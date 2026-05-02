import asyncio
from backend.db import AsyncSessionLocal
from backend.models import Rule, Contradiction, QueryLog
from sqlalchemy import delete

async def clear_test_data():
    async with AsyncSessionLocal() as db:
        await db.execute(delete(Contradiction).where(Contradiction.workspace_id == "test-workspace-1"))
        await db.execute(delete(Rule).where(Rule.workspace_id == "test-workspace-1"))
        await db.execute(delete(QueryLog).where(QueryLog.workspace_id == "test-workspace-1"))
        await db.commit()
        print("Test data cleared for test-workspace-1")

if __name__ == "__main__":
    asyncio.run(clear_test_data())
