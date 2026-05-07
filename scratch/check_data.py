import asyncio
from backend.db import AsyncSessionLocal
from backend.models import RuleDependency, Rule
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as db:
        rules = await db.execute(select(Rule))
        deps = await db.execute(select(RuleDependency))
        
        rules_list = rules.scalars().all()
        deps_list = deps.scalars().all()
        
        print(f"Total Rules: {len(rules_list)}")
        print(f"Total Dependencies: {len(deps_list)}")
        
        for d in deps_list:
            print(f"Dep: {d.rule_id} -> {d.depends_on_id}")

if __name__ == "__main__":
    asyncio.run(check())
