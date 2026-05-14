-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- SlackMessage table
CREATE TABLE IF NOT EXISTS slack_messages (
    id UUID PRIMARY KEY,
    channel_id VARCHAR(255) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    is_logic_candidate BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slack_messages_channel_id ON slack_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_slack_messages_logic_candidate ON slack_messages(is_logic_candidate);

-- Skill table
CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    yaml_content TEXT NOT NULL,
    trigger_keywords TEXT[] NOT NULL,
    source_message_ids UUID[] NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GIN index for trigger_keywords
CREATE INDEX IF NOT EXISTS idx_skills_trigger_keywords ON skills USING GIN (trigger_keywords);

CREATE TABLE IF NOT EXISTS agent_conversations (
    id UUID PRIMARY KEY,
    user_query TEXT NOT NULL,
    matched_skill_id UUID REFERENCES skills(id),
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255) NOT NULL,
    agents_count INTEGER NOT NULL,
    notes TEXT,
    source VARCHAR(50) DEFAULT 'landing-page',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- WorkflowRun table
CREATE TABLE IF NOT EXISTS workflow_runs (
    id UUID PRIMARY KEY,
    workspace_id VARCHAR(255) REFERENCES slack_workspaces(workspace_id),
    skill_id UUID REFERENCES skills(id),
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'running',
    context TEXT,
    current_step_index INTEGER DEFAULT 0,
    value_generated FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WorkflowStepLog table
CREATE TABLE IF NOT EXISTS workflow_step_logs (
    id UUID PRIMARY KEY,
    workflow_run_id UUID REFERENCES workflow_runs(id),
    step_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    input_data TEXT,
    output_data TEXT,
    error_message TEXT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BillingEvent table
CREATE TABLE IF NOT EXISTS billing_events (
    id UUID PRIMARY KEY,
    workspace_id VARCHAR(255) REFERENCES slack_workspaces(workspace_id),
    workflow_run_id UUID REFERENCES workflow_runs(id),
    event_type VARCHAR(100),
    value_amount FLOAT,
    currency VARCHAR(10) DEFAULT 'USD',
    metadata_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ExternalTool table
CREATE TABLE IF NOT EXISTS external_tools (
    id UUID PRIMARY KEY,
    workspace_id VARCHAR(255) REFERENCES slack_workspaces(workspace_id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_url VARCHAR(500),
    api_key_encrypted TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
