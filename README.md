# Company Brain

Company Brain is an enterprise-grade logic extraction and retrieval system. It systematically processes unstructured organizational communication, identifies standard operating procedures, and codifies them into structured, machine-readable rulesets. These rulesets are then leveraged by an autonomous support agent to provide deterministic, policy-grounded answers to internal queries.

## Architecture

The system operates across three primary layers:

1. **Ingestion Engine**: Processes historical and real-time messaging data (e.g., Slack) via asynchronous webhooks and batch pipelines, applying heuristic noise-filtering to isolate high-signal workflow discussions.
2. **Extraction Pipeline**: Utilizes Large Language Models to parse conversational context, identify distinct business policies, and compile them into formal YAML-based "Skills" files.
3. **Execution & Retrieval (RAG)**: Employs vector embeddings (`pgvector`) and keyword heuristics to retrieve relevant procedural context, grounding the agent's responses strictly in codified company policy.

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL database with the `pgvector` extension enabled
- Valid LLM API keys and Slack integration tokens

## Installation

### 1. Environment Configuration

Clone the repository and configure the required environment variables:

```bash
cp .env.example .env
```

Ensure the following variables are populated in your `.env` file:
- `SLACK_BOT_TOKEN`
- `SLACK_SIGNING_SECRET`
- `LLM_API_KEY` (or provider-specific key, replacing `GEMINI_API_KEY`)
- `DATABASE_URL`

### 2. Backend Setup

Initialize the Python environment and install the required dependencies:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Frontend Setup

Install the React application dependencies:

```bash
cd frontend
npm install
```

## Usage

### Running the End-to-End Demo

To validate the extraction and retrieval pipeline without external dependencies, execute the demo script:

```bash
python backend/demo.py
```

### Starting the Services

**API Server**
Start the FastAPI backend:
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Interface**
Start the frontend development server:
```bash
cd frontend
npm run dev
```

The interface will be available at `http://localhost:5173/`.

## Repository Structure

```
company-brain/
├── backend/
│   ├── main.py          # FastAPI application entry point
│   ├── ingestor.py      # Slack ingestion and filtering logic
│   ├── extractor.py     # Unstructured data to YAML transformation
│   ├── executor.py      # RAG-based query resolution
│   ├── db.py            # PostgreSQL and pgvector configuration
│   └── models.py        # SQLAlchemy ORM definitions
├── frontend/            # React SPA for the conversational interface
├── skills/              # Repository for extracted YAML rulesets
└── slack_messy_dataset.csv
```

## Contributing

We welcome contributions to Company Brain. Please ensure all pull requests include appropriate tests and adhere to the existing architectural patterns.
