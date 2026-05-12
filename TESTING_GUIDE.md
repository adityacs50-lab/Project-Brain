# 🛡️ Statelock Testing Guide

Use these steps to verify that the **Statelock** deterministic engine is correctly enforcing your high-stakes business rules.

## 1. Local "Live Fire" Test (Python)
This test runs the logic locally to verify the decision engine.

**Prerequisites:**
- Ensure you are in the `STATELOCK` directory.
- Ensure dependencies are installed (`pip install -r requirements.txt`).

**Run the command:**
```powershell
$env:PYTHONPATH = "."; python test_violation.py
```

**Expected Result:**
The output should show `decision: denied` with the reason:
> "Any refund request exceeding the threshold of $200 requires formal authorization from the VP of Customer Success..."

---

## 2. Live API Test (cURL)
Test the production Railway backend directly to verify the orchestration layer is alive.

**Run the command:**
```powershell
curl -X POST https://project-brain-production-fa75.up.railway.app/agent/query `
  -H "Content-Type: application/json" `
  -H "x-api-key: sk-demo-12345678" `
  -d '{
    "workspace_id": "demo-workspace",
    "agent_id": "outreach-test",
    "action": "issue a $350 refund for a 3-month customer",
    "context": {"source": "manual_test"}
  }'
```

**Expected Result:**
```json
{
  "decision": "denied",
  "confidence": 1.0,
  "reason": "Any refund request exceeding the threshold of $200 requires formal authorization...",
  "status": "violation_detected"
}
```

---

## 3. UI Sync Verification
Open [statelock.vercel.app](https://statelock.vercel.app) (or your latest Vercel deployment) and check:

1.  **Dashboard Load**: "Operation Command Center" should load with **10 Active Rules**.
2.  **Governance Health**: Should show **100% Confidence**.
3.  **Recent Activity**: Should show the seeded rules (PII Data Sovereignty, Refund Cap, etc.).
4.  **Browser Console**: Open DevTools (F12) → Console. You should see:
    > `API: Fetching rules from Railway: https://project-brain-production-fa75.up.railway.app/rules/demo-workspace/rules`

---

## 🛠️ Troubleshooting
If you see **0 Active Rules**:
1. Check the browser console for CORS errors.
2. Ensure `NEXT_PUBLIC_API_URL` is set to `https://project-brain-production-fa75.up.railway.app` in Vercel settings.
3. If the backend is down, the dashboard will show a loader or 0. Check [Railway Dashboard](https://railway.app).
