import asyncio
import os
from backend.db import AsyncSessionLocal
from backend.models import Rule
from sqlalchemy import select, func
from dotenv import load_dotenv

load_dotenv()

async def check_rules():
    async with AsyncSessionLocal() as db:
        stmt = select(func.count(Rule.id)).where(Rule.workspace_id == 'T0B27A94NN4', Rule.status == 'active')
        result = await db.execute(stmt)
        count = result.scalar()
        print(f"ACTIVE_RULES_COUNT: {count}")
        
        stmt = select(Rule.title).where(Rule.workspace_id == 'T0B27A94NN4', Rule.status == 'active').limit(5)
        result = await db.execute(stmt)
        titles = result.scalars().all()
        print(f"ACTIVE_RULES_TITLES: {titles}")

if __name__ == "__main__":
    asyncio.run(check_rules())
