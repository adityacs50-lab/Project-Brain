import asyncio
import sys
import os
import uuid
from datetime import datetime
from sqlalchemy import select, delete

# Setup path to import FastAPI app and modules
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../STATELOCK")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../sdk/python")))

from backend.main import app
from backend.db import AsyncSessionLocal
from backend.models import SlackWorkspace, Rule, AgentDecisionLog
from backend.versioning import get_model
from statelock import StateLock, AsyncStateLock
import httpx

WORKSPACE_ID = "acme-fintech-pilot-e2e"
API_KEY = "sl_live_pilot_e2e_test_key_xyz_12345"

async def setup_test_workspace_and_rules():
    print("[1/5] Setting up E2E Pilot Workspace and Rules in Database...")
    
    async with AsyncSessionLocal() as db:
        try:
            # Clean up old test data to ensure test is idempotent
            await db.execute(delete(AgentDecisionLog).where(AgentDecisionLog.workspace_id == WORKSPACE_ID))
            await db.execute(delete(Rule).where(Rule.workspace_id == WORKSPACE_ID))
            await db.execute(delete(SlackWorkspace).where(SlackWorkspace.workspace_id == WORKSPACE_ID))
            await db.commit()
            
            # 1. Onboard Pilot Workspace
            pilot = SlackWorkspace(
                workspace_id=WORKSPACE_ID,
                team_name="Acme Fintech Pilot E2E",
                api_key=API_KEY,
                bot_token="dummy-bot-token"
            )
            db.add(pilot)
            await db.flush() # Flush workspace first to avoid foreign key constraint violations for rules
            
            # Get managed embedding model to seed rules
            model_instance = get_model()
            
            # 2. Seed Rule A: Deterministic Refund Threshold (Action: Denied)
            rule_a_text = "Refunds above $100 require manager approval."
            rule_a_emb = model_instance.encode(rule_a_text).tolist()
            rule_a = Rule(
                id=uuid.uuid4(),
                workspace_id=WORKSPACE_ID,
                title="Refund Limit Rule",
                rule_text=rule_a_text,
                action_type="denied",
                status="active",
                threshold_value=100.0,
                threshold_currency="$",
                operator=">",
                embedding=rule_a_emb,
                version=1,
                created_at=datetime.utcnow()
            )
            db.add(rule_a)
            
            # 3. Seed Rule B: Semantic Weekly Report Permission (Action: Permitted)
            rule_b_text = "Agents are permitted to compile and send standard weekly status reports."
            rule_b_emb = model_instance.encode(rule_b_text).tolist()
            rule_b = Rule(
                id=uuid.uuid4(),
                workspace_id=WORKSPACE_ID,
                title="Weekly Status Reports Permission",
                rule_text=rule_b_text,
                action_type="permitted",
                status="active",
                embedding=rule_b_emb,
                version=1,
                created_at=datetime.utcnow()
            )
            db.add(rule_b)
            
            await db.commit()
            print("Successfully initialized test workspace and rules (embeddings offloaded & saved).")
            
        except Exception as e:
            await db.rollback()
            print(f"Failed database setup: {e}")
            sys.exit(1)

async def test_api_endpoints():
    print("\n[2/5] Initializing API tests using httpx.AsyncClient...")
    
    headers = {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(app=app, base_url="http://testserver") as client:
        # Case 1: Exact Threshold Deny Match
        print("\n--- TEST CASE A: Exact Threshold Match (Expect DENIED) ---")
        payload_a = {
            "workspace_id": WORKSPACE_ID,
            "agent_id": "e2e-agent",
            "action": "issue a $250 refund to a customer",
            "context": {}
        }
        res_a = await client.post("/agent/query", json=payload_a, headers=headers)
        data_a = res_a.json()
        print("Status Code:", res_a.status_code)
        print("Decision   :", data_a.get("decision"))
        print("Reasoning  :", data_a.get("rule_text"))
        
        # Case 2: Semantic Match Permit
        print("\n--- TEST CASE B: Semantic Match (Expect PERMITTED) ---")
        payload_b = {
            "workspace_id": WORKSPACE_ID,
            "agent_id": "e2e-agent",
            "action": "email a weekly status update to the managers",
            "context": {}
        }
        res_b = await client.post("/agent/query", json=payload_b, headers=headers)
        data_b = res_b.json()
        print("Status Code:", res_b.status_code)
        print("Decision   :", data_b.get("decision"))
        print("Confidence :", data_b.get("confidence"))
        print("Rule Title :", data_b.get("rule_title"))
        
        # Case 3: No Rule Found
        print("\n--- TEST CASE C: No Matching Rule (Expect NO_RULE_FOUND) ---")
        payload_c = {
            "workspace_id": WORKSPACE_ID,
            "agent_id": "e2e-agent",
            "action": "purchase a new mechanical keyboard",
            "context": {}
        }
        res_c = await client.post("/agent/query", json=payload_c, headers=headers)
        data_c = res_c.json()
        print("Status Code:", res_c.status_code)
        print("Decision   :", data_c.get("decision"))
        print("Rule Title :", data_c.get("rule_title"))
        print("Rule Text  :", data_c.get("rule_text"))
        print("Confidence :", data_c.get("confidence"))
        
        # Assertions to guarantee production-readiness
        assert res_a.status_code == 200, "Case A Failed Status Code"
        assert data_a.get("decision") == "denied", f"Case A Decision should be 'denied', got '{data_a.get('decision')}'"
        
        assert res_b.status_code == 200, "Case B Failed Status Code"
        assert data_b.get("decision") == "permitted", f"Case B Decision should be 'permitted', got '{data_b.get('decision')}'"
        
        assert res_c.status_code == 200, "Case C Failed Status Code"
        assert data_c.get("decision") == "no_rule_found", f"Case C Decision should be 'no_rule_found', got '{data_c.get('decision')}'"
        
        print("\n[3/5] All API integrations and assertions passed successfully!")

async def cleanup_test_data():
    print("\n[4/5] Cleaning up test data from database...")
    async with AsyncSessionLocal() as db:
        try:
            await db.execute(delete(AgentDecisionLog).where(AgentDecisionLog.workspace_id == WORKSPACE_ID))
            await db.execute(delete(Rule).where(Rule.workspace_id == WORKSPACE_ID))
            await db.execute(delete(SlackWorkspace).where(SlackWorkspace.workspace_id == WORKSPACE_ID))
            await db.commit()
            print("Cleanup completed successfully.")
        except Exception as e:
            await db.rollback()
            print(f"Failed to cleanup test data: {e}")

async def main():
    print("="*60)
    print("   STARTING END-TO-END PILOT PIPELINE VALIDATION")
    print("="*60)
    
    await setup_test_workspace_and_rules()
    try:
        await test_api_endpoints()
    finally:
        await cleanup_test_data()
        
    print("\n[5/5] E2E PILOT WORKFLOW VERIFICATION 100% SUCCESSFUL!")
    print("="*60)

if __name__ == "__main__":
    asyncio.run(main())
