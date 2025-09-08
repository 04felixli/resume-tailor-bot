from sentence_transformers import SentenceTransformer
import numpy as np

_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2") 

def embed_texts(texts: list[str]) -> np.ndarray:
    V = _model.encode(texts, batch_size=64, normalize_embeddings=True)
    return np.asarray(V, dtype=np.float32) # dimensions of n * d where n = len(texts) and d = 384 (dimensions)
