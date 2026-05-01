import os
import hmac
import hashlib
import time
import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Request, HTTPException, BackgroundTasks, Depends
from slack_sdk.web.async_client import AsyncWebClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from backend.db import get_db, AsyncSessionLocal
from backend.models import SlackMessage
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(tags=["slack"])

# Mode A: Slack Client for Historical Pull
slack_client = AsyncWebClient(token=os.getenv("SLACK_BOT_TOKEN"))
SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET")

async def score_logic_relevance(message_text: str) -> float:
    """Simple keyword scoring to filter signal from noise."""
    logic_keywords = [
        "from now on", "new policy", "going forward", "rule is", 
        "must be approved", "requires approval", "process is", 
        "procedure is", "always", "never", "all requests"
    ]
    noise_keywords = ["please", "reminder", "fyi", "heads up"]
    
    text_lower = message_text.lower()
    
    for kw in logic_keywords:
        if kw in text_lower:
            return 1.0
            
    for kw in noise_keywords:
        if kw in text_lower:
            return 0.5
            
    return 0.0

async def save_slack_message(db: AsyncSession, channel_id: str, sender: str, text: str, timestamp: datetime):
    """Utility to save a message and update its logic candidate flag."""
    new_msg = SlackMessage(
        channel_id=channel_id,
        sender=sender,
        text=text,
        timestamp=timestamp,
        is_logic_candidate=False
    )
    db.add(new_msg)
    await db.flush() # Get the ID if needed
    
    score = await score_logic_relevance(text)
    if score >= 0.5:
        new_msg.is_logic_candidate = True
        
    await db.commit()
    return new_msg

async def pull_channel_history(channel_id: str, limit: int = 200) -> List[SlackMessage]:
    """MODE A: Historical Pull."""
    print(f"Starting historical pull for {channel_id}...")
    try:
        response = await slack_client.conversations_history(channel=channel_id, limit=limit)
        messages = response.get("messages", [])
        
        saved_messages = []
        async with AsyncSessionLocal() as db:
            for msg in messages:
                # Skip bot messages and empty text
                if msg.get("subtype") == "bot_message" or not msg.get("text"):
                    continue
                
                ts = float(msg.get("ts", time.time()))
                dt = datetime.fromtimestamp(ts)
                
                saved_msg = await save_slack_message(
                    db, 
                    channel_id=channel_id, 
                    sender=msg.get("user", "unknown"), 
                    text=msg.get("text"), 
                    timestamp=dt
                )
                saved_messages.append(saved_msg)
        
        print(f"Ingested {len(saved_messages)} messages from {channel_id}")
        return saved_messages
    except Exception as e:
        print(f"Error pulling history: {e}")
        return []

# Mode B: Webhook Listener
def verify_slack_signature(timestamp: str, signature: str, body: bytes):
    """Verifies the signature of the request from Slack."""
    if not SLACK_SIGNING_SECRET:
        return False
    
    # Check if the request is too old
    if abs(time.time() - int(timestamp)) > 60 * 5:
        return False
        
    sig_basestring = f"v0:{timestamp}:{body.decode('utf-8')}"
    my_signature = "v0=" + hmac.new(
        SLACK_SIGNING_SECRET.encode("utf-8"),
        sig_basestring.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(my_signature, signature)

@router.post("/slack/events")
async def slack_events(request: Request, background_tasks: BackgroundTasks):
    body_bytes = await request.body()
    headers = request.headers
    
    timestamp = headers.get("X-Slack-Request-Timestamp")
    signature = headers.get("X-Slack-Signature")
    
    if not timestamp or not signature or not verify_slack_signature(timestamp, signature, body_bytes):
        raise HTTPException(status_code=400, detail="Invalid request signature")
        
    data = json.loads(body_bytes)
    
    # URL Verification challenge
    if data.get("type") == "url_verification":
        return {"challenge": data.get("challenge")}
        
    # Handle message events
    if data.get("type") == "event_callback":
        event = data.get("event", {})
        if event.get("type") == "message" and not event.get("subtype") and event.get("text"):
            # Background task to save message to keep response < 3s
            background_tasks.add_task(
                process_live_message,
                channel_id=event.get("channel"),
                sender=event.get("user"),
                text=event.get("text"),
                ts=event.get("ts")
            )
            
    return {"status": "ok"}

async def process_live_message(channel_id: str, sender: str, text: str, ts: str):
    async with AsyncSessionLocal() as db:
        dt = datetime.fromtimestamp(float(ts))
        await save_slack_message(db, channel_id, sender, text, dt)
