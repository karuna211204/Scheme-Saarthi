"""
Scheme Saarthi RAG MCP Server using FastMCP
Separate server for government scheme knowledge base queries

Features:
- Google text-embedding-004 for semantic understanding
- Multilingual scheme information (Hindi, Telugu, Tamil, English)
- Category-specific filtering (Agriculture, Education, Health, Housing, etc.)
- Eligibility criteria matching
- 1000+ government scheme documents
"""

from fastmcp import FastMCP
import os
from datetime import datetime
import json
from typing import Optional, List
import logging
from dotenv import load_dotenv
from starlette.responses import JSONResponse
import asyncio

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastMCP server
mcp = FastMCP("scheme-saarthi-rag-server")

# Import RAG components
from db.chromadb_client import chromadb_client
from rag.retriever import knowledge_retriever


# ========== Initialization Helper ==========
def _init_kb():
    logger.info("🚀 Initializing Scheme Saarthi RAG MCP Server...")
    chromadb_client.connect()
    stats = chromadb_client.get_collection_stats()
    logger.info(f"📚 Scheme knowledge base ready: {stats.get('count', 0)} documents")


# ========== Custom Routes ==========

@mcp.custom_route("/health", methods=["GET"])
async def health_check(request):
    """Health check endpoint"""
    stats = chromadb_client.get_collection_stats()
    return JSONResponse({
        "status": "healthy",
        "server": "scheme-saarthi-rag-server",
        "timestamp": datetime.now().isoformat(),
        "documents_count": stats.get('count', 0),
        "tools_available": [
            "search_scheme_knowledge",
            "search_scheme_by_category",
            "check_eligibility",
            "search_schemes_by_benefit",
            "get_scheme_knowledge"
        ]
    })


@mcp.custom_route("/", methods=["GET"])
async def root(request):
    """Root endpoint"""
    return JSONResponse({
        "message": "Scheme Saarthi RAG Server - Government Schemes Knowledge Base",
        "status": "running",
        "docs": "/docs"
    })


# ========== RAG MCP Tools ==========

@mcp.tool()
def search_scheme_knowledge(query: str, n_results: int = 5) -> str:
    """
    Search the government schemes knowledge base using natural language query.
    Use this for detailed scheme information from documents and policies.
    
    The system understands queries like: "schemes for farmers", "education scholarships", "housing for poor"
    
    Args:
        query: Search query describing what the citizen needs (e.g., "schemes for farmers with low income")
        n_results: Number of schemes to return (default 5)
    
    Returns:
        Detailed scheme information from government documents and knowledge base
    
    Examples:
        search_scheme_knowledge(query="schemes for farmers in Andhra Pradesh")
        search_scheme_knowledge(query="scholarships for SC/ST students")
        search_scheme_knowledge(query="pension schemes for senior citizens")
    """
    try:
        logger.info("="*60)
        logger.info("🔍 SCHEME SEARCH")
        logger.info(f"   Query: '{query}'")
        logger.info(f"   Max Results: {n_results}")
        logger.info("="*60)
        
        result = knowledge_retriever.search_symptom(query)
        
        result_length = len(result)
        
        logger.info("="*60)
        logger.info(f"✅ SCHEME SEARCH COMPLETE")
        logger.info(f"   Total characters returned: {result_length}")
        logger.info("")
        logger.info("📋 FULL RAG OUTPUT:")
        logger.info("-"*60)
        logger.info(result)
        logger.info("-"*60)
        logger.info("="*60)
        
        return result
        
    except Exception as e:
        logger.error("="*60)
        logger.error(f"❌ SCHEME SEARCH FAILED")
        logger.error(f"   Query: '{query}'")
        logger.error(f"   Error: {e}", exc_info=True)
        logger.error("="*60)
        return f"Error searching schemes: {str(e)}"


