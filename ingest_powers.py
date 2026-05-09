import os
import asyncio
import google.generativeai as genai
from backend.db import AsyncSessionLocal
from backend.models import WorkspaceNiche, SlackWorkspace
from sqlalchemy import select
from dotenv import load_dotenv

from openai import OpenAI

load_dotenv()

# Gemini Config
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Groq Config
groq_client = OpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)

async def call_groq(prompt: str):
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq failed: {e}")
        return None

async def ingest_powers(workspace_id: str, file_path: str):
    print(f"Reading {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read()

    # Use first 15k characters to get the core logic
    context_chunk = text[:15000]
    
    prompt = f"""
    SYSTEM: You are a business strategy analyst. You are processing the book '7 Powers' by Hamilton Helmer.
    
    USER: Extract the core strategic principles (the 7 Powers) and any specific operational 'rules' or 'guardrails' suggested for a company. 
    Format them as a concise set of 'Company Strategic Secrets' that an AI agent should follow when making decisions.
    
    BOOK CONTENT SNIPPET:
    {context_chunk}
    
    Respond with a clean, structured summary. Use bullet points. Focus on 'Deterministic' logic (e.g., 'Always prioritize scale economies over short-term margin').
    """

    print("Generating strategic summary via Groq...")
    try:
        secrets = await call_groq(prompt)
    except Exception as ge:
        print(f"Groq exception: {ge}")
        secrets = None
    
    if not secrets:
        print("Groq failed or returned empty. Trying Gemini...")
        # Try multiple model names as fallbacks
        model_names = ['gemini-1.5-flash-latest', 'gemini-1.5-pro-latest', 'gemini-pro']
        for m_name in model_names:
            try:
                print(f"Trying model {m_name}...")
                m = genai.GenerativeModel(m_name)
                resp = m.generate_content(prompt)
                if resp:
                    secrets = resp.text
                    break
            except Exception as e:
                print(f"Model {m_name} failed: {e}")
                continue

    if not secrets:
        print("All models failed. Using manual summary.")
        secrets = "Hamilton Helmer's 7 Powers:\n1. Scale Economies\n2. Network Economies\n3. Counter-Positioning\n4. Switching Costs\n5. Branding\n6. Cornered Resource\n7. Process Power\n\nOperational Rules:\n- Always prioritize scale economies over short-term margin.\n- Leverage network effects to create moat."

    print(f"Seeding database for {workspace_id}...")
    async with AsyncSessionLocal() as db:
        # Ensure workspace exists
        stmt = select(SlackWorkspace).where(SlackWorkspace.workspace_id == workspace_id)
        result = await db.execute(stmt)
        ws = result.scalar_one_or_none()
        
        if not ws:
            print(f"Workspace {workspace_id} not found.")
            return

        # Update or create niche
        stmt = select(WorkspaceNiche).where(WorkspaceNiche.workspace_id == workspace_id)
        result = await db.execute(stmt)
        niche = result.scalar_one_or_none()
        
        if niche:
            niche.special_logic_notes = secrets
        else:
            niche = WorkspaceNiche(
                workspace_id=workspace_id,
                industry="Strategic Growth (7 Powers)",
                special_logic_notes=secrets
            )
            db.add(niche)
            
        await db.commit()
        print(f"Successfully ingested 7 Powers for {workspace_id}")
        
        # Save to a file for review
        with open('7_powers_summary.md', 'w', encoding='utf-8') as f:
            f.write(secrets)
        print("Summary saved to 7_powers_summary.md")

if __name__ == "__main__":
    # Using 'T0B27A94NN4' (Adityas Workshop) as the target
    asyncio.run(ingest_powers("T0B27A94NN4", "powers_principles.txt"))
