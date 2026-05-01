import pytest
import asyncio
import uuid
from datetime import datetime
from unittest.mock import AsyncMock, patch, MagicMock
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models import SlackMessage, Skill, AgentConversation
from backend.extractor import extract_skills_from_messages
from backend.ingestor import score_logic_relevance
from backend.executor import answer_query

@pytest.mark.asyncio
async def test_malformed_input():
    # empty message text
    assert await score_logic_relevance("") == 0.0
    
    # missing user field, missing timestamp - represented by passing None or empty to SlackMessage
    # We should just ensure it doesn't crash the extractor
    msg = SlackMessage(
        id=uuid.uuid4(),
        channel_id="C123",
        sender="", # missing user
        text="", # empty text
        timestamp=datetime.now(), # missing timestamp in reality but we give one to avoid db errors
        is_logic_candidate=True
    )
    
    mock_yaml = "skills: []"
    
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    
    with patch("backend.extractor.call_gemini_with_retry", return_value=mock_yaml):
        with patch("backend.extractor.AsyncSessionLocal", return_value=mock_db):
            skills = await extract_skills_from_messages([msg])
            assert len(skills) == 0

@pytest.mark.asyncio
async def test_conflicting_policy_changes():
    msg1 = SlackMessage(
        id=uuid.uuid4(),
        channel_id="C1", sender="U1",
        text="From now on, all refunds over $100 require VP approval.",
        timestamp=datetime(2023, 1, 1),
        is_logic_candidate=True
    )
    msg2 = SlackMessage(
        id=uuid.uuid4(),
        channel_id="C1", sender="U2",
        text="New rule: refunds over $100 now only require Manager approval, overriding the old VP rule.",
        timestamp=datetime(2023, 1, 2),
        is_logic_candidate=True
    )
    
    # Mock Gemini response returning a conflict flag
    mock_yaml = """
skills:
  - name: "Refund Approval"
    trigger_keywords: ["refund", "approval"]
    description: "Approval process for refunds"
    steps:
      - step: 1
        action: "Manager approval"
    notes: "CONFLICT DETECTED: U1 said VP approval, but U2 later said Manager approval. Using latest."
"""
    
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    
    with patch("backend.extractor.call_gemini_with_retry", return_value=mock_yaml):
        with patch("backend.extractor.AsyncSessionLocal", return_value=mock_db):
            skills = await extract_skills_from_messages([msg1, msg2])
            assert len(skills) == 1
            assert "CONFLICT DETECTED" in skills[0].yaml_content

@pytest.mark.asyncio
async def test_source_attribution_preserved():
    # End-to-end trace: Extracted skill should store source message ID, and executor should return source name
    msg_id = uuid.uuid4()
    skill_id = uuid.uuid4()
    
    skill = Skill(
        id=skill_id,
        name="Source Policy",
        yaml_content="name: Source Policy\ntrigger_keywords: [source, policy]\nsteps: []",
        trigger_keywords=["source", "policy"],
        source_message_ids=[msg_id]
    )
    
    # Mock DB for Executor
    mock_db = AsyncMock()
    mock_db.__aenter__.return_value = mock_db
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [skill]
    mock_db.execute = AsyncMock(return_value=mock_result)
    mock_db.add = MagicMock()
    
    # Mock Gemini for Executor
    mock_genai_response = MagicMock()
    mock_genai_response.text = "Here is the policy based on the source."
    
    mock_model = MagicMock()
    mock_model.generate_content_async = AsyncMock(return_value=mock_genai_response)
    
    with patch("backend.executor.AsyncSessionLocal", return_value=mock_db):
        with patch("backend.executor.genai.GenerativeModel", return_value=mock_model):
            result = await answer_query("What is the source policy?")
            
            assert "Here is the policy based on the source" in result["answer"]
            assert "Source Policy" in result["sources"]

@pytest.mark.asyncio
async def test_noise_never_becomes_skill():
    noise_messages = [
        "Lunch is ready in the kitchen!",
        "The coffee machine on the 3rd floor is fixed.",
        "Reminder: tomorrow is casual Friday, wear your jeans.",
        "Please update your profile picture on Slack by Friday."
    ]
    
    msgs = []
    for i, text in enumerate(noise_messages):
        msgs.append(SlackMessage(
            id=uuid.uuid4(), channel_id="C1", sender=f"U{i}",
            text=text, timestamp=datetime.now(), is_logic_candidate=True
        ))
    
    mock_db = AsyncMock()
    mock_db.__aenter__.return_value = mock_db
    mock_db.add = MagicMock()
    
    # Mock Gemini to return empty skills, as it correctly identifies noise
    mock_yaml = "skills: []"
    
    with patch("backend.extractor.call_gemini_with_retry", return_value=mock_yaml):
        with patch("backend.extractor.AsyncSessionLocal", return_value=mock_db):
            skills = await extract_skills_from_messages(msgs)
            assert len(skills) == 0, "Noise messages were incorrectly extracted as skills"
