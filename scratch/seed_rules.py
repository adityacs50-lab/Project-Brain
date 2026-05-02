import requests
import json

base_url = "http://localhost:8000"

rules = [
    {
        "workspace_id": "test-workspace-1",
        "title": "Refund Approval Policy",
        "rule_text": "Refunds over $200 require VP approval before processing",
        "confidence": 0.95,
        "source_message": "From now on refunds over 200 dollars need VP sign off",
        "channel_id": "customer-support"
    },
    {
        "workspace_id": "test-workspace-1",
        "title": "Bug Ticket Protocol",
        "rule_text": "All bug tickets must be tagged with QA before moving to resolved",
        "confidence": 0.91,
        "source_message": "lets make it mandatory to tag QA on all bugs before resolving",
        "channel_id": "dev-chat"
    },
    {
        "workspace_id": "test-workspace-1",
        "title": "Refund Approval Policy",
        "rule_text": "Refunds over $100 only need Manager approval, not VP",
        "confidence": 0.88,
        "source_message": "update - manager approval is enough for refunds now, no need for VP",
        "channel_id": "customer-support"
    }
]

for rule in rules:
    print(f"Ingesting rule: {rule['title']}")
    response = requests.post(f"{base_url}/rules/ingest", json=rule)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    print("-" * 20)
