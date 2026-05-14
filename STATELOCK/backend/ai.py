import os
import google.generativeai as genai
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

class AIClient:
    def __init__(self):
        self.groq_key = os.getenv("GROQ_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        
        self.groq_client = None
        if self.groq_key:
            self.groq_client = AsyncOpenAI(
                api_key=self.groq_key,
                base_url="https://api.groq.com/openai/v1"
            )
        elif self.openai_key:
            self.groq_client = AsyncOpenAI(api_key=self.openai_key)
            
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            print(f"AI: Gemini initialized with model: gemini-1.5-flash")
        else:
            self.gemini_model = None

    async def chat_completion(self, model, messages, **kwargs):
        # Prefer Groq/OpenAI if configured
        if self.groq_client:
            try:
                response = await self.groq_client.chat.completions.create(
                    model=model,
                    messages=messages,
                    **kwargs
                )
                return response.choices[0].message.content
            except Exception as e:
                print(f"Groq/OpenAI error: {e}")
                if not self.gemini_model:
                    raise e
        
        # Fallback to Gemini
        if self.gemini_key:
            # Convert messages to Gemini format
            prompt = ""
            for m in messages:
                role = m["role"]
                content = m["content"]
                prompt += f"{role.upper()}: {content}\n"
            
            for model_name in ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']:
                try:
                    m = genai.GenerativeModel(model_name)
                    response = await m.generate_content_async(prompt)
                    return response.text
                except Exception as e:
                    print(f"Gemini model {model_name} failed: {e}")
                    continue
        
        raise Exception("No AI client configured or all models failed")

ai_client = AIClient()
