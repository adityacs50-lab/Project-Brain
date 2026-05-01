# Company Brain

Company Brain is a Slack-to-Intelligence pipeline that turns messy company communication into structured, executable business logic. It ingests Slack messages, extracts policy-like skills into YAML, and answers company-procedure questions with grounded, source-attributed responses.

## What it does
- Ingests historical or live Slack messages.
- Filters noise from real operational logic.
- Extracts company policies into structured YAML skills.
- Answers questions using only the extracted company knowledge.
- Preserves source attribution for every answer.

## Demo
Run the end-to-end demo:

```bash
python backend/demo.py
```

## Backend
Start the backend server:

```bash
uvicorn backend.main:app --reload
```

If your app uses a different entrypoint, adjust the module path accordingly.

## Frontend
Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

## Tests
Run the full test suite:

```bash
pytest
```

Run the edge case tests:

```bash
pytest backend/test_edge_cases.py
```

## Environment Setup
Create a `.env` file in the project root with any required keys, such as:

```env
GEMINI_API_KEY=your_key_here
DATABASE_URL=your_database_url_here
SLACK_BOT_TOKEN=your_slack_token_here
SLACK_SIGNING_SECRET=your_slack_signing_secret_here
```

If you are using a local mock setup, make sure the demo and tests are pointed at the correct mock or in-memory configuration.

## Project Structure
- `backend/` - FastAPI backend, ingestion, extraction, executor, and tests.
- `frontend/` - React frontend.
- `skills/` - Generated YAML skill files.
- `slack_messy_dataset.csv` - Sample dataset for testing.

## How the pipeline works
1. Slack messages are ingested from historical data or live events.
2. Noise filtering separates casual chat from policy-like content.
3. The extractor converts relevant threads into YAML skills.
4. The executor uses those skills to answer questions.
5. Each response includes source attribution.

## Example workflow
1. Add messages to Slack or load the sample dataset.
2. Run the ingestion and extraction pipeline.
3. Ask a question like:
   - What is the refund policy?
   - How do we handle bug tickets?
   - Who can approve discounts?
4. The system replies with a grounded answer and a source reference.

## Notes
- This is an MVP focused on demonstrating the core logic layer idea.
- It is optimized for speed of iteration, not full enterprise hardening.
- The next production step is stronger conflict resolution, RBAC, and connector expansion.

## YC Summary
Company Brain is the logic layer for AI agents. It turns fragmented Slack knowledge into executable skills so company-specific workflows can run reliably.
