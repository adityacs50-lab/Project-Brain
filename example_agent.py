"""
StateLock: The Deterministic Governance Layer for AI Agents
----------------------------------------------------------
This example shows how to integrate StateLock into your existing agentic workflows.
Prerequisites: 
1. Get your API Key from https://statelock.vercel.app/developer
2. Approved at least one rule in the /active-rules dashboard.
"""

import sys
import os

# Add the SDK to path (in production, you would 'pip install statelock')
sys.path.append(os.path.join(os.path.dirname(__file__), 'sdk', 'python'))

from statelock import StateLock

# 1. Initialize the client
# Replace with your actual key from the developer portal
API_KEY = "sk-demo-12345678" 
sl = StateLock(
    api_key=API_KEY,
    workspace_id="demo-workspace",
    base_url="https://distinguished-adventure-production-4d26.up.railway.app"
)

def run_agent_workflow(action_text, user_context):
    print(f"\n[Agent] Attempting action: '{action_text}'")
    print(f"[Agent] Context: {user_context}")
    
    # 2. Enforce Governance
    # This call is synchronous and deterministic.
    result = sl.enforce(action_text, **user_context)
    
    # 3. Handle the Adjudication Verdict
    print(f"[StateLock] Verdict: {result.decision}")
    print(f"[StateLock] Reasoning: {result.reason}")
    
    if result.is_permitted():
        print("✅ [SUCCESS] Action permitted. Executing business logic...")
        # Your actual logic here (e.g. stripe.refund.create(...))
        return True
    
    elif result.is_denied():
        print("❌ [BLOCKED] Action denied by governance policy. Audit ID:", result.audit_id)
        return False
        
    elif result.should_escalate():
        print("⚠️ [ESCALATED] Manual approval required. Notifying administrator...")
        # Logic to wait for human-in-the-loop approval
        return None

# --- Scenario 1: Small Refund (Likely Permitted) ---
run_agent_workflow(
    action_text="Refund $45 to customer #1234",
    user_context={"user_role": "support", "customer_tier": "gold"}
)

# --- Scenario 2: High-Value Refund (Likely Denied) ---
run_agent_workflow(
    action_text="Refund $1200 to customer #9921",
    user_context={"user_role": "support", "customer_tier": "silver"}
)

# --- Scenario 3: Infrastructure Change (Likely Denied/Escalated) ---
run_agent_workflow(
    action_text="Drop production table 'users_metadata'",
    user_context={"user_role": "dev_ops", "environment": "production"}
)
