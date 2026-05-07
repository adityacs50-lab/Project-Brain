import asyncio
import os
import sys
sys.path.append(os.getcwd())
from dotenv import load_dotenv
from sqlalchemy import text
from backend.db import engine

load_dotenv()

async def inspect_rules():
    print("Inspecting rules text for T0B27A94NN4...")
    query = "SELECT title, rule_text FROM rules WHERE workspace_id = 'T0B27A94NN4' AND status = 'active';"
    
    async with engine.connect() as conn:
        result = await conn.execute(text(query))
        rows = result.fetchall()
        
        for row in rows:
            print(f"\n--- {row[0]} ---")
            print(row[1])

if __name__ == "__main__":
    asyncio.run(inspect_rules())
