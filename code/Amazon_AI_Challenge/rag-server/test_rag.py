from db.chromadb_client import chromadb_client
from rag.retriever import KnowledgeRetriever

# Test 1: Check washing machine content
print("=" * 70)
print("TEST 1: Checking Washing Machine Manual Content")
print("=" * 70)
chromadb_client.connect()
results = chromadb_client.search("washing machine drum", n_results=5, filter_metadata={'source': 'washing_maching.pdf'})
print(f"\nFound {len(results['documents'][0])} chunks from washing_maching.pdf:")
for i, doc in enumerate(results['documents'][0][:3]):
    print(f"\n--- Chunk {i+1} (first 400 chars) ---")
    print(doc[:400])

# Test 2: Search for drainage issue
print("\n\n" + "=" * 70)
print("TEST 2: Searching for 'washing machine drainage' issue")
print("=" * 70)
retriever = KnowledgeRetriever()
result = retriever.search_symptom("washing machine drainage pump filter cleaning")
print(result[:1500])

# Test 3: Search for spinning issue
print("\n\n" + "=" * 70)
print("TEST 3: Searching for 'washing machine not spinning' issue")
print("=" * 70)
result = retriever.search_symptom("washing machine clothes still wet drum not spinning")
print(result[:1500])

# Test 4: Check error code
print("\n\n" + "=" * 70)
print("TEST 4: Searching for error codes")
print("=" * 70)
result = retriever.search_error_code("error")
print(result[:1500])
