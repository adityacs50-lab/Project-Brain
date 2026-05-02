import asyncio
import json
from backend.versioning import get_model
from backend.db import AsyncSessionLocal
from sqlalchemy import select, cast, Float
from backend.models import Rule

async def check():
    query_text = 'process refund request. Context: {"issue": "customer wants refund of $350", "customer_tenure": "3 months", "ticket_priority": "high"}'
    model = get_model()
    emb = model.encode(query_text).tolist()
    
    async with AsyncSessionLocal() as db:
        stmt = select(Rule.title, Rule.rule_text, cast(1 - Rule.embedding.cosine_distance(emb), Float).label("sim")).order_by(Rule.embedding.cosine_distance(emb)).limit(3)
        res = await db.execute(stmt)
        for r in res:
            print(f"Title: {r.title}, Sim: {r.sim}")

if __name__ == "__main__":
    asyncio.run(check())
