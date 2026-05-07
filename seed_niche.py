import asyncio
from backend.db import AsyncSessionLocal
from backend.models import WorkspaceNiche, SlackWorkspace
from sqlalchemy import select

async def seed_niche(workspace_id: str, industry: str, secrets: str):
    async with AsyncSessionLocal() as db:
        # Ensure workspace exists
        stmt = select(SlackWorkspace).where(SlackWorkspace.workspace_id == workspace_id)
        result = await db.execute(stmt)
        ws = result.scalar_one_or_none()
        
        if not ws:
            print(f"Workspace {workspace_id} not found. Creating it...")
            ws = SlackWorkspace(workspace_id=workspace_id, team_name=f"{industry.title()} Team")
            db.add(ws)
            await db.commit()

        # Update or create niche
        stmt = select(WorkspaceNiche).where(WorkspaceNiche.workspace_id == workspace_id)
        result = await db.execute(stmt)
        niche = result.scalar_one_or_none()
        
        if niche:
            niche.industry = industry
            niche.special_logic_notes = secrets
        else:
            niche = WorkspaceNiche(
                workspace_id=workspace_id,
                industry=industry,
                special_logic_notes=secrets
            )
            db.add(niche)
            
        await db.commit()
        print(f"✅ Seeded {industry} secrets for {workspace_id}")

if __name__ == "__main__":
    # Example: Seed Fintech Secrets for the test workspace
    asyncio.run(seed_niche(
        "test-workspace-1", 
        "fintech", 
        "All transactions over $10k must trigger AML-01 checks. Refunds are only permitted for users with verified KYC. Escalations go to the Compliance Lead."
    ))
