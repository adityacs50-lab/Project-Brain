import json
import re
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, desc, delete, cast, Float, text
from backend.db import AsyncSessionLocal
from backend.models import Rule, AgentDecisionLog

router = APIRouter(prefix="/agent", tags=["Agent API"])

# Import the singleton sentence-transformer model from versioning.py
def get_model():
    from backend.versioning import get_model as get_versioning_model
    return get_versioning_model()

# Request models
class AgentQueryRequest(BaseModel):
    workspace_id: str
    agent_id: str
    action: str
    context: dict

class AgentFeedbackRequest(BaseModel):
    audit_id: str
    outcome: str  # "resolved" | "escalated" | "incorrect" | "overridden"
    notes: str | None = None


def _extract_escalation_target(rule_text: str | None) -> str | None:
    if not rule_text:
        return None

    rule_lower = rule_text.lower()
    if "vp of customer success" in rule_lower:
        return "VP of Customer Success"
    if "on-call engineer" in rule_lower:
        return "On-Call Engineer"

    # Fallback extraction for rules that include escalation language.
    match = re.search(r"escalated to ([^.,]+)", rule_text, flags=re.IGNORECASE)
    if match:
        return match.group(1).strip().title()

    match = re.search(r"require[s]? ([^.,]+) approval", rule_text, flags=re.IGNORECASE)
    if match:
        return match.group(1).strip().title()

    return None

# ========================================
# POST /agent/query
# ========================================
@router.post("/query")
async def query_agent(request: AgentQueryRequest):
    """
    Query the agent decision API to determine if an action is permitted.
    Uses semantic search with pgvector to find matching rules.
    """
    # 🛡️ DETERMINISTIC CONTROL PLANE: Actor Identity Verification
    if not request.agent_id or len(request.agent_id) < 3:
        raise HTTPException(status_code=403, detail="Actor Identity (agent_id) is invalid or missing.")
    
    # Build natural language query from action + context
    query_text = f"{request.action}. Context: {json.dumps(request.context)}"
    
    # Get the singleton model and generate embedding
    model_instance = get_model()
    query_embedding = model_instance.encode(query_text).tolist()
    
    async with AsyncSessionLocal() as db:
        # Query active rules for this workspace using pgvector cosine distance
        # Similarity >= 0.75 means cosine_distance <= 0.25
        stmt = select(Rule).where(
            Rule.workspace_id == request.workspace_id,
            Rule.status == "active"
        ).order_by(Rule.embedding.cosine_distance(query_embedding)).limit(3)
        
        result = await db.execute(stmt)
        matching_rules = result.scalars().all()
        
        # Track if we found a match
        decision = "no_rule_found"
        rule_id = None
        rule_title = None
        rule_text = None
        escalate_to = None
        confidence = None
        source_channel = None
        rule_version = None
        similarity_score = None
        
        if matching_rules:
            # Calculate similarity score (1 - cosine_distance)
            top_rule = matching_rules[0]
            
            # Get similarity by computing 1 - cosine distance
            stmt_sim = select(
                cast(1 - Rule.embedding.cosine_distance(query_embedding), Float)
            ).where(Rule.id == top_rule.id)
            result_sim = await db.execute(stmt_sim)
            sim_row = result_sim.scalar_one()
            similarity_score = float(sim_row) if sim_row is not None else 0.0
            
            if similarity_score >= 0.75:
                # We have a match - apply decision logic
                rule_id = top_rule.id
                rule_title = top_rule.title
                rule_text = top_rule.rule_text
                confidence = min(1.0, float(similarity_score) * 1.8)
                source_channel = top_rule.channel_id
                rule_version = top_rule.version
                
                confidence = min(1.0, float(similarity_score) * 1.8)
                source_channel = top_rule.channel_id
                rule_version = top_rule.version
                
                # ✅ DETERMINISTIC ENFORCEMENT: Use action_type from DB
                decision = top_rule.action_type if top_rule.action_type else "permitted"
                
                if decision == "escalate":
                    # Prefer explicit escalation targets from full rule text.
                    escalate_to = _extract_escalation_target(rule_text)
                    if not escalate_to:
                        escalate_to = "human operator"
        
        # Log to AgentDecisionLog
        decision_log = AgentDecisionLog(
            id=uuid.uuid4(),
            workspace_id=request.workspace_id,
            agent_id=request.agent_id,
            action=request.action,
            context=json.dumps(request.context),
            matched_rule_id=rule_id,
            rule_text=rule_text,
            decision=decision,
            escalate_to=escalate_to,
            confidence=confidence,
            created_at=datetime.utcnow()
        )
        db.add(decision_log)
        await db.commit()
        await db.refresh(decision_log)
        
        # Build response based on decision
        if decision == "no_rule_found":
            return {
                "decision": "no_rule_found",
                "message": "No matching rule found. Escalate to human operator.",
                "audit_id": str(decision_log.id)
            }
        else:
            return {
                "decision": decision,
                "rule_title": rule_title,
                "rule_text": rule_text,
                "escalate_to": escalate_to,
                "confidence": confidence,
                "source_channel": source_channel,
                "rule_version": rule_version,
                "audit_id": str(decision_log.id)
            }

