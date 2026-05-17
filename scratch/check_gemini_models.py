import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("No GEMINI_API_KEY found!")
    exit(1)

genai.configure(api_key=api_key)

try:
    print("Available Gemini Models:")
    print("="*50)
    for m in genai.list_models():
        if "embed" in m.name or "embedding" in m.name or "embedContent" in m.supported_generation_methods:
            print(f"- Name: {m.name}")
            print(f"  Supported Methods: {m.supported_generation_methods}")
            print(f"  Description: {m.description}")
            print("-"*50)
except Exception as e:
    print("Error listing models:", e)
