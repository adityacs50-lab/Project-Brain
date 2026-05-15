# StateLock: Design Partner Onboarding Checklist

Welcome to the StateLock Design Partnership program. Over the next 14 days, we will work closely with your team to establish deterministic guardrails for your AI agents, eliminating the "hallucination gap."

This checklist outlines the steps we will take together to get your agents securely governed.

## Phase 1: Environment Setup (Day 1)
- [ ] **Kickoff Call (15 min):** Align on the primary agentic workflow you want to secure (e.g., Customer Support Refund Agent, DevOps Operations Agent).
- [ ] **Dashboard Access:** We will provision your secure workspace at [statelock.vercel.app](https://statelock.vercel.app/).
- [ ] **Generate API Keys:** Navigate to the `/developer` portal and generate your live environment keys.

## Phase 2: Slack Ingestion & Privacy Scoping (Day 1-2)
*Note: To ensure maximum data privacy and accuracy, we manually scope the Slack integration with our Design Partners.*
- [ ] **Whitelist Channels:** Identify 1-2 specific Slack channels where your team discusses rules or makes decisions related to the agent's domain (e.g., `#support-escalations`, `#agent-ops`).
- [ ] **App Provisioning:** Invite the StateLock secure ingestion bot to the whitelisted channels. 
- [ ] **Data Verification:** Confirm that StateLock is only ingesting data from the authorized channels. (StateLock uses zero-retention extraction and never trains generalized models on your data).

## Phase 3: Rule Adjudication & Approval (Day 3-5)
- [ ] **Review Extraction Queue:** Check the `/review` dashboard for the first batch of rules extracted passively from your Slack history.
- [ ] **Apply the "Executive Seal":** Have a technical leader review the extracted rules. Edit for precision if necessary.
- [ ] **Approve Rules:** Click "Approve" to move validated rules to the Active deterministic library.
- [ ] **Create Manual Hard Rules:** Manually input any non-negotiable boundaries (e.g., "NEVER delete a database table without a human override").

## Phase 4: SDK Integration (Day 5-7)
- [ ] **Install the SDK:** `pip install statelock` in your agent's environment.
- [ ] **Initialize Client:** Add the 2 lines of initialization code using your API key.
- [ ] **Wrap Agent Actions:** Identify the critical juncture where your agent interacts with an external API (e.g., Stripe, AWS). Wrap that call in `statelock.enforce(...)`.
- [ ] **Handle Verdicts:** Implement logic to handle `PERMITTED`, `DENIED`, and `ESCALATED` responses gracefully.

## Phase 5: Production Shadowing (Day 7-14)
- [ ] **Deploy to Staging/Production:** Run your agent with StateLock enforcement active.
- [ ] **Monitor the Supreme Court:** Use the `/decisions` dashboard to watch the Supreme Court adjudicate actions in real-time.
- [ ] **Refine Rules:** Adjust thresholds and rules based on actual agent behavior.
- [ ] **Pilot Review:** Final meeting to review the Audit Logs, quantify risk mitigated, and discuss long-term partnership.

---
**Need Support?**
During the pilot, you have a direct line to the founding team. Reach out on our shared Slack connect channel for instant engineering support.
