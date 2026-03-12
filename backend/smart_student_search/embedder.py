import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from dotenv import load_dotenv

load_dotenv()

def get_embedding(text: str):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
         raise ValueError("No Google Key")

    embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001", google_api_key=api_key)
    vector = embeddings.embed_query(text)

    return vector
