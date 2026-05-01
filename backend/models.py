import uuid
from sqlalchemy import Column, String, Text, DateTime, Boolean, ARRAY, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from backend.db import Base

class SlackMessage(Base):
    __tablename__ = "slack_messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_id = Column(String, index=True)
    sender = Column(String)
    text = Column(Text)
    timestamp = Column(DateTime)
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