@mcp.tool()
def search_scheme_by_category(category: str, citizen_profile: str = "") -> str:
    """
    Search for schemes in a specific category with optional citizen profile for filtering.
    
    Categories: Agriculture, Education, Health, Housing, Employment, Social Welfare, 
                Women Empowerment, Senior Citizen, Financial Inclusion
    
    Args:
        category: Scheme category (e.g., "Agriculture", "Education", "Health")
        citizen_profile: Optional profile info (e.g., "age 45, farmer, SC category, income below 2 lakh")
    
    Returns:
        Schemes in the specified category matching the profile
    
    Examples:
        search_scheme_by_category(category="Agriculture", citizen_profile="small farmer, 2 acres")
        search_scheme_by_category(category="Education", citizen_profile="SC student, 10th pass")
        search_scheme_by_category(category="Health", citizen_profile="senior citizen, low income")
    """
    try:
        query = f"{category} schemes"
        if citizen_profile:
            query += f" for {citizen_profile}"
            
        logger.info("="*60)
        logger.info("📂 CATEGORY SEARCH")
        logger.info(f"   Category: {category}")
        logger.info(f"   Profile: {citizen_profile if citizen_profile else 'None'}")
        logger.info(f"   Full Query: '{query}'")
        logger.info("="*60)
        
        result = knowledge_retriever.search_symptom(query)
        
        result_length = len(result)
        
        logger.info("="*60)
        logger.info(f"✅ CATEGORY SEARCH COMPLETE")
        logger.info(f"   Category: {category}")
        logger.info(f"   Response length: {result_length} characters")
        logger.info("")
        logger.info("📋 FULL RAG OUTPUT:")
        logger.info("-"*60)
        logger.info(result)
        logger.info("-"*60)
        logger.info("="*60)
        
        return result
        
    except Exception as e:
        logger.error("="*60)
        logger.error(f"❌ CATEGORY SEARCH FAILED")
        logger.error(f"   Category: {category}")
        logger.error(f"   Error: {e}", exc_info=True)
        logger.error("="*60)
        return f"Error searching category: {str(e)}"


@mcp.tool()
def check_eligibility(scheme_name: str, citizen_profile: str) -> str:
    """
    Check if a citizen is eligible for a specific scheme based on their profile.
    
    Args:
        scheme_name: Name of the government scheme
        citizen_profile: Citizen details (age, occupation, income, category, location, etc.)
    
    Returns:
        Eligibility assessment with matching/missing criteria
    
    Example:
        check_eligibility(
            scheme_name="PM-KISAN", 
            citizen_profile="age 45, farmer, 2 acres land, income 1 lakh per year"
        )
    """
    try:
        query = f"{scheme_name} eligibility criteria for {citizen_profile}"
        
        logger.info("="*60)
        logger.info("✔️  ELIGIBILITY CHECK")
        logger.info(f"   Scheme: {scheme_name}")
        logger.info(f"   Profile: {citizen_profile}")
        logger.info("="*60)
        
        result = knowledge_retriever.search_symptom(query)
        
        result_length = len(result)
        
        logger.info("="*60)
        logger.info(f"✅ ELIGIBILITY CHECK COMPLETE")
        logger.info(f"   Scheme: {scheme_name}")
        logger.info(f"   Response length: {result_length} characters")
        logger.info("")
        logger.info("📋 FULL RAG OUTPUT:")
        logger.info("-"*60)
        logger.info(result)
        logger.info("-"*60)
        logger.info("="*60)
        
        return result
        
    except Exception as e:
        logger.error("="*60)
        logger.error(f"❌ ELIGIBILITY CHECK FAILED")
        logger.error(f"   Scheme: {scheme_name}")
        logger.error(f"   Error: {e}", exc_info=True)
        logger.error("="*60)
        return f"Error checking eligibility: {str(e)}"


