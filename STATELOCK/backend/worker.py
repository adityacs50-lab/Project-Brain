import os
import asyncio
from arq import cron
from backend.slack_oauth import run_scheduled_sync
from backend.extractor import run_extraction_pipeline

async def sync_slack_task(ctx):
    """ARQ Task to synchronize Slack messages for the workspace."""
    print("ARQ Task: Starting Slack synchronization...")
    try:
        await run_scheduled_sync()
        print("ARQ Task: Slack synchronization completed successfully.")
    except Exception as e:
        print(f"ARQ Task: Slack synchronization failed: {e}")

async def run_extraction_task(ctx):
    """ARQ Task to run the rule extraction pipeline and compile logic."""
    print("ARQ Task: Starting rule extraction pipeline...")
    try:
        await run_extraction_pipeline()
        print("ARQ Task: Rule extraction pipeline completed successfully.")
    except Exception as e:
        print(f"ARQ Task: Rule extraction pipeline failed: {e}")

async def startup(ctx):
    print("StateLock ARQ Background Worker starting up...")
    print("Configured Redis URL:", os.getenv("REDIS_URL", "redis://localhost:6379"))

async def shutdown(ctx):
    print("StateLock ARQ Background Worker shutting down...")

class WorkerSettings:
    """
    ARQ Worker Settings Configuration.
    To run this worker, execute the command:
        arq backend.worker.WorkerSettings
    """
    functions = [sync_slack_task, run_extraction_task]
    
    cron_jobs = [
        # Synchronize Slack messages every 6 hours
        cron(sync_slack_task, hour={0, 6, 12, 18}, minute=0, run_at_startup=False),
        # Run the logic extraction pipeline every hour
        cron(run_extraction_task, minute=0, run_at_startup=False)
    ]
    
    # Read redis configuration, defaulting to local redis
    redis_settings = os.getenv("REDIS_URL", "redis://localhost:6379")
    on_startup = startup
    on_shutdown = shutdown
