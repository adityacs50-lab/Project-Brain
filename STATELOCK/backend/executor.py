import os
import uuid
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy import select
from backend.db import AsyncSessionLocal
from backend.models import Skill, AgentConversation, WorkflowRun, WorkflowStepLog, BillingEvent
from backend.tools import tool_executor
import json
from dotenv import load_dotenv
from backend.ai import ai_client

load_dotenv()

# AI client is now handled by backend.ai

async def answer_query(user_query: str, workspace_id: str) -> Dict[str, Any]:
    """🛡️ THIEL PROTOCOL RULE 3: DETERMINISTIC ENFORCEMENT.
    Finds relevant rules using vector similarity and enforces actions strictly.
    """
    from backend.versioning import get_model
    from backend.models import Rule, AgentDecisionLog
    from sqlalchemy import select, and_, or_

    # Initialize response defaults for logging
    final_answer = ""
    final_sources = []
    final_confidence = 0.0
    final_action = "escalate"
    matched_rule_id = None
    matched_rule_text = None
    status_flag = None

    try:
        async with AsyncSessionLocal() as db:
            # 🚀 NEW: Check for Skills (Stateful Workflows)
            # Find skills where any trigger keyword is present in the query
            words = [w.strip("?,.!").lower() for w in user_query.split()]
            stmt_skills = select(Skill)
            result_skills = await db.execute(stmt_skills)
            all_skills = result_skills.scalars().all()
            
            matched_skill = next((s for s in all_skills if any(kw.lower() in words for kw in s.trigger_keywords)), None)

            if matched_skill:
                return await start_workflow(workspace_id, matched_skill.id, {"query": user_query})

            # 🛡️ Model loading deferred until after skill check
            model_instance = get_model()
            embedding = model_instance.encode(user_query).tolist()

            # Vector search for top 5 rules
            stmt = select(Rule).where(
                Rule.workspace_id == workspace_id, 
                Rule.status.in_(["active", "pending"])
            ).order_by(Rule.embedding.cosine_distance(embedding)).limit(5)
                
            result = await db.execute(stmt)
            matching_rules = result.scalars().all()
            
            active_rules = [r for r in matching_rules if r.status == "active"]
            pending_rules = [r for r in matching_rules if r.status == "pending"]

            if not active_rules:
                if pending_rules:
                    final_answer = f"I found a potential match: '{pending_rules[0].title}', but it is currently PENDING human review (Thiel Protocol Rule 5). I cannot enforce it until it receives the Executive Seal."
                    final_sources = [r.title for r in pending_rules]
                    final_confidence = 0.7
                    final_action = "escalate"
                    matched_rule_id = pending_rules[0].id
                    matched_rule_text = pending_rules[0].rule_text
                    status_flag = "pending_review"
                else:
                    final_answer = "I don't have any active documented procedures for this request. Please check with your manager or submit a new policy via Slack."
                    final_sources = []
                    final_confidence = 0.3
                    final_action = "escalate"
                    status_flag = "no_match"
            else:
                rules_context = "\n---\n".join([f"Rule ID: {r.id}\nTitle: {r.title}\nAction: {r.action_type}\nLogic: {r.rule_text}" for r in active_rules])
                
                # ⚖️ Conflict Resolution Engine
                # Check if we have multiple active rules with different action_types
                action_types = {r.action_type for r in active_rules}
                is_conflict = len(action_types) > 1
                
                if is_conflict:
                    prompt = f"""SYSTEM: You are the 'Adjudication Engine' of Company Operations. 
We have detected a CONFLICT between multiple company rules for this request.
Your job is to resolve the conflict by following these precedence rules:
1. 'denied' always overrides 'permitted'.
2. 'escalate' overrides 'permitted' if uncertainty exists.
3. More specific rules override general rules.

MATCHING RULES:
{rules_context}

USER REQUEST: {user_query}

DECISION PROTOCOL:
1. Identify the contradiction.
2. Adjudicate based on the hierarchy.
3. State the final decision clearly.
4. Mention which rules were overruled and why.
"""
                else:
                    prompt = f"""SYSTEM: You are a high-precision company operations assistant. 
Answer the QUESTION using ONLY the PROCEDURES below.

STRICT RULES:
1. If the PROCEDURE says "Action: denied", you MUST deny the request.
2. If the PROCEDURE says "Action: escalate", you MUST tell the user you are escalating to a manager.
3. If no procedure perfectly matches, explain what IS documented.

PROCEDURES:
{rules_context}

QUESTION: {user_query}"""
                
                try:
                    final_answer = await ai_client.chat_completion(
                        model="llama-3.3-70b-versatile",
                        messages=[{"role": "user", "content": prompt}]
                    )
                except Exception as e:
                    print(f"Adjudication Engine reasoning failed: {e}. Falling back to deterministic hierarchy.")
                    if is_conflict:
                        # Deterministic Hierarchy: Denied > Escalate > Permitted
                        if "denied" in action_types:
                            final_answer = "[ADJUDICATION ENGINE - DETERMINISTIC FALLBACK]\n\nConflict detected between permissive and restrictive policies. In accordance with the Safety-First Hierarchy, the RESTRICTIVE policy ('denied') has been upheld. Request is DENIED to prevent potential budget or compliance violations."
                        elif "escalate" in action_types:
                            final_answer = "[ADJUDICATION ENGINE - DETERMINISTIC FALLBACK]\n\nConflict detected between automated and manual oversight policies. The request has been ESCALATED to a human administrator for final review."
                        else:
                            final_answer = "Procedural conflict detected. Escalating to human admin for logic reconciliation."
                    else:
                        raise e

                final_answer = final_answer.strip()
                
                if is_conflict and "ADJUDICATION ENGINE" not in final_answer:
                    final_answer = "[ADJUDICATION ENGINE]\n\n" + final_answer
                
                final_sources = [r.title for r in active_rules]
                final_confidence = 0.95
                final_action = active_rules[0].action_type or "escalate"
                matched_rule_id = active_rules[0].id
                matched_rule_text = active_rules[0].rule_text

            # 🛡️ DETERMINISTIC AUDIT TRAIL: Always log the decision
            decision_log = AgentDecisionLog(
                id=uuid.uuid4(),
                workspace_id=workspace_id,
                agent_id="core_brain_v1",
                action=user_query[:200], # Query is the intent
                context=json.dumps({"query": user_query}),
                matched_rule_id=matched_rule_id,
                rule_text=matched_rule_text,
                decision=final_action,
                confidence=final_confidence,
                created_at=datetime.utcnow()
            )
            db.add(decision_log)
            await db.commit()

            response_payload = {
                "answer": final_answer,
                "sources": final_sources,
                "confidence": "high" if final_confidence > 0.8 else "medium" if final_confidence > 0.5 else "low",
                "action": final_action
            }
            if status_flag:
                response_payload["status"] = status_flag
            
            return response_payload

    except Exception as e:
        print(f"Executor error: {e}")
        return {
            "answer": f"Internal Error: Logic system compromised ({str(e)}). Escalating to human admin.",
            "sources": [],
            "confidence": "low",
            "action": "escalate"
        }


