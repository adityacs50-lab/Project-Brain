import asyncio
from backend.db import AsyncSessionLocal
from backend.models import SlackMessage
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(SlackMessage).order_by(SlackMessage.created_at.desc()).limit(5))
        rows = result.scalars().all()
        print(f"Latest messages: {[r.text for r in rows]}")

if __name__ == "__main__":
    asyncio.run(check())
