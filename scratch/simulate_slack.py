import asyncio
import uuid
import sys
import os
from datetime import datetime
from backend.db import AsyncSessionLocal
from backend.models import SlackMessage

async def simulate_message(text, sender="CTO"):
    workspace_id = "demo-workspace"
    async with AsyncSessionLocal() as db:
        msg = SlackMessage(
            id=uuid.uuid4(),
            message_id=f"msg-{uuid.uuid4().hex[:8]}",
            workspace_id=workspace_id,
            channel_id="C-DEMO",
            user_id="U-DEMO",
            sender=sender,
            text=text,
            ts=str(datetime.utcnow().timestamp()),
            timestamp=datetime.utcnow(),
            is_logic_candidate=True
        )
        db.add(msg)
        await db.commit()
        print(f"Simulated Slack Message from {sender}: {text}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python simulate_slack.py 'Message text'")
    else:
        asyncio.run(simulate_message(sys.argv[1]))
