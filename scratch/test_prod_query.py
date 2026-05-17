import httpx

def check():
    try:
        r = httpx.post(
            "https://distinguished-adventure-production-4d26.up.railway.app/agent/query",
            json={"action": "issue a refund", "context": {}},
            headers={"Authorization": "Bearer fake_api_key"}
        )
        print(f"PROD QUERY STATUS: {r.status_code}")
        print(f"PROD QUERY RESPONSE: {r.text}")
    except Exception as e:
        print(f"PROD QUERY FAILED: {e}")

if __name__ == "__main__":
    check()
