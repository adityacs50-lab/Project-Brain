import asyncio
from backend.db import AsyncSessionLocal
from backend.models import WorkspaceNiche, SlackWorkspace
from sqlalchemy import select

SECRETS = """# Hamilton Helmer's 7 Powers: Strategic Secrets

## 1. Scale Economies
- **Logic:** Unit costs decline as volume increases.
- **Rule:** Always prioritize market share and volume in segments where we have a cost advantage. Never cede volume to competitors in scale-sensitive areas.

## 2. Network Economies
- **Logic:** The value of the service increases with the number of users.
- **Rule:** Maximize user acquisition speed. Subsidize the 'on-ramp' if necessary to reach critical mass before competitors.

## 3. Counter-Positioning
- **Logic:** A new business model that an incumbent cannot mimic without damaging their existing business.
- **Rule:** Identify 'incumbent's dilemma' opportunities. If a competitor's business model prevents them from following our lead, double down on that specific innovation.

## 4. Switching Costs
- **Logic:** It is easier/cheaper to stay with us than to move to a competitor.
- **Rule:** Focus on deep integration with customer workflows. Make the cost of exit higher than the cost of renewal through superior data and habit formation.

## 5. Branding
- **Logic:** Higher value attribution based on perceived quality and trust.
- **Rule:** Maintain premium positioning. Never discount if it dilutes the long-term brand equity, even if short-term sales are lost.

## 6. Cornered Resource
- **Logic:** Preferential access to a coveted asset (talent, IP, geography).
- **Rule:** Aggressively secure and protect key talent and intellectual property. These are the non-negotiable moats.

## 7. Process Power
- **Logic:** Embedded organizational muscle that is difficult to replicate.
- **Rule:** Codify every successful process into the 'Company Brain'. Continuous improvement is the only way to maintain this power.

---
**DETERMINISTIC GUARDRAILS:**
- If a decision threatens one of our 'Powers', it must be escalated to the Strategy Lead.
- Prioritize long-term 'Power' accumulation over short-term EBITDA optimization.
"""

async def main():
    workspace_id = "T0B27A94NN4" # Adityas Workshop
    async with AsyncSessionLocal() as db:
        stmt = select(WorkspaceNiche).where(WorkspaceNiche.workspace_id == workspace_id)
        result = await db.execute(stmt)
        niche = result.scalar_one_or_none()
        
        if niche:
            niche.special_logic_notes = SECRETS
            niche.industry = "Strategic Control Plane (7 Powers)"
        else:
            niche = WorkspaceNiche(
                workspace_id=workspace_id,
                industry="Strategic Control Plane (7 Powers)",
                special_logic_notes=SECRETS
            )
            db.add(niche)
            
        await db.commit()
        print(f"Successfully seeded 7 Powers for {workspace_id}")

if __name__ == "__main__":
    asyncio.run(main())