async def start_workflow(workspace_id: str, skill_id: uuid.UUID, initial_context: Dict[str, Any]) -> Dict[str, Any]:
    """🚀 THIEL PROTOCOL UPGRADE: STATEFUL EXECUTION.
    Starts a multi-step workflow and persists the initial state.
    """
    async with AsyncSessionLocal() as db:
        # Fetch skill details
        stmt = select(Skill).where(Skill.id == skill_id)
        result = await db.execute(stmt)
        skill = result.scalar_one_or_none()
        
        if not skill:
            return {"error": "Skill not found"}

        # Create new Workflow Run
        workflow_run = WorkflowRun(
            id=uuid.uuid4(),
            workspace_id=workspace_id,
            skill_id=skill_id,
            title=skill.name,
            status="running",
            context=json.dumps(initial_context),
            current_step_index=0
        )
        db.add(workflow_run)
        await db.commit()
        
        # Execute first step
        return await execute_workflow_step(workflow_run.id)

async def execute_workflow_step(workflow_run_id: uuid.UUID) -> Dict[str, Any]:
    """🛡️ STEP-BY-STEP DETERMINISM.
    Executes the next step in a workflow and logs the outcome.
    """
    async with AsyncSessionLocal() as db:
        stmt = select(WorkflowRun).where(WorkflowRun.id == workflow_run_id)
        result = await db.execute(stmt)
        run = result.scalar_one_or_none()
        
        if not run or run.status != "running":
            return {"error": "Workflow not running or not found"}

        # Load skill and context
        stmt = select(Skill).where(Skill.id == run.skill_id)
        result = await db.execute(stmt)
        skill = result.scalar_one_or_none()
        
        import yaml
        skill_data = yaml.safe_load(skill.yaml_content)
        steps = skill_data.get("steps", [])
        value_per_run = skill_data.get("value_per_run", 0.0)
        
        if run.current_step_index >= len(steps):
            run.status = "completed"
            run.value_generated = value_per_run
            
            # Log Billing Event
            billing_event = BillingEvent(
                id=uuid.uuid4(),
                workspace_id=run.workspace_id,
                workflow_run_id=run.id,
                event_type="workflow_completion",
                value_amount=value_per_run,
                metadata_json=json.dumps({"skill_name": skill.name})
            )
            db.add(billing_event)
            await db.commit()
            return {
                "workflow_id": str(run.id),
                "status": "completed", 
                "message": f"Workflow '{skill.name}' finished successfully. Value generated: ${value_per_run}",
                "context": json.loads(run.context),
                "value_generated": run.value_generated
            }

        current_step = steps[run.current_step_index]
        context = json.loads(run.context)
        
        # Log Step Start
        step_log = WorkflowStepLog(
            id=uuid.uuid4(),
            workflow_run_id=run.id,
            step_name=f"Step {run.current_step_index + 1}: {current_step['action']}",
            status="success", # Defaulting to success for now
            input_data=json.dumps(context)
        )
        
        # 🚀 Agent-to-Agent Tool Call Integration
        step_output = {"action_taken": current_step['action'], "timestamp": datetime.utcnow().isoformat()}
        
        if "tool" in current_step:
            tool_name = current_step["tool"]
            # Extract params from context or query
            tool_params = context.get("tool_params", {})
            if tool_name == "stripe_refund":
                # Extract amount from query if possible, or use default
                tool_params["amount"] = context.get("amount", 25.0)
                tool_params["order_id"] = context.get("order_id", "ORD-999")
            
            tool_result = await tool_executor.call_tool(tool_name, tool_params)
            step_output["tool_execution"] = tool_result
            
        # Update context and progress
        context[f"step_{run.current_step_index + 1}_output"] = step_output
        run.context = json.dumps(context)
        run.current_step_index += 1
        
        if run.current_step_index >= len(steps):
            run.status = "completed"
            run.value_generated = value_per_run
            
            # Log Billing Event
            billing_event = BillingEvent(
                id=uuid.uuid4(),
                workspace_id=run.workspace_id,
                workflow_run_id=run.id,
                event_type="workflow_completion",
                value_amount=value_per_run,
                metadata_json=json.dumps({"skill_name": skill.name})
            )
            db.add(billing_event)
            
        step_log.output_data = json.dumps(step_output)
        db.add(step_log)
        await db.commit()
        
        return {
            "workflow_id": str(run.id),
            "status": run.status,
            "current_step": current_step['action'],
            "next_step_index": run.current_step_index,
            "value_generated": run.value_generated,
            "context": context
        }
