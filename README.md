# Company Brain 🧠
### Turning Messy Slack History into Executable Company Intelligence

[![Python](https://img.shields.io/badge/Backend-Python_3.11-blue?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Framework-FastAPI-green?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Gemini](https://img.shields.io/badge/AI-Gemini_1.5_Flash-orange?logo=google&logoColor=white)](https://ai.google.dev/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%2Bpgvector-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)

---

## 🚀 The Vision
Most company knowledge is trapped in Slack threads, forgotten the moment they scroll off the screen. **Company Brain** is an AI-powered operations engine that watches your Slack history, extracts recurring business logic, and transforms it into a structured **"Skills File" (YAML)**.

This Skills File then powers an **AI Support Agent** that provides grounded, policy-backed answers to employee questions—eliminating the "Where is that policy?" frustration forever.

---

## ✨ Key Features
- **🧠 Automated Logic Extraction**: Uses Gemini 1.5 Flash to identify procedures and workflows in messy chat history.
- **📄 Executable Skills Files**: Knowledge is stored in versionable YAML files, making business rules readable for both humans and machines.
- **🛡️ Policy-Grounded RAG**: An AI agent that answers questions based *strictly* on documented procedures.
- **⚡ Real-time Ingestion**: Connects via Slack Webhooks to capture new policies as they are announced.
- **💎 Premium UI**: A sleek, procedural chat interface designed for high-efficiency operations teams.

---

## 🛠️ Tech Stack
- **AI/LLM**: Google Gemini 1.5 Flash (Extraction & RAG)
- **Backend**: FastAPI (Async Python 3.11)
- **Frontend**: React + Vite (Plain JS, Inline Design System)
- **Database**: PostgreSQL with `pgvector` for semantic search
- **Ingestion**: `slack-sdk` for historical and live event processing

---

## 🚦 Quick Start

### 1. Prerequisites
Ensure you have Python 3.11+ and Node.js installed. You will need a PostgreSQL database with the `pgvector` extension enabled (Supabase is recommended).

### 2. Environment Setup
Copy `.env.example` to `.env` and fill in your credentials:
```env
GEMINI_API_KEY=your_key
SLACK_BOT_TOKEN=xoxb-...
DATABASE_URL=postgresql+asyncpg://...
```

### 3. Run the Demo
Experience the full pipeline (Ingestion -> Extraction -> Answering) with one command:
```bash
python backend/demo.py
```

### 4. Development Launch
**Backend**:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

---

## 🗺️ Roadmap (The YC Path)
- [ ] **V1 (Current)**: Slack-to-YAML extraction and RAG support.
- [ ] **V2**: Multi-channel synthesis and conflict detection between rules.
- [ ] **V3**: "Self-Healing" logic (Agent asks for clarification when a rule is ambiguous).
- [ ] **V4**: Native integrations with Jira, Notion, and Salesforce for action-taking.

---

## 🤝 Contributing
Built with ⚡ by the Company Brain team. Targeted for YC Summer 2026.

---
*Company Brain: Because your company's intelligence shouldn't have an expiration date.*
