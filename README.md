# Company Brain 🧠

Company Brain is an AI-powered operations assistant that transforms messy Slack conversations into structured, executable business rules. It uses Gemini 1.5 Flash to extract "Skills" from chat history and provides a RAG-based chat interface for employees to query company procedures instantly.

## Setup Instructions

1.  **Clone & Configure**: Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`, `SLACK_BOT_TOKEN`, and `DATABASE_URL`.
2.  **Install Backend**: 
    ```bash
    cd backend
    pip install -r requirements.txt
    ```
3.  **Database**: Ensure PostgreSQL with `pgvector` is running and the `DATABASE_URL` in `.env` is correct.
4.  **Install Frontend**:
    ```bash
    cd frontend
    npm install
    ```

## Usage

### Run the Demo
The demo script seeds fake messages, runs the extraction pipeline, and tests the agent:
```bash
python backend/demo.py
```

### Start the Application
- **Backend**: `uvicorn backend.main:app --reload`
- **Frontend**: `cd frontend && npm run dev`

### API Health Check
```bash
curl http://localhost:8000/health
```

## How it Works
1.  **Ingestion**: Pulls messages from Slack or receives them via Webhooks.
2.  **Filtering**: Scores messages for "logic relevance" to filter out noise.
3.  **Extraction**: Groups relevant threads and uses Gemini to generate structured YAML Skill files.
4.  **Execution**: Matches user questions to extracted skills using keyword-weighted search and generates grounded answers via Gemini.

---
*Note: Screenshot placeholders for UI demo.*
