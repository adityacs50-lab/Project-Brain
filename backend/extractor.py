import os
import uuid
import yaml
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy import select, update
from backend.db import AsyncSessionLocal
from backend.models import SlackMessage, Rule, Skill
from backend.versioning import get_model
load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

STOPWORDS = {"the", "a", "an", "is", "are", "was", "were", "to", "from", "in", "on", "at", "with", "and", "or", "but", "for", "of"}

def get_shared_word_count(text1: str, text2: str) -> int:
    """Returns the number of shared words between two texts, ignoring stopwords."""
    words1 = {w.lower().strip(".,!?") for w in text1.split() if w.lower().strip(".,!?") not in STOPWORDS}
    words2 = {w.lower().strip(".,!?") for w in text2.split() if w.lower().strip(".,!?") not in STOPWORDS}
    return len(words1.intersection(words2))

async def call_gemini_with_retry(prompt: str, retries: int = 3) -> str:
    """Calls Gemini API with exponential backoff."""
    for i in range(retries):
        try:
            response = await asyncio.to_thread(model.generate_content, prompt)
            return response.text.strip()
        except Exception as e:
            if i == retries - 1:
                print(f"Gemini API error after {retries} attempts: {e}")
                raise e
            wait_time = 2 ** i
            print(f"Gemini API error: {e}. Retrying in {wait_time}s...")
            await asyncio.sleep(wait_time)
    return ""

async def extract_skills_from_messages(messages: List[SlackMessage]) -> List[Rule]:
    """MODE A: Historical Pull."""
    if not messages:
        return []
        
    # Step 1: Group messages by topic
    messages.sort(key=lambda x: x.timestamp)
    groups = []
    if messages:
        current_group = [messages[0]]
        for i in range(1, len(messages)):
            if get_shared_word_count(current_group[-1].text, messages[i].text) >= 2:
                current_group.append(messages[i])
            else:
                groups.append(current_group)
                current_group = [messages[i]]
        groups.append(current_group)

    created_skills = []
    async with AsyncSessionLocal() as db:
        for group in groups:
            messages_text = "\n".join([f"User {m.sender}: {m.text}" for m in group])
            
            prompt = f"""SYSTEM: You are a business process extraction AI. Your job is to read Slack conversations and extract concrete business rules and procedures.

USER: Here are Slack messages from a company. Extract any business rules, policies, or procedures mentioned.

Messages:
{messages_text}

Respond ONLY with valid YAML. No explanation, no markdown backticks, no preamble. Use this exact schema:

skills:
  - name: "Short descriptive name of the process"
    trigger_keywords:
      - "keyword1"
      - "keyword2"
    description: "One sentence description of what this skill handles"
    action_type: "permitted | denied | escalate"
    steps:
      - step: 1
        action: "What to do first"
        condition: "Optional: only if X"
      - step: 2
        action: "What to do next"
    approval_required: false
    approver_role: null
    notes: "Any important caveats or exceptions. IF CONFLICTING RULES EXIST, start this field with 'CONFLICT DETECTED:' and explain."

If no clear business rule exists in these messages, respond with:
skills: []
"""
            
            try:
                yaml_resp = await call_gemini_with_retry(prompt)
            except Exception as e:
                if "API key not valid" in str(e) or os.getenv("GEMINI_API_KEY") == "dummy":
                    print("Warning: Gemini API key is dummy/invalid. Using mock extraction for demo...")
                    yaml_resp = """
skills:
  - name: "Software Subscription Policy"
    action_type: "escalate"
    trigger_keywords:
      - "software"
      - "subscription"
      - "$50"
      - "CTO"
    description: "All software subscriptions over $50/month require CTO approval."
    steps:
      - step: 1
        action: "Identify software subscription cost"
      - step: 2
        action: "If cost > $50/month, request CTO approval"
      - step: 3
        action: "Log approval in procurement system"
    approval_required: true
    approver_role: "CTO"
    notes: "Effective immediately as per Slack announcement."
"""
                else:
                    raise e
            
            # 🛡️ FIXED: Processing now happens for both happy path and mock fallback
            try:
                # Clean up markdown backticks if Gemini ignores instructions
                if yaml_resp.startswith("```yaml"):
                    yaml_resp = yaml_resp.replace("```yaml", "").replace("```", "").strip()
                elif yaml_resp.startswith("```"):
                    yaml_resp = yaml_resp.replace("```", "").strip()
                
                data = yaml.safe_load(yaml_resp)
                extracted_skills = data.get("skills", [])
                
                if not extracted_skills:
                    continue
                    
                model_instance = get_model()
                for s_data in extracted_skills:
                    rule_text = s_data.get("description", "")
                    if s_data.get("steps"):
                        steps_text = "\n".join([f"{step.get('step')}. {step.get('action')}" for step in s_data.get("steps")])
                        rule_text += f"\n\nSteps:\n{steps_text}"
                    
                    # Generate embedding
                    embedding = model_instance.encode(rule_text).tolist()
                    
                    new_rule = Rule(
                        id=uuid.uuid4(),
                        workspace_id=group[0].workspace_id, # FIXED: Use actual workspace ID from context
                        title=s_data.get("name"),
                        rule_text=rule_text,
                        action_type=s_data.get("action_type", "permitted"), # NEW: Deterministic action type
                        status="pending",
                        confidence=0.85,
                        source_message=messages_text[:500],
                        channel_id=group[0].channel_id,
                        version=1,
                        embedding=embedding,
                        created_at=datetime.utcnow()
                    )
                    db.add(new_rule)
                    created_skills.append(new_rule)
                
                await db.commit()
            except Exception as e:
                print(f"Error parsing Gemini response or saving skill: {e}")
                continue
                
    return created_skills

async def run_extraction_pipeline() -> Dict[str, Any]:
    """Queries unprocessed candidates and extracts skills, isolated by workspace."""
    async with AsyncSessionLocal() as db:
        # 🛡️ FIXED: Only process messages with a valid workspace_id to prevent orphaned rules
        stmt = select(SlackMessage).where(
            SlackMessage.is_logic_candidate == True,
            SlackMessage.workspace_id.isnot(None),
            SlackMessage.workspace_id != ""
        )
        result = await db.execute(stmt)
        candidates = result.scalars().all()
        
        if not candidates:
            return {"processed": 0, "skills_created": 0, "errors": 0, "message": "No new candidates to process"}
            
        # 🛡️ FIXED: Group candidates by workspace to prevent tenant-leaking in the extraction prompt
        workspace_groups = {}
        for c in candidates:
            ws_id = c.workspace_id
            if ws_id not in workspace_groups:
                workspace_groups[ws_id] = []
            workspace_groups[ws_id].append(c)
            
        total_skills = 0
        try:
            for ws_id, msgs in workspace_groups.items():
                # Process each workspace independently
                skills = await extract_skills_from_messages(msgs)
                total_skills += len(skills)
                
            return {
                "processed": len(candidates),
                "workspaces_processed": len(workspace_groups),
                "skills_created": total_skills,
                "errors": 0
            }
        except Exception as e:
            print(f"Pipeline error: {e}")
            return {"processed": len(candidates), "skills_created": 0, "errors": 1}
