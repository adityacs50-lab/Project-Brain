import os
import sys
import numpy as np
from dotenv import load_dotenv

# Setup path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../STATELOCK")))
from backend.versioning import get_model

load_dotenv()
model_instance = get_model()

text_a = "Refunds above $100 require manager approval."
text_b = "Agents are permitted to compile and send standard weekly status reports."
text_c = "purchase a new mechanical keyboard"
text_query_b = "email a weekly status update to the managers"

# Print details of embeddings
for text, name in [(text_a, "Rule A"), (text_b, "Rule B"), (text_c, "Query C"), (text_query_b, "Query B")]:
    emb = model_instance.encode(text)
    print(f"{name} embedding: length={len(emb)}, min={min(emb):.4f}, max={max(emb):.4f}, norm={np.linalg.norm(emb):.4f}")

emb_a = np.array(model_instance.encode(text_a))
emb_b = np.array(model_instance.encode(text_b))
emb_c = np.array(model_instance.encode(text_c))
emb_query_b = np.array(model_instance.encode(text_query_b))

sim_ac = np.dot(emb_a, emb_c) / (np.linalg.norm(emb_a) * np.linalg.norm(emb_c))
sim_bc = np.dot(emb_b, emb_c) / (np.linalg.norm(emb_b) * np.linalg.norm(emb_c))
sim_b_query_b = np.dot(emb_b, emb_query_b) / (np.linalg.norm(emb_b) * np.linalg.norm(emb_query_b))

print("\nCosine Similarities:")
print(f"Rule A vs Query C (unrelated)   : {sim_ac:.4f}")
print(f"Rule B vs Query C (unrelated)   : {sim_bc:.4f}")
print(f"Rule B vs Query B (SEMANTIC MATCH): {sim_b_query_b:.4f}")
