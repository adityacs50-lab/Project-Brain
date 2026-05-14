import asyncio
from backend.db import AsyncSessionLocal
from backend.models import Rule
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as db:
        stmt = select(Rule).where(Rule.workspace_id == "demo-workspace")
        result = await db.execute(stmt)
        rules = result.scalars().all()
        print(f"FOUND {len(rules)} RULES IN DB")
        for r in rules:
            print(f"- {r.title} | Status: {r.status} | ID: {r.id}")

if __name__ == "__main__":
    asyncio.run(check())
