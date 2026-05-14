import asyncio
from backend.db import AsyncSessionLocal
from backend.models import Rule
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as db:
        stmt = select(Rule).where(Rule.workspace_id == "demo-workspace")
        result = await db.execute(stmt)
        rules = result.scalars().all()
        print(f"POLLING DEMO-WORKSPACE POLICIES ({len(rules)} total)")
        for r in rules:
            print(f"[{r.status.upper()}] {r.title}")
            print(f"   Action: {r.action_type}")
            print(f"   Text:   {r.rule_text}")
            print(f"   Value:  {r.threshold_value}")
            print("-" * 30)

if __name__ == "__main__":
    asyncio.run(check())
