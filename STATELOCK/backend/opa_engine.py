import re
import json

class OPARegoEngine:
    """
    Enterprise-grade OPARegoEngine.
    Compiles dynamic database rules into declarative OPA/Rego format,
    and provides a lightweight Python-native parser to evaluate input payloads
    against compiled Rego policies with zero external binary dependencies.
    """

    @staticmethod
    def compile_rule_to_rego(rule_id: str, title: str, rule_text: str, action_type: str, operator: str, threshold: float) -> str:
        """
        Compiles a dynamic database compliance rule into standardized Rego syntax.
        """
        package_header = f"package statelock.authz.rule_{str(rule_id).replace('-', '_')}\n\n"
        default_val = "default allow = true\n" if action_type in ["denied", "escalate"] else "default allow = false\n"
        
        # Determine logical operator for Rego block
        rego_op = operator
        if operator == "=":
            rego_op = "=="
            
        rego_block = f"# Rule: {title}\n"
        
        # If action is 'denied' or 'escalate', we set 'allow = false' if conditions are met
        outcome_allow = "allow = false" if action_type in ["denied", "escalate"] else "allow = true"
        
        conditions = []
        # Match primary keywords associated with rule (ignoring metadata descriptors like 'policy', 'protocol')
        ignore_words = {"policy", "protocol", "rules", "rule", "management", "governance", "limit", "limitations"}
        keywords = [w for w in re.findall(r"\w+", title.lower()) if w not in ignore_words]
        if not keywords:
            keywords = re.findall(r"\w+", title.lower())
            
        if keywords:
            conditions.append(f'  contains(input.action, "{keywords[0]}")')
            
        if threshold is not None and rego_op:
            conditions.append(f'  input.amount {rego_op} {threshold}')
            
        conditions_str = "\n".join(conditions)
        rego_block += f"{outcome_allow} {{\n{conditions_str}\n}}\n"
        
        return package_header + default_val + rego_block

    @staticmethod
    def evaluate_rego(rego_code: str, input_payload: dict) -> dict:
        """
        Evaluates compiled Rego code against an input payload.
        Implements declarative parsing for enterprise security checks.
        """
        # Parse package header
        package_match = re.search(r"package\s+([a-zA-Z0-9_\.]+)", rego_code)
        package_name = package_match.group(1) if package_match else "statelock.authz"
        
        # Extract default allow value
        default_match = re.search(r"default\s+allow\s*=\s*(true|false)", rego_code)
        default_allow = default_match.group(1) == "true" if default_match else True
        
        # Analyze evaluation blocks
        allow_blocks = re.findall(r"allow\s*=\s*(true|false)\s*\{([^}]+)\}", rego_code, re.DOTALL)
        
        action = input_payload.get("action", "").lower()
        amount = input_payload.get("amount")
        
        final_verdict = default_allow
        
        for outcome_str, block in allow_blocks:
            outcome = outcome_str == "true"
            conditions = [c.strip() for c in block.split("\n") if c.strip()]
            
            block_triggered = True
            for condition in conditions:
                if condition.startswith("#"):
                    continue
                # Evaluate: contains(input.action, "keyword")
                contains_match = re.search(r'contains\(input\.action,\s*"([^"]+)"\)', condition)
                if contains_match:
                    kw = contains_match.group(1).lower()
                    if kw not in action:
                        block_triggered = False
                        break
                        
                # Evaluate: input.amount op val
                amount_match = re.search(r'input\.amount\s*(>|<|==|>=|<=)\s*(\d+(?:\.\d+)?)', condition)
                if amount_match:
                    op_str = amount_match.group(1)
                    val = float(amount_match.group(2))
                    if amount is None:
                        block_triggered = False
                        break
                    
                    # Execute comparison
                    if op_str == ">" and not (amount > val):
                        block_triggered = False
                    elif op_str == "<" and not (amount < val):
                        block_triggered = False
                    elif op_str == "==" and not (amount == val):
                        block_triggered = False
                    elif op_str == ">=" and not (amount >= val):
                        block_triggered = False
                    elif op_str == "<=" and not (amount <= val):
                        block_triggered = False
                        
            if block_triggered:
                final_verdict = outcome
                break
                
        return {
            "allowed": final_verdict,
            "package": package_name,
            "decision": "permitted" if final_verdict else "denied"
        }
