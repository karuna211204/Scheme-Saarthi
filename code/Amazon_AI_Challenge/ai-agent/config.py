"""
Configuration settings for Scheme Saarthi AI Agent
"""
import os
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings using pydantic for validation"""
    
    # Google Cloud & AI
    google_api_key: str
    project_id: Optional[str] = None
    
    # MongoDB
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "schemesaarthi_db"
    
    # LiveKit
    livekit_url: Optional[str] = None
    livekit_api_key: Optional[str] = None
    livekit_api_secret: Optional[str] = None
    
    # ChromaDB
    chromadb_path: str = "./chromadb_data"
    
    # RAG Settings
    embedding_model: str = "models/text-embedding-004"
    chunk_size: int = 1000
    chunk_overlap: int = 200
    
    # MCP Server
    mcp_server_url: str = "http://localhost:8001/sse"
    rag_server_url: str = "http://localhost:8002/sse"
    rag_server_port: int = 8002
    
    # Google Sheets (removed - using MongoDB only)
    
    # WhatsApp (Optional)
    whatsapp_api_token: Optional[str] = None
    whatsapp_phone_id: Optional[str] = None
    
    # Business Logic
    visit_charge_amount: int = 300
    amc_annual_cost: int = 999
    warranty_days_threshold: int = 7  # Days before expiry to trigger sales call
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
