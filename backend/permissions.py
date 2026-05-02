import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy import select, desc
from backend.db import AsyncSessionLocal
from backend.models import ChannelPermission, AuditLog

router = APIRouter(prefix="/permissions", tags=["Permissions"])

class PermissionToggleRequest(BaseModel):
    admin_user_id: str
    capture_enabled: bool

@router.get("/{workspace_id}/channels")
async def get_channels(workspace_id: str):
    """Returns all channels with capture_enabled status, sorted private first."""
    async with AsyncSessionLocal() as db:
        stmt = (
            select(ChannelPermission)
            .where(ChannelPermission.workspace_id == workspace_id)
            .order_by(desc(ChannelPermission.is_private), ChannelPermission.channel_name)
        )
        result = await db.execute(stmt)
        channels = result.scalars().all()
        
        return {
            "workspace_id": workspace_id,
            "channels": [
                {
                    "channel_id": c.channel_id,
                    "channel_name": c.channel_name,
                    "is_private": c.is_private,
                    "capture_enabled": c.capture_enabled,
                    "enabled_by_user_id": c.enabled_by_user_id,
                    "enabled_at": c.enabled_at
                }
                for c in channels
            ]
        }

@router.patch("/{workspace_id}/channels/{channel_id}")
async def toggle_channel_permission(workspace_id: str, channel_id: str, request: PermissionToggleRequest):
    """Toggles capture_enabled for a specific channel, requires admin_user_id, logs to AuditLog."""
    async with AsyncSessionLocal() as db:
        stmt = select(ChannelPermission).where(
            ChannelPermission.workspace_id == workspace_id,
            ChannelPermission.channel_id == channel_id
        )
        result = await db.execute(stmt)
        channel = result.scalar_one_or_none()
        
        if not channel:
            raise HTTPException(status_code=404, detail="Channel permission record not found")
            
        # Update the permission
        channel.capture_enabled = request.capture_enabled
        if request.capture_enabled:
            channel.enabled_by_user_id = request.admin_user_id
            channel.enabled_at = datetime.utcnow()
        else:
            channel.enabled_by_user_id = None
            channel.enabled_at = None
            
        # Write to AuditLog
        action_str = "enabled" if request.capture_enabled else "disabled"
        audit = AuditLog(
            id=uuid.uuid4(),
            workspace_id=workspace_id,
            channel_id=channel_id,
            action=action_str,
            performed_by_user_id=request.admin_user_id,
            performed_at=datetime.utcnow()
        )
        db.add(audit)
        await db.commit()
        
        return {
            "status": "success",
            "channel_id": channel_id,
            "capture_enabled": channel.capture_enabled
        }

@router.get("/{workspace_id}/audit-log")
async def get_audit_log(workspace_id: str):
    """Returns full audit history ordered by performed_at DESC."""
    async with AsyncSessionLocal() as db:
        stmt = (
            select(AuditLog)
            .where(AuditLog.workspace_id == workspace_id)
            .order_by(desc(AuditLog.performed_at))
        )
        result = await db.execute(stmt)
        logs = result.scalars().all()
        
        return {
            "workspace_id": workspace_id,
            "audit_logs": [
                {
                    "log_id": str(log.id),
                    "channel_id": log.channel_id,
                    "action": log.action,
                    "performed_by_user_id": log.performed_by_user_id,
                    "performed_at": log.performed_at
                }
                for log in logs
            ]
        }
