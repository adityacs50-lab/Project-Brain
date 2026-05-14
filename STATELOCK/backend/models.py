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
    api_key = Column(String, unique=True, index=True, nullable=True)
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
    action_type = Column(String) # "permitted" | "denied" | "escalate"
    embedding = Column(Vector(384))
    
    threshold_value = Column(Float, nullable=True)
    threshold_currency = Column(String, nullable=True)
    operator = Column(String, nullable=True)
    
    # 🛡️ THIEL PROTOCOL RULE 5: EXECUTIVE SEAL
    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

class RuleDependency(Base):
    """🛡️ THIEL PROTOCOL RULE 4: THE LOGIC GRAPH.
    Creates many-to-many links between rules to build a proprietary knowledge moat.
    """
    __tablename__ = "rule_dependencies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    rule_id = Column(UUID(as_uuid=True), ForeignKey("rules.id"))
    depends_on_id = Column(UUID(as_uuid=True), ForeignKey("rules.id"))
    dependency_type = Column(String, default="requires") # "requires" | "conflicts" | "refines"
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkspaceNiche(Base):
    """🛡️ THIEL PROTOCOL RULE 2: THE MONOPOLY NICHE.
    Stores industry-specific 'Secrets' to give the AI an edge in vertical progress.
    """
    __tablename__ = "workspace_niches"
    
    workspace_id = Column(String, ForeignKey("slack_workspaces.workspace_id"), primary_key=True)
    industry = Column(String) # "fintech" | "healthtech" | "saas" | "legal"
    special_logic_notes = Column(Text) # The "Secrets" of this specific niche
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

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

class Waitlist(Base):
    __tablename__ = "waitlist"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    company = Column(String)
    agents_count = Column(Integer)
    notes = Column(Text, nullable=True)
    source = Column(String, default="landing-page")
    created_at = Column(DateTime, default=datetime.utcnow)

class WorkflowRun(Base):
    __tablename__ = "workflow_runs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, ForeignKey("slack_workspaces.workspace_id"), index=True)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=True)
    title = Column(String)
    status = Column(String, default="running") # "running" | "completed" | "failed" | "paused"
    context = Column(Text) # JSON state
    current_step_index = Column(Integer, default=0)
    value_generated = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class WorkflowStepLog(Base):
    __tablename__ = "workflow_step_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workflow_run_id = Column(UUID(as_uuid=True), ForeignKey("workflow_runs.id"), index=True)
    step_name = Column(String)
    status = Column(String) # "success" | "failure"
    input_data = Column(Text) # JSON
    output_data = Column(Text) # JSON
    error_message = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=datetime.utcnow)

class BillingEvent(Base):
    __tablename__ = "billing_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, ForeignKey("slack_workspaces.workspace_id"), index=True)
    workflow_run_id = Column(UUID(as_uuid=True), ForeignKey("workflow_runs.id"), nullable=True)
    event_type = Column(String) # "workflow_completion" | "rule_enforcement"
    value_amount = Column(Float) # The $ value saved/generated
    currency = Column(String, default="USD")
    metadata_json = Column(Text) # Additional details
    created_at = Column(DateTime, default=datetime.utcnow)

class ExternalTool(Base):
    __tablename__ = "external_tools"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, ForeignKey("slack_workspaces.workspace_id"), index=True)
    name = Column(String) # e.g. "stripe_refund"
    description = Column(Text)
    base_url = Column(String, nullable=True)
    api_key_encrypted = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# 📧 YC RFS: THE EMAIL LAYER
class EmailAccount(Base):
    __tablename__ = "email_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, ForeignKey("slack_workspaces.workspace_id"), index=True)
    email_address = Column(String, unique=True, index=True)
    provider = Column(String) # "gmail" | "outlook"
    access_token = Column(String)
    refresh_token = Column(String)
    is_active = Column(Boolean, default=True)
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class EmailThread(Base):
    __tablename__ = "email_threads"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(String, unique=True, index=True) # Provider's thread ID
    account_id = Column(UUID(as_uuid=True), ForeignKey("email_accounts.id"), index=True)
    subject = Column(String)
    snippet = Column(Text)
    full_body = Column(Text)
    participants = Column(ARRAY(String))
    is_logic_candidate = Column(Boolean, default=False, index=True)
    embedding = Column(Vector(384))
    last_message_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

# 🎫 SUPPORT TICKETS LAYER
class SupportAccount(Base):
    __tablename__ = "support_accounts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, ForeignKey("slack_workspaces.workspace_id"), index=True)
    provider = Column(String) # "zendesk" | "intercom"
    api_url = Column(String)
    api_key_encrypted = Column(Text)
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SupportTicket(Base):
    __tablename__ = "support_tickets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_id = Column(String, unique=True, index=True)
    account_id = Column(UUID(as_uuid=True), ForeignKey("support_accounts.id"), index=True)
    subject = Column(String)
    description = Column(Text)
    resolution = Column(Text, nullable=True)
    status = Column(String)
    is_logic_candidate = Column(Boolean, default=False, index=True)
    embedding = Column(Vector(384))
    created_at = Column(DateTime, default=datetime.utcnow)

# 🗄️ DATABASE LAYER
class DatabaseConnection(Base):
    __tablename__ = "database_connections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(String, ForeignKey("slack_workspaces.workspace_id"), index=True)
    name = Column(String)
    db_type = Column(String) # "postgres" | "mysql" | "snowflake"
    connection_string_encrypted = Column(Text)
    schema_dump = Column(Text, nullable=True) # LLM uses this to understand rules
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
