import asyncio
import sys
import os

# Adjust path to import SDK from local workspace
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../sdk/python")))

from statelock import StateLock, AsyncStateLock

# Use a mock API key and point to the development/mock server to check client construction
API_KEY = "sk-demo-12345678"
BASE_URL = "http://localhost:8000"

def test_sync_sdk():
    print("\n--- Testing Synchronous SDK Client ---")
    try:
        sl = StateLock(api_key=API_KEY, workspace_id="demo-workspace", base_url=BASE_URL)
        print("Sync SDK Initialized Successfully")
        print("Base URL:", sl.base_url)
        print("Workspace ID:", sl.workspace_id)
        
        # Test client representation and methods
        action = "Waive late fee for tenure customer"
        print(f"Checking enforce interface with action: '{action}'")
        # Enforce will fail-close (escalate) if server is down, which is expected and correct!
        result = sl.enforce(action)
        print("Sync Enforce Result:", result)
        print("Decision:", result.decision)
        print("Is Permitted:", result.is_permitted())
        print("Should Escalate:", result.should_escalate())
        
    except Exception as e:
        print(f"Error during Sync SDK verification: {e}")

async def test_async_sdk():
    print("\n--- Testing Asynchronous SDK Client ---")
    try:
        sl = AsyncStateLock(api_key=API_KEY, workspace_id="demo-workspace", base_url=BASE_URL)
        print("Async SDK Initialized Successfully")
        print("Base URL:", sl.base_url)
        print("Workspace ID:", sl.workspace_id)
        
        action = "Issue a $500 refund to customer"
        print(f"Checking enforce async interface with action: '{action}'")
        # Async enforce will fail-closed if server is down
        result = await sl.enforce(action)
        print("Async Enforce Result:", result)
        print("Decision:", result.decision)
        print("Is Permitted:", result.is_permitted())
        print("Should Escalate:", result.should_escalate())
        
    except Exception as e:
        print(f"Error during Async SDK verification: {e}")

if __name__ == "__main__":
    test_sync_sdk()
    asyncio.run(test_async_sdk())
    print("\nSDK Verification Complete!")
