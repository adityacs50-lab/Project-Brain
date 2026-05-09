import asyncio
from backend.db import AsyncSessionLocal
from backend.models import SlackWorkspace
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        stmt = select(SlackWorkspace)
        result = await db.execute(stmt)
        workspaces = result.scalars().all()
        for ws in workspaces:
            print(f"ID: {ws.workspace_id}, Name: {ws.team_name}")

if __name__ == "__main__":
    asyncio.run(main())
