import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

models = ["models/gemini-embedding-001", "models/gemini-embedding-2", "models/gemini-embedding-2-preview"]

for model in models:
    print(f"\nTesting model: {model}")
    try:
        res = genai.embed_content(
            model=model,
            content="Hello world",
            task_type="retrieval_document",
            output_dimensionality=384
        )
        vec = res["embedding"]
        print(f"✅ Success! Generated embedding with shape: {len(vec)}")
    except Exception as e:
        print(f"❌ Error with output_dimensionality parameter: {e}")
        try:
            # Test without custom dimensionality
            res = genai.embed_content(
                model=model,
                content="Hello world",
                task_type="retrieval_document"
            )
            vec = res["embedding"]
            print(f"💡 Works without dimension parameter! Default shape: {len(vec)}")
        except Exception as ex:
            print(f"❌ Error without parameter: {ex}")
