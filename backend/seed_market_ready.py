import asyncio
import uuid
from datetime import datetime
from backend.db import AsyncSessionLocal
from backend.models import Rule, SlackWorkspace
from backend.versioning import get_model
from sqlalchemy import delete

async def seed_market_ready():
    print("Initializing STATELOCK Deterministic Seed...")
    model_instance = get_model()
    
    async with AsyncSessionLocal() as db:
        # 1. Ensure demo workspace
        demo_ws = await db.get(SlackWorkspace, "demo-workspace")
        if not demo_ws:
            demo_ws = SlackWorkspace(
                workspace_id="demo-workspace",
                team_name="STATELOCK Demo Corp",
                bot_token="xoxb-demo-mock-token",
                api_key="sk-demo-12345678"
            )
            db.add(demo_ws)
            await db.flush()
        else:
            demo_ws.api_key = "sk-demo-12345678"

        # 0. Clear existing logs for demo-workspace to avoid FK constraints
        print("Clearing existing logs for demo-workspace...")
        from backend.models import AgentDecisionLog
        await db.execute(delete(AgentDecisionLog).where(AgentDecisionLog.workspace_id == "demo-workspace"))

        # 1. Clear existing rules for demo-workspace
        print("Clearing existing rules for demo-workspace...")
        await db.execute(delete(Rule).where(Rule.workspace_id == "demo-workspace"))
        await db.commit()

        # 2. Hardened Rules with Numerical Thresholds
        rules_to_seed = [
            {
            "title": "Standard Reporting",
            "rule_text": "Employees are permitted to send weekly status reports to their teams",
            "action_type": "permitted",
            "threshold_value": None,
            "threshold_currency": None,
            "operator": None
        },
        {
                "title": "Refund Cap Enforcement", 
                "rule_text": "No refund above $50 without manager approval",
                "threshold_value": 50.0,
                "threshold_currency": "$",
                "operator": ">"
            },
            {
                "title": "Vendor Procurement Threshold", 
                "rule_text": "No vendor contract above $10,000 without legal sign-off",
                "threshold_value": 10000.0,
                "threshold_currency": "$",
                "operator": ">"
            },
            {
                "title": "Outbound Payment Dual-Auth", 
                "rule_text": "All outbound payments above $5,000 require dual authorization",
                "threshold_value": 5000.0,
                "threshold_currency": "$",
                "operator": ">"
            }
        ]

        # Add the remaining 7 rules as semantic-only for now
        other_rules = [
            {"title": "PII Data Sovereignty", "rule_text": "Customer PII cannot be shared outside CRM without a signed DPA"},
            {"title": "Sales Discount Governance", "rule_text": "Discounts above 30% require VP Sales approval"},
            {"title": "Infrastructure Security (IAM)", "rule_text": "No AWS IAM role changes without security team review"},
            {"title": "HR Data Protection", "rule_text": "No employee data exported outside HRIS without HR Director sign-off"},
            {"title": "Database Ops Governance", "rule_text": "No production database changes during business hours without change ticket"},
            {"title": "Contractor Compliance", "rule_text": "Contractors cannot access internal Slack without NDA on file"},
            {"title": "Automated Secret Revocation", "rule_text": "No public API keys in source code - auto-revoke on detection"}
        ]

        for r_data in rules_to_seed + other_rules:
            print(f"Locking Rule: {r_data['title']}")
            embedding = model_instance.encode(r_data["rule_text"]).tolist()
            
            rule = Rule(
                id=str(uuid.uuid4()),
                workspace_id="demo-workspace",
                title=r_data["title"],
                rule_text=r_data["rule_text"],
                action_type=r_data.get("action_type", "denied"),
                status="active",
                confidence=1.0,
                source_message="STATELOCK-SEED-ENGINE",
                embedding=embedding,
                threshold_value=r_data.get("threshold_value"),
                threshold_currency=r_data.get("threshold_currency"),
                operator=r_data.get("operator")
            )
            db.add(rule)
        
        await db.commit()
        print("STATELOCK DETERMINISTIC SEED COMPLETE.")

if __name__ == "__main__":
    asyncio.run(seed_market_ready())
