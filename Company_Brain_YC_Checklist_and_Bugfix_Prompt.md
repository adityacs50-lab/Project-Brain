
# Company Brain: YC-Ready Status + Fix List

## What We Built
- End-to-end Slack-to-Intelligence pipeline.
- Slack ingestion for both historical and live messages.
- Noise filtering to separate casual chat from policy-like logic.
- YAML skill extraction from company conversations.
- RAG-style executor that answers company-procedure questions with source attribution.
- Basic audit logging for conversation history.
- Demo script proving the full flow from raw messages to grounded answers.
- Pytest coverage for ingestion, extraction, and dataset validation.

## What Still Needs Fixing
- Async warning in `extractor.py` from an un-awaited DB mock call.
- More test coverage for malformed inputs.
- More test coverage for conflicting policy changes.
- Stronger guarantee that noise never becomes a skill.
- End-to-end test that confirms source attribution survives extraction and answer generation.

## YC-Ready Positioning
- We have a working MVP, not just a prototype.
- The system already proves the core thesis: messy company communication can be converted into executable logic.
- The next step is making the pipeline more reliable and resilient, not rebuilding the product.

## Bug-Fix Prompt for AI Agent
Act as a senior Python engineer reviewing the Company Brain backend.

### Goal
Fix the async warning in `backend/extractor.py` and add robust tests for edge cases.

### Tasks
1. Inspect `backend/extractor.py` and find the un-awaited async DB call causing this warning:
   `RuntimeWarning: coroutine 'AsyncMockMixin._execute_mock_call' was never awaited`.
2. Refactor the extractor so all async DB operations are properly awaited.
3. Add tests for malformed Slack-like input:
   - empty message text
   - missing user field
   - missing timestamp
   - non-policy text
4. Add tests for conflicting policy changes:
   - newer Slack thread overrides older rule
   - conflicting rules are flagged instead of silently merged
5. Add an end-to-end test ensuring source attribution is preserved:
   - extracted skill stores source thread/message info
   - executor answer includes the original source name or id
6. Add an end-to-end test proving noise never becomes a skill:
   - lunch chat
   - coffee machine updates
   - casual Friday reminders
   - profile picture reminders
7. Keep the code minimal and production-safe.
8. Do not break the existing demo or current passing tests.

### Acceptance Criteria
- No async warning during pytest.
- Existing tests still pass.
- New tests pass.
- Source attribution is preserved in generated answers.
- Noise messages are filtered out.
- Conflicting policies do not overwrite each other without detection.

## Suggested Next Implementation Order
1. Fix async await issue.
2. Add malformed input tests.
3. Add conflicting policy tests.
4. Add source attribution test.
5. Add noise rejection test.
6. Run demo again.
7. Re-run full pytest suite.