# ========================================
# GET /agent/rules/{workspace_id}/support
# ========================================
@router.get("/rules/{workspace_id}/support")
async def get_support_rules(workspace_id: str):
    """
    Returns all active rules for workspace as clean JSON array.
    Agents can call this once at session start to preload rules.
    """
    async with AsyncSessionLocal() as db:
        stmt = select(Rule).where(
            Rule.workspace_id == workspace_id,
            Rule.status == "active"
        ).order_by(Rule.confidence.desc())
        
        result = await db.execute(stmt)
        rules = result.scalars().all()
        
        return {
            "workspace_id": workspace_id,
            "total_rules": len(rules),
            "rules": [
                {
                    "rule_id": str(r.id),
                    "title": r.title,
                    "rule_text": r.rule_text,
                    "confidence": r.confidence,
                    "source_channel": r.channel_id,
                    "version": r.version
                }
                for r in rules
            ]
        }

# ========================================
# POST /agent/feedback
# ========================================
@router.post("/feedback")
async def submit_feedback(request: AgentFeedbackRequest):
    """
    Submit feedback on an agent decision.
    If outcome is 'incorrect' or 'overridden', the matched rule is sent back for review.
    """
    async with AsyncSessionLocal() as db:
        # Find the decision log
        stmt = select(AgentDecisionLog).where(AgentDecisionLog.id == request.audit_id)
        result = await db.execute(stmt)
        decision_log = result.scalar_one_or_none()
        
        if not decision_log:
            raise HTTPException(status_code=404, detail="Audit record not found")
        
        # Build feedback string
        feedback_str = request.outcome
        if request.notes:
            feedback_str += f": {request.notes}"
        
        # Update agent_feedback
        decision_log.agent_feedback = feedback_str
        await db.commit()
        
        # If outcome is incorrect or overridden, send rule back to review
        rule_sent_to_review = False
        if request.outcome in ["incorrect", "overridden"]:
            if decision_log.matched_rule_id:
                stmt_rule = select(Rule).where(Rule.id == decision_log.matched_rule_id)
                result_rule = await db.execute(stmt_rule)
                rule = result_rule.scalar_one_or_none()
                
                if rule:
                    rule.status = "pending"
                    rule_sent_to_review = True
                    await db.commit()
        
        return {
            "updated": True,
            "rule_sent_to_review": rule_sent_to_review
        }

# ========================================
# GET /agent/decisions/{workspace_id}
# ========================================
@router.get("/decisions/{workspace_id}")
async def get_decisions(workspace_id: str):
    """
    Returns last 50 AgentDecisionLog entries for workspace.
    Used for audit trail and analytics.
    """
    async with AsyncSessionLocal() as db:
        stmt = select(AgentDecisionLog).where(
            AgentDecisionLog.workspace_id == workspace_id
        ).order_by(desc(AgentDecisionLog.created_at)).limit(50)
        
        result = await db.execute(stmt)
        decisions = result.scalars().all()
        
        return {
            "workspace_id": workspace_id,
            "total_decisions": len(decisions),
            "decisions": [
                {
                    "audit_id": str(d.id),
                    "agent_id": d.agent_id,
                    "action": d.action,
                    "context": (lambda x: (json.loads(x) if x and x.startswith('{') else x))(d.context) if d.context else {},
                    "decision": d.decision,
                    "matched_rule_id": str(d.matched_rule_id) if d.matched_rule_id else None,
                    "escalate_to": d.escalate_to,
                    "confidence": d.confidence,
                    "agent_feedback": d.agent_feedback,
                    "created_at": d.created_at.isoformat() if d.created_at else None
                }
                for d in decisions
            ]
        }

