import os
import asyncio
from dotenv import load_dotenv
from slack_sdk.web.async_client import AsyncWebClient
from slack_sdk.errors import SlackApiError

load_dotenv()

async def debug_slack():
    token = os.getenv("SLACK_BOT_TOKEN")
    if not token:
        print("SLACK_BOT_TOKEN is NOT set in environment.")
        return

    print(f"SLACK_BOT_TOKEN found. First 10 chars: {token[:10]}...")

    client = AsyncWebClient(token=token)
    
    print("\nTesting conversations.list with public_channel...")
    try:
        res = await client.conversations_list(types="public_channel", limit=1)
        print("public_channel access OK")
    except SlackApiError as e:
        print(f"public_channel access FAILED: {e.response['error']}")

    print("\nTesting conversations.list with private_channel...")
    try:
        res = await client.conversations_list(types="private_channel", limit=1)
        print("private_channel access OK")
    except SlackApiError as e:
        print(f"private_channel access FAILED: {e.response['error']}")

    print("\nTesting conversations.list with im...")
    try:
        res = await client.conversations_list(types="im", limit=1)
        print("im access OK")
    except SlackApiError as e:
        print(f"im access FAILED: {e.response['error']}")

if __name__ == "__main__":
    asyncio.run(debug_slack())
