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
from backend.bot import handler as slack_bot_handler
from backend.db import engine, Base
from sqlalchemy import text
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Company Brain API", version="0.1.0")

class AskRequest(BaseModel):
    query: str

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(slack_router)
app.include_router(slack_oauth_router)
app.include_router(permissions_router)
app.include_router(versioning_router)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}

@app.post("/extract")
async def extract_logic():
    result = await run_extraction_pipeline()
    return result

@app.post("/ask")
async def ask_agent(request: AskRequest):
    result = await answer_query(request.query)
    return result

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
    # Run every 6 hours
    scheduler.add_job(run_scheduled_sync, 'interval', hours=6)
    scheduler.start()
    print("APScheduler started: Slack sync job scheduled every 6 hours.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
