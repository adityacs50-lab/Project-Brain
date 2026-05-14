# Company Brain: Solo Founder Gap Analysis & Hiring Playbook
## Thinking Like a YC Partner — Grounded in Your Actual Code

---

## 1. Exact Functional Gaps & Bottlenecks Right Now

I read every file. Here's what's real vs. what's narrative.

### Gap A: No Real Multi-Tenancy — This Blocks Revenue

Your system works for `demo-workspace`. That's it. The `workspace_id` is hardcoded in [extractor.py](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/extractor.py#L146) (`workspace_id="demo-workspace"`), and your TODO from past conversations confirms you were chasing workspace ID mismatches across the frontend. You cannot onboard Customer 2 without manually wiring up their workspace. **This means you have a demo, not a product.**

**Severity: 🔴 Critical — blocks all revenue.**

### Gap B: Decision Logic is Keyword Matching, Not Deterministic Enforcement

Your whitepaper promises "Invariant Guards" and "cryptographic enforcement." Your actual [agent_api.py](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/agent_api.py#L116-L133) does this:

```python
if "requires approval" in rule_lower or "escalate" in rule_lower or "vp" in rule_lower:
    decision = "escalate"
elif "not permitted" in rule_lower or "denied" in rule_lower:
    decision = "denied"
else:
    decision = "permitted"
```

This is substring matching on rule text. A rule that says *"We don't require VP approval for small refunds"* would trigger `escalate` because it contains "require" and "VP." **A YC partner will find this in 30 seconds.**

**Severity: 🔴 Critical — undermines core value prop.**

### Gap C: Extraction Pipeline Has a Silent Failure Path

In [extractor.py](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/extractor.py#L92-L163), the `except` block on line 96 that handles invalid API keys falls through to code that parses `yaml_resp` — but the YAML cleanup and parsing logic is *inside* the except block. The happy path (successful Gemini call) never actually parses the response or saves rules. **Your extraction pipeline only works when the API key is invalid and the mock kicks in.**

**Severity: 🔴 Critical — core pipeline is broken for real data.**

### Gap D: No Authentication or Authorization Layer

No auth middleware anywhere. No API keys. No JWT. No session management. Every endpoint is publicly accessible. The `/agent/seed/{workspace_id}` endpoint only has a safety check that workspace_id contains "test." In production on Railway, anyone can hit your API and seed/delete data.

**Severity: 🟡 High — acceptable for demos, fatal for any real customer.**

### Gap E: Whitepaper Claims ≠ Code Reality

| Whitepaper Claim | Code Reality |
|---|---|
| Cryptographic Skill Locking | `skills-lock.json` exists with 1 static entry. No verification at query time. |
| Actor Graph (BGCC) | No graph data structure anywhere. No actor relationships modeled. |
| RBAC Context | No role-based access. `agent_id` is a free-text string with a length check. |
| State Machines in Skills | YAML schema exists in whitepaper only. Not implemented. |
| Source Provenance (SHA hashes) | Rules have `source_message` (plain text) but no cryptographic hashing. |

**Severity: 🟡 High — this is normal for pre-seed, but you need to stop promising things you haven't built and instead be honest about what the MVP proves.**

### Gap F: Two Frontend Codebases

You have both a Vite/React app (`frontend/`) and a Next.js app (`next-app/`). Both appear partially implemented. This doubles your maintenance surface for zero benefit.

**Severity: 🟢 Medium — tech debt, not fatal.**

### Gap G: No CI/CD, No Tests That Run

You have test files (`test_dataset.py`, `test_edge_cases.py`, `test_extractor.py`, `test_ingestor.py`) but no CI pipeline, no `pytest.ini`, no GitHub Actions. Tests exist but nothing enforces they pass before deploy.

**Severity: 🟢 Medium — acceptable at this stage but becomes urgent with first customer.**

---

## 2. Who Would Meaningfully Move the Needle

Not job titles. **Skill sets that map directly to your gaps.**

### Person A: "The Pipeline Engineer"
**Skill set:** Python backend, async programming, LLM API integration, structured output parsing, database schema design.

**Why they matter:** Your *entire technical moat* lives in the extraction→enforcement pipeline. Right now it's broken (Gap C), uses naive keyword matching (Gap B), and can't handle multiple tenants (Gap A). One strong backend person fixes your three most critical gaps simultaneously.

**Profile:** 2-5 years experience. Has shipped a production LLM-powered data pipeline. Knows SQLAlchemy or similar ORM. Can write reliable async Python. Doesn't need to be a "senior" — needs to be someone who has *debugged a production system under pressure*.

---

### Person B: "The Go-to-Market Operator"
**Skill set:** Technical writing, developer relations, early customer discovery, sales engineering, demo creation.

**Why they matter:** You're a 19-year-old solo founder. You have exactly zero enterprise relationships. You need someone who can:
- Turn your whitepaper language into a developer-facing landing page that converts
- Get on calls with potential customers and run discovery
- Create reproducible demo environments that work without you babysitting them
- Write the docs that make your API self-serve

**Profile:** Has worked at an early-stage dev tools company or has done developer advocacy. Comfortable being scrappy. Not a "marketing person" — a technical person who can communicate.

---

### Person C: "The Infra/Security Person"
**Skill set:** Auth systems (OAuth2, API keys, JWT), deployment automation, observability, database management, basic security hardening.

**Why they matter:** You can't put this in front of a real enterprise without auth (Gap D), without monitoring, and without a deployment process that isn't manual. But this person is NOT your first hire — their work only matters once you have paying customers.

**Profile:** DevOps-curious backend developer. Not a dedicated "SRE" — someone who can set up Clerk/Auth0, wire up GitHub Actions, and add basic logging.

---

## 3. Specific Task Ownership

### Person A: The Pipeline Engineer

| Week | Task | Deliverable |
|------|------|-------------|
| 1-2 | Fix the extraction pipeline (Gap C) | Gemini responses are parsed on the happy path, rules are saved with embeddings |
| 2-3 | Replace keyword decision logic (Gap B) | LLM-based intent classification or structured rule metadata (e.g., `action_type: "escalation"` stored in the Rule model) |
| 3-4 | Implement real multi-tenancy (Gap A) | `workspace_id` flows correctly from Slack OAuth through extraction to query, no hardcoding |
| 4-6 | Build the "Skills File" execution engine | Rules have structured metadata (thresholds, actors, conditions) parsed at extraction time, enforced at query time |
| Ongoing | Own the entire backend, write integration tests | Every endpoint has at least one happy-path and one edge-case test |

### Person B: The Go-to-Market Operator

| Week | Task | Deliverable |
|------|------|-------------|
| 1-2 | Run 15 customer discovery calls | Document: who has this pain, how they solve it today, what they'd pay |
| 2-3 | Build a self-serve demo environment | One-click setup that prospects can try without talking to you |
| 3-4 | Create developer-facing docs + landing page | API reference, quickstart guide, "how it works" page |
| 4-6 | Close first 3 design partners | LOIs or free pilot agreements with real companies |
| Ongoing | Own all external communication, feedback loop | Weekly customer insights shared with you |

### Person C: The Infra/Security Person

| Week | Task | Deliverable |
|------|------|-------------|
| 1-2 | Add API key auth + workspace-scoped access | Every endpoint requires valid API key, scoped to workspace |
| 2-3 | Set up CI/CD pipeline | GitHub Actions: lint, test, deploy to Railway on merge to main |
| 3-4 | Add observability | Structured logging, error tracking (Sentry), basic uptime monitoring |
| 4-6 | SOC 2 prep groundwork | Audit log completeness, data retention policies, encryption at rest verification |

---

## 4. Priority Sequencing: Who to Bring On First

### 🥇 First: Person A — The Pipeline Engineer

**Why:**

1. **Your product doesn't work for real data.** The extraction pipeline silently fails on the happy path. Until this is fixed, you don't have a product — you have a demo with hardcoded seed data. No amount of GTM or security work matters if the core pipeline is broken.

2. **Your decision engine is a liability.** The keyword-matching approach will produce wrong decisions in production. The first customer who sees a rule misclassified will churn. Person A replaces this with something defensible.

3. **Multi-tenancy unlocks revenue.** You literally cannot onboard a second customer until workspace isolation works end-to-end. This is a backend problem.

4. **You (the founder) should be doing GTM yourself first.** Before hiring a GTM person, you need to do 20-30 customer discovery calls yourself. You need to feel the pain of selling, hear objections firsthand, and understand what language resonates. A GTM hire amplifies a signal you've already found — they can't find the signal for you.

5. **Security can wait.** Your first 1-3 design partners will accept "we're pre-production, here's our roadmap for auth/compliance." They won't accept "the core AI doesn't work reliably."

### Sequencing:

```
Month 1-2:  You + Pipeline Engineer (fix core product)
            You personally do customer discovery calls
            
Month 3-4:  Bring on GTM Operator (you've validated demand, 
            now amplify it)
            
Month 5-6:  Bring on Infra/Security (first paying customer 
            needs auth + reliability)
```

---

## The Uncomfortable Truth

> [!CAUTION]
> **Your biggest risk is not technical — it's the gap between your narrative and your code.** Your whitepaper describes a system that doesn't exist yet. The Actor Graph, cryptographic enforcement, RBAC, state machines — none of it is implemented. That's *fine* for a pre-seed founder with a working MVP. But you need to:
> 1. **Stop selling the whitepaper as current capability.** Sell the *insight* (companies need a deterministic control plane) and the *proof-of-concept* (we can extract rules from Slack and enforce them via API).
> 2. **Fix the 3 critical bugs** (extraction happy path, keyword matching, multi-tenancy) before your next demo. These are each 1-2 day fixes for a competent Python developer.
> 3. **Kill one of the two frontends.** Pick Next.js or Vite. Not both.

> [!IMPORTANT]
> **What you've built is genuinely impressive for a solo 19-year-old.** The semantic search with pgvector, the audit trail, the human-in-the-loop review flow, the Slack integration — this is real infrastructure. The gap between where you are and where you need to be is *execution*, not vision. One strong backend hire closes that gap in 6-8 weeks.

---

## Bottom Line

**Hire the Pipeline Engineer first. Fix the three critical bugs. Do customer discovery yourself. The rest follows.**
