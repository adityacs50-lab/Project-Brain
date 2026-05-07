import asyncio
import os
import sys
from dotenv import load_dotenv

# Set up environment
load_dotenv()
sys.path.append(os.getcwd())

from backend.extractor import run_extraction_pipeline

async def test():
    print("Running extraction pipeline...")
    try:
        result = await run_extraction_pipeline()
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
