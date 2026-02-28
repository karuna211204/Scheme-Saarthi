"""
Test RAG Server with Government Scheme Queries
"""
from db.chromadb_client import chromadb_client
import json

def test_scheme_search():
    print("\n" + "="*70)
    print("🇮🇳 SCHEME SAARTHI RAG - TEST SUITE")
    print("="*70)
    
    # Connect to vector database
    chromadb_client.connect()
    
    # Get stats
    stats = chromadb_client.get_collection_stats()
    print(f"\n📊 Vector Database Stats:")
    print(f"   Backend: {stats['backend']}")
    print(f"   Total Documents: {stats['count']}")
    print(f"   Embedding Dimension: {stats['dim']}")
    print(f"   Storage Dir: {stats['store_dir']}")
    
    # Test queries
    test_queries = [
        {
            "query": "schemes for farmers",
            "description": "Agriculture schemes"
        },
        {
            "query": "education scholarships for students",
            "description": "Education schemes"
        },
        {
            "query": "housing schemes for poor people",
            "description": "Housing assistance"
        },
        {
            "query": "pension for senior citizens",
            "description": "Old age pension"
        },
        {
            "query": "women empowerment business loans",
            "description": "Women business loans"
        },
        {
            "query": "health insurance for BPL families",
            "description": "Healthcare schemes"
        },
        {
            "query": "skill development training free",
            "description": "Skill training"
        }
    ]
    
    for i, test in enumerate(test_queries, 1):
        print(f"\n" + "="*70)
        print(f"TEST {i}: {test['description']}")
        print(f"Query: '{test['query']}'")
        print("="*70)
        
        results = chromadb_client.search(query=test['query'], n_results=2)
        
        if not results['documents'][0]:
            print("❌ No results found")
            continue
        
        print(f"✅ Found {len(results['documents'][0])} relevant schemes\n")
        
        for j, (doc, metadata) in enumerate(zip(results['documents'][0], results['metadatas'][0]), 1):
            print(f"📋 RESULT {j}:")
            print(f"   Scheme: {metadata.get('scheme_name', 'Unknown')}")
            print(f"   Category: {metadata.get('category', 'Unknown')}")
            print(f"   Content Preview: {doc[:300]}...")
            print()
    
    print("\n" + "="*70)
    print("✅ TEST SUITE COMPLETE")
    print("="*70)

if __name__ == "__main__":
    test_scheme_search()
