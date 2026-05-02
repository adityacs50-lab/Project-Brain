import asyncio
from backend.db import AsyncSessionLocal
from backend.models import Contradiction, Rule
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as db:
        res_c = await db.execute(select(Contradiction))
        contradictions = res_c.scalars().all()
        print(f"Contradictions: {len(contradictions)}")
        
        res_r = await db.execute(select(Rule))
        rules = res_r.scalars().all()
        print(f"Rules: {len(rules)}")
        for r in rules:
            print(f"Rule: {r.title} - Status: {r.status}")

if __name__ == "__main__":
    asyncio.run(check())
