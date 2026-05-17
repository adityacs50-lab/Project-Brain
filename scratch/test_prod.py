import httpx

def check():
    try:
        r = httpx.get("https://distinguished-adventure-production-4d26.up.railway.app/health")
        print(f"PROD STATUS: {r.status_code}")
        print(f"PROD RESPONSE: {r.text}")
    except Exception as e:
        print(f"PROD CHECK FAILED: {e}")

if __name__ == "__main__":
    check()
