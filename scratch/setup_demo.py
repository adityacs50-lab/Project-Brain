import asyncio
import uuid
from datetime import datetime
from backend.db import AsyncSessionLocal, engine
from backend.models import SlackWorkspace, SlackMessage, Base

async def setup_demo():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Ensure workspace exists
        ws = await db.get(SlackWorkspace, "demo-workspace")
        if not ws:
            ws = SlackWorkspace(
                workspace_id="demo-workspace",
                bot_token="xoxb-mock",
                team_name="Demo Team"
            )
            db.add(ws)
            print("Created demo-workspace")
        
        # 2. Insert the trigger message
        msg = SlackMessage(
            id=uuid.uuid4(),
            message_id=f"msg-{uuid.uuid4().hex[:8]}",
            workspace_id="demo-workspace",
            channel_id="C12345",
            user_id="U12345",
            sender="CTO",
            text="Hey team, effective immediately, all software subscriptions over $50/month require CTO approval.",
            ts=str(datetime.utcnow().timestamp()),
            timestamp=datetime.utcnow(),
            is_logic_candidate=True
        )
        db.add(msg)
        await db.commit()
        print("Inserted trigger message")

if __name__ == "__main__":
    asyncio.run(setup_demo())
