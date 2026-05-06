import asyncio
import uuid
from datetime import datetime
from backend.db import AsyncSessionLocal, engine
from backend.models import SlackWorkspace, SlackMessage, Rule, Contradiction, QueryLog, Base
from sqlalchemy import delete

async def prepare_demo():
    print("--- Preparing Company Brain Demo ---")
    
    # 1. Initialize Tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    workspace_id = "demo-workspace"
    
    async with AsyncSessionLocal() as db:
        # 2. Clear Existing Demo Data
        print(f"Cleaning up {workspace_id}...")
        await db.execute(delete(Contradiction).where(Contradiction.workspace_id == workspace_id))
        await db.execute(delete(Rule).where(Rule.workspace_id == workspace_id))
        await db.execute(delete(QueryLog).where(QueryLog.workspace_id == workspace_id))
        await db.execute(delete(SlackMessage).where(SlackMessage.workspace_id == workspace_id))
        
        # 3. Ensure Workspace Exists
        ws = await db.get(SlackWorkspace, workspace_id)
        if not ws:
            ws = SlackWorkspace(
                workspace_id=workspace_id,
                bot_token="xoxb-mock",
                team_name="Demo Team"
            )
            db.add(ws)
            print(f"Created {workspace_id}")
        
        await db.commit()
    
    print("\nWorkspace is CLEAN and ready for recording.")
    print("1. Start Backend: python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000")
    print("2. Start Frontend: npm run dev (in next-app directory)")
    print("\nDemo Steps:")
    print("Part 1: Type policy in Slack (or use simulate_slack.py)")
    print("Part 2: Go to http://localhost:3000/review, Approve the rule")
    print("Part 3: Query the API: POST http://localhost:8000/ask {'query': 'Can I buy a $99/month Cursor license?'}")
    print("Part 4: Type conflicting policy in Slack, check dashboard for contradiction")

if __name__ == "__main__":
    asyncio.run(prepare_demo())
