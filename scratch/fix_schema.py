from sqlalchemy import text
from backend.db import engine
import asyncio

async def fix_schema():
    async with engine.begin() as conn:
        print("Adding missing columns to 'rules' table...")
        try:
            await conn.execute(text("ALTER TABLE rules ADD COLUMN IF NOT EXISTS approved_by VARCHAR;"))
            await conn.execute(text("ALTER TABLE rules ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;"))
            print("Successfully updated 'rules' table.")
        except Exception as e:
            print(f"Error updating 'rules': {e}")
            
        print("Creating 'rule_dependencies' table...")
        try:
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS rule_dependencies (
                    id UUID PRIMARY KEY,
                    rule_id UUID REFERENCES rules(id),
                    depends_on_id UUID REFERENCES rules(id),
                    dependency_type VARCHAR,
                    created_at TIMESTAMP
                );
            """))
            print("Successfully created 'rule_dependencies'.")
        except Exception as e:
            print(f"Error creating 'rule_dependencies': {e}")

        print("Creating 'workspace_niches' table...")
        try:
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS workspace_niches (
                    workspace_id VARCHAR PRIMARY KEY REFERENCES slack_workspaces(workspace_id),
                    industry VARCHAR,
                    special_logic_notes TEXT,
                    updated_at TIMESTAMP
                );
            """))
            print("Successfully created 'workspace_niches'.")
        except Exception as e:
            print(f"Error creating 'workspace_niches': {e}")

if __name__ == "__main__":
    asyncio.run(fix_schema())
