import requests
import json
import time

BASE_URL = "http://localhost:8000"
WORKSPACE_ID = "test-workspace-1"

# Seed 3 test rules as per the test checklist

def seed_rules():
    print("=== Seeding Test Rules ===\n")
    
    # Rule 1
    print("Ingesting Rule 1...")
    rule1 = {
        "workspace_id": WORKSPACE_ID,
        "title": "Refund Approval Policy",
        "rule_text": "Refunds over $200 require VP approval before processing",
        "confidence": 0.95,
        "source_message": "From now on refunds over 200 dollars need VP sign off",
        "channel_id": "customer-support"
    }
    resp = requests.post(f"{BASE_URL}/rules/ingest", json=rule1)
    data = resp.json()
    print(f"  Status: {resp.status_code}")
    print(f"  Rule ID: {data['id']}")
    print(f"  Status: {data['status']}")
    rule1_id = data['id']
    
    time.sleep(0.5)
    
    # Rule 2
    print("\nIngesting Rule 2...")
    rule2 = {
        "workspace_id": WORKSPACE_ID,
        "title": "Bug Ticket Protocol",
        "rule_text": "All bug tickets must be tagged with QA before moving to resolved",
        "confidence": 0.91,
        "source_message": "lets make it mandatory to tag QA on all bugs before resolving",
        "channel_id": "dev-chat"
    }
    resp = requests.post(f"{BASE_URL}/rules/ingest", json=rule2)
    data = resp.json()
    print(f"  Status: {resp.status_code}")
    print(f"  Rule ID: {data['id']}")
    print(f"  Status: {data['status']}")
    rule2_id = data['id']
    
    time.sleep(0.5)
    
    # Rule 3 (intentional contradiction to test contradiction engine)
    print("\nIngesting Rule 3 (should create contradiction with Rule 1)...")
    rule3 = {
        "workspace_id": WORKSPACE_ID,
        "title": "Refund Approval Policy",
        "rule_text": "Refunds over $100 only need Manager approval, not VP",
        "confidence": 0.88,
        "source_message": "update - manager approval is enough for refunds now, no need for VP",
        "channel_id": "customer-support"
    }
    resp = requests.post(f"{BASE_URL}/rules/ingest", json=rule3)
    data = resp.json()
    print(f"  Status: {resp.status_code}")
    print(f"  Rule ID: {data['id']}")
    print(f"  Status: {data['status']}")
    rule3_id = data['id']
    
    return rule1_id, rule2_id, rule3_id

def verify_state():
    print("\n=== Verifying State ===\n")
    
    # Get all rules
    resp = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/rules")
    rules = resp.json()
    
    pending = [r for r in rules if r['status'] == 'pending']
    active = [r for r in rules if r['status'] == 'active']
    archived = [r for r in rules if r['status'] == 'archived']
    
    print(f"Total Rules: {len(rules)}")
    print(f"  Pending: {len(pending)}")
    print(f"  Active: {len(active)}")
    print(f"  Archived: {len(archived)}")
    
    # Get contradictions
    resp = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/contradictions")
    contradictions = resp.json()
    print(f"\nContradictions: {len(contradictions)}")
    for c in contradictions:
        print(f"  - {c['id']}: similarity={c['similarity_score']}, resolution={c['resolution']}")
    
    print(f"\nExpected: Pending Review: 3, Contradictions: 1")
    print(f"Actual:   Pending Review: {len(pending)}, Contradictions: {len(contradictions)}")
    
    if len(pending) == 3 and len(contradictions) == 1:
        print("\n✅ Step 1 PASSED: Rules seeded correctly with 1 contradiction")
    else:
        print("\n❌ Step 1 FAILED")
    
    return pending, contradictions

if __name__ == "__main__":
    seed_rules()
    pending, contradictions = verify_state()
    
    # Test Step 2: Approve/Edit/Reject
    print("\n\n=== Testing Step 2: Approve/Edit/Reject ===\n")
    
    if not pending:
        print("No pending rules to test")
        exit(1)
    
    # Approve Rule 1 (first refund policy)
    rule1 = next(r for r in pending if 'VP approval' in r['rule_text'])
    print(f"Approving: {rule1['title']}")
    resp = requests.patch(
        f"{BASE_URL}/rules/{rule1['id']}/status",
        json={"status": "active"}
    )
    print(f"  Result: {resp.status_code}")
    
    # Edit & Approve Rule 2 (bug ticket protocol)
    rule2 = next(r for r in pending if 'Bug Ticket' in r['title'])
    new_text = "All bug tickets must be tagged with QA and Bug label before moving to resolved"
    print(f"Editing & Approving: {rule2['title']}")
    resp = requests.patch(
        f"{BASE_URL}/rules/{rule2['id']}/status",
        json={"status": "active", "edited_text": new_text}
    )
    print(f"  Result: {resp.status_code}")
    print(f"  New text: {new_text}")
    
    # Reject Rule 3 (contradiction - the one that created contradiction)
    rule3 = next(r for r in pending if 'Manager approval' in r['rule_text'])
    print(f"Rejecting: {rule3['title']}")
    resp = requests.patch(
        f"{BASE_URL}/rules/{rule3['id']}/status",
        json={"status": "archived"}
    )
    print(f"  Result: {resp.status_code}")
    
    # Verify final state
    print("\n=== Final State After Approve/Edit/Reject ===\n")
    resp = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/rules")
    rules = resp.json()
    
    pending = [r for r in rules if r['status'] == 'pending']
    active = [r for r in rules if r['status'] == 'active']
    archived = [r for r in rules if r['status'] == 'archived']
    
    print(f"Active: {len(active)} (Expected: 2)")
    print(f"Pending: {len(pending)} (Expected: 0)")
    print(f"Archived: {len(archived)} (Expected: 1)")
    
    for r in active:
        print(f"  ✅ {r['title']}: {r['rule_text'][:50]}...")
    
    if len(active) == 2 and len(pending) == 0:
        print("\n✅ Step 2 PASSED: Approve/Edit/Reject works correctly")
    else:
        print("\n❌ Step 2 FAILED")
    
    print("\n=== ALL TESTS COMPLETE ===")
