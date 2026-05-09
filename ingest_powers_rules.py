import asyncio
import uuid
from datetime import datetime
from backend.db import AsyncSessionLocal
from backend.models import Rule
from backend.versioning import get_model

RULES = [
    {
        "title": "Strategy Rule 1: Scale Economies",
        "text": "Rule: If a project increases volume by >20%, it is permitted even if short-term margins drop by up to 10%. Scale is the primary moat."
    },
    {
        "title": "Strategy Rule 2: Network Economies",
        "text": "Rule: Always approve integrations that increase user-to-user interaction. Network value is proportional to the square of the users."
    },
    {
        "title": "Strategy Rule 3: Counter-Positioning",
        "text": "Rule: If a new feature makes an incumbent competitor's core product obsolete, prioritize it over all maintenance tasks."
    },
    {
        "title": "Strategy Rule 4: Switching Costs",
        "text": "Rule: Deny any request to simplify data export if it reduces customer lock-in without a clear strategic trade-off."
    },
    {
        "title": "Strategy Rule 5: Branding",
        "text": "Rule: Escalate any UI/UX change that violates the 'Premium' brand guidelines. Brand is the emotional moat."
    },
    {
        "title": "Strategy Rule 6: Cornered Resource",
        "text": "Rule: All employment offers for 'A-player' talent are auto-approved if within 20% of budget. Talent is a cornered resource."
    },
    {
        "title": "Strategy Rule 7: Process Power",
        "text": "Rule: Any process that has been successfully executed 3 times must be codified into the Company Brain. Tribal knowledge is a risk."
    }
]

async def main():
    workspace_id = "T0B27A94NN4"
    model = get_model()
    
    async with AsyncSessionLocal() as db:
        for r_data in RULES:
            # Generate embedding
            embedding = model.encode(r_data["text"]).tolist()
            
            new_rule = Rule(
                id=uuid.uuid4(),
                workspace_id=workspace_id,
                title=r_data["title"],
                rule_text=r_data["text"],
                action_type="permitted", # Defaulting to permitted for these strategic guidelines
                status="active",
                confidence=1.0,
                source_message="Extracted from 7 Powers (Hamilton Helmer)",
                version=1,
                embedding=embedding,
                created_at=datetime.utcnow()
            )
            db.add(new_rule)
            
        await db.commit()
        print(f"Successfully ingested 7 Strategic Rules for {workspace_id}")

if __name__ == "__main__":
    asyncio.run(main())
