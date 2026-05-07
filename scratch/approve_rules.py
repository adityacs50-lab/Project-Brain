import asyncio
import os
import sys
sys.path.append(os.getcwd())
from dotenv import load_dotenv
from sqlalchemy import text, update
from backend.db import engine, AsyncSessionLocal
from backend.models import Rule

load_dotenv()

async def approve_all():
    print("Promoting all rules for T0B27A94NN4 to 'active'...")
    async with AsyncSessionLocal() as db:
        stmt = update(Rule).where(
            Rule.workspace_id == 'T0B27A94NN4'
        ).values(status='active', approved_by='admin')
        await db.execute(stmt)
        await db.commit()
    print("Done!")

if __name__ == "__main__":
    asyncio.run(approve_all())
