import asyncio
import os
from dotenv import load_dotenv

# Set up environment
load_dotenv()

# Set PYTHONPATH to include the current directory
import sys
sys.path.append(os.getcwd())

from backend.extractor import run_extraction_pipeline

async def test_live_extraction():
    print("Starting Live Groq Extraction Test...")
    try:
        result = await run_extraction_pipeline()
        print("\nExtraction Complete!")
        print(f"Processed: {result.get('processed')}")
        print(f"Skills Created: {result.get('skills_created')}")
        if result.get('errors') > 0:
            print(f"Errors: {result.get('error_details')}")
    except Exception as e:
        print(f"Fatal Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_live_extraction())
