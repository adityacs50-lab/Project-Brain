# 🔒 StateLock: The Deterministic Guardrail for Autonomous Agents

**The end of LLM hallucinations in production.**

StateLock is a high-performance security layer that sits between your Autonomous AI Agents and the real world. It intercepts every action an agent tries to take—whether it's processing a refund, accessing PII, or making a wire transfer—and runs it against a deterministic engine to ensure compliance, safety, and security.

[![Status](https://img.shields.io/badge/Status-Live_MVP-emerald)](https://statelock.app)
[![API](https://img.shields.io/badge/API-Connected-blue)](https://distinguished-adventure-production-4d26.up.railway.app)

---

## 🚀 Why StateLock?

LLMs are probabilistic; your company’s security must be deterministic. 
Autonomous agents are powerful, but they are prone to:
*   **Hallucinations:** Attempting to call non-existent APIs or use invalid parameters.
*   **Prompt Injection:** Being manipulated into leaking internal data.
*   **Compliance Breaches:** Violating SOC2, GDPR, or internal financial caps.

**StateLock fixes this.** It provides a single point of enforcement that guarantees your agents stay within the guardrails you define.

---

## 📦 Integration in 10 Lines

Integrate StateLock into any Python-based agent (LangChain, OpenAI, AutoGPT) in seconds.

```python
from statelock_mvp import StateLockGuard

# 1. Initialize the Guard with your Cloud API Key
guard = StateLockGuard(api_key="sk-demo-12345678")

# 2. Intercept an agent's intended action
action = "Issue a $350 refund to user 'bob_99'"
context = "User is complaining about a 3-day delivery delay."

# 3. Evaluate against the cloud engine
verdict = guard.evaluate(action, context)

if verdict["allowed"]:
    # 🛡️ Execute the action with confidence
    print(f"✅ Approved: {verdict['reason']}")
    execute_refund(action)
else:
    # ❌ Block the action and alert human operator
    print(f"🛑 BLOCKED: {verdict['reason']}")
```

---

## 🛠️ How it Works

1.  **Intercept:** The SDK captures the natural language or JSON action string from the LLM.
2.  **Evaluate:** The action is sent to the **StateLock Cloud Engine** (hosted on Railway).
3.  **Adjudicate:** The engine runs a hybrid match:
    *   **Deterministic Thresholds:** Hard caps (e.g., "No refunds > $200").
    *   **Semantic Guardrails:** LLM-powered policy matching (e.g., "No PII sharing").
4.  **Enforce:** Returns an `ALLOWED` or `BLOCKED` verdict with a human-readable reason and confidence score.
5.  **Audit:** Every decision is logged in real-time for SOC2 compliance.

---

## 🏛️ The "Founders Mode" Vision

StateLock is built for high-agency teams who need to ship autonomous agents without the "hallucination anxiety." 

*   **Zero-Latency Enforcement:** Optimized for minimal overhead.
*   **Human-in-the-Loop:** Automatically escalates complex or "no rule found" scenarios to a human dashboard.
*   **Policy as Code:** Define your company's safety manual in plain English; StateLock turns it into enforced logic.

---

## 🔒 Security & Privacy

StateLock is designed for the enterprise:
*   **Fail-Closed Architecture:** If the cloud engine is unreachable, the SDK defaults to `BLOCKED`.
*   **PII Stripping:** Our engine analyzes the *intent* of the action without needing your full database access.

---

## 📄 License

Proprietary. All rights reserved. Built for the Fintech Pilot Program.

---

**Ready to secure your agents?** [Talk to a Founder](mailto:aditya@statelock.app) | [View Dashboard](https://statelock.app/dashboard)
