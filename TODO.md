# TODO: Implement Agent API Layer

## 1. Update models.py
- [x] Add AgentDecisionLog table with all required fields

## 2. Create agent_api.py
- [x] POST /agent/query - Query rules using semantic search with pgvector
- [x] GET /agent/rules/{workspace_id}/support - Get all active rules
- [x] POST /agent/feedback - Update feedback and trigger learning loop
- [x] GET /agent/decisions/{workspace_id} - Get audit trail
- [x] POST /agent/seed/{workspace_id} - Seed test rules

## 3. Register router in main.py
- [x] Include agent_api router with prefix /agent

## 4. Test
- [x] Test the API endpoints work correctly
