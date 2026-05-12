import requests
import json
import sys

# Configuration
BASE_URL = "https://project-brain-production-fa75.up.railway.app"
HEADERS = {
    "Content-Type": "application/json",
    "x-api-key": "sk-demo-12345678"
}
WORKSPACE_ID = "demo-workspace"

def print_step(msg):
    print(f"\n[STEP] {msg}")

def test_full_workflow():
    results = []

    print(f"STATELOCK FULL SYSTEM VALIDATION")
    print(f"Target: {BASE_URL}\n" + "="*40)

    # 1. Health Check
    print_step("Checking System Health...")
    try:
        res = requests.get(f"{BASE_URL}/health")
        if res.status_code == 200 and res.json().get("status") == "ok":
            print("OK: Health Check Passed")
            results.append(("Health Check", True))
        else:
            print(f"FAIL: Health Check Failed: {res.text}")
            results.append(("Health Check", False))
    except Exception as e:
        print(f"FAIL: Health Check Error: {e}")
        results.append(("Health Check", False))

    # 2. Rules Loaded
    print_step("Verifying Seeded Rules...")
    try:
        res = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/rules")
        rules = res.json()
        if len(rules) >= 10:
            print(f"OK: Found {len(rules)} rules. Validation Passed.")
            for r in rules:
                print(f"   - {r['title']}")
            results.append(("Rules Loading", True))
        else:
            print(f"FAIL: Only found {len(rules)} rules. Expected at least 10.")
            results.append(("Rules Loading", False))
    except Exception as e:
        print(f"FAIL: Rules Verification Error: {e}")
        results.append(("Rules Loading", False))

    # 3. Permitted Action
    print_step("Testing Permitted Action: 'send weekly report'...")
    try:
        payload = {
            "workspace_id": WORKSPACE_ID,
            "agent_id": "test-agent",
            "action": "send weekly report to team",
            "context": {}
        }
        res = requests.post(f"{BASE_URL}/agent/query", headers=HEADERS, json=payload)
        data = res.json()
        if data.get("decision") == "permitted":
            print("OK: Permitted Action Passed")
            results.append(("Permitted Action", True))
        else:
            print(f"FAIL: Expected 'permitted', got '{data.get('decision')}'")
            results.append(("Permitted Action", False))
    except Exception as e:
        print(f"FAIL: Permitted Action Error: {e}")
        results.append(("Permitted Action", False))

    # 4. Blocked Action 1: Refund
    print_step("Testing Blocked Action: '$350 Refund'...")
    try:
        payload = {"workspace_id": WORKSPACE_ID, "agent_id": "test-agent", "action": "issue a $350 refund", "context": {}}
        res = requests.post(f"{BASE_URL}/agent/query", headers=HEADERS, json=payload)
        data = res.json()
        if data.get("decision") == "denied" and data.get("confidence") == 1.0:
            print(f"OK: Denied correctly with 1.0 confidence: {data.get('rule_title')}")
            results.append(("Blocked Action: Refund", True))
        else:
            print(f"FAIL: Blocked Action Failed. Decision: {data.get('decision')}, Confidence: {data.get('confidence')}")
            results.append(("Blocked Action: Refund", False))
    except Exception as e:
        print(f"FAIL: Blocked Action Error: {e}")
        results.append(("Blocked Action: Refund", False))

    # 5. Blocked Action 2: Vendor Contract
    print_step("Testing Blocked Action: '$15,000 Vendor Contract'...")
    try:
        payload = {"workspace_id": WORKSPACE_ID, "agent_id": "test-agent", "action": "sign a $15,000 vendor contract", "context": {}}
        res = requests.post(f"{BASE_URL}/agent/query", headers=HEADERS, json=payload)
        data = res.json()
        if data.get("decision") == "denied":
            print(f"OK: Denied correctly: {data.get('rule_title')}")
            results.append(("Blocked Action: Vendor", True))
        else:
            print(f"FAIL: Expected 'denied', got '{data.get('decision')}'")
            results.append(("Blocked Action: Vendor", False))
    except Exception as e:
        print(f"FAIL: Blocked Action Error: {e}")
        results.append(("Blocked Action: Vendor", False))

    # 6. Blocked Action 3: PII
    print_step("Testing Blocked Action: 'share customer PII'...")
    try:
        payload = {"workspace_id": WORKSPACE_ID, "agent_id": "test-agent", "action": "share customer PII outside CRM", "context": {}}
        res = requests.post(f"{BASE_URL}/agent/query", headers=HEADERS, json=payload)
        data = res.json()
        if data.get("decision") == "denied":
            print(f"OK: Denied correctly: {data.get('rule_title')}")
            results.append(("Blocked Action: PII", True))
        else:
            print(f"FAIL: Expected 'denied', got '{data.get('decision')}'")
            results.append(("Blocked Action: PII", False))
    except Exception as e:
        print(f"FAIL: Blocked Action Error: {e}")
        results.append(("Blocked Action: PII", False))

    # 7. Audit Log
    print_step("Verifying Audit Logging...")
    try:
        res = requests.get(f"{BASE_URL}/agent/decisions/{WORKSPACE_ID}")
        decisions = res.json()
        if len(decisions) > 0:
            print(f"OK: Found {len(decisions)} decisions in audit log.")
            results.append(("Audit Logging", True))
        else:
            print("FAIL: Audit log is empty.")
            results.append(("Audit Logging", False))
    except Exception as e:
        print(f"FAIL: Audit Log Error: {e}")
        results.append(("Audit Logging", False))

    # FINAL SUMMARY
    print("\n" + "="*40 + "\nFINAL VALIDATION SUMMARY\n" + "="*40)
    all_passed = True
    for test, passed in results:
        status = "PASS" if passed else "FAIL"
        if not passed: all_passed = False
        print(f"{test:<30}: {status}")
    
    print("\n" + "="*40)
    if all_passed:
        print("SUCCESS: SYSTEM READY FOR OUTREACH")
    else:
        print("CRITICAL: SYSTEM NOT READY - INVESTIGATE FAILURES")
        sys.exit(1)

if __name__ == "__main__":
    test_full_workflow()
