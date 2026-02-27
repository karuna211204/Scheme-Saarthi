"""
Debug script to test error code search
"""
import logging
from db.chromadb_client import chromadb_client
from rag.retriever import knowledge_retriever

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize
chromadb_client.connect()

# Test 1: Check what's in the database
print("="*70)
print("TEST 1: Database Stats")
print("="*70)
stats = chromadb_client.get_collection_stats()
print(f"Documents: {stats['count']}")
print(f"Backend: {stats['backend']}")
print(f"Dimensions: {stats['dim']}")

# Test 2: Check metadatas for washing machine PDFs
print("\n" + "="*70)
print("TEST 2: Check Washing Machine Documents")
print("="*70)
washing_docs = [
    (i, meta) for i, meta in enumerate(chromadb_client.metadatas) 
    if 'washing' in meta.get('source', '').lower()
]
print(f"Found {len(washing_docs)} washing machine documents")
if washing_docs:
    print(f"First 5 sources:")
    for i, (idx, meta) in enumerate(washing_docs[:5]):
        print(f"  {i+1}. {meta.get('source')} - Page {meta.get('page')}")

# Test 3: Direct search with filter
print("\n" + "="*70)
print("TEST 3: Direct Search with Filter")
print("="*70)
query = "error code E4"
print(f"Query: '{query}'")
print(f"Filter: {{'source': 'washing_maching.pdf'}}")
results = chromadb_client.search(
    query=query,
    n_results=5,
    filter_metadata={'source': 'washing_maching.pdf'}
)
print(f"Found {len(results['documents'][0])} results")
if results['documents'][0]:
    for i, doc in enumerate(results['documents'][0][:3]):
        print(f"\nResult {i+1}:")
        print(f"  Source: {results['metadatas'][0][i].get('source')}")
        print(f"  Page: {results['metadatas'][0][i].get('page')}")
        print(f"  Text preview: {doc[:200]}...")

# Test 4: Search without filter
print("\n" + "="*70)
print("TEST 4: Search WITHOUT Filter (All Documents)")
print("="*70)
results_no_filter = chromadb_client.search(
    query="error code E4 washing machine",
    n_results=5
)
print(f"Found {len(results_no_filter['documents'][0])} results")
if results_no_filter['documents'][0]:
    for i, doc in enumerate(results_no_filter['documents'][0][:3]):
        print(f"\nResult {i+1}:")
        print(f"  Source: {results_no_filter['metadatas'][0][i].get('source')}")
        print(f"  Page: {results_no_filter['metadatas'][0][i].get('page')}")
        print(f"  Text preview: {doc[:200]}...")

# Test 5: Search for "E4" specifically
print("\n" + "="*70)
print("TEST 5: Search for E4 text in washing machine docs")
print("="*70)
e4_docs = []
for i, (text, meta) in enumerate(zip(chromadb_client.texts, chromadb_client.metadatas)):
    if 'washing' in meta.get('source', '').lower():
        if 'E4' in text or 'e4' in text.lower():
            e4_docs.append((i, meta, text))

print(f"Found {len(e4_docs)} documents containing 'E4' in washing machine docs")
if e4_docs:
    for i, (idx, meta, text) in enumerate(e4_docs[:3]):
        print(f"\nDocument {i+1}:")
        print(f"  Source: {meta.get('source')}")
        print(f"  Page: {meta.get('page')}")
        # Find E4 mentions
        text_lower = text.lower()
        e4_pos = text_lower.find('e4')
        if e4_pos != -1:
            start = max(0, e4_pos - 100)
            end = min(len(text), e4_pos + 200)
            print(f"  Context: ...{text[start:end]}...")

# Test 6: Test the actual retriever function
print("\n" + "="*70)
print("TEST 6: Test knowledge_retriever.search_error_code()")
print("="*70)
result = knowledge_retriever.search_error_code("washing machine E4")
print(result)
