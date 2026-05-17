import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
import random
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# ==========================================
# CONFIGURATION
# ==========================================
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "your-email@gmail.com") 
APP_PASSWORD = os.getenv("APP_PASSWORD", "your-16-digit-app-password")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.0-flash')

# ==========================================
# THE LEADS (With Business Context)
# ==========================================
LEADS = [
    {
        "name": "Timmy", 
        "company": "Fazeshift", 
        "email": "timmy@fazeshift.com", 
        "context": "Building autonomous AI agents for Accounts Receivable and financial invoicing."
    },
    {
        "name": "Valerie", 
        "company": "Duckie", 
        "email": "valerie@duckie.ai", 
        "context": "Building AI customer support agents to resolve complex technical issues for users."
    },
    {
        "name": "Asa", 
        "company": "Voicepanel", 
        "email": "asa@voicepanel.com", 
        "context": "Building AI agents that conduct automated customer research and user interviews."
    },
    {
        "name": "Léonard", 
        "company": "Topo.io", 
        "email": "leonard@topo.io", 
        "context": "Building AI sales agents for outbound sequences and enterprise sales engagement."
    }
]

def generate_personalized_body(name, company, context):
    prompt = f"""
    You are Aditya, the founder of StateLock, a deterministic governance SDK for AI agents.
    StateLock acts as a strict deterministic Policy Gateway for agents, mathematically evaluating actions against company policy and blocking unauthorized actions before execution, bypassing LLM hallucination risk.

    Write a highly personalized 100-word cold email to {name}, the CTO of {company}.
    {company} does this: {context}

    Follow these strict Y Combinator cold email rules:
    1. Short and punchy. Maximum 100 words.
    2. Hook: Compliment what they are specifically building at {company}.
    3. Pain: Ask a highly specific question about how they guarantee their agents won't hallucinate destructive actions IN THEIR SPECIFIC DOMAIN (e.g. for finance, hallucinating a refund. For sales, hallucinating a bad discount).
    4. Solution: Briefly mention StateLock as a deterministic SDK that solves this.
    5. CTA: Low friction. Ask if they are building these guardrails in-house and if it's worth a 10-minute chat.
    6. Tone: Founder-to-founder. Technical, direct, no marketing fluff.
    
    Return ONLY the body of the email. Do not include the Subject line.
    """
    
    print(f"Asking Gemini to write a personalized email for {company}...")
    response = model.generate_content(prompt)
    return response.text.strip()

def send_cold_emails():
    print(f"Starting AI-Personalized Outreach Sequence for {len(LEADS)} leads...")
    
    if SENDER_EMAIL == "your-email@gmail.com" or APP_PASSWORD == "your-16-digit-app-password":
        print("ERROR: You must set your SENDER_EMAIL and APP_PASSWORD in the .env file!")
        return
        
    if not GEMINI_API_KEY:
        print("ERROR: GEMINI_API_KEY is missing from .env!")
        return

    try:
        # Connect to Gmail's SMTP server
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, APP_PASSWORD)
        print("Successfully logged into Gmail SMTP.")
        
        for index, lead in enumerate(LEADS):
            print(f"\n[{index+1}/{len(LEADS)}] Processing {lead['name']} at {lead['company']}...")
            
            # 1. Use AI to generate a highly personalized body
            body = generate_personalized_body(lead['name'], lead['company'], lead['context'])
            subject = f"Quick question regarding {lead['company']}'s agent guardrails"
            
            print(f"\n--- GENERATED EMAIL FOR {lead['company']} ---")
            print(body)
            print("-------------------------------------------\n")
            
            # Construct the email object
            msg = MIMEMultipart()
            msg['From'] = f"Aditya Shinde <{SENDER_EMAIL}>"
            msg['To'] = lead['email']
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))
            
            # Send the email
            try:
                server.send_message(msg)
                print(f"SENT: Email successfully delivered to {lead['email']}")
            except Exception as e:
                print(f"FAILED: Could not send to {lead['email']}. Error: {e}")
            
            # RANDOM DELAY
            if index < len(LEADS) - 1:
                delay = random.randint(45, 120)
                print(f"Sleeping for {delay} seconds to avoid spam filters...")
                time.sleep(delay)
                
        server.quit()
        print("\nOUTREACH COMPLETE! All personalized emails sent.")

    except Exception as e:
        print(f"CRITICAL ERROR during execution: {e}")

if __name__ == "__main__":
    send_cold_emails()
