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

-- AgentConversation table
CREATE TABLE IF NOT EXISTS agent_conversations (
    id UUID PRIMARY KEY,
    user_query TEXT NOT NULL,
    matched_skill_id UUID REFERENCES skills(id),
    response TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
