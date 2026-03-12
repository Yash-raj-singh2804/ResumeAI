import chromadb
from chromadb.config import Settings
import os

CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), "../../chroma_db")
os.makedirs(CHROMA_DB_DIR, exist_ok=True)

client = chromadb.PersistentClient(path=CHROMA_DB_DIR)

collection = client.get_or_create_collection(name="resumes")

def add_resume_to_vector_db(resume_id: str, text: str, vector: list, metadata: dict):
    """
    Adds a single resume vector to ChromaDB.
    """

    clean_meta = {k: str(v) for k, v in metadata.items()}
    clean_meta['resume_id'] = resume_id
    
    collection.add(
        ids=[resume_id],
        embeddings=[vector],
        metadatas=[clean_meta],
        documents=[text]
    )

def search_resumes(query_embedding: list, limit: int = 10):
    """
    Searches for similar resumes using the query embedding.
    
    Returns:
        list: List of dicts with 'id', 'score', and 'metadata'.
    """
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=limit
    )

    ids = results['ids'][0]
    distances = results['distances'][0]
    metadatas = results['metadatas'][0]
    
    structured_results = []
    for i in range(len(ids)):
        structured_results.append({
            "id": ids[i],
            "distance": distances[i],
            "metadata": metadatas[i]
        })
        
    return structured_results