@mcp.tool()
def search_schemes_by_benefit(benefit_type: str, min_amount: int = 0) -> str:
    """
    Search for schemes offering specific types of benefits above a certain amount.
    
    Benefit types: Cash Transfer, Subsidy, Loan, Insurance, In-kind, Training, etc.
    
    Args:
        benefit_type: Type of benefit (e.g., "Cash Transfer", "Subsidy", "Loan")
        min_amount: Minimum benefit amount in rupees (default 0)
    
    Returns:
        Schemes offering the specified benefit type
    
    Examples:
        search_schemes_by_benefit(benefit_type="Cash Transfer", min_amount=5000)
        search_schemes_by_benefit(benefit_type="Loan", min_amount=50000)
        search_schemes_by_benefit(benefit_type="Subsidy")
    """
    try:
        query = f"schemes providing {benefit_type}"
        if min_amount > 0:
            query += f" minimum {min_amount} rupees"
            
        logger.info("="*60)
        logger.info("💰 BENEFIT SEARCH")
        logger.info(f"   Benefit Type: {benefit_type}")
        logger.info(f"   Min Amount: ₹{min_amount}")
        logger.info("="*60)
        
        result = knowledge_retriever.search_symptom(query)
        
        result_length = len(result)
        
        logger.info("="*60)
        logger.info(f"✅ BENEFIT SEARCH COMPLETE")
        logger.info(f"   Response length: {result_length} characters")
        logger.info("="*60)
        
        return result
        
    except Exception as e:
        logger.error("="*60)
        logger.error(f"❌ BENEFIT SEARCH FAILED")
        logger.error(f"   Error: {e}", exc_info=True)
        logger.error("="*60)
        return f"Error searching benefits: {str(e)}"


@mcp.tool()
def get_scheme_knowledge(scheme_id_or_name: str) -> str:
    """
    Get detailed knowledge base information about a specific government scheme.
    Uses RAG (Retrieval Augmented Generation) to fetch comprehensive scheme details.
    
    Args:
        scheme_id_or_name: Scheme ID or name (e.g., "PM-KISAN", "Ayushman Bharat")
    
    Returns:
        Complete scheme details from knowledge base including benefits, eligibility, application process, documents
    
    Example:
        get_scheme_knowledge(scheme_id_or_name="PM-KISAN")
        get_scheme_knowledge(scheme_id_or_name="Pradhan Mantri Awas Yojana")
    """
    try:
        query = f"{scheme_id_or_name} complete details benefits eligibility documents application process"
        
        logger.info("="*60)
        logger.info("📄 SCHEME DETAILS")
        logger.info(f"   Scheme: {scheme_id_or_name}")
        logger.info("="*60)
        
        result = knowledge_retriever.search_symptom(query)
        
        result_length = len(result)
        
        logger.info("="*60)
        logger.info(f"✅ DETAILS RETRIEVED")
        logger.info(f"   Scheme: {scheme_id_or_name}")
        logger.info(f"   Response length: {result_length} characters")
        logger.info("")
        logger.info("📋 FULL RAG OUTPUT:")
        logger.info("-"*60)
        logger.info(result)
        logger.info("-"*60)
        logger.info("="*60)
        
        return result
        
    except Exception as e:
        logger.error("="*60)
        logger.error(f"❌ DETAILS RETRIEVAL FAILED")
        logger.error(f"   Scheme: {scheme_id_or_name}")
        logger.error(f"   Error: {e}", exc_info=True)
        logger.error("="*60)
        return f"Error getting scheme details: {str(e)}"


@mcp.tool()
def get_knowledge_base_stats() -> str:
    """
    Get statistics about the scheme knowledge base (document count, collection info).
    Useful for debugging or verifying knowledge base is loaded.
    
    Returns:
        JSON string with knowledge base statistics
    """
    try:
        stats = chromadb_client.get_collection_stats()
        logger.info(f"📊 Scheme knowledge base stats requested")
        return json.dumps(stats, indent=2)
        
    except Exception as e:
        logger.error(f"❌ Failed to get stats: {e}", exc_info=True)
        return json.dumps({"error": str(e)})


# ========== Server Entry Point ==========

if __name__ == "__main__":
    logger.info("🚀 Starting Scheme Saarthi RAG MCP Server...")
    _init_kb()
    
    # Get port from environment or default to 8002 (different from main MCP server)
    port = int(os.getenv("RAG_SERVER_PORT", "8002"))
    host = "0.0.0.0"
    
    logger.info(f"🌐 Starting SSE server on {host}:{port}")
    logger.info(f"📚 This server handles all government scheme knowledge base queries")
    
    # Run with SSE transport
    mcp.run(transport="sse", host=host, port=port)
