import requests
import json

BASE_URL = "http://localhost:8000"

# First, seed rules to ensure we have test data
def clear_and_seed():
    # Clear test data
    workspace_id = "test-workspace-1"
    
    # Get all rules
    resp = requests.get(f"{BASE_URL}/rules/{workspace_id}/rules")
    rules = resp.json()
    print(f"Current rules: {len(rules)}")
    
    # Ingest Rule 1
    rule1 = {
        "workspace_id": workspace_id,
        "title": "Refund Approval Policy",
        "rule_text": "Refunds over $200 require VP approval before processing",
        "confidence": 0.95,
        "source_message": "From now on refunds over 200 dollars need VP sign off",
        "channel_id": "customer-support"
    }
    resp = requests.post(f"{BASE_URL}/rules/ingest", json=rule1)
    print(f"Rule 1 ingested: {resp.json()['id']}")
    
    # Ingest Rule 2
    rule2 = {
        "workspace_id": workspace_id,
        "title": "Bug Ticket Protocol",
        "rule_text": "All bug tickets must be tagged with QA before moving to resolved",
        "confidence": 0.91,
        "source_message": "lets make it mandatory to tag QA on all bugs before resolving",
        "channel_id": "dev-chat"
    }
    resp = requests.post(f"{BASE_URL}/rules/ingest", json=rule2)
    rule2_id = resp.json()['id']
    print(f"Rule 2 ingested: {rule2_id}")
    
    # Ingest Rule 3 (contradiction)
    rule3 = {
        "workspace_id": workspace_id,
        "title": "Refund Approval Policy",
        "rule_text": "Refunds over $100 only need Manager approval, not VP",
        "confidence": 0.88,
        "source_message": "update - manager approval is enough for refunds now, no need for VP",
        "channel_id": "customer-support"
    }
    resp = requests.post(f"{BASE_URL}/rules/ingest", json=rule3)
    rule3_id = resp.json()['id']
    print(f"Rule 3 ingested: {rule3_id}")
    
    # Get contradictions
    resp = requests.get(f"{BASE_URL}/rules/{workspace_id}/contradictions")
    contradictions = resp.json()
    print(f"Contradictions: {len(contradictions)}")
    
    return workspace_id

def test_approve_edit_reject(workspace_id):
    # Get all pending rules
    resp = requests.get(f"{BASE_URL}/rules/{workspace_id}/rules")
    rules = resp.json()
    pending = [r for r in rules if r['status'] == 'pending']
    print(f"\n=== Test Step 2: Review UI Actions ===")
    print(f"Pending rules: {len(pending)}")
    
    # Test approval of Rule 1
    rule1 = next(r for r in pending if 'VP approval' in r['rule_text'])
    resp = requests.patch(
        f"{BASE_URL}/rules/{rule1['id']}/status",
        json={"status": "active"}
    )
    print(f"Approved Rule 1: {resp.status_code} - {resp.json()}")
    
    # Test edit and approve of Rule 2
    rule2 = next(r for r in pending if 'Bug Ticket' in r['rule_text'])
    new_text = rule2['rule_text'] + " (Edited)"
    resp = requests.patch(
        f"{BASE_URL}/rules/{rule2['id']}/status",
        json={"status": "active", "edited_text": new_text}
    )
    print(f"Edited & Approved Rule 2: {resp.status_code} - {resp.json()}")
    
    # Test reject of Rule 3 (contradiction)
    rule3 = next(r for r in pending if 'Manager approval' in r['rule_text'])
    resp = requests.patch(
        f"{BASE_URL}/rules/{rule3['id']}/status",
        json={"status": "archived"}
    )
    print(f"Rejected Rule 3: {resp.status_code} - {resp.json()}")
    
    # Check final state
    resp = requests.get(f"{BASE_URL}/rules/{workspace_id}/rules")
    rules = resp.json()
    active = [r for r in rules if r['status'] == 'active']
    pending = [r for r in rules if r['status'] == 'pending']
    archived = [r for r in rules if r['status'] == 'archived']
    print(f"\nFinal state:")
    print(f"  Active: {len(active)}")
    print(f"  Pending: {len(pending)}")
    print(f"  Archived: {len(archived)}")
    
    return active

def test_api_endpoints(workspace_id, active_rules):
    print(f"\n=== Test Step 3: API Direct Queries ===")
    
    # Get active rules
    resp = requests.get(f"{BASE_URL}/rules/{workspace_id}/active")
    if resp.status_code == 404:
        # Try without /active suffix
        resp = requests.get(f"{BASE_URL}/rules/{workspace_id}/rules?status=active")
    print(f"Active rules: {len(resp.json())}")
    
    # Get contradictions
    resp = requests.get(f"{BASE_URL}/rules/{workspace_id}/contradictions")
    print(f"Contradictions: {len(resp.json())}")
    
    # Get version history
    if active_rules:
        rule_id = active_rules[0]['id']
        resp = requests.get(f"{BASE_URL}/rules/{rule_id}/history")
        print(f"Rule history: {len(resp.json())} versions")

if __name__ == "__main__":
    workspace_id = clear_and_seed()
    active_rules = test_approve_edit_reject(workspace_id)
    test_api_endpoints(workspace_id, active_rules)
    print("\n=== ALL TESTS COMPLETE ===")
