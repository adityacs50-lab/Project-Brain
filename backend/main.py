import os
from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from backend.ingestor import router as slack_router
from backend.extractor import run_extraction_pipeline
from backend.executor import answer_query
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

@app.on_event("startup")
async def startup_event():
    print("Company Brain backend running")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
