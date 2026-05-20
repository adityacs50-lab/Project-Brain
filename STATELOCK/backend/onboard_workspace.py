import asyncio
import argparse
import secrets
import sys
import re
from sqlalchemy import select
from backend.db import AsyncSessionLocal
from backend.models import SlackWorkspace

def slugify(text: str) -> str:
    """Convert text to a clean URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text

async def onboard_workspace(name: str, workspace_id: str | None = None, api_key: str | None = None):
    # 1. Resolve Workspace ID (generate if none)
    if not workspace_id:
        workspace_id = slugify(name)
        # Ensure it's not empty
        if not workspace_id:
            workspace_id = "workspace-" + secrets.token_hex(4)
    
    # 2. Resolve API Key (generate if none)
    if not api_key:
        api_key = f"sl_live_{secrets.token_hex(20)}"
        
    print("\n" + "="*50)
    print("      [STATELOCK] WORKSPACE ONBOARDING PROTOCOL")
    print("="*50)
    print(f"Company/Team Name : {name}")
    print(f"Target ID         : {workspace_id}")
    print(f"API Key           : {api_key}")
    print("-"*50)
    print("Connecting to database...")

    async with AsyncSessionLocal() as db:
        try:
            # Check if workspace_id already exists
            stmt = select(SlackWorkspace).where(SlackWorkspace.workspace_id == workspace_id)
            result = await db.execute(stmt)
            existing = result.scalar_one_or_none()
            
            if existing:
                print(f"\n[ERROR] Workspace ID '{workspace_id}' already exists!")
                print(f"Existing Workspace Name: '{existing.team_name}'")
                print("Please choose a different Workspace ID or let it auto-generate.")
                sys.exit(1)
                
            # Check if api_key already exists
            stmt_key = select(SlackWorkspace).where(SlackWorkspace.api_key == api_key)
            result_key = await db.execute(stmt_key)
            existing_key = result_key.scalar_one_or_none()
            
            if existing_key:
                print("\n[ERROR] Generated API key collision detected! Try running the script again.")
                sys.exit(1)
            
            # Create new workspace record
            new_workspace = SlackWorkspace(
                workspace_id=workspace_id,
                team_name=name,
                api_key=api_key,
                bot_token="dummy-bot-token" # Dummy token for API-only SDK users
            )
            
            db.add(new_workspace)
            await db.commit()
            print("Database transaction successfully committed!")
            
            # Print success output
            print("\n" + "="*50)
            print("SUCCESS: PILOT WORKSPACE SUCCESSFULLY ONBOARDED!")
            print("="*50)
            print(f"Workspace ID: {workspace_id}")
            print(f"API Key     : {api_key}")
            print("-"*50)
            print("\nREADY-TO-USE PYTHON SDK INTEGRATION SNIPPET:")
            print("="*50)
            print(f"""from statelock import StateLock, AsyncStateLock

# Initialize synchronous client
sl = StateLock(
    api_key="{api_key}",
    workspace_id="{workspace_id}",
    base_url="https://project-brain-production-fa75.up.railway.app" # Or local dev: http://localhost:8000
)

# Enforce governance
result = sl.enforce("Issue a $150 refund to user", user_role="support_agent")
if result.is_permitted():
    # Proceed with execution
    pass
else:
    # Action blocked! Escalation ID: result.audit_id
    pass""")
            print("="*50 + "\n")
            
        except Exception as e:
            await db.rollback()
            print(f"\n❌ DATABASE TRANSACTION FAILED: {e}")
            sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Onboard a new StateLock pilot workspace and generate secure API keys.",
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--name", "-n",
        required=True,
        help="The official company or team name (e.g. 'Stripe Customer Support')"
    )
    parser.add_argument(
        "--id", "-i",
        required=False,
        help="Custom Workspace ID. If omitted, slugified company name is used."
    )
    parser.add_argument(
        "--key", "-k",
        required=False,
        help="Custom API Key. If omitted, a secure 'sl_live_...' key is auto-generated."
    )
    
    args = parser.parse_args()
    
    # Run async function
    asyncio.run(onboard_workspace(
        name=args.name,
        workspace_id=args.id,
        api_key=args.key
    ))

if __name__ == "__main__":
    main()
