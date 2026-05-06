import os
import uuid
from datetime import datetime
from slack_bolt.async_app import AsyncApp
from slack_bolt.adapter.fastapi.async_handler import AsyncSlackRequestHandler
from sqlalchemy import select, asc
from backend.db import AsyncSessionLocal
from backend.models import Rule, QueryLog
from backend.versioning import get_model

SLACK_BOT_TOKEN = os.getenv("SLACK_BOT_TOKEN", "")
SLACK_SIGNING_SECRET = os.getenv("SLACK_SIGNING_SECRET", "")

app = AsyncApp(token=SLACK_BOT_TOKEN, signing_secret=SLACK_SIGNING_SECRET)
handler = AsyncSlackRequestHandler(app)

async def handle_query(query_text: str, workspace_id: str, say, user_id: str):
    model = get_model()
    # Generate embedding for the query
    embedding = model.encode(query_text).tolist()
    
    async with AsyncSessionLocal() as db:
        # Distance = 1 - Similarity. So Similarity >= 0.60 means Distance <= 0.40
        # We query the nearest rule. 
        # Using exact distance sort might be needed if multiple rules match
        stmt = select(Rule, Rule.embedding.cosine_distance(embedding).label('distance')) \
            .where(Rule.workspace_id == workspace_id, Rule.status == "active") \
            .order_by(asc('distance')) \
            .limit(1)
            
        result = await db.execute(stmt)
        row = result.first()
        
        matched_rule = None
        similarity = 0.0
        
        if row:
            rule_obj, distance = row
            similarity = 1.0 - distance
            if similarity >= 0.60:
                matched_rule = rule_obj
                
        # Prepare response
        if matched_rule:
            conf_pct = int(matched_rule.confidence * 100)
            if matched_rule.confidence >= 0.85:
                emoji = "🟢"
            elif matched_rule.confidence >= 0.60:
                emoji = "🟡"
            else:
                emoji = "🔴"
                
            # Log the query BEFORE responding to get the log ID for the flag action
            log_id = uuid.uuid4()
            query_log = QueryLog(
                id=log_id,
                workspace_id=workspace_id,
                user_id=user_id,
                query_text=query_text,
                matched_rule_id=matched_rule.id,
                similarity_score=similarity,
                was_flagged=False,
                asked_at=datetime.utcnow()
            )
            db.add(query_log)
            await db.commit()
            
            blocks = [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": f"*{matched_rule.title}*\n{matched_rule.rule_text}"
                    }
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": f"📎 Source: #{matched_rule.channel_id} — _{matched_rule.source_message}_"
                        }
                    ]
                },
                {
                    "type": "context",
                    "elements": [
                        {
                            "type": "mrkdwn",
                            "text": f"{emoji} Confidence: {conf_pct}%"
                        }
                    ]
                },
                {
                    "type": "actions",
                    "elements": [
                        {
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": "🚩 Flag this answer"
                            },
                            "action_id": "flag_rule",
                            # Pass both rule ID and log ID in the value
                            "value": f"{matched_rule.id}:{log_id}"
                        }
                    ]
                }
            ]
            await say(blocks=blocks, text="Found a rule!")
        else:
            # Log the query even if no match
            query_log = QueryLog(
                id=uuid.uuid4(),
                workspace_id=workspace_id,
                user_id=user_id,
                query_text=query_text,
                matched_rule_id=None,
                similarity_score=similarity if row else None,
                was_flagged=False,
                asked_at=datetime.utcnow()
            )
            db.add(query_log)
            await db.commit()
            
            await say("I don't have a rule for this yet — want me to flag it for your Ops team? 🤔")

@app.event("app_mention")
async def handle_app_mention_events(body, say):
    event = body.get("event", {})
    query_text = event.get("text", "")
    # Remove the bot mention <@U123456> from the text
    if ">" in query_text:
        query_text = query_text.split(">", 1)[1].strip()
        
    workspace_id = body.get("team_id", "")
    user_id = event.get("user", "")
    
    await handle_query(query_text, workspace_id, say, user_id)

@app.event("message")
async def handle_message_events(body, say, logger):
    """Saves all messages as logic candidates and handles DM queries."""
    event = body.get("event", {})
    if event.get("bot_id") or event.get("subtype") == "bot_message":
        return
        
    text = event.get("text", "")
    workspace_id = body.get("team_id", "")
    user_id = event.get("user", "")
    channel_id = event.get("channel")
    ts = event.get("ts")
    
    # 1. Save all messages to DB for logic extraction
    from backend.ingestor import save_slack_message
    from backend.db import AsyncSessionLocal
    try:
        async with AsyncSessionLocal() as db:
            dt = datetime.fromtimestamp(float(ts))
            await save_slack_message(db, workspace_id, channel_id, user_id, text, dt)
    except Exception as e:
        logger.error(f"Error saving live message: {e}")

    # 2. Handle queries if it's a DM (IM)
    if event.get("channel_type") == "im":
        await handle_query(text, workspace_id, say, user_id)

@app.action("flag_rule")
async def handle_flag_rule(ack, body, respond):
    await ack()
    action = body["actions"][0]
    value = action.get("value")
    
    if not value or ":" not in value:
        await respond("Error: invalid flag payload.")
        return
        
    rule_id, log_id = value.split(":")
    
    async with AsyncSessionLocal() as db:
        # Update Rule status to pending
        stmt = select(Rule).where(Rule.id == rule_id)
        result = await db.execute(stmt)
        rule = result.scalar_one_or_none()
        if rule:
            rule.status = "pending"
            
        # Update QueryLog was_flagged = True
        stmt_log = select(QueryLog).where(QueryLog.id == log_id)
        result_log = await db.execute(stmt_log)
        qlog = result_log.scalar_one_or_none()
        if qlog:
            qlog.was_flagged = True
            
        await db.commit()
        
    # Replace the original message with an acknowledgment
    await respond(
        text="Got it — flagged for your Ops team to review ✅",
        replace_original=True
    )
