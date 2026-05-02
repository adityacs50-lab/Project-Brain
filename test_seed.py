import asyncio
from backend.agent_api import seed_agent_rules

async def main():
    try:
        res = await seed_agent_rules("test-workspace-1")
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
