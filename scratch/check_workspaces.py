import asyncio
from backend.db import AsyncSessionLocal
from backend.models import SlackWorkspace
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(SlackWorkspace))
        rows = result.scalars().all()
        print(f"Workspaces: {[r.workspace_id for r in rows]}")

if __name__ == "__main__":
    asyncio.run(check())
