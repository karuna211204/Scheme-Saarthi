import os
import json
import numpy as np
from pathlib import Path
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

STORE_DIR = Path(__file__).parent.parent / ".vectorstore"
STORE_DIR.mkdir(exist_ok=True)
STORE_FILE = STORE_DIR / "store.npz"
META_FILE = STORE_DIR / "meta.json"

# Get embedding model name and ensure it has the models/ prefix for Google
RAW_MODEL_NAME = os.getenv("RAG_EMBEDDING_MODEL", "text-embedding-004")
if not RAW_MODEL_NAME.startswith("models/"):
    DEFAULT_EMBED_MODEL = f"models/{RAW_MODEL_NAME}"
else:
    DEFAULT_EMBED_MODEL = RAW_MODEL_NAME

EMBED_BACKEND = (os.getenv("RAG_EMBED_BACKEND", "local") or "local").lower()
API_KEY = os.getenv("GOOGLE_API_KEY")


class _VectorStoreClient:
    def __init__(self):
        self.embeddings: Optional[np.ndarray] = None
        self.texts: List[str] = []
        self.metadatas: List[Dict[str, Any]] = []
        self.ids: List[str] = []
        self.dim: Optional[int] = None
        self._connected = False

    def connect(self):
        # No-op for local backend; Google config happens lazily when used
        pass

        if STORE_FILE.exists() and META_FILE.exists():
            data = np.load(STORE_FILE)
            self.embeddings = data["embeddings"]
            with META_FILE.open("r", encoding="utf-8") as f:
                meta = json.load(f)
            self.texts = meta.get("texts", [])
            self.metadatas = meta.get("metadatas", [])
            self.ids = meta.get("ids", [])
            self.dim = int(data["embeddings"].shape[1]) if self.embeddings.size else None
        else:
            self.embeddings = np.zeros((0, 0), dtype=np.float32)
            self.texts = []
            self.metadatas = []
            self.ids = []
            self.dim = None
        self._connected = True

    def _persist(self):
        if self.embeddings is None:
            return
        if self.embeddings.size == 0:
            # Ensure 2D empty array
            arr = np.zeros((0, self.dim or 0), dtype=np.float32)
        else:
            arr = self.embeddings
        np.savez_compressed(STORE_FILE, embeddings=arr)
        with META_FILE.open("w", encoding="utf-8") as f:
            json.dump({
                "texts": self.texts,
                "metadatas": self.metadatas,
                "ids": self.ids
            }, f)

    def _hash_embed(self, text: str, dim: int = 1024) -> List[float]:
        import re
        vec = np.zeros(dim, dtype=np.float32)
        tokens = re.findall(r"[a-z0-9]+", text.lower())
        for tok in tokens:
            idx = (hash(tok) & 0x7FFFFFFF) % dim
            vec[idx] += 1.0
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

    def _google_embed(self, texts: List[str]) -> List[List[float]]:
        if not API_KEY:
            raise RuntimeError("GOOGLE_API_KEY not set; required for Google embedding backend")
        import google.generativeai as genai
        genai.configure(api_key=API_KEY)
        vectors: List[List[float]] = []
        for t in texts:
            res = genai.embed_content(model=DEFAULT_EMBED_MODEL, content=t)
            vec = res.get("embedding") or res.get("data", {}).get("embedding")
            if vec is None:
                raise RuntimeError("Failed to get embedding from Google API response")
            vectors.append(vec)
        return vectors

    def _embed_batch(self, texts: List[str]) -> List[List[float]]:
        if EMBED_BACKEND == "google":
            return self._google_embed(texts)
        # default local hashing
        return [self._hash_embed(t) for t in texts]

    def add_documents(self, documents: List[str], metadatas: List[Dict[str, Any]], ids: List[str]):
        if not self._connected:
            self.connect()
        if len(documents) != len(metadatas) or len(documents) != len(ids):
            raise ValueError("documents, metadatas, ids must have same length")

        vectors = self._embed_batch(documents)
        vecs = np.array(vectors, dtype=np.float32)
        if self.dim is None:
            self.dim = vecs.shape[1]
        if self.embeddings is None or self.embeddings.size == 0:
            self.embeddings = vecs
        else:
            self.embeddings = np.vstack([self.embeddings, vecs])
        self.texts.extend(documents)
        self.metadatas.extend(metadatas)
        self.ids.extend(ids)
        self._persist()

    def _cosine_sim(self, a: np.ndarray, b: np.ndarray) -> np.ndarray:
        a_norm = a / (np.linalg.norm(a, axis=1, keepdims=True) + 1e-12)
        b_norm = b / (np.linalg.norm(b, axis=1, keepdims=True) + 1e-12)
        return a_norm @ b_norm.T

    def search(self, query: str, n_results: int = 3, filter_metadata: Optional[Dict[str, Any]] = None):
        if not self._connected:
            self.connect()
        if self.embeddings is None or self.embeddings.size == 0 or not self.texts:
            return {"documents": [[]], "metadatas": [[]], "ids": [[]]}

        qvec = np.array(self._embed_batch([query])[0], dtype=np.float32)[None, :]
        sims = self._cosine_sim(qvec, self.embeddings)[0]

        # Apply metadata filters by masking
        indices = np.arange(len(self.texts))
        if filter_metadata:
            mask = []
            for i, md in enumerate(self.metadatas):
                ok = True
                for k, v in filter_metadata.items():
                    if md.get(k) != v:
                        ok = False
                        break
                mask.append(ok)
            indices = indices[np.array(mask, dtype=bool)]
            sims = sims[np.array(mask, dtype=bool)]

        if sims.size == 0:
            return {"documents": [[]], "metadatas": [[]], "ids": [[]]}

        topk = int(max(1, min(n_results, sims.shape[0])))
        top_idx = indices[np.argsort(-sims)[:topk]]

        docs = [self.texts[i] for i in top_idx]
        metas = [self.metadatas[i] for i in top_idx]
        ids = [self.ids[i] for i in top_idx]
        return {"documents": [docs], "metadatas": [metas], "ids": [ids]}

    def search_by_error_code(self, error_code: str) -> str:
        # Specialized helper: bias query towards error code semantics
        q = f"appliance error code {error_code} meaning cause fix steps"
        results = self.search(q, n_results=3)
        if not results["documents"][0]:
            return "No information found for this error code."
        parts = ["Error code information:\n"]
        for doc, md in zip(results["documents"][0], results["metadatas"][0]):
            src = md.get("source", "Unknown")
            page = md.get("page", "")
            parts.append(f"- From {src} (Page {page}):\n{doc[:500]}" + ("..." if len(doc) > 500 else ""))
        return "\n\n".join(parts)

    def get_collection_stats(self) -> Dict[str, Any]:
        return {
            "backend": f"numpy-{'google' if EMBED_BACKEND=='google' else 'local'}",
            "count": len(self.texts),
            "dim": self.dim or 0,
            "store_dir": str(STORE_DIR)
        }


# Public singleton matching previous import style
chromadb_client = _VectorStoreClient()
