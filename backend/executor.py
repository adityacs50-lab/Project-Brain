import os
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
    from backend.models import Rule
    from sqlalchemy import select, and_, or_

    model_instance = get_model()
    embedding = model_instance.encode(user_query).tolist()
    
    try:
        async with AsyncSessionLocal() as db:
            # Vector search for top 5 rules (broader search)
            # 🛡️ IMPROVED: We search for both active and pending to provide better feedback
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
                    return {
                        "answer": f"I found a potential match: '{pending_rules[0].title}', but it is currently PENDING human review (Thiel Protocol Rule 5). I cannot enforce it until it receives the Executive Seal.",
                        "sources": [r.title for r in pending_rules],
                        "confidence": "medium",
                        "action": "escalate",
                        "status": "pending_review"
                    }
                
                return {
                    "answer": "I don't have any active documented procedures for this request. Please check with your manager or submit a new policy via Slack.",
                    "sources": [],
                    "confidence": "low",
                    "action": "escalate"
                }

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
            
            # Use Groq for deterministic enforcement
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}]
            )
            answer = response.choices[0].message.content.strip()
            
            # 🛡️ PROTOCOL 5: TRACEABILITY
            sources = [r.title for r in active_rules]
            
            # Log the decision for the "Executive Seal"
            from backend.models import AgentDecisionLog
            decision_log = AgentDecisionLog(
                workspace_id=workspace_id,
                agent_id="core_brain_v1",
                action=active_rules[0].action_type,
                context=user_query,
                matched_rule_id=active_rules[0].id,
                rule_text=active_rules[0].rule_text,
                decision=active_rules[0].action_type,
                confidence=0.95
            )
            db.add(decision_log)
            await db.commit()

            return {
                "answer": answer,
                "sources": sources,
                "confidence": "high",
                "action": active_rules[0].action_type
            }

    except Exception as e:
        print(f"Executor error: {e}")
        return {
            "answer": f"Internal Error: Logic system compromised ({str(e)}). Escalating to human admin.",
            "sources": [],
            "confidence": "low",
            "action": "escalate"
        }
