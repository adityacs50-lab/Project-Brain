# 🧠 Company Brain: Turning Slack Noise into Executable Knowledge

Company Brain is an AI-powered system designed to capture, structure, and query internal company knowledge hidden within Slack conversations. It uses a "Human-in-the-Loop" workflow to ensure that the knowledge captured is accurate and verifiable.

## 🚀 Key Features

*   **AI Knowledge Extraction**: Automatically scans Slack messages to identify policies, business rules, and operational procedures.
*   **Semantic Search with pgvector**: Uses state-of-the-art vector embeddings to search for knowledge based on meaning, not just keywords.
*   **Version Control & Contradiction Detection**: Automatically detects when new information contradicts existing rules and maintains a full version history of all company knowledge.
*   **Human Review Queue**: A dedicated Next.js dashboard where admins can review, edit, and approve AI-extracted knowledge before it goes live.
*   **Slack RAG Bot**: Employees can ask questions directly in Slack. The bot responds with grounded answers, source citations, and a feedback mechanism for continuous improvement.

## 🛠️ Technology Stack

*   **Backend**: FastAPI (Python), SQLAlchemy, pgvector, Sentence Transformers.
*   **Frontend**: Next.js 14, Tailwind CSS, shadcn/ui.
*   **Database**: PostgreSQL (Supabase recommended).
*   **Integration**: Slack Bolt SDK.

## 🏁 Getting Started

### 1. Prerequisites
*   Python 3.10+
*   Node.js 18+
*   PostgreSQL with `pgvector` extension (e.g., Supabase)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the root directory (see `.env.example`).
4. Start the server:
   ```bash
   uvicorn backend.main:app --reload
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd next-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🧠 How It Works

1.  **Ingest**: Slack messages are synced to the database.
2.  **Extract**: The system identifies logic candidates and extracts them into "Rules".
3.  **Review**: Rules appear in the **Human Review Queue** for validation.
4.  **Query**: Once approved, rules are indexed in the vector database and accessible via the Slack Bot.
5.  **Feedback**: Users can flag inaccurate responses, pushing the rule back to the review queue automatically.

---

Built with ❤️ to solve the "where did we talk about that?" problem.
