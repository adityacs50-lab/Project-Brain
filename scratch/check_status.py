import os
import sys
sys.path.append(os.getcwd())
import asyncio
from dotenv import load_dotenv
from sqlalchemy import text
from backend.db import engine

load_dotenv()

async def check_status():
    print("Checking rules status...")
    query = "SELECT title, workspace_id, status FROM rules WHERE workspace_id = 'T0B27A94NN4';"
    
    async with engine.connect() as conn:
        result = await conn.execute(text(query))
        rows = result.fetchall()
        
        if not rows:
            print("No rules found for T0B27A94NN4.")
            return

        print(f"{'Title':<40} | {'Status'}")
        print("-" * 55)
        for row in rows:
            print(f"{row[0]:<40} | {row[2]}")

if __name__ == "__main__":
    asyncio.run(check_status())
