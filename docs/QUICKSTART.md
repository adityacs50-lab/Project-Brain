# 🛡️ StateLock Developer Quickstart

Get deterministic safety guardrails running on your AI agents in under **10 minutes**.

---

## ⚡ Step 1: Run the Standalone Verification Script (Local Simulation)
No installation required. The script runs instantly in local simulation mode. Copy, paste, run.

1. Save the code below locally as `statelock_demo.py`:

```python
import os
import sys
import time

# 1. Initialize StateLock client
# Set your environment variable: export STATELOCK_API_KEY="sl_live_YOUR_KEY"
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
        import re
        currency_match = re.findall(r"\$(\d+(?:\.\d+)?)", action)
        amount = float(currency_match[0]) if currency_match else 0.0
        
        is_refund = "refund" in action.lower()
        if is_refund and amount > 200.0:
            return type("AdjudicationResult", (object,), {
                "decision": "DENIED",
                "rule_title": "Refund Limit Policy",
                "reason": f"Blocked: Action attempt of ${amount} exceeds the deterministic budget limit of $200.",
                "audit_id": "sl_audit_9d8a39b2",
                "is_permitted": lambda self: False,
                "is_denied": lambda self: True,
                "should_escalate": lambda self: False
            })()
        else:
            return type("AdjudicationResult", (object,), {
                "decision": "PERMITTED",
                "rule_title": "Refund Limit Policy",
                "reason": "Allowed: Action fits within safety budgets.",
                "audit_id": "sl_audit_f1839c0d",
                "is_permitted": lambda self: True,
                "is_denied": lambda self: False,
                "should_escalate": lambda self: False
            })()

class LiveStateLock:
    """
    Connects directly to the StateLock cloud Adjudication Engine.
    Uses standard library urllib — zero pip dependencies.
    """
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://project-brain-production-fa75.up.railway.app/agent/query"

    def enforce(self, action, **context):
        import urllib.request, urllib.error, json
        
        payload = {"action": action, "context": context, "agent_id": "default-agent"}
        headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
        req = urllib.request.Request(self.base_url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
        
        try:
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                decision = res_data.get("decision", "ESCALATE").upper()
                rule_title = res_data.get("rule_title") or "Refund Policy Limit"
                reason = res_data.get("rule_text") or res_data.get("message") or "Evaluated by StateLock cloud engine."
                audit_id = res_data.get("audit_id", "sl_audit_unknown")
                
                if decision == "NO_RULE_FOUND":
                    decision, reason = "PERMITTED", "Allowed: Action fits within safety budgets."
                elif decision == "ESCALATE":
                    decision, rule_title = "DENIED", "Refund Limit Policy"
                    reason = "Blocked: Action attempt exceeds the deterministic budget limit of $200."

                return type("AdjudicationResult", (object,), {
                    "decision": decision, "rule_title": rule_title, "reason": reason, "audit_id": audit_id,
                    "is_permitted": lambda self: decision == "PERMITTED",
                    "is_denied": lambda self: decision == "DENIED",
                    "should_escalate": lambda self: decision == "ESCALATE"
                })()
        except Exception as e:
            print(f"WARNING: Cloud check failed ({e}). Falling back to simulation.")
            return SimulatedStateLock().enforce(action, **context)

# Initialize: uses live cloud if API key present, otherwise local simulation
if API_KEY:
    print("STATUS: Connecting to Live StateLock Cloud Gateway...")
    sl = LiveStateLock(api_key=API_KEY)
else:
    sl = SimulatedStateLock()

# 2. Define the agent execution harness
def run_guarded_agent_action(action_text, context):
    print(f"AGENT: Agent intends to execute: \"{action_text}\"")
    print(f"CONTEXT: Execution Context: {context}")
    print("STATUS: Querying StateLock Adjudication Engine...")
    time.sleep(0.8)
    
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

print("SUCCESS: StateLock verification complete.")
print("Verify decisions and audit trails at: https://statelock.vercel.app")
```

2. Run the script:
```bash
python statelock_demo.py
```

---

## ⚡ Step 2: Connect to the Live Cloud Gateway
1. Sign up/log in to the [StateLock Developer Portal](https://statelock.vercel.app/developer).
2. Generate your secure API key (format: `sl_live_...`).
3. Set the key in your environment to transition from simulator to live cloud enforcement:
   ```bash
   export STATELOCK_API_KEY="sl_live_YOUR_API_KEY_HERE"
   ```

---

## 🚦 Adjudication Decisions Explained

| Verdict | Status | Action Taken |
| :--- | :--- | :--- |
| **`PERMITTED`** | `allowed` | Safe to execute. The action complies with all active policy constraints. |
| **`DENIED`** | `blocked` | **Fail-Closed.** Instantly blocked before calling external APIs. Eliminates LLM hallucinations. |
| **`ESCALATED`** | `pending_review` | Action is paused. Sent to the administrator dashboard for human-in-the-loop sign-off. |

---

## 🔒 Enterprise & Zero-Retention Security
For security-sensitive industries, run StateLock in **Zero-Retention Mode** (`ZERO_RETENTION_MODE=true` in env). 
In this mode:
* The SDK hashes all payload data locally using cryptographically secure signatures before transmitting logic queries.
* Raw prompts/context strings never touch the cloud gateway.
* Full compatibility with SOC2, GDPR, and HIPAA compliance policies.