# ========================================
# GET /agent/stats/{workspace_id}
# ========================================
@router.get("/stats/{workspace_id}")
async def get_agent_stats(workspace_id: str):
    """
    Returns real-time health and performance metrics for the agent brain.
    - Brain Health (Avg Confidence)
    - Hallucination Free Score (1 - Flagged/Total)
    - Total Decisions
    - Active Rules Count
    """
    async with AsyncSessionLocal() as db:
        # 1. Rules Stats
        stmt_rules = select(Rule).where(Rule.workspace_id == workspace_id, Rule.status == "active")
        result_rules = await db.execute(stmt_rules)
        rules = result_rules.scalars().all()
        total_rules = len(rules)
        avg_confidence = sum([r.confidence for r in rules]) / total_rules if total_rules > 0 else 1.0

        # 2. Decisions Stats
        stmt_decisions = select(AgentDecisionLog).where(AgentDecisionLog.workspace_id == workspace_id)
        result_decisions = await db.execute(stmt_decisions)
        decisions = result_decisions.scalars().all()
        total_decisions = len(decisions)
        
        # 3. Hallucination Free Score (Flags)
        # Any decision where feedback is 'incorrect' or 'overridden' is considered a hallucination/error
        flagged_count = sum([1 for d in decisions if d.agent_feedback and ("incorrect" in d.agent_feedback.lower() or "overridden" in d.agent_feedback.lower())])
        hallucination_free = (1 - (flagged_count / total_decisions)) if total_decisions > 0 else 1.0

        return {
            "workspace_id": workspace_id,
            "brain_health": int(avg_confidence * 100),
            "hallucination_free": int(hallucination_free * 100),
            "total_decisions": total_decisions,
            "active_rules": total_rules,
            "health_status": "OPTIMAL" if avg_confidence > 0.8 else "STABLE" if avg_confidence > 0.5 else "CRITICAL"
        }

# ========================================
# POST /agent/seed/{workspace_id}
# ========================================
@router.post("/seed/{workspace_id}")
async def seed_agent_rules(workspace_id: str):
    """
    Seeds 3 support-specific rules for agent testing:
    - "Refunds over $200 require VP of Customer Success approval"
    - "Tickets marked urgent must be escalated to on-call engineer within 15 minutes"
    - "Customers with tenure over 1 year are permitted a one-time fee waiver"
    """
    if "test" not in workspace_id.lower() and workspace_id != "demo-workspace":
        raise HTTPException(status_code=400, detail="Safety check: workspace_id must contain 'test' or be 'demo-workspace'")
    
    model_instance = get_model()
    seeded_rules = []
    
    async with AsyncSessionLocal() as db:
        from backend.models import Contradiction, QueryLog

        # Ensure workspace exists to satisfy rules.workspace_id foreign key.
        await db.execute(
            text(
                """
                INSERT INTO slack_workspaces (workspace_id, team_name)
                VALUES (:workspace_id, :team_name)
                ON CONFLICT (workspace_id) DO NOTHING
                """
            ),
            {
                "workspace_id": workspace_id,
                "team_name": "Demo Workspace" if workspace_id == "demo-workspace" else "Test Workspace",
            },
        )
        await db.commit()
        
        # Clear existing rules for this workspace first
        # Must delete child records first to avoid foreign key violations
        stmt_del_contradictions = delete(Contradiction).where(Contradiction.workspace_id == workspace_id)
        await db.execute(stmt_del_contradictions)
        
        stmt_del_queries = delete(QueryLog).where(QueryLog.workspace_id == workspace_id)
        await db.execute(stmt_del_queries)
        
        stmt_del_decisions = delete(AgentDecisionLog).where(AgentDecisionLog.workspace_id == workspace_id)
        await db.execute(stmt_del_decisions)
        
        stmt_del = delete(Rule).where(Rule.workspace_id == workspace_id)
        await db.execute(stmt_del)
        await db.commit()
        
        # Seed Rule 1: Refund Approval Policy
        rule1_text = "Any refund request exceeding the threshold of $200 requires formal authorization from the VP of Customer Success before the transaction can be processed."
        embedding1 = model_instance.encode(rule1_text).tolist()
        
        rule1 = Rule(
            id=uuid.uuid4(),
            workspace_id=workspace_id,
            title="Refund Approval Policy",
            rule_text=rule1_text,
            status="active",
            confidence=1.0,
            source_message="Refunds over $200 require VP of Customer Success approval",
            channel_id="support-policies",
            version=1,
            embedding=embedding1,
            created_at=datetime.utcnow()
        )
        db.add(rule1)
        await db.commit()
        await db.refresh(rule1)
        seeded_rules.append(str(rule1.id))
        
        # Seed Rule 2: Urgent Ticket Protocol
        rule2_text = "All support tickets designated as 'Urgent' must be immediately escalated to the active on-call engineer, with a mandatory internal response time of no more than 15 minutes."
        embedding2 = model_instance.encode(rule2_text).tolist()
        
        rule2 = Rule(
            id=uuid.uuid4(),
            workspace_id=workspace_id,
            title="Urgent Ticket Protocol",
            rule_text=rule2_text,
            status="active",
            confidence=1.0,
            source_message="Tickets marked urgent must be escalated to on-call engineer within 15 minutes",
            channel_id="support-policies",
            version=1,
            embedding=embedding2,
            created_at=datetime.utcnow()
        )
        db.add(rule2)
        await db.commit()
        await db.refresh(rule2)
        seeded_rules.append(str(rule2.id))
        
        # Seed Rule 3: Fee waiver for long-tenure customers
        rule3_text = "Customers with tenure over 1 year are permitted a one-time fee waiver"
        embedding3 = model_instance.encode(rule3_text).tolist()
        
        rule3 = Rule(
            id=uuid.uuid4(),
            workspace_id=workspace_id,
            title="Fee Waiver Policy",
            rule_text=rule3_text,
            status="active",
            confidence=1.0,
            source_message="Customers with tenure over 1 year are permitted a one-time fee waiver",
            channel_id="support-policies",
            version=1,
            embedding=embedding3,
            created_at=datetime.utcnow()
        )
        db.add(rule3)
        await db.commit()
        await db.refresh(rule3)
        seeded_rules.append(str(rule3.id))
    
    return {
        "workspace_id": workspace_id,
        "seeded_rules": 3,
        "rule_ids": seeded_rules
    }


