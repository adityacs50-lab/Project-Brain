import asyncio
import sys
import os
import uuid
from datetime import datetime
from unittest.mock import AsyncMock, patch, MagicMock

# Add the parent directory to sys.path to allow imports from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock genai before importing extractor to avoid potential hangs during init
mock_genai = MagicMock()
sys.modules["google.generativeai"] = mock_genai

from backend.models import SlackMessage
# Now we can import extractor
from backend.extractor import extract_skills_from_messages

async def test_extraction():
    # 1. Create fake SlackMessage objects
    fake_messages = [
        SlackMessage(
            id=uuid.uuid4(),
            channel_id="C123",
            sender="U456",
            text="From now on, all refunds over $200 need VP approval.",
            timestamp=datetime.now(),
            is_logic_candidate=True
        ),
        SlackMessage(
            id=uuid.uuid4(),
            channel_id="C123",
            sender="U456",
            text="The VP approval process requires a signed PDF.",
            timestamp=datetime.now(),
            is_logic_candidate=True
        ),
        SlackMessage(
            id=uuid.uuid4(),
            channel_id="C123",
            sender="U789",
            text="How do I get a refund?",
            timestamp=datetime.now(),
            is_logic_candidate=False
        ),
        SlackMessage(
            id=uuid.uuid4(),
            channel_id="C123",
            sender="U456",
            text="Just follow the new policy I just mentioned.",
            timestamp=datetime.now(),
            is_logic_candidate=True
        ),
        SlackMessage(
            id=uuid.uuid4(),
            channel_id="C123",
            sender="U456",
            text="Step 1 is verify receipt, Step 2 is check product.",
            timestamp=datetime.now(),
            is_logic_candidate=True
        )
    ]

    # Mock Gemini response
    mock_yaml = """
skills:
  - name: "VP Refund Approval"
    trigger_keywords:
      - "refund"
      - "VP"
    description: "Process for approving high-value refunds"
    steps:
      - step: 1
        action: "Verify receipt"
      - step: 2
        action: "Check product return status"
      - step: 3
        action: "Submit signed PDF to VP"
        condition: "amount > 200"
    approval_required: true
    approver_role: "VP"
    notes: "Requires signed PDF"
"""

    # Mock database session
    mock_db = AsyncMock()
    
    print("--- Starting Extraction Test ---")
    
    with patch("backend.extractor.call_gemini_with_retry", return_value=mock_yaml):
        with patch("backend.extractor.AsyncSessionLocal", return_value=mock_db):
            # We also need to mock the context manager behavior of AsyncSessionLocal
            mock_db.__aenter__.return_value = mock_db
            
            skills = await extract_skills_from_messages(fake_messages)
            
            print(f"Extracted {len(skills)} skills.")
            
            for skill in skills:
                print(f"\nExtracted Skill: {skill.name}")
                print("YAML Content:")
                print(skill.yaml_content)
                
            assert len(skills) >= 1, "Failed: No skills extracted"
            print("\nTest Passed: Skill extraction successful.")

if __name__ == "__main__":
    asyncio.run(test_extraction())
