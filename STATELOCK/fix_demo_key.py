import asyncio
from backend.db import AsyncSessionLocal
from backend.models import SlackWorkspace
from sqlalchemy import select

async def fix():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(SlackWorkspace).where(SlackWorkspace.workspace_id == 'demo-workspace'))
        ws = res.scalar_one()
        ws.api_key = 'sk-demo-12345678'
        await db.commit()
        print("API_KEY FIXED: sk-demo-12345678")

if __name__ == "__main__":
    asyncio.run(fix())
