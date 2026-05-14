import requests
import json

def test_live_api():
    url = "https://project-brain-production-fa75.up.railway.app/agent/query"
    headers = {
        "Content-Type": "application/json",
        "x-api-key": "sk-demo-12345678"
    }
    payload = {
        "workspace_id": "demo-workspace",
        "agent_id": "outreach-test",
        "action": "issue a $350 refund for a 3-month customer",
        "context": {"source": "manual_test"}
    }
    
    print(f"Testing Live API at {url}...")
    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\nLIVE API RESPONSE:")
            print(json.dumps(data, indent=2))
            
            if data.get("decision") == "denied":
                print("\n✅ SUCCESS: Production engine DENIED the unauthorized refund.")
            else:
                print(f"\n❌ FAILURE: Engine returned decision: {data.get('decision')}")
        else:
            print(f"Error: {response.text}")
            
    except Exception as e:
        print(f"Request failed: {e}")

if __name__ == "__main__":
    test_live_api()
