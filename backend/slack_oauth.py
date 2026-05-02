import os
import asyncio
from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from slack_sdk.web.async_client import AsyncWebClient
from slack_sdk.errors import SlackApiError
from backend.db import AsyncSessionLocal
from backend.models import SlackWorkspace, SlackMessage, ChannelPermission
import uuid

router = APIRouter(prefix="/slack", tags=["Slack OAuth & Sync"])

SLACK_CLIENT_ID = os.getenv("SLACK_CLIENT_ID", "dummy_client_id")
SLACK_CLIENT_SECRET = os.getenv("SLACK_CLIENT_SECRET", "dummy_client_secret")
# Configure your redirect URI here if needed, or rely on Slack app configuration
SLACK_REDIRECT_URI = os.getenv("SLACK_REDIRECT_URI", "http://localhost:8000/slack/callback")

# These scopes exactly match the user's request
REQUIRED_SCOPES = [
    "channels:history", 
    "channels:read", 
    "groups:history", 
    "groups:read", 
    "im:history", 
    "users:read", 
    "team:info"
]

@router.get("/install")
async def slack_install():
    """Redirects to the Slack OAuth consent screen."""
    scope_str = ",".join(REQUIRED_SCOPES)
    url = f"https://slack.com/oauth/v2/authorize?client_id={SLACK_CLIENT_ID}&scope={scope_str}&redirect_uri={SLACK_REDIRECT_URI}"
    return RedirectResponse(url=url)

@router.get("/callback")
async def slack_callback(code: str):
    """Exchanges code for a bot token and stores workspace info."""
    client = AsyncWebClient()
    try:
        response = await client.oauth_v2_access(
            client_id=SLACK_CLIENT_ID,
            client_secret=SLACK_CLIENT_SECRET,
            code=code,
            redirect_uri=SLACK_REDIRECT_URI
        )
        
        if not response.get("ok"):
            raise HTTPException(status_code=400, detail=response.get("error", "Unknown OAuth error"))
            
        team_id = response["team"]["id"]
        team_name = response["team"]["name"]
        bot_token = response["access_token"]
        
        async with AsyncSessionLocal() as db:
            # Upsert workspace
            stmt = select(SlackWorkspace).where(SlackWorkspace.workspace_id == team_id)
            result = await db.execute(stmt)
            workspace = result.scalar_one_or_none()
            
            if workspace:
                workspace.bot_token = bot_token
                workspace.team_name = team_name
            else:
                workspace = SlackWorkspace(
                    workspace_id=team_id,
                    bot_token=bot_token,
                    team_name=team_name
                )
                db.add(workspace)
            await db.commit()
            
        return {"status": "success", "message": f"Successfully installed to {team_name}"}
        
    except SlackApiError as e:
        raise HTTPException(status_code=400, detail=f"Slack API Error: {e.response['error']}")


async def fetch_and_store_channel_history(client: AsyncWebClient, db, workspace_id: str, channel_id: str, is_private: bool):
    """Pulls last 30 days of messages for a channel with rate limiting."""
    oldest = (datetime.utcnow() - timedelta(days=30)).timestamp()
    cursor = None
    
    while True:
        try:
            # 1.1s sleep to handle Slack's 1 req/sec Tier 3 rate limit on conversations.history
            await asyncio.sleep(1.1)
            
            response = await client.conversations_history(
                channel=channel_id,
                oldest=str(oldest),
                cursor=cursor,
                limit=100
            )
            
            messages = response.get("messages", [])
            for m in messages:
                if "subtype" in m and m["subtype"] != "bot_message": 
                    # Optionally skip certain subtypes, but we store raw messages mostly
                    pass
                
                # Check if message already exists
                msg_id_val = f"{channel_id}-{m.get('ts')}"
                
                # Simple UPSERT or ignore if exists could be done. 
                # Doing check first for simplicity in SQLAlchemy ORM without raw SQL ON CONFLICT
                stmt = select(SlackMessage).where(SlackMessage.message_id == msg_id_val)
                result = await db.execute(stmt)
                existing = result.scalar_one_or_none()
                
                if not existing:
                    ts_val = m.get("ts")
                    dt_val = datetime.fromtimestamp(float(ts_val)) if ts_val else datetime.utcnow()
                    
                    new_msg = SlackMessage(
                        id=uuid.uuid4(),
                        message_id=msg_id_val,
                        workspace_id=workspace_id,
                        channel_id=channel_id,
                        user_id=m.get("user", "unknown"),
                        sender=m.get("user", "unknown"), # populate for backward compatibility
                        text=m.get("text", ""),
                        ts=ts_val,
                        timestamp=dt_val,
                        is_private=is_private,
                        is_logic_candidate=True if len(m.get("text", "")) > 10 else False
                    )
                    db.add(new_msg)
                    
            await db.commit()
            
            cursor = response.get("response_metadata", {}).get("next_cursor")
            if not cursor:
                break
                
        except SlackApiError as e:
            if e.response.get("error") == "ratelimited":
                delay = int(e.response.headers.get("Retry-After", 5))
                await asyncio.sleep(delay)
                continue
            else:
                print(f"Error fetching channel {channel_id}: {e}")
                break