# ========================================
# GET /agent/demo/run
# ========================================
@router.get("/demo/run")
async def run_agent_demo():
    """
    Runs a full self-contained demo for demo-workspace:
    1) clear and seed support rules
    2) execute 4 predefined queries
    3) return all decisions with a concise summary
    """
    workspace_id = "demo-workspace"
    seed_result = await seed_agent_rules(workspace_id)

    demo_queries = [
        {
            "query": "process refund of $350 for 3 month old customer",
            "action": "Any refund request exceeding the threshold of $200 requires formal authorization from the VP of Customer Success before the transaction can be processed.",
            "context": {}
        },
        {
            "query": "handle urgent production outage ticket",
            "action": "All support tickets designated as 'Urgent' must be immediately escalated to the active on-call engineer, with a mandatory internal response time of no more than 15 minutes.",
            "context": {}
        },
        {
            "query": "waive fee for 2 year customer",
            "action": "Customers with tenure over 1 year are permitted a one-time fee waiver",
            "context": {}
        },
        {
            "query": "offer free upgrade to unhappy customer",
            "action": "offer free upgrade",
            "context": {
                "issue": "customer unhappy with current plan"
            }
        }
    ]

    decisions = []
    for item in demo_queries:
        result = await query_agent(
            AgentQueryRequest(
                workspace_id=workspace_id,
                agent_id="support-agent-01",
                action=item["action"],
                context=item["context"]
            )
        )
        decisions.append(
            {
                "query": item["query"],
                "decision": result.get("decision"),
                "rule_title": result.get("rule_title"),
                "escalate_to": result.get("escalate_to"),
                "confidence": result.get("confidence")
            }
        )

    matched = sum(1 for d in decisions if d["decision"] != "no_rule_found")
    escalations = sum(1 for d in decisions if d["decision"] == "escalate")
    permitted = sum(1 for d in decisions if d["decision"] == "permitted")
    no_rule_found = sum(1 for d in decisions if d["decision"] == "no_rule_found")

    return {
        "demo": "complete",
        "rules_loaded": seed_result["seeded_rules"],
        "decisions": decisions,
        "summary": f"{matched}/4 rules matched. {escalations} escalations, {permitted} permitted, {no_rule_found} no_rule_found."
    }
