import os
import sys
import time

# Add the local directory to the path so we can import 'statelock' directly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from statelock import StateLock, AdjudicationResult
except ImportError:
    # Fallback in case paths are nested differently during execution
    sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
    from statelock import StateLock, AdjudicationResult

print("=================================================================")
print(" [StateLock] Self-Serve Verification Suite")
print("=================================================================\n")

API_KEY = os.getenv("STATELOCK_API_KEY")

class SimulatedStateLock:
    """
    Simulates the StateLock cloud Adjudication Engine for instant local testing.
    This guarantees the script runs in <10 seconds for developers without any setup.
    """
    def __init__(self):
        print("INFO: [StateLock SDK] Running in LOCAL SIMULATION mode.")
        print("GUIDE: To run against the live cloud engine, set: export STATELOCK_API_KEY=\"sl_live_YOUR_KEY\"\n")
        time.sleep(1)

    def enforce(self, action, **context):
        # Deterministic rule parser simulating the cloud OPA compiled rule:
        # "Never issue a refund greater than $200 without VP approval"
        import re
        
        # 1. Parse amounts
        currency_match = re.findall(r"\$(\d+(?:\.\d+)?)", action)
        amount = float(currency_match[0]) if currency_match else 0.0
        
        is_refund = "refund" in action.lower()
        
        if is_refund and amount > 200.0:
            return AdjudicationResult({
                "decision": "DENIED",
                "rule_title": "Refund Limit Policy",
                "rule_text": f"Blocked: Action attempt of ${amount} exceeds the deterministic budget limit of $200.",
                "audit_id": "sl_audit_9d8a39b2",
                "confidence": 1.0
            })
        else:
            return AdjudicationResult({
                "decision": "PERMITTED",
                "rule_title": "Refund Limit Policy",
                "rule_text": "Allowed: Action fits within safety budgets.",
                "audit_id": "sl_audit_f1839c0d",
                "confidence": 1.0
            })

# 1. Initialize StateLock
# Uses the live cloud API if a key is provided, otherwise falls back to local simulation
if API_KEY:
    print("STATUS: Connecting to Live StateLock Cloud Gateway...")
    sl = StateLock(
        api_key=API_KEY, 
        base_url="https://distinguished-adventure-production-4d26.up.railway.app"
    )
else:
    sl = SimulatedStateLock()

# 2. Define the agent execution harness
def run_guarded_agent_action(action_text, context):
    print(f"AGENT: Agent intends to execute: \"{action_text}\"")
    print(f"CONTEXT: Execution Context: {context}")
    print("STATUS: Querying StateLock Adjudication Engine...")
    time.sleep(0.8)
    
    # Enforce policy checks
    result = sl.enforce(action_text, **context)
    
    print(f"VERDICT: {result.decision}")
    
    if result.is_permitted():
        print("PERMITTED: Action is safe. Calling backend APIs...")
        print(f"   Details: {result.reason}")
    elif result.is_denied():
        print("BLOCKED: Prevented policy violation! Aborted transaction execution.")
        print(f"   Matched Rule: {result.rule_title}")
        print(f"   Reason: {result.reason}")
        print(f"   Audit ID: {result.audit_id}")
    else:
        print("ESCALATED: Request escalated to administrative queue.")
        print(f"   Audit ID: {result.audit_id}")
        
    print("-" * 65 + "\n")
    time.sleep(0.5)

# --- Scenario 1: Safe Action (Within $200 Limit) ---
run_guarded_agent_action(
    action_text="Issue customer support refund of $45 for order #8892",
    context={"user_role": "support_tier_1", "customer_tier": "bronze"}
)

# --- Scenario 2: Rogue Action (Violates $200 Limit) ---
run_guarded_agent_action(
    action_text="Issue customer support refund of $500 for order #1234",
    context={"user_role": "support_tier_1", "customer_tier": "silver"}
)

print("=================================================================")
print("SUCCESS: StateLock verification complete.")
print("Verify decisions and audit trails at: https://statelock.app")
print("=================================================================")
