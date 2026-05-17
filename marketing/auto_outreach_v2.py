import os
import smtplib
import time
from email.message import EmailMessage
from dotenv import load_dotenv

# Load credentials
load_dotenv()
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
APP_PASSWORD = os.getenv("APP_PASSWORD")

# Pre-generated AI emails to avoid Quota issues
LEADS = [
    {
        "name": "Timmy",
        "company": "Fazeshift",
        "email": "timmy@fazeshift.com",
        "body": """Hi Timmy,

I've been following what you're building at Fazeshift—bringing autonomous agents to code review is exactly where the market is heading.

As you scale, how are you mathematically guaranteeing that an agent doesn't accidentally push a breaking change or leak a sensitive secret during an autonomous review?

I'm building StateLock, a deterministic governance SDK for AI agents. It acts as a strict Policy Gateway that blocks unauthorized actions before execution, bypassing LLM hallucination risk entirely.

Are you building these guardrails in-house, or is it worth a 10-minute chat to see how we handle it?

Best,
Aditya
Founder, StateLock"""
    },
    {
        "name": "Valerie",
        "company": "Duckie",
        "email": "valerie@duckie.ai",
        "body": """Hi Valerie,

Duckie's ability to automate technical support workflows is impressive.

In a support context, how do you prevent an agent from hallucinating a high-value refund or accidentally sharing a sensitive enterprise secret with a customer?

I'm building StateLock, a deterministic governance SDK for agents. It sits at the execution layer to mathematically enforce policy and block destructive actions before they happen, regardless of what the LLM decides.

Are you already building these runtime guardrails, or would it be worth a quick 10-minute founder-to-founder chat?

Best,
Aditya
Founder, StateLock"""
    },
    {
        "name": "Fazel",
        "company": "OpenLayer",
        "email": "fazel@openlayer.com",
        "body": """Hi Fazel,

OpenLayer's focus on AI reliability and evaluation is spot on.

Once a team identifies a failure pattern in evaluation, how do you help them *enforce* that fix at runtime to physically stop a destructive agent action?

I'm building StateLock, the deterministic enforcement layer for AI agents. We act as the deterministic Policy Gateway for agent actions, blocking anything that violates company policy before it hits production.

I'd love to hear how you're thinking about the gap between evaluation and enforcement. Worth a 10-minute chat?

Best,
Aditya
Founder, StateLock"""
    },
    {
        "name": "Aditya",
        "company": "CodeAnt AI",
        "email": "aditya@codeant.ai",
        "body": """Hi Aditya,

Bringing agentic workflows to code review and security is a game changer.

For high-security environments, how do you mathematically ensure an agent never performs a sensitive operation (like dropping a table or pushing to prod) without violating your governance policy?

I'm building StateLock, a deterministic governance SDK that blocks unauthorized calls before execution, bypassing the unreliability of LLM self-correction.

Are you building these safety layers in-house? Would love to swap notes for 10 minutes.

Best,
Aditya
Founder, StateLock"""
    }
]

def send_cold_emails():
    print(f"Starting Outreach Sequence for {len(LEADS)} leads...")
    
    if not SENDER_EMAIL or not APP_PASSWORD:
        print("ERROR: SENDER_EMAIL or APP_PASSWORD missing from .env!")
        return

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        print("Successfully logged into Gmail SMTP.")
        
        for index, lead in enumerate(LEADS):
            print(f"[{index+1}/{len(LEADS)}] Sending to {lead['name']} at {lead['company']}...")
            
            msg = EmailMessage()
            msg.set_content(lead['body'])
            msg['Subject'] = f"Quick question regarding {lead['company']}'s agent boundaries"
            msg['From'] = SENDER_EMAIL
            msg['To'] = lead['email']

            try:
                server.send_message(msg)
                print(f"SENT: Email delivered to {lead['email']}")
            except Exception as e:
                print(f"FAILED: Could not send to {lead['email']}. Error: {e}")
            
            if index < len(LEADS) - 1:
                delay = 60 # 1 minute delay
                print(f"Waiting {delay}s...")
                time.sleep(delay)
                
        server.quit()
        print("\nOUTREACH COMPLETE!")

    except Exception as e:
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    send_cold_emails()
