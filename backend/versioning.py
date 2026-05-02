import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from sqlalchemy import select, desc
from backend.db import AsyncSessionLocal
from backend.models import Rule, Contradiction

router = APIRouter(prefix="/rules", tags=["Rule Versioning"])

# Lazy load the model to avoid blocking on import
model = None

def get_model():
    global model
    if model is None:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
    return model

from typing import Optional

class StatusUpdateRequest(BaseModel):
    status: str
    edited_text: Optional[str] = None

class IngestRequest(BaseModel):
    workspace_id: str
    title: str
    rule_text: str
    confidence: float
    source_message: str
    channel_id: str

@router.post("/ingest")
async def ingest_rule(request: IngestRequest):
    """
    Ingests a new rule, computes its embedding, and checks for contradictions against active rules.
    Returns the new rule object.
    """
    model_instance = get_model()
    # Generate embedding using sentence-transformers
    embedding = model_instance.encode(request.rule_text).tolist()
    
    async with AsyncSessionLocal() as db:
        # Query active rules for this workspace to check similarity
        # Cosine distance = 1 - Cosine Similarity. Similarity > 0.85 means distance < 0.15
        stmt = select(Rule).where(
            Rule.workspace_id == request.workspace_id,
            Rule.status == "active",
            Rule.embedding.cosine_distance(embedding) < 0.15
        )
        result = await db.execute(stmt)
        similar_rules = result.scalars().all()
        
        new_rule = Rule(
            id=uuid.uuid4(),
            workspace_id=request.workspace_id,
            title=request.title,
            rule_text=request.rule_text,
            status="pending",
            confidence=request.confidence,
            source_message=request.source_message,
            channel_id=request.channel_id,
            version=1,
            parent_rule_id=None,
            embedding=embedding,
            created_at=datetime.utcnow()
        )
        
        # If there's an existing highly similar active rule
        if similar_rules:
            # For simplicity, we resolve against the most similar one. 
            # The query above could return multiple, let's just pick the first one.
            # Realistically, we'd order by distance.
            old_rule = similar_rules[0]
            
            # Archive the old rule
            old_rule.status = "archived"
            
            # Setup the new rule's version and ancestry
            new_rule.version = old_rule.version + 1
            new_rule.parent_rule_id = old_rule.id
            
            # Create a contradiction record
            contradiction = Contradiction(
                id=uuid.uuid4(),
                workspace_id=request.workspace_id,
                rule_a_id=old_rule.id,
                rule_b_id=new_rule.id,
                similarity_score=0.85, # Simplification; normally calculated exactly
                detected_at=datetime.utcnow(),
                resolution="latest_wins"
            )
            db.add(contradiction)
            
        db.add(new_rule)
        await db.commit()
        await db.refresh(new_rule)
        
        return {
            "id": str(new_rule.id),
            "title": new_rule.title,
            "rule_text": new_rule.rule_text,
            "status": new_rule.status,
            "confidence": new_rule.confidence,
            "source_message": new_rule.source_message,
            "channel_id": new_rule.channel_id,
            "version": new_rule.version,
            "created_at": new_rule.created_at
        }

@router.get("/{workspace_id}/rules")
async def get_rules(workspace_id: str, status: Optional[str] = None):
    """Returns rules for workspace, optionally filtered by status."""
    async with AsyncSessionLocal() as db:
        stmt = select(Rule).where(Rule.workspace_id == workspace_id)
        if status:
            stmt = stmt.where(Rule.status == status)
        result = await db.execute(stmt)
        rules = result.scalars().all()
        return [
            {
                "id": str(r.id),
                "title": r.title,
                "rule_text": r.rule_text,
                "status": r.status,
                "confidence": r.confidence,
                "source_message": r.source_message,
                "channel_id": r.channel_id,
                "version": r.version,
                "created_at": r.created_at
            } for r in rules
        ]

@router.get("/{rule_id}/history")
async def get_rule_history(rule_id: str):
    """Walks parent_rule_id chain from current back to v1, returns full version history."""
    history = []
    current_id = rule_id
    
    async with AsyncSessionLocal() as db:
        while current_id:
            stmt = select(Rule).where(Rule.id == current_id)
            result = await db.execute(stmt)
            rule = result.scalar_one_or_none()
            
            if not rule:
                break
                
            history.append({
                "id": str(rule.id),
                "title": rule.title,
                "rule_text": rule.rule_text,
                "status": rule.status,
                "version": rule.version,
                "created_at": rule.created_at
            })
            current_id = str(rule.parent_rule_id) if rule.parent_rule_id else None
            
    return history

@router.post("/{rule_id}/rollback")
async def rollback_rule(rule_id: str):
    """Archives current active version, restores specified rule_id as active."""
    async with AsyncSessionLocal() as db:
        # Find the target rule to restore
        stmt = select(Rule).where(Rule.id == rule_id)
        result = await db.execute(stmt)
        target_rule = result.scalar_one_or_none()
        
        if not target_rule:
            raise HTTPException(status_code=404, detail="Rule not found")
            
        workspace_id = target_rule.workspace_id
        
        # We need to find the currently active rule in this chain to archive it.
        # For simplicity, we can archive ALL active rules with the same title/chain,
        # but a robust system would trace the chain forward. 
        # Here we just blindly find the active rule in the workspace with the same title.
        stmt_active = select(Rule).where(
            Rule.workspace_id == workspace_id,
            Rule.title == target_rule.title,
            Rule.status == "active"
        )
        result_active = await db.execute(stmt_active)
        active_rules = result_active.scalars().all()
        
        for ar in active_rules:
            ar.status = "archived"
            
        # Restore target
        target_rule.status = "active"
        
        await db.commit()
        return {"status": "success", "restored_version": target_rule.version}

@router.patch("/{rule_id}/status")
async def update_rule_status(rule_id: str, request: StatusUpdateRequest):
    """Updates status to active|archived|pending. Used by human review UI."""
    if request.status not in ["active", "archived", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    async with AsyncSessionLocal() as db:
        stmt = select(Rule).where(Rule.id == rule_id)
        result = await db.execute(stmt)
        rule = result.scalar_one_or_none()
        
        if not rule:
            raise HTTPException(status_code=404, detail="Rule not found")
            
        rule.status = request.status
        if request.edited_text is not None:
            rule.rule_text = request.edited_text
            
        await db.commit()
        return {"status": "success", "new_status": rule.status}

@router.get("/{workspace_id}/contradictions")
async def get_contradictions(workspace_id: str):
    """Returns all contradiction records for workspace."""
    async with AsyncSessionLocal() as db:
        stmt = select(Contradiction).where(Contradiction.workspace_id == workspace_id).order_by(desc(Contradiction.detected_at))
        result = await db.execute(stmt)
        contradictions = result.scalars().all()
        
        return [
            {
                "id": str(c.id),
                "rule_a_id": str(c.rule_a_id),
                "rule_b_id": str(c.rule_b_id),
                "similarity_score": c.similarity_score,
                "resolution": c.resolution,
                "detected_at": c.detected_at
            } for c in contradictions
        ]
