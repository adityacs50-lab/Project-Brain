import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from sqlalchemy import select, desc
from backend.db import AsyncSessionLocal
from backend.models import Rule, Contradiction

router = APIRouter(prefix="/rules", tags=["Rule Versioning"])

# Lazy load the model to avoid blocking on import
model = None

def get_model():
    global model
    if model is None:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
    return model

from typing import Optional

class StatusUpdateRequest(BaseModel):
    status: str
    edited_text: Optional[str] = None
    approved_by: Optional[str] = None

class IngestRequest(BaseModel):
    workspace_id: str
    title: str
    rule_text: str
    confidence: float
    source_message: str
    channel_id: str

@router.post("/ingest")
async def ingest_rule(request: IngestRequest):
    """
    Ingests a new rule, computes its embedding, and checks for contradictions against active rules.
    Returns the new rule object.
    """
    model_instance = get_model()
    # Generate embedding using sentence-transformers
    embedding = model_instance.encode(request.rule_text).tolist()

    async with AsyncSessionLocal() as db:
        # Query active/pending rules for this workspace to check similarity OR title match
        # Cosine distance = 1 - Cosine Similarity. Similarity > 0.75 means distance < 0.25
        # Also check exact title matches as indicators of policy updates
        stmt = select(Rule).where(
            Rule.workspace_id == request.workspace_id,
            Rule.status.in_(["active", "pending"]),
            (Rule.embedding.cosine_distance(embedding) < 0.25) | (Rule.title == request.title)
        )
        result = await db.execute(stmt)
        similar_rules = result.scalars().all()

        # Create the new rule - store immediately to get ID first
        new_rule = Rule(
            id=uuid.uuid4(),
            workspace_id=request.workspace_id,
            title=request.title,
            rule_text=request.rule_text,
            status="pending",
            confidence=request.confidence,
            source_message=request.source_message,
            channel_id=request.channel_id,
            version=1,
            parent_rule_id=None,
            embedding=embedding,
            created_at=datetime.utcnow()
        )

        db.add(new_rule)
        await db.commit()
        await db.refresh(new_rule)

        # If there's an existing similar/same-titled rule
        if similar_rules:
            old_rule = similar_rules[0]

            # Archive the old rule if it was active
            if old_rule.status == "active":
                old_rule.status = "archived"

            # Setup the new rule's version and ancestry
            new_rule.version = old_rule.version + 1
            new_rule.parent_rule_id = old_rule.id

            # Create a contradiction record
            contradiction = Contradiction(
                id=uuid.uuid4(),
                workspace_id=request.workspace_id,
                rule_a_id=old_rule.id,
                rule_b_id=new_rule.id,
                similarity_score=0.85, # Simplification; normally calculated exactly
                detected_at=datetime.utcnow(),
                resolution="latest_wins"
            )
            db.add(contradiction)
            await db.commit()

        return {
            "id": str(new_rule.id),
            "title": new_rule.title,
            "rule_text": new_rule.rule_text,
            "status": new_rule.status,
            "confidence": new_rule.confidence,
            "source_message": new_rule.source_message,
            "channel_id": new_rule.channel_id,
            "version": new_rule.version,
            "created_at": new_rule.created_at
        }

@router.get("/{workspace_id}/rules")
async def get_rules(workspace_id: str, status: Optional[str] = None):
    """Returns rules for workspace, optionally filtered by status."""
    async with AsyncSessionLocal() as db:
        stmt = select(Rule).where(Rule.workspace_id == workspace_id)
        if status:
            stmt = stmt.where(Rule.status == status)
        result = await db.execute(stmt)
        rules = result.scalars().all()
        return [
            {
                "id": str(r.id),
                "title": r.title,
                "rule_text": r.rule_text,
                "status": r.status,
                "confidence": r.confidence,
                "source_message": r.source_message,
                "channel_id": r.channel_id,
                "version": r.version,
                "created_at": r.created_at
            } for r in rules
        ]

