# 🛡️ StateLock Developer Quickstart

Get deterministic safety guardrails running on your AI agents in under **10 minutes**.

---

## ⚡ Step 1: Get Your API Key
1. Sign up/log in to the [StateLock Developer Portal](https://statelock.vercel.app/developer).
2. Generate your secure API key (format: `sl_live_...`).
3. Set it as an environment variable in your project:
   ```bash
   export STATELOCK_API_KEY="sl_live_YOUR_API_KEY_HERE"
   ```

## 📦 Step 2: Install the SDK
Install the official Python client:
```bash
pip install statelock
```

## 🛠️ Step 3: Secure Your Agent Loop
Wrap any high-risk action execution (Stripe refunds, database writes, system commands) with the StateLock guardrail. If an action violates your policies, StateLock blocks it **before** it hits production APIs.

```python
import os
from statelock import StateLock

# 1. Initialize the client using your API Key
API_KEY = os.getenv("STATELOCK_API_KEY")
sl = StateLock(api_key=API_KEY)

def handle_user_request(request_text, user_id):
    # 2. Define target action and execution context
    action = f"Issue refund of $350 for request {request_text}"
    context = {
        "user_id": user_id,
        "user_role": "support_agent"
    }

    print(f"🔍 Evaluated action: '{action}'")

    # 3. Enforce policies before calling execution APIs
    verdict = sl.enforce(action, **context)

    # 4. Handle the adjudication verdict
    if verdict.is_permitted():
        print("✅ [PERMITTED] Safe to run. Calling stripe.refund.create()...")
        # stripe.refund.create(...)
        
    elif verdict.is_denied():
        print(f"🛑 [BLOCKED] Prevented policy violation: {verdict.reason}")
        print(f"   Audit ID: {verdict.audit_id}")
        
    elif verdict.should_escalate():
        print(f"⚠️ [ESCALATED] Requires human-in-the-loop review by: {verdict.escalate_to}")
        # Notify slack channel or admin dashboard for approval
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
