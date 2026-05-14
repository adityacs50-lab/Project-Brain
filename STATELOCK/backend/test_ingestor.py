import asyncio
import sys
import os

# Add the parent directory to sys.path to allow imports from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.ingestor import score_logic_relevance

import pytest

@pytest.mark.asyncio
async def test_scoring():
    test_messages = [
        "Hello everyone! How is it going?", # 0.0
        "From now on, all refunds over $200 need VP approval.", # 1.0
        "The new policy for remote work is available in the handbook.", # 1.0
        "Please remember to fill out your timesheets.", # 0.5
        "Going forward, we will use Jira for all task tracking.", # 1.0
        "FYI: The office will be closed on Friday.", # 0.5
        "The process is simple: just submit the form.", # 1.0
        "Heads up, the meeting is starting in 5 minutes.", # 0.5
        "Lunch is here!", # 0.0
        "Always double check the code before merging." # 1.0
    ]
    
    flagged_count = 0
    print("--- Testing Logic Relevance Scoring ---")
    
    for msg in test_messages:
        score = await score_logic_relevance(msg)
        is_candidate = score >= 0.5
        status = "[CANDIDATE]" if is_candidate else "[NOISE]"
        print(f"{status} (Score: {score}): {msg}")
        
        if is_candidate:
            flagged_count += 1
            
    print(f"\nTotal flagged as logic candidates: {flagged_count}")
    
    assert flagged_count >= 3, f"Failed: Expected at least 3 logic candidates, but found {flagged_count}"
    print("Test Passed: Minimum threshold of candidates met.")

if __name__ == "__main__":
    asyncio.run(test_scoring())
