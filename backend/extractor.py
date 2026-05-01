import os
import yaml
import asyncio
import google.generativeai as genai
from typing import List, Dict, Any
from datetime import datetime
from sqlalchemy import select, update
from backend.db import AsyncSessionLocal
from backend.models import SlackMessage, Skill
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

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

async def extract_skills_from_messages(messages: List[SlackMessage]) -> List[Skill]:
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
    steps:
      - step: 1
        action: "What to do first"
        condition: "Optional: only if X"
      - step: 2
        action: "What to do next"
    approval_required: false
    approver_role: null
    notes: "Any important caveats or exceptions"

If no clear business rule exists in these messages, respond with:
skills: []
"""
            
            try:
                yaml_resp = await call_gemini_with_retry(prompt)
                
                # Clean up markdown backticks if Gemini ignores instructions
                if yaml_resp.startswith("```yaml"):
                    yaml_resp = yaml_resp.replace("```yaml", "").replace("```", "").strip()
                elif yaml_resp.startswith("```"):
                    yaml_resp = yaml_resp.replace("```", "").strip()
                
                data = yaml.safe_load(yaml_resp)
                extracted_skills = data.get("skills", [])
                
                if not extracted_skills:
                    continue
                    
                for s_data in extracted_skills:
                    new_skill = Skill(
                        name=s_data.get("name"),
                        version="1.0.0",
                        yaml_content=yaml.dump(s_data),
                        trigger_keywords=s_data.get("trigger_keywords", []),
                        source_message_ids=[m.id for m in group]
                    )
                    db.add(new_skill)
                    created_skills.append(new_skill)
                
                await db.commit()
            except Exception as e:
                print(f"Error parsing Gemini response or saving skill: {e}")
                continue
                
    return created_skills

async def run_extraction_pipeline() -> Dict[str, Any]:
    """Queries unprocessed candidates and extracts skills."""
    async with AsyncSessionLocal() as db:
        # Get all candidates (we'll filter processed in a simple way for the MVP: 
        # messages not associated with any Skill yet)
        # Note: In a real app, we'd use a dedicated 'processed' flag on SlackMessage
        stmt = select(SlackMessage).where(SlackMessage.is_logic_candidate == True)
        result = await db.execute(stmt)
        candidates = result.scalars().all()
        
        if not candidates:
            return {"processed": 0, "skills_created": 0, "errors": 0}
            
        try:
            skills = await extract_skills_from_messages(candidates)
            return {
                "processed": len(candidates),
                "skills_created": len(skills),
                "errors": 0
            }
        except Exception as e:
            print(f"Pipeline error: {e}")
            return {"processed": len(candidates), "skills_created": 0, "errors": 1}
