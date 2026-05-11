import asyncio
import json
from backend.db import AsyncSessionLocal
from backend.models import Rule
from sqlalchemy import select, cast, Float
from backend.versioning import get_model

async def diagnose_similarity():
    print("Diagnosing Semantic Matcher...")
    model_instance = get_model()
    query_text = "issue a $200 refund"
    query_embedding = model_instance.encode(query_text).tolist()
    
    async with AsyncSessionLocal() as db:
        stmt = select(Rule).where(Rule.workspace_id == "demo-workspace")
        result = await db.execute(stmt)
        rules = result.scalars().all()
        
        print(f"Found {len(rules)} rules in demo-workspace.\n")
        
        for r in rules:
            # Manually calculate cosine similarity if possible, or just look at the text
            # Since we can't easily run the pgvector distance here without a real DB connection string, 
            # we'll just check the text mapping.
            print(f"RULE: {r.title}")
            print(f"TEXT: {r.rule_text}")
            print(f"EMBEDDING SIZE: {len(r.embedding) if r.embedding else 'MISSING'}")
            print("-" * 20)

if __name__ == "__main__":
    asyncio.run(diagnose_similarity())
