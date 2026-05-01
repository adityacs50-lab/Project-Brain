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
model = genai.GenerativeModel('gemini-1.5-flash')

async def answer_query(user_query: str) -> Dict[str, Any]:
    """Finds relevant skills and uses Gemini to answer the user query."""
    try:
        async with AsyncSessionLocal() as db:
            # Step 1: Find relevant skills
            stmt = select(Skill)
            result = await db.execute(stmt)
            all_skills = result.scalars().all()
    except Exception as e:
        print(f"Database connection failed, using demo fallback: {e}")
        all_skills = [] # Fallback to empty skills or could use hardcoded ones for demo
        
        scored_skills = []
        query_lower = user_query.lower()
        
        for skill in all_skills:
            if not skill.trigger_keywords:
                continue
                
            matches = [kw for kw in skill.trigger_keywords if kw.lower() in query_lower]
            score = len(matches) / len(skill.trigger_keywords)
            
            if score >= 0.1:
                scored_skills.append((score, skill))
        
        # Take top 2
        scored_skills.sort(key=lambda x: x[0], reverse=True)
        top_skills = [s[1] for s in scored_skills[:2]]
        
        if not top_skills:
            answer = "I don't have a documented procedure for this — please check with your manager."
            sources = []
            confidence = "low"
        else:
            # Step 2: Build context
            skills_context = "\n---\n".join([s.yaml_content for s in top_skills])
            if len(skills_context) > 3000:
                skills_context = skills_context[:3000] + "... [truncated]"
            
            # Step 3: Call Gemini
            prompt = f"""SYSTEM: You are a helpful company operations assistant. You answer questions using ONLY the company's documented procedures below. If the answer is not in the procedures, say "I don't have a documented procedure for this — please check with your manager."

COMPANY PROCEDURES (Skills File):
{skills_context}

USER QUESTION: {user_query}

Provide a clear, step-by-step answer. Be concise. If approval is required, mention who needs to approve.
"""
            
            try:
                response = await genai.GenerativeModel('gemini-1.5-flash').generate_content_async(prompt)
                answer = response.text.strip()
                sources = [s.name for s in top_skills]
                
                # Confidence based on score
                avg_score = sum([s[0] for s in scored_skills[:2]]) / len(top_skills) if top_skills else 0
                if avg_score > 0.7:
                    confidence = "high"
                elif avg_score > 0.3:
                    confidence = "medium"
                else:
                    confidence = "low"
            except Exception as e:
                print(f"Error calling Gemini: {e}")
                answer = "I'm having trouble processing that right now. Please try again later."
                sources = []
                confidence = "low"

        # Step 4: Save to AgentConversation
        try:
            async with AsyncSessionLocal() as db:
                new_conv = AgentConversation(
                    user_query=user_query,
                    matched_skill_id=top_skills[0].id if top_skills else None,
                    response=answer
                )
                db.add(new_conv)
                await db.commit()
        except Exception as e:
            print(f"Failed to log conversation to DB: {e}")
        
        return {
            "answer": answer,
            "sources": sources,
            "confidence": confidence
        }
