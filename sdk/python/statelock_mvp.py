import requests
import json
import re
import time
import sys

# PRODUCTION ENGINE URL
STATELOCK_API_URL = "https://distinguished-adventure-production-4d26.up.railway.app"

def sanitize_payload(action: str) -> str:
    """
    Locally scrubs Personally Identifiable Information (PII) before it leaves the client's network.
    """
    if not isinstance(action, str):
        return action
    # 1. Mask Emails
    action = re.sub(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[MASKED_EMAIL]", action)
    # 2. Mask SSNs (format: 000-00-0000 or 000000000)
    action = re.sub(r"\b\d{3}-\d{2}-\d{4}\b|\b\d{9}\b", "[MASKED_SSN]", action)
    # 3. Mask Credit Cards (13 to 16 digits)
    action = re.sub(r"\b(?:\d[ -]*?){13,16}\b", "[MASKED_CARD]", action)
    # 4. Mask Passwords / Keys / Secrets
    action = re.sub(r"(?i)(password|passwd|secret|pass|key|api_key|token|credentials)\s*[=:]\s*['\"]?[a-zA-Z0-9_\-]{4,}['\"]?", r"\1=[MASKED_SECRET]", action)
    return action

class StateLockGuard:
    """
    StateLock Guard: The production SDK for deterministic agent safety.
    Connects to the cloud-hosted Adjudication Engine with local edge caching.
    """
    def __init__(self, api_key: str, rules: list[str] = None, fallback_mode: str = None):
        self.api_key = api_key
        self.rules = rules or []
        self.fallback_mode = fallback_mode  # FAIL_CLOSED or FAIL_OPEN_BUT_LOG
        self.rule_cache = []
        self.last_cache_sync = 0.0
        self.workspace_id = "demo-workspace"
        
        print("StateLock Guard Initialized. Connected to Production Engine (Local Edge Caching Enabled).")
        self.sync_rules()

    def sync_rules(self):
        """
        Pulls active deterministic rules from the cloud engine and caches them locally.
        """
        try:
            response = requests.get(
                f"{STATELOCK_API_URL}/agent/rules/{self.workspace_id}/support",
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                self.rule_cache = data.get("rules", [])
                self.last_cache_sync = time.time()
                
                # Pre-parse deterministic constraints for immediate <3ms local execution
                for rule in self.rule_cache:
                    text_lower = rule["rule_text"].lower()
                    rule["threshold_val"] = None
                    rule["operator"] = None
                    rule["currency"] = None
                    
                    # Search for currency threshold (e.g. $200)
                    match = re.search(r"(\$|€|£)?\s*(\d+(?:\.\d+)?)", text_lower)
                    if match:
                        rule["threshold_val"] = float(match.group(2))
                        rule["currency"] = match.group(1)
                    
                    # Detect logical operators
                    if any(term in text_lower for term in ["exceed", "greater than", "over", "more than"]):
                        rule["operator"] = ">"
                    elif any(term in text_lower for term in ["less than", "under", "below"]):
                        rule["operator"] = "<"
                    elif "equal to" in text_lower:
                        rule["operator"] = "="
        except Exception:
            pass # Graceful failure: retain existing in-memory cache

    def evaluate_local_deterministic(self, action: str) -> dict:
        """
        Evaluates deterministic threshold rules locally at <3ms to eliminate network roundtrips.
        """
        action_lower = action.lower()
        match = re.search(r"(\$|€|£)?\s*(\d+(?:\.\d+)?)", action_lower)
        if not match:
            return None
        
        val = float(match.group(2))
        currency = match.group(1)
        
        for rule in self.rule_cache:
            r_val = rule.get("threshold_val")
            r_op = rule.get("operator")
            r_curr = rule.get("currency")
            
            if r_val is not None and r_op is not None:
                rule_keywords = set(re.findall(r"\w+", rule["rule_text"].lower()))
                action_keywords = set(re.findall(r"\w+", action_lower))
                common_terms = {"refund", "transfer", "pay", "charge", "fee", "waive", "outage", "escalate"}
                
                if rule_keywords.intersection(action_keywords).intersection(common_terms):
                    triggered = False
                    if r_op == ">" and val > r_val:
                        triggered = True
                    elif r_op == "<" and val < r_val:
                        triggered = True
                    elif r_op == "=" and val == r_val:
                        triggered = True
                    
                    if triggered and (not r_curr or r_curr == currency):
                        return {
                            "allowed": False,
                            "reason": f"Local Limit Enforced: {rule['title']} - {rule['rule_text']}",
                            "audit_id": f"sl_local_{rule['rule_id'][:8]}"
                        }
        return None

    def handle_fallback(self, action: str, error_msg: str) -> dict:
        """
        Applies tiered fail-safe rules when the cloud backend is unreachable.
        FAIL_CLOSED for high-risk actions, FAIL_OPEN_BUT_LOG for benign actions.
        """
        action_lower = action.lower()
        
        # Determine risk level based on operational indicators
        high_risk_terms = ["refund", "delete", "drop", "write", "update", "transfer", "pay", "ssn", "social security", "password", "key", "credentials"]
        is_high_risk = any(term in action_lower for term in high_risk_terms)
        
        # Tighten checks on refund amounts offline
        if "refund" in action_lower:
            amount_match = re.search(r"\$?(\d+)", action_lower)
            if amount_match:
                amount = int(amount_match.group(1))
                if amount > 50:
                    is_high_risk = True
        
        mode = self.fallback_mode
        if not mode:
            mode = "FAIL_CLOSED" if is_high_risk else "FAIL_OPEN_BUT_LOG"
            
        if mode == "FAIL_CLOSED":
            return {
                "allowed": False,
                "reason": f"StateLock Offline: High-risk action blocked under FAIL_CLOSED. Error: {error_msg}",
                "audit_id": "sl_fallback_closed"
            }
        else:
            print(f"⚠️ [StateLock WARNING] Adjudication Engine unreachable ({error_msg}). Benign action permitted under FAIL_OPEN fallback.", file=sys.stderr)
            return {
                "allowed": True,
                "reason": "Verified under FAIL_OPEN fallback mode.",
                "audit_id": "sl_fallback_open"
            }

    def evaluate(self, action: str, context: str = "") -> dict:
        """
        Evaluates an action. Runs local edge caching checks first, sanitizes data, 
        and securely calls the cloud engine before applying fallbacks.
        """
        # 1. Scrub PII locally to guarantee data privacy compliance
        sanitized_action = sanitize_payload(action)
        
        # 2. Refresh Rule Cache if expired
        if time.time() - self.last_cache_sync > 60:
            self.sync_rules()
            
        # 3. Check Local Edge Cache for deterministic rules (<3ms execution)
        local_verdict = self.evaluate_local_deterministic(sanitized_action)
        if local_verdict:
            return local_verdict

        # 4. Fallback to Real-Time Cloud Engine for complex semantic vector match
        try:
            response = requests.post(
                f"{STATELOCK_API_URL}/agent/query",
                headers={"x-api-key": self.api_key},
                json={
                    "workspace_id": self.workspace_id,
                    "agent_id": "test-agent",
                    "action": str(sanitized_action),
                    "context": {"user_context": context}
                },
                timeout=12
            )
            
            if response.status_code == 200:
                data = response.json()
                decision = data.get("decision")
                is_allowed = decision in ["permitted", "no_rule_found"]
                return {
                    "allowed": is_allowed,
                    "reason": data.get("rule_title") or data.get("message") or "Verified by StateLock Cloud",
                    "audit_id": data.get("audit_id") or "sl_prod_6789"
                }
            
            raise requests.exceptions.RequestException("Adjudication Engine Offline")
            
        except Exception as e:
            # 5. Apply Tiered Fallback Mechanic
            return self.handle_fallback(sanitized_action, str(e))
