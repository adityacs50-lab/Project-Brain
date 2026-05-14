# Company Brain: Technical Due Diligence Audit
## Every file read. No fluff. Line numbers included.

---

## 1. What Actually Exists and Works

| Component | File | Verdict |
|---|---|---|
| **Slack OAuth flow** | [slack_oauth.py](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/slack_oauth.py) | ✅ Real. Install→callback→token storage→channel sync. Rate limiting handled (L89, L140). |
| **Slack webhook ingestion** | [ingestor.py L115-145](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/ingestor.py#L115-L145) | ✅ Real. Signature verification, background task processing, <3s response. |
| **Semantic search via pgvector** | [agent_api.py L75-78](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/agent_api.py#L75-L78), [versioning.py L49-52](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/versioning.py#L49-L52) | ✅ Real. `all-MiniLM-L6-v2` embeddings + cosine distance queries. Works. |
| **Rule CRUD + versioning** | [versioning.py](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/versioning.py) | ✅ Real. Ingest, status update, rollback via `parent_rule_id` chain, history walk. |
| **Contradiction detection** | [versioning.py L49-100](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/versioning.py#L49-L100) | ✅ Real. Embedding similarity + title match finds conflicts at ingest time. |
| **Human-in-the-loop review** | [versioning.py L199-218](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/versioning.py#L199-L218) | ✅ Real. PATCH endpoint for status updates with optional text edits. |
| **Agent decision API** | [agent_api.py L55-170](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/agent_api.py#L55-L170) | ⚠️ Partially real. Query→match→decision→audit log works, but decision logic is fatally flawed (see below). |
| **Feedback loop** | [agent_api.py L209-249](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/agent_api.py#L209-L249) | ✅ Real. Feedback marks incorrect rules as "pending" for re-review. |
| **Slack bot (query via @mention)** | [bot.py](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/bot.py) | ✅ Real. @mention and DM handling, flag button, query logging. |
| **Next.js dashboard** | [next-app/app/page.tsx](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/next-app/app/page.tsx) | ✅ Real. SWR polling, rule activity feed, brain health gauge. |
| **Channel permissions** | [permissions.py](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/permissions.py) | ✅ Real. Toggle capture per channel, audit log for permission changes. |
| **Scheduled background sync** | [main.py L122-126](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/main.py#L122-L126) | ✅ Real. APScheduler runs `run_scheduled_sync` every 6 hours. |

**Summary:** ~70% of the backend is functional infrastructure. The plumbing works. The intelligence layer is where things break.

---

## 2. What Exists But Is Broken or Incomplete

### BUG 1: Extraction pipeline never saves rules on the happy path 🔴

**File:** [extractor.py L94-163](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/extractor.py#L94-L163)

The `try` block on L94 calls `call_gemini_with_retry(prompt)`. If Gemini succeeds, `yaml_resp` gets the result — but then **nothing happens**. The YAML parsing, rule creation, embedding generation, and `db.commit()` are all inside the `except` block (L96-163). The happy path falls through to `continue` on L163.

```
L94:  try:
L95:      yaml_resp = await call_gemini_with_retry(prompt)   # ← succeeds
L96:  except Exception as e:                                  # ← skipped
L97:      if "API key not valid" in str(e)...                 # ← all parsing
L98-L160:    ...yaml parsing, rule creation, db.commit...     #   is in here
L161: except Exception as e:                                  # ← outer except
L162:     print(f"Error parsing...")
L163:     continue                                            # ← happy path lands here
```

**Impact:** With a valid Gemini API key, zero rules are ever extracted from real Slack data. The system only works with the mock fallback.

---

### BUG 2: Decision engine is substring matching, not semantic 🔴

**File:** [agent_api.py L116-133](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/agent_api.py#L116-L133)

```python
if ("requires approval" in rule_lower or 
    "escalate" in rule_lower or 
    "vp" in rule_lower or 
    "manager" in rule_lower):
    decision = "escalate"
elif ("not permitted" in rule_lower or 
      "denied" in rule_lower or 
      "cannot" in rule_lower):
    decision = "denied"
else:
    decision = "permitted"
```

A rule saying *"This does not require VP approval"* → triggers `escalate` (matches "vp" and "require"). A rule saying *"Previously denied requests can now be approved"* → triggers `denied` (matches "denied"). **The decision engine produces wrong results for any rule containing these words in non-affirming context.**

---

### BUG 3: Hardcoded workspace_id blocks multi-tenancy 🔴

**File:** [extractor.py L146](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/extractor.py#L146)
```python
workspace_id="demo-workspace",  # Default for demo
```

**File:** [main.py L65](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/main.py#L65)
```python
workspace_id = "demo-workspace"
```

**File:** [next-app/app/page.tsx L10](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/next-app/app/page.tsx#L10)
```typescript
const workspaceId = "test-workspace-1";
```

Three different hardcoded workspace IDs across three files. The extraction pipeline ignores the actual workspace the message came from.

---

### BUG 4: Duplicate `/slack/events` route 🟡

**File:** [main.py L107-109](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/main.py#L107-L109) registers `/slack/events` via `slack_bot_handler`.

**File:** [ingestor.py L115](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/ingestor.py#L115) also registers `/slack/events` via the `slack_router`.

Both are included in `main.py` (L41 and L107-109). FastAPI will route to whichever was registered first, silently shadowing the other. One of these handlers never receives traffic.

---

### BUG 5: Ingestor doesn't set `workspace_id` on messages 🟡

**File:** [ingestor.py L47-52](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/ingestor.py#L47-L52)

```python
new_msg = SlackMessage(
    channel_id=channel_id,
    sender=sender,
    text=text,
    timestamp=timestamp,
    is_logic_candidate=False
)
```

No `workspace_id` is set. The `SlackMessage` model has a `workspace_id` column (FK to `slack_workspaces`). Messages saved via the live webhook have no workspace association, making them unqueryable by workspace.

---

### BUG 6: Similarity score is always hardcoded 🟡

**File:** [versioning.py L374](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/versioning.py#L374)
```python
similarity_score=0.85  # hardcoded
```

**File:** [versioning.py L95](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/versioning.py#L95)
```python
similarity_score=0.85,  # Simplification; normally calculated exactly
```

The query log and contradiction records never store the real similarity score. Any analytics built on this data will show fabricated numbers.

---

### BUG 7: Two dead code paths (executor.py + legacy Skill model) 🟢

**File:** [executor.py](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/executor.py) — entire file uses the old `Skill` model with keyword matching. No route in `main.py` calls `answer_query()` anymore (the `/ask` endpoint in `main.py` uses the `Rule` model directly). This is dead code.

**File:** [models.py L32-43](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/models.py#L32-L43) — `Skill` model and [models.py L44-51](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/models.py#L44-L51) `AgentConversation` model are unused by any live code path. Dead weight in the schema.

---

### BUG 8: Two frontend codebases 🟢

`frontend/` (Vite/React, hardcoded to `localhost:8000`) and `next-app/` (Next.js/Tailwind, hardcoded to `test-workspace-1`) both exist. The Vite app uses the old `/ask` endpoint. The Next.js app uses the versioning API. Neither is complete on its own.

---

### BUG 9: Tests reference old `Skill` model, would fail on current code 🟢

**File:** [test_edge_cases.py L80](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/test_edge_cases.py#L80)
```python
assert "CONFLICT DETECTED" in skills[0].yaml_content
```

The extractor now creates `Rule` objects, not `Skill` objects. `Rule` has no `.yaml_content` attribute. This test would crash with `AttributeError`.

**File:** [test_extractor.py L104-106](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/test_extractor.py#L104-L106) — same issue, accessing `.name` and `.yaml_content` on what would be `Rule` objects.

---

## 3. Whitepaper Claims With Zero Implementation

| Whitepaper Claim | Section | Code Evidence |
|---|---|---|
| **Actor Graph (AG)** | Module 1.1 | No graph data structure anywhere. No actor entity. `agent_id` is a free-text string with a `len >= 3` check ([agent_api.py L62](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/agent_api.py#L62)). |
| **Big Graph of Company Context (BGCC)** | Module 1.1 | Zero implementation. No relationship mapping between actors. |
| **Cryptographic Skill Locking** | Module 2.2 | [skills-lock.json](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/skills-lock.json) has 2 entries for Supabase agent skills (not company rules). No code reads or verifies this file. No hash verification at query time. |
| **Source Provenance (SHA hashes)** | Module 2.2 | Rules store `source_message` as plain text. No hashing. No `source_id` linked to Slack message hashes. |
| **RBAC Context** | Module 3 (YAML spec) | No role-based access anywhere. No `allowed_actors`, no `required_signatures`. |
| **State Machine execution** | Module 3 (YAML spec) | No `pre_states`, `logic_nodes`, or `post_states` implemented. The YAML schema exists only in the whitepaper. |
| **Pragmatic Class Normalization** | Module 1.3 | No intent classification. The ingestor uses keyword scoring ([ingestor.py L24-43](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/ingestor.py#L24-L43)) — checking for strings like "from now on" and "new policy." |
| **Invariant Guards (pre-commit checks)** | Module 1.2 | The agent API returns decisions but does not intercept or block any actual action. It's advisory, not enforcing. |
| **"100% Hallucination-Free"** | Module 2.2 | The Gemini LLM generates free-text answers ([versioning.py L357-358](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/versioning.py#L357-L358), [main.py L91](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/main.py#L91)). No guardrails prevent hallucination beyond the prompt instruction. |

---

## 4. Three Most Critical Bugs to Fix Before Any Demo

### 🔴 Critical #1: Fix the extraction pipeline

**Files:** [extractor.py L94-163](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/extractor.py#L94-L163)

**Problem:** YAML parsing and rule saving is inside the `except` block. With a valid API key, no rules are ever created.

**Fix:** Move lines 122-160 (YAML cleanup, parsing, embedding, Rule creation, db.commit) out of the `except` block and into the `try` block after `yaml_resp` is assigned on L95. The `except` block should only handle the mock fallback for invalid API keys, then fall through to the shared parsing logic.

**Time:** 30 minutes.

---

### 🔴 Critical #2: Replace keyword decision logic

**Files:** [agent_api.py L116-133](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/agent_api.py#L116-L133)

**Problem:** Substring matching produces wrong decisions. Any YC partner or technical evaluator will find this immediately.

**Fix (minimum viable):** Add an `action_type` column to the `Rule` model (enum: `escalation`, `permission`, `denial`, `informational`). Set it at extraction time using the LLM (add to the extraction prompt). At query time, read the column instead of parsing the text.

**Time:** 2-3 hours.

---

### 🔴 Critical #3: Fix multi-tenancy

**Files:** [extractor.py L146](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/extractor.py#L146), [main.py L65](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/main.py#L65), [ingestor.py L47-52](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/backend/ingestor.py#L47-L52), [next-app/app/page.tsx L10](file:///c:/Users/Umesh%20Shinde/Desktop/Project%20Brain/company-brain/next-app/app/page.tsx#L10)

**Problem:** `workspace_id` is hardcoded in 3 different files to 2 different values. The ingestor webhook doesn't set `workspace_id` at all.

**Fix:** Pass `workspace_id` from the Slack event payload (`team_id`) through the ingestion→extraction→query chain. Remove all hardcoded workspace IDs. Make the frontend read workspace from URL params or auth context.

**Time:** 3-4 hours.

---

## 5. What a Competent Backend Engineer Could Fix in 2 Weeks

### Week 1: Make the core pipeline actually work

| Day | Task | Files |
|-----|------|-------|
| 1 | Fix extraction happy path (Bug #1) | `extractor.py` |
| 1 | Fix ingestor missing `workspace_id` (Bug #5) | `ingestor.py` |
| 2 | Add `action_type` to Rule model, update extraction prompt to classify rules | `models.py`, `extractor.py` |
| 2 | Replace keyword decision logic with `action_type` lookup (Bug #2) | `agent_api.py` |
| 3 | Fix multi-tenancy: `workspace_id` flows from Slack through entire pipeline (Bug #3) | `extractor.py`, `main.py`, `ingestor.py` |
| 3 | Remove duplicate `/slack/events` route (Bug #4) | `main.py`, `ingestor.py` |
| 4 | Delete dead code: `executor.py`, `Skill` model, `AgentConversation` model | `executor.py`, `models.py`, `migration.sql` |
| 4 | Pick one frontend (Next.js), delete the other | `frontend/` directory |
| 5 | Fix tests to use `Rule` model, add basic CI | `test_*.py`, add GitHub Actions |

### Week 2: Make it demoable to a real customer

| Day | Task | Files |
|-----|------|-------|
| 6 | Add API key auth middleware (workspace-scoped) | New: `auth.py`, update `main.py` |
| 7 | Store real similarity scores in QueryLog and Contradiction | `versioning.py` |
| 7 | Add `message_id` field to `SlackMessage` in ingestor webhook path | `ingestor.py` |
| 8 | Build one-command demo reset + seed that works end-to-end with real extraction | `agent_api.py`, `demo.py` |
| 9 | Integration tests: ingest→extract→query→decide round-trip | New: `test_integration.py` |
| 10 | Load test the agent API, fix any N+1 queries or missing indices | `agent_api.py`, `models.py` |

### What this does NOT include (out of scope for 2 weeks):
- Actor Graph / BGCC
- Cryptographic verification
- RBAC
- State machine execution
- Any whitepaper Module 3 features

---

## Verdict

The plumbing is real — Slack OAuth, pgvector search, versioning chain, audit logs, human review loop, Slack bot. That's genuine infrastructure.

The intelligence layer is broken. The extraction pipeline doesn't save rules when it should. The decision engine is substring matching. Multi-tenancy doesn't work. The whitepaper describes a system that is 6-12 months of engineering away from the current code.

Three fixes (extraction happy path, decision logic, workspace_id) would take a competent engineer **one day** and would turn this from a broken demo into a working MVP.
