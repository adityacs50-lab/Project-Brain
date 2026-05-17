# 🔒 StateLock: The Deterministic Guardrail for Autonomous Agents

**The end of LLM hallucinations in production.**

StateLock is a high-performance security layer that intercepts agent actions in real-time and evaluates them against deterministic cloud-hosted policies. It ensures that your AI agents—no matter how "creative" they get—never violate your company's security, financial, or compliance boundaries.

[![Status](https://img.shields.io/badge/Status-Live_MVP-emerald)](https://statelock.app)
[![API](https://img.shields.io/badge/API-Connected-blue)](https://distinguished-adventure-production-4d26.up.railway.app)
[![License](https://img.shields.io/badge/License-Proprietary-red)](#)

---

## ⚡ Developer Quickstart (The "Fail-Proof" Path)

If you've just cloned this repo, follow these 3 steps to see StateLock in action.

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Production SDK Validation
This script tests the `StateLockGuard` against a live Railway-hosted engine. It covers safe refunds, unauthorized high-value transfers, and PII leaks.
```bash
# Navigate to the SDK folder
cd sdk/python

# Run the validation suite
python test_local_mvp.py
```

### 3. Run the "Live-Fire" Stress Test
This demo simulates a rogue agent attempting a $200 refund and shows how the **Adjudication Engine** intercepts and blocks it in real-time.
```bash
# Run from the project root
python STATELOCK/scratch/live_fire_demo.py
```

---

## 📦 Integration in 10 Lines

StateLock is designed to be injected into any agentic loop (LangChain, OpenAI, etc.).

```python
from statelock_mvp import StateLockGuard

# 🛡️ Initialize the Guard with your Cloud API Key
guard = StateLockGuard(api_key="sk-demo-12345678")

# 🔍 Evaluate an agent's intended action
action = "Issue a $350 refund"
verdict = guard.evaluate(action, context={"user": "bob_99"})

if verdict["allowed"]:
    execute_action(action)
else:
    print(f"🛑 BLOCKED: {verdict['reason']}") # Reason: "Refund Approval Policy"
```

---

## 🛠️ Core Technology

### 🧠 The Adjudication Engine
StateLock doesn't just "guess." It uses a hybrid adjudication model:
*   **Deterministic Thresholds:** Hard-coded financial and operational limits.
*   **Semantic Guardrails:** High-confidence vector matching for policy intent.
*   **Fail-Closed Security:** If the connection is lost, StateLock defaults to `BLOCKED`.

### 📊 Real-Time Governance
Every decision—whether allowed or blocked—is streamed to your **Real-Time ROI Dashboard**, providing an instant audit trail for SOC2 and compliance reviews.

---

## 🏛️ Project Structure

*   `sdk/python/`: The production-ready Python client.
*   `STATELOCK/backend/`: The core logic of the Cloud Engine.
*   `app/`: The Next.js dashboard for policy management.
*   `example_agent.py`: A full implementation of an agent protected by StateLock.

---

## 🔒 Security & Privacy

StateLock is built for the enterprise. We analyze **intent strings**, not raw database contents. Your data stays in your VPC; only the agent's *decisions* touch our guardrails.

---

**Ready to secure your agents?** [Talk to a Founder](mailto:aditya@statelock.app) | [View Dashboard](https://statelock.app/dashboard)

Built by the StateLock Team. 🔒🚀