async def check_channel_permission(db, workspace_id: str, channel: dict) -> bool:
    """Checks or creates a permission record for the channel. Returns True if capture is enabled."""
    channel_id = channel["id"]
    channel_name = channel.get("name", "unknown")
    is_private = channel.get("is_private", False) or channel.get("is_im", False)
    
    stmt = select(ChannelPermission).where(
        ChannelPermission.workspace_id == workspace_id,
        ChannelPermission.channel_id == channel_id
    )
    result = await db.execute(stmt)
    perm = result.scalar_one_or_none()
    
    if not perm:
        perm = ChannelPermission(
            id=uuid.uuid4(),
            workspace_id=workspace_id,
            channel_id=channel_id,
            channel_name=channel_name,
            is_private=is_private,
            capture_enabled=not is_private  # Public=True, Private=False
        )
        db.add(perm)
        await db.commit()
        
    return perm.capture_enabled


@router.post("/sync/{workspace_id}")
async def sync_workspace(workspace_id: str):
    """Pulls last 30 days of messages from all accessible channels."""
    async with AsyncSessionLocal() as db:
        stmt = select(SlackWorkspace).where(SlackWorkspace.workspace_id == workspace_id)
        result = await db.execute(stmt)
        workspace = result.scalar_one_or_none()
        
        if not workspace:
            raise HTTPException(status_code=404, detail="Workspace not found or not installed")
            
        client = AsyncWebClient(token=workspace.bot_token)
        
        try:
            # 1. Get all accessible channels (public + private + im)
            types = "public_channel,private_channel,im"
            response = await client.conversations_list(types=types, exclude_archived=True, limit=1000)
            channels = response.get("channels", [])
            
            # Filter to channels the bot is actually in
            # For public/private, conversations_list returns what we have access to
            for ch in channels:
                channel_id = ch["id"]
                is_private = ch.get("is_private", False) or ch.get("is_im", False)
                if ch.get("is_member", True): # Try to fetch if member
                    capture_allowed = await check_channel_permission(db, workspace_id, ch)
                    if not capture_allowed:
                        print(f"Skipping {ch.get('name', channel_id)} — capture disabled")
                        continue
                        
                    await fetch_and_store_channel_history(client, db, workspace_id, channel_id, is_private)
                    
            return {"status": "success", "message": f"Synced {len(channels)} channels."}
            
        except SlackApiError as e:
            raise HTTPException(status_code=400, detail=f"Slack API Error: {e.response['error']}")

async def run_scheduled_sync():
    """Background job that syncs all workspaces."""
    print(f"[{datetime.utcnow()}] Running scheduled Slack sync...")
    async with AsyncSessionLocal() as db:
        stmt = select(SlackWorkspace)
        result = await db.execute(stmt)
        workspaces = result.scalars().all()
        
        for ws in workspaces:
            print(f"Syncing workspace {ws.team_name} ({ws.workspace_id})...")
            client = AsyncWebClient(token=ws.bot_token)
            try:
                response = await client.conversations_list(types="public_channel,private_channel,im", exclude_archived=True)
                channels = response.get("channels", [])
                for ch in channels:
                    if ch.get("is_member", True):
                        capture_allowed = await check_channel_permission(db, ws.workspace_id, ch)
                        if not capture_allowed:
                            print(f"Skipping {ch.get('name', ch['id'])} — capture disabled")
                            continue
                            
                        await fetch_and_store_channel_history(
                            client, db, ws.workspace_id, ch["id"], 
                            ch.get("is_private", False) or ch.get("is_im", False)
                        )
            except Exception as e:
                print(f"Failed to sync workspace {ws.workspace_id}: {e}")
    print(f"[{datetime.utcnow()}] Scheduled Slack sync complete.")
