import requests

class StateLock:
    """
    StateLock Python SDK: The Deterministic Governance Layer for AI Agents.
    
    Usage:
        from statelock import StateLock
        sl = StateLock(api_key="sk-xxx")
        result = sl.enforce("Issue a $1000 refund", user="support_lead")
        
        if result.decision == "PERMITTED":
            # Proceed with action
            pass
    """
    def __init__(self, api_key, base_url="https://statelock-backend.railway.app"):
        self.api_key = api_key
        # Default to production URL unless overridden
        self.base_url = base_url.rstrip("/")

    def enforce(self, action, context=None, **kwargs):
        """
        Enforce governance on an agent action.
        
        Args:
            action (str): The natural language description of the action being attempted.
            context (dict, optional): Additional metadata for the adjudication.
            **kwargs: Extra context key-value pairs (e.g. amount=500).
            
        Returns:
            AdjudicationResult: The verdict from the StateLock Supreme Court.
        """
        ctx = context or {}
        ctx.update(kwargs)
        
        payload = {
            "action": action,
            "context": ctx
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        try:
            # Use /agent/query endpoint
            response = requests.post(
                f"{self.base_url}/agent/query", 
                json=payload, 
                headers=headers,
                timeout=10 # Governance should be fast
            )
            
            if response.status_code == 401 or response.status_code == 403:
                return AdjudicationResult({
                    "decision": "ESCALATE",
                    "message": "Invalid StateLock API Key. Check your dashboard."
                })
                
            response.raise_for_status()
            data = response.json()
            return AdjudicationResult(data)
            
        except requests.exceptions.RequestException as e:
            # SAFETY-FIRST: If the engine is down, escalate the action. 
            # Better to block a good action than to permit a bad one without governance.
            return AdjudicationResult({
                "decision": "ESCALATE",
                "message": f"StateLock Connection Error: {str(e)}",
                "reasoning": "Governance engine unreachable. Safety-first protocol triggered."
            })

class AdjudicationResult:
    def __init__(self, data):
        # Normalize decision to uppercase for consistency
        self.decision = data.get("decision", "ESCALATE").upper()
        
        # Extract reasoning
        self.reason = data.get("rule_text") or data.get("message") or "No explicit reasoning provided by Supreme Court."
        self.rule_title = data.get("rule_title")
        self.confidence = data.get("confidence", 0.0)
        self.audit_id = data.get("audit_id")

    def __repr__(self):
        return f"<StateLock Result: {self.decision} (Confidence: {self.confidence:.2f})>"

    def is_permitted(self):
        return self.decision == "PERMITTED"

    def is_denied(self):
        return self.decision == "DENIED"

    def should_escalate(self):
        return self.decision == "ESCALATE" or self.decision == "NO_RULE_FOUND"
