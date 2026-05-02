import uuid
from sqlalchemy import Column, String, Text, DateTime, Boolean, ARRAY, ForeignKey, Float, Integer
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from backend.db import Base

class SlackWorkspace(Base):
    __tablename__ = "slack_workspaces"
    
    workspace_id = Column(String, primary_key=True)
    bot_token = Column(String)
    team_name = Column(String)
    installed_at = Column(DateTime, default=datetime.utcnow)

class SlackMessage(Base):
    __tablename__ = "slack_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(String, unique=True, index=True)
    workspace_id = Column(String, ForeignKey("slack_workspaces.workspace_id"), index=True)
    channel_id = Column(String, index=True)
    user_id = Column(String)
    sender = Column(String) # kept for backwards compatibility with existing tests
    text = Column(Text)
    ts = Column(String)
    timestamp = Column(DateTime)
    is_private = Column(Boolean, default=False)
    is_logic_candidate = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    version = Column(String)
    yaml_content = Column(Text)
    trigger_keywords = Column(ARRAY(String))
    source_message_ids = Column(ARRAY(UUID(as_uuid=True)))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AgentConversation(Base):
    __tablename__ = "agent_conversations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_query = Column(Text)
    matched_skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=True)
    response = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class ChannelPermission(Base):
    __tablename__ = "channel_permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, ForeignKey("slack_workspaces.workspace_id"), index=True)
    channel_id = Column(String, index=True)
    channel_name = Column(String)
    is_private = Column(Boolean)
    capture_enabled = Column(Boolean, default=False)
    enabled_by_user_id = Column(String, nullable=True)
    enabled_at = Column(DateTime, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, index=True)
    channel_id = Column(String, index=True)
    action = Column(String) # "enabled" | "disabled"
    performed_by_user_id = Column(String)
    performed_at = Column(DateTime, default=datetime.utcnow)

class Rule(Base):
    __tablename__ = "rules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, ForeignKey("slack_workspaces.workspace_id"), index=True)
    title = Column(String)
    rule_text = Column(Text)
    status = Column(String) # "pending" | "active" | "archived"
    confidence = Column(Float)
    source_message = Column(Text)
    channel_id = Column(String)
    version = Column(Integer, default=1)
    parent_rule_id = Column(UUID(as_uuid=True), ForeignKey("rules.id"), nullable=True)
    embedding = Column(Vector(384))
    created_at = Column(DateTime, default=datetime.utcnow)

class Contradiction(Base):
    __tablename__ = "contradictions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, index=True)
    rule_a_id = Column(UUID(as_uuid=True), ForeignKey("rules.id"))
    rule_b_id = Column(UUID(as_uuid=True), ForeignKey("rules.id"))
    similarity_score = Column(Float)
    detected_at = Column(DateTime, default=datetime.utcnow)
    resolution = Column(String) # "latest_wins" | "manual"

class QueryLog(Base):
    __tablename__ = "query_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, index=True)
    user_id = Column(String)
    query_text = Column(Text)
    matched_rule_id = Column(UUID(as_uuid=True), ForeignKey("rules.id"), nullable=True)
    similarity_score = Column(Float, nullable=True)
    was_flagged = Column(Boolean, default=False)
    asked_at = Column(DateTime, default=datetime.utcnow)

class AgentDecisionLog(Base):
    __tablename__ = "agent_decision_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, index=True)
    agent_id = Column(String)
    action = Column(String)
    context = Column(Text)  # JSON stored as text
    matched_rule_id = Column(UUID(as_uuid=True), ForeignKey("rules.id"), nullable=True)
    rule_text = Column(Text, nullable=True)
    decision = Column(String)  # "permitted" | "denied" | "escalate" | "no_rule_found"
    escalate_to = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    agent_feedback = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
