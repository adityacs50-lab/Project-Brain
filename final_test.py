import requests
import json

BASE_URL = "http://localhost:8000"
WORKSPACE_ID = "test-workspace-1"

# Step 1: Clear all test data fresh
print("=== Step 1: Clean Database ===\n")

# Get all rules
resp = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/rules")
all_rules = resp.json()
print(f"Found {len(all_rules)} total rules")

# Delete all rules (we can delete via API or just get fresh state)
# For now, we'll just archive them all
for rule in all_rules:
    requests.patch(
        f"{BASE_URL}/rules/{rule['id']}/status",
        json={"status": "archived"}
    )
print("Archived all rules")

# Step 2: Seed exactly 3 rules as per checklist
print("\n=== Step 2: Seed 3 Test Rules ===\n")

# Rule 1
rule1 = {
    "workspace_id": WORKSPACE_ID,
    "title": "Refund Approval Policy",
    "rule_text": "Refunds over $200 require VP approval before processing",
    "confidence": 0.95,
    "source_message": "From now on refunds over 200 dollars need VP sign off",
    "channel_id": "customer-support"
}
resp = requests.post(f"{BASE_URL}/rules/ingest", json=rule1)
data1 = resp.json()
print(f"Rule 1: {data1['id']} - Status: {data1['status']}")

# Rule 2 - wait to avoid race condition
import time
time.sleep(1)

rule2 = {
    "workspace_id": WORKSPACE_ID,
    "title": "Bug Ticket Protocol",
    "rule_text": "All bug tickets must be tagged with QA before moving to resolved",
    "confidence": 0.91,
    "source_message": "lets make it mandatory to tag QA on all bugs before resolving",
    "channel_id": "dev-chat"
}
resp = requests.post(f"{BASE_URL}/rules/ingest", json=rule2)
data2 = resp.json()
print(f"Rule 2: {data2['id']} - Status: {data2['status']}")

time.sleep(1)

# Rule 3 - contradiction
rule3 = {
    "workspace_id": WORKSPACE_ID,
    "title": "Refund Approval Policy",
    "rule_text": "Refunds over $100 only need Manager approval, not VP",
    "confidence": 0.88,
    "source_message": "update - manager approval is enough for refunds now, no need for VP",
    "channel_id": "customer-support"
}
resp = requests.post(f"{BASE_URL}/rules/ingest", json=rule3)
data3 = resp.json()
print(f"Rule 3: {data3['id']} - Status: {data3['status']}")

# Step 3: Verify
print("\n=== Step 3: Verify Seed ===\n")
resp = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/rules")
rules = resp.json()

pending = [r for r in rules if r['status'] == 'pending']
active = [r for r in rules if r['status'] == 'active']
archived = [r for r in rules if r['status'] == 'archived']

print(f"Pending: {len(pending)} (Expected: 3)")
print(f"Active: {len(active)}")
print(f"Archived: {len(archived)}")

resp = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/contradictions")
contradictions = resp.json()
print(f"Contradictions: {len(contradictions)} (Expected: 1)")

# Step 4: Test Approve/Edit/Reject
print("\n=== Step 4: Test Actions ===\n")

# Approve Rule 1
resp = requests.patch(
    f"{BASE_URL}/rules/{data1['id']}/status",
    json={"status": "active"}
)
print(f"Approve Rule 1: {resp.status_code}")

# Edit & Approve Rule 2
new_text = rule2['rule_text'] + " (Edited)"
resp = requests.patch(
    f"{BASE_URL}/rules/{data2['id']}/status",
    json={"status": "active", "edited_text": new_text}
)
print(f"Edit & Approve Rule 2: {resp.status_code}")

# Reject Rule 3
resp = requests.patch(
    f"{BASE_URL}/rules/{data3['id']}/status",
    json={"status": "archived"}
)
print(f"Reject Rule 3: {resp.status_code}")

# Step 5: Final State
print("\n=== Step 5: Final State ===\n")
resp = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/rules")
rules = resp.json()

active = [r for r in rules if r['status'] == 'active']
pending = [r for r in rules if r['status'] == 'pending']
archived = [r for r in rules if r['status'] == 'archived']

print(f"Active: {len(active)} (Expected: 2)")
print(f"Pending: {len(pending)} (Expected: 0)")
print(f"Archived: {len(archived)}")

for r in active:
    print(f"  - {r['title']}: {r['rule_text'][:60]}...")

# Step 6: API Tests
print("\n=== Step 6: API Endpoints ===\n")

# Get active rules
resp = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/rules?status=active")
print(f"GET /rules/{WORKSPACE_ID}/rules?status=active: {len(resp.json())} rules")

# Get contradictions
resp = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/contradictions")
print(f"GET /rules/{WORKSPACE_ID}/contradictions: {len(resp.json())} contradictions")

# Get version history
resp = requests.get(f"{BASE_URL}/rules/{data1['id']}/history")
print(f"GET /rules/{data1['id']}/history: {len(resp.json())} versions")

print("\n=== ALL TESTS COMPLETE ===")

if len(active) == 2 and len(pending) == 0:
    print("✅ Step 2 PASSED: Approve/Edit/Reject works")
else:
    print("❌ Step 2 FAILED")