@router.get("/{rule_id}/history")
async def get_rule_history(rule_id: str):
    """Walks parent_rule_id chain from current back to v1, returns full version history."""
    history = []
    current_id = rule_id

    async with AsyncSessionLocal() as db:
        while current_id:
            stmt = select(Rule).where(Rule.id == current_id)
            result = await db.execute(stmt)
            rule = result.scalar_one_or_none()

            if not rule:
                break

            history.append({
                "id": str(rule.id),
                "title": rule.title,
                "rule_text": rule.rule_text,
                "status": rule.status,
                "version": rule.version,
                "created_at": rule.created_at
            })
            current_id = str(rule.parent_rule_id) if rule.parent_rule_id else None

    return history

@router.post("/{rule_id}/rollback")
async def rollback_rule(rule_id: str):
    """Archives current active version, restores specified rule_id as active."""
    async with AsyncSessionLocal() as db:
        # Find the target rule to restore
        stmt = select(Rule).where(Rule.id == rule_id)
        result = await db.execute(stmt)
        target_rule = result.scalar_one_or_none()

        if not target_rule:
            raise HTTPException(status_code=404, detail="Rule not found")

        workspace_id = target_rule.workspace_id

        # We need to find the currently active rule in this chain to archive it.
        # For simplicity, we can archive ALL active rules with the same title/chain,
        # but a robust system would trace the chain forward.
        # Here we just blindly find the active rule in the workspace with the same title.
        stmt_active = select(Rule).where(
            Rule.workspace_id == workspace_id,
            Rule.title == target_rule.title,
            Rule.status == "active"
        )
        result_active = await db.execute(stmt_active)
        active_rules = result_active.scalars().all()

        for ar in active_rules:
            ar.status = "archived"

        # Restore target
        target_rule.status = "active"

        await db.commit()
        return {"status": "success", "restored_version": target_rule.version}

