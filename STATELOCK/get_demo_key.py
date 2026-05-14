import asyncio
from backend.db import AsyncSessionLocal
from backend.models import SlackWorkspace
from sqlalchemy import select

async def get_key():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(SlackWorkspace).where(SlackWorkspace.workspace_id == 'demo-workspace'))
        ws = res.scalar_one()
        print(f"API_KEY={ws.api_key}")

if __name__ == "__main__":
    asyncio.run(get_key())
