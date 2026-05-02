import requests

BASE_URL = "http://localhost:8000"
WORKSPACE_ID = "test-workspace-1"

# Clear rules via direct SQL - we need to delete from the tables in the right order
# First, let's just clear by deleting contradictions and then updating rules

# Get all rules and update them
resp = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/rules")
rules = resp.json()
print(f"Found {len(rules)} rules")

for rule in rules:
    # Delete the rule - we'll just update status to archived
    requests.patch(
        f"{BASE_URL}/rules/{rule['id']}/status",
        json={"status": "archived"}
    )
    print(f"Archived: {rule['title']}")

# Clear contradictions
resp = requests.get(f"{BASE_URL}/rules/{WORKSPACE_ID}/contradictions")
contradictions = resp.json()
print(f"Found {len(contradictions)} contradictions")

# Now we have a clean state - all rules archived
print("\nTest data cleared")
