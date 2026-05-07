import asyncio
import os
from dotenv import load_dotenv
import sys
sys.path.append(os.getcwd())
from sqlalchemy import text
from backend.db import engine

load_dotenv()

async def check_embeddings():
    print("Checking rules table for embeddings...")
    query = "SELECT title, workspace_id, LENGTH(embedding::text) as embedding_size FROM rules LIMIT 5;"
    
    async with engine.connect() as conn:
        result = await conn.execute(text(query))
        rows = result.fetchall()
        
        if not rows:
            print("No rules found in database.")
            return

        print(f"{'Title':<30} | {'Workspace ID':<15} | {'Embedding Size'}")
        print("-" * 65)
        for row in rows:
            print(f"{row[0]:<30} | {row[1]:<15} | {row[2]}")

if __name__ == "__main__":
    asyncio.run(check_embeddings())
