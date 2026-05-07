import os
import asyncio
from dotenv import load_dotenv
from slack_sdk.web.async_client import AsyncWebClient

load_dotenv()

async def check_scopes():
    token = os.getenv("SLACK_BOT_TOKEN")
    client = AsyncWebClient(token=token)
    
    print(f"Testing token: {token[:10]}...")
    try:
        # auth.test doesn't return scopes, we need to check the response headers of any API call
        # or use apps.permissions.scopes.list (but that's usually for older apps)
        # Actually, the best way is to check the 'x-oauth-scopes' header from a successful response.
        res = await client.auth_test()
        scopes = res.headers.get("x-oauth-scopes")
        print(f"Current Scopes: {scopes}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_scopes())
