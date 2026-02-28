import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

print("Available models for embedding:")
for model in genai.list_models():
    if 'embedContent' in model.supported_generation_methods or 'embed' in model.name.lower():
        print(f"  - {model.name}")
        print(f"    Methods: {model.supported_generation_methods}")
        print()
