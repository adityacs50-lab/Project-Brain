import asyncio
import os
from backend.db import AsyncSessionLocal
from backend.models import AgentDecisionLog
from sqlalchemy import select, func
from dotenv import load_dotenv

load_dotenv()

async def check_logs():
    async with AsyncSessionLocal() as db:
        stmt = select(func.count(AgentDecisionLog.id)).where(AgentDecisionLog.workspace_id == 'T0B27A94NN4')
        result = await db.execute(stmt)
        count = result.scalar()
        print(f"DECISION_LOGS_COUNT: {count}")
        
        stmt = select(AgentDecisionLog.action, AgentDecisionLog.decision).where(AgentDecisionLog.workspace_id == 'T0B27A94NN4').order_by(AgentDecisionLog.created_at.desc()).limit(5)
        result = await db.execute(stmt)
        logs = result.all()
        print(f"RECENT_LOGS: {logs}")

if __name__ == "__main__":
    asyncio.run(check_logs())
