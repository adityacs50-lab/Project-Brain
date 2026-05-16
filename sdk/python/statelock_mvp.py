import requests
import json

STATELOCK_API_URL = "https://distinguished-adventure-production-4d26.up.railway.app"

class StateLockGuard:
    """
    StateLock Guard: A deterministic interceptor for LLM actions.
    Connects to the live Railway deterministic engine.
    """
    def __init__(self, api_key: str, rules: list[str] = None):
        # We pass the api_key to authenticate. 
        # For the MVP, rules are managed in the backend workspace "demo-workspace".
        self.api_key = api_key
        # rules array is optional in real SDK since backend holds them, but kept for signature compatibility
        self.rules = rules or []
        print(f"🔒 StateLock Guard Initialized. Connected to {STATELOCK_API_URL}")

    def evaluate(self, action: str, context: str) -> dict:
        """
        Intercepts an agent action and runs it against the remote StateLock engine.
        """
        payload = {
            "workspace_id": "demo-workspace",
            "agent_id": "test-agent",
            "action": str(action),
            "context": {"user_context": context}
        }
        
        headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }

        try:
            response = requests.post(
                f"{STATELOCK_API_URL}/agent/query", 
                json=payload, 
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
            data = response.json()
            
            # The backend returns "decision": "permitted", "denied", or "no_rule_found"
            decision = data.get("decision")
            is_allowed = decision in ["permitted", "no_rule_found"]
            
            reason = data.get("rule_title") or data.get("message") or "Unknown backend response"
            if is_allowed:
                reason = "Action complies with policies (no block rule triggered)."
                
            return {
                "allowed": is_allowed,
                "reason": reason,
                "confidence": data.get("confidence", 1.0)
            }
            
        except Exception as e:
            # Fail closed or fail open? For a guardrail, fail closed if API is unreachable.
            return {
                "allowed": False,
                "reason": f"System Error: Failed to reach StateLock Engine ({str(e)})"
            }
