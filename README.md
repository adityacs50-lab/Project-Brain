# Company Brain

**Company Brain** turns messy Slack into usable company logic that answers real operational questions correctly. 

This repository contains the Minimum Buyable Solution (MBS) for the platform—the core, end-to-end flow demonstrating how organizational knowledge is extracted from team chats and used to provide deterministic answers.

## The Minimum Buyable Solution (MBS)

Our MBS is focused on proving one thing: capturing chaotic conversational data and making it actionable. It specifically includes:

1. **Slack Ingestion**: A Slack app that securely ingests messages.
2. **Skill Extractor**: An LLM-powered engine that identifies policy-like discussions and transforms them into structured YAML "Skills".
3. **Execution & Retrieval**: A search and execution layer (RAG) that uses these extracted YAML files to answer company-procedure questions.
4. **Simple Interface**: A clean UI (or direct Slack bot response) that provides answers with clear source attribution.

*Note: In the spirit of the MBS, this version intentionally omits complex multi-source connectors, deep RBAC (Role-Based Access Control) frameworks, self-healing workflow logic, and administrative marketplaces. It is designed to be installed, tested, and utilized quickly by real customers.*

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