@router.patch("/{rule_id}/status")
async def update_rule_status(rule_id: str, request: StatusUpdateRequest):
    """Updates status to active|archived|pending. Used by human review UI."""
    if request.status not in ["active", "archived", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    async with AsyncSessionLocal() as db:
        stmt = select(Rule).where(Rule.id == rule_id)
        result = await db.execute(stmt)
        rule = result.scalar_one_or_none()

        if not rule:
            raise HTTPException(status_code=404, detail="Rule not found")

        # 🛡️ THIEL PROTOCOL RULE 5: EXECUTIVE SEAL
        if request.status == "active" and rule.status != "active":
            rule.approved_by = request.approved_by or "admin"
            rule.approved_at = datetime.utcnow()

        rule.status = request.status
        if request.edited_text is not None:
            rule.rule_text = request.edited_text

        await db.commit()
        return {
            "status": "success", 
            "new_status": rule.status,
            "approved_by": rule.approved_by,
            "approved_at": rule.approved_at
        }

@router.get("/{workspace_id}/contradictions")
async def get_contradictions(workspace_id: str):
    """Returns all contradiction records for workspace."""
    async with AsyncSessionLocal() as db:
        stmt = select(Contradiction).where(Contradiction.workspace_id == workspace_id).order_by(desc(Contradiction.detected_at))
        result = await db.execute(stmt)
        contradictions = result.scalars().all()

        return [
            {
                "id": str(c.id),
                "rule_a_id": str(c.rule_a_id),
                "rule_b_id": str(c.rule_b_id),
                "similarity_score": c.similarity_score,
                "resolution": c.resolution,
                "detected_at": c.detected_at
            } for c in contradictions
        ]


# ========================================
# Demo Helper Endpoints
# ========================================

from sqlalchemy import delete

@router.delete("/{workspace_id}/clear")
async def clear_workspace_data(workspace_id: str):
    """CLEAR ENDPOINT — Deletes all Rules, Contradictions, and QueryLogs. Requires 'test' in workspace_id."""
    if "test" not in workspace_id.lower():
        raise HTTPException(status_code=400, detail="Safety check: workspace_id must contain 'test'")

    async with AsyncSessionLocal() as db:
        from backend.models import QueryLog
        stmt_c = delete(Contradiction).where(Contradiction.workspace_id == workspace_id)
        await db.execute(stmt_c)
        stmt_r = delete(Rule).where(Rule.workspace_id == workspace_id)
        await db.execute(stmt_r)
        stmt_q = delete(QueryLog).where(QueryLog.workspace_id == workspace_id)
        await db.execute(stmt_q)
        await db.commit()
        return {"workspace_id": workspace_id, "deleted": "all test data cleared"}


@router.post("/{workspace_id}/seed")
async def seed_workspace_data(workspace_id: str):
    """SEED ENDPOINT — Seeds 3 test rules for demo."""
    import asyncio

    if "test" not in workspace_id.lower():
        raise HTTPException(status_code=400, detail="Safety check: workspace_id must contain 'test'")

    # Clear first
    await clear_workspace_data(workspace_id)

    # Seed Rule 1
    r1 = IngestRequest(
        workspace_id=workspace_id,
        title="Refund Approval Policy",
        rule_text="Refunds over $200 require VP approval before processing",
        confidence=0.95,
        source_message="From now on refunds over 200 dollars need VP sign off",
        channel_id="customer-support"
    )
    result1 = await ingest_rule(r1)
    await asyncio.sleep(0.5)

    # Seed Rule 2
    r2 = IngestRequest(
        workspace_id=workspace_id,
        title="Bug Ticket Protocol",
        rule_text="All bug tickets must be tagged with QA before moving to resolved",
        confidence=0.91,
        source_message="lets make it mandatory to tag QA on all bugs before resolving",
        channel_id="dev-chat"
    )
    result2 = await ingest_rule(r2)
    await asyncio.sleep(0.5)

    # Seed Rule 3 - contradiction
    r3 = IngestRequest(
        workspace_id=workspace_id,
        title="Refund Approval Policy",
        rule_text="Refunds over $100 only need Manager approval, not VP",
        confidence=0.88,
        source_message="update - manager approval is enough for refunds now",
        channel_id="customer-support"
    )
    result3 = await ingest_rule(r3)

    # Count contradictions
    async with AsyncSessionLocal() as db:
        stmt = select(Contradiction).where(Contradiction.workspace_id == workspace_id)
        result = await db.execute(stmt)
        contradictions = result.scalars().all()

    return {
        "seeded": 3,
        "contradictions_detected": len(contradictions),
        "rules": [result1, result2, result3]
    }


class QueryRequest(BaseModel):
    workspace_id: str
    query: str
    user_id: Optional[str] = "demo-user"

@router.post("/query")
async def query_rules(request: QueryRequest):
    """RAG Query Endpoint — Finds relevant active rules for a query."""
    from backend.models import QueryLog

    model_instance = get_model()
    query_embedding = model_instance.encode(request.query).tolist()

    async with AsyncSessionLocal() as db:
        stmt = select(Rule).where(
            Rule.workspace_id == request.workspace_id,
            Rule.status == "active"
        ).order_by(Rule.embedding.cosine_distance(query_embedding)).limit(3)

        result = await db.execute(stmt)
        matching_rules = result.scalars().all()

        if not matching_rules:
            answer = "I don't have a documented procedure for this."
            sources = []
            confidence = "low"
        else:
            rules_context = "\n---\n".join([
                f"Rule: {r.title}\n{r.rule_text}"
                for r in matching_rules
            ])

            try:
                import google.generativeai as genai
                prompt = f"""SYSTEM: Answer using ONLY company rules below.\n\n{rules_context}\n\nQuestion: {request.query}\n\nAnswer:"""
                response = await genai.GenerativeModel('gemini-2.5-flash').generate_content_async(prompt)
                answer = response.text.strip()
                sources = [r.title for r in matching_rules]
                confidence = "high"
            except Exception as e:
                print(f"Gemini error: {e}")
                answer = matching_rules[0].rule_text
                sources = [matching_rules[0].title]
                confidence = "medium"

        # Log query
        query_log = QueryLog(
            workspace_id=request.workspace_id,
            user_id=request.user_id,
            query_text=request.query,
            matched_rule_id=matching_rules[0].id if matching_rules else None,
            similarity_score=0.85
        )
        db.add(query_log)
        await db.commit()

        return {
            "answer": answer,
            "sources": sources,
            "confidence": confidence,
            "matched_rules": [{"title": r.title, "rule_text": r.rule_text} for r in matching_rules]
        }
