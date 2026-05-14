import asyncio
import json
from backend.agent_api import query_agent, AgentQueryRequest
from unittest.mock import MagicMock

async def test_violation():
    print("Testing Policy Violation: Refund $200...")
    
    # Mock the FastAPI Request object for the API key check
    mock_request = MagicMock()
    mock_request.headers = {"x-api-key": "sk-demo-12345678"}
    
    query_req = AgentQueryRequest(
        workspace_id="demo-workspace",
        agent_id="test-agent",
        action="issue a $200 refund",
        context={"user": "support_rep_01"}
    )
    
    try:
        response = await query_agent(query_req, mock_request)
        print("\nAPI RESPONSE:")
        print(json.dumps(response, indent=2))
        
        if response.get("decision") == "denied":
            print("\nSUCCESS: Decision was correctly DENIED.")
        else:
            print(f"\nFAILURE: Decision was {response.get('decision')}")
            
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    asyncio.run(test_violation())
