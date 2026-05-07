import os
import uuid
from datetime import datetime
from typing import List, Dict, Any
from sqlalchemy import select
from backend.db import AsyncSessionLocal
from backend.models import Skill, AgentConversation
from dotenv import load_dotenv
from openai import AsyncOpenAI

load_dotenv()

# Configure Groq (OpenAI compatible)
groq_client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

async def answer_query(user_query: str, workspace_id: str) -> Dict[str, Any]:
    """🛡️ THIEL PROTOCOL RULE 3: DETERMINISTIC ENFORCEMENT.
    Finds relevant rules using vector similarity and enforces actions strictly.
    """
    from backend.versioning import get_model
    from backend.models import Rule, AgentDecisionLog
    from sqlalchemy import select, and_, or_

    model_instance = get_model()
    embedding = model_instance.encode(user_query).tolist()
    
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
                rules_context = "\n---\n".join([f"Rule: {r.title} (Action: {r.action_type})\n{r.rule_text}" for r in active_rules])
                
                prompt = f"""SYSTEM: You are a high-precision company operations assistant. 
Answer the QUESTION using ONLY the PROCEDURES below.

STRICT RULES:
1. If the PROCEDURE says "Action: denied", you MUST deny the request.
2. If the PROCEDURE says "Action: escalate", you MUST tell the user you are escalating to a manager.
3. If no procedure perfectly matches, explain what IS documented and why it doesn't quite answer the specific question.
4. If the question asks about a specific person/role (e.g. VP) and the procedure mentions a different role (e.g. Manager), state the requirement for the documented role.

PROCEDURES:
{rules_context}

QUESTION: {user_query}"""
                
                response = await groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": prompt}]
                )
                final_answer = response.choices[0].message.content.strip()
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
