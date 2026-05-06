import os
from fastapi import FastAPI, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.ingestor import router as slack_router
from backend.extractor import run_extraction_pipeline
from backend.executor import answer_query
from backend.slack_oauth import router as slack_oauth_router, run_scheduled_sync
from backend.permissions import router as permissions_router
from backend.versioning import router as versioning_router
from backend.agent_api import router as agent_api_router
from backend.versioning import get_model
from backend.bot import handler as slack_bot_handler
from backend.db import engine, Base
from sqlalchemy import text
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Company Brain API", version="0.1.0")

class AskRequest(BaseModel):
    query: str
    workspace_id: str

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173", 
        "https://project-brain-eight.vercel.app",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(slack_router)
app.include_router(slack_oauth_router)
app.include_router(permissions_router)
app.include_router(versioning_router)
app.include_router(agent_api_router)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/extract")
async def extract_logic():
    result = await run_extraction_pipeline()
    return result

@app.post("/ask")
async def ask_agent(request: AskRequest):
    from backend.executor import answer_query
    
    result = await answer_query(request.query, request.workspace_id)
    return result

@app.get("/graph")
async def get_logic_graph():
    """🛡️ THIEL PROTOCOL RULE 4: GRAPH EXPORT.
    Returns nodes (rules) and edges (dependencies) for visual mapping.
    """
    from backend.models import Rule, RuleDependency
    from sqlalchemy import select
    from backend.db import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        # Get all rules
        rules_stmt = select(Rule)
        rules_result = await db.execute(rules_stmt)
        rules = rules_result.scalars().all()
        
        # Get all dependencies
        deps_stmt = select(RuleDependency)
        deps_result = await db.execute(deps_stmt)
        deps = deps_result.scalars().all()
        
        nodes = []
        for r in rules:
            nodes.append({
                "id": str(r.id),
                "label": r.title,
                "status": r.status,
                "type": r.action_type
            })
            
        edges = []
        for d in deps:
            edges.append({
                "from": str(d.rule_id),
                "to": str(d.depends_on_id),
                "type": d.dependency_type
            })
            
        return {"nodes": nodes, "edges": edges}

@app.post("/slack/events")
async def slack_events(req: Request):
    return await slack_bot_handler.handle(req)

@app.on_event("startup")
async def startup_event():
    print("Company Brain backend running")
    
    # Initialize the database tables
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)
        print("Database tables created/verified.")
    
    # Setup background scheduler for syncing slack
    scheduler = AsyncIOScheduler()
    # Sync messages every 6 hours
    scheduler.add_job(run_scheduled_sync, 'interval', hours=6)
    # 🛡️ THIEL PROTOCOL RULE 2: AUTOMATED EXTRACTION
    # Run the extraction pipeline every hour to turn raw data into logic automatically.
    scheduler.add_job(run_extraction_pipeline, 'interval', hours=1)
    scheduler.start()
    print("APScheduler started: Slack sync (6h) and Extraction pipeline (1h) scheduled.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
