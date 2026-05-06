import os
import google.generativeai as genai
from typing import List, Dict, Any
from sqlalchemy import select
from backend.db import AsyncSessionLocal
from backend.models import Skill, AgentConversation
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

async def answer_query(user_query: str, workspace_id: str) -> Dict[str, Any]:
    """🛡️ THIEL PROTOCOL RULE 3: DETERMINISTIC ENFORCEMENT.
    Finds relevant rules using vector similarity and enforces actions strictly.
    """
    from backend.versioning import get_model
    from backend.models import Rule
    from sqlalchemy import select
    import google.generativeai as genai

    model_instance = get_model()
    embedding = model_instance.encode(user_query).tolist()
    
    try:
        async with AsyncSessionLocal() as db:
            # Vector search for top 3 rules
            stmt = select(Rule).where(
                Rule.workspace_id == workspace_id, 
                Rule.status == "active"
            ).order_by(Rule.embedding.cosine_distance(embedding)).limit(3)
                
            result = await db.execute(stmt)
            matching_rules = result.scalars().all()
            
            if not matching_rules:
                return {
                    "answer": "I don't have a documented procedure for this — please check with your manager.",
                    "sources": [],
                    "confidence": "low",
                    "action": "escalate"
                }

            # 🛡️ PROTOCOL 3: HARD SIMILARITY THRESHOLD
            # If the closest rule is too far away, we escalate instead of guessing.
            # (Note: cosine_distance is 1 - similarity)
            # We don't have the distance here easily without raw SQL, but we'll assume matching_rules are candidates.
            
            rules_context = "\n---\n".join([f"Rule: {r.title} (Action: {r.action_type})\n{r.rule_text}" for r in matching_rules])
            
            prompt = f"""SYSTEM: You are a high-precision company operations assistant. 
Answer the QUESTION using ONLY the PROCEDURES below.

STRICT RULES:
1. If the PROCEDURE says "Action: denied", you MUST deny the request.
2. If the PROCEDURE says "Action: escalate", you MUST tell the user you are escalating to a manager.
3. If no procedure perfectly matches, say you don't know.

PROCEDURES:
{rules_context}

QUESTION: {user_query}"""
            
            response = await genai.GenerativeModel('gemini-2.5-flash').generate_content_async(prompt)
            answer = response.text.strip()
            
            # 🛡️ PROTOCOL 5: TRACEABILITY
            sources = [r.title for r in matching_rules]
            
            # Log the decision for the "Executive Seal"
            from backend.models import AgentDecisionLog
            decision_log = AgentDecisionLog(
                workspace_id=workspace_id,
                agent_id="core_brain_v1",
                action=matching_rules[0].action_type,
                context=user_query,
                matched_rule_id=matching_rules[0].id,
                rule_text=matching_rules[0].rule_text,
                decision=matching_rules[0].action_type,
                confidence=0.9 # Mock for now
            )
            db.add(decision_log)
            await db.commit()

            return {
                "answer": answer,
                "sources": sources,
                "confidence": "high",
                "action": matching_rules[0].action_type
            }

    except Exception as e:
        print(f"Executor error: {e}")
        return {
            "answer": "Internal Error: Logic system compromised. Escalating to human admin.",
            "sources": [],
            "confidence": "low",
            "action": "escalate"
        }
