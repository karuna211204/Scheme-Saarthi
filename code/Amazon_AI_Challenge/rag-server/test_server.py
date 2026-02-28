"""
Test MCP RAG Server HTTP endpoint
"""
import requests

try:
    response = requests.get('http://localhost:8002/health', timeout=5)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    print("\n✅ RAG MCP Server is running!")
except Exception as e:
    print(f"❌ Error connecting to RAG server: {e}")
    print("\nMake sure the server is running with: python mcp_rag_server.py")
