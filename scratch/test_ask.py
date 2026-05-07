import asyncio
import os
import sys
sys.path.append(os.getcwd())
from dotenv import load_dotenv
from backend.executor import answer_query

load_dotenv()

async def test_ask():
    workspace_id = "T0B27A94NN4"
    query = "can I approve a refund without VP approval?"
    print(f"Querying: {query}")
    
    result = await answer_query(query, workspace_id)
    
    print("\n--- AGENT RESPONSE ---")
    print(f"Answer: {result.get('answer')}")
    print(f"Sources: {result.get('sources')}")
    print(f"Confidence: {result.get('confidence')}")
    print(f"Action: {result.get('action')}")

if __name__ == "__main__":
    asyncio.run(test_ask())
