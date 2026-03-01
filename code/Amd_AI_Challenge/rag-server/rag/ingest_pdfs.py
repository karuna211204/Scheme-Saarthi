"""
PDF Ingestion Pipeline for RAG Knowledge Base
Processes service manuals and SOPs into ChromaDB
"""
from pypdf import PdfReader
from pathlib import Path
from typing import List, Dict, Any
import logging
from db.chromadb_client import chromadb_client
import hashlib

logger = logging.getLogger(__name__)


class PDFIngester:
    """Ingest PDF documents into the vector database"""
    
    def __init__(self, chunk_size: int = 1500, chunk_overlap: int = 300):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def extract_text_from_pdf(self, pdf_path: Path) -> List[Dict[str, Any]]:
        """
        Extract text from PDF with page metadata
        Returns list of {page_num, text, metadata}
        """
        try:
            reader = PdfReader(str(pdf_path))
            pages_data = []
            
            for page_num, page in enumerate(reader.pages, start=1):
                text = page.extract_text()
                
                # Clean the text - remove common junk
                text = self._clean_text(text)
                
                if text.strip() and len(text.strip()) > 50:  # Only add pages with meaningful content
                    pages_data.append({
                        "page_num": page_num,
                        "text": text,
                        "source": pdf_path.name
                    })
            
            logger.info(f"✅ Extracted {len(pages_data)} pages from {pdf_path.name}")
            return pages_data
            
        except Exception as e:
            logger.error(f"❌ Failed to extract from {pdf_path}: {e}")
            return []
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text from common junk"""
        # Remove common footer/header junk
        junk_phrases = [
            "Downloaded from www.Manualslib.com manuals search engine",
            "Downloaded from",
            "www.Manualslib.com",
            "manuals search engine"
        ]
        
        for phrase in junk_phrases:
            text = text.replace(phrase, "")
        
        # Remove excessive whitespace
        import re
        text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)  # Max 2 newlines
        text = re.sub(r' +', ' ', text)  # Multiple spaces to single space
        
        return text.strip()
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks with smart boundaries
        """
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + self.chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary for better context
            if end < text_length:
                # Look for sentence endings
                last_period = chunk.rfind('. ')
                last_newline = chunk.rfind('\n\n')
                break_point = max(last_period, last_newline)
                
                # Only break if we're past 60% of chunk size
                if break_point > self.chunk_size * 0.6:
                    chunk = chunk[:break_point + 1]
                    end = start + break_point + 1
            
            chunk = chunk.strip()
            
            # Only add chunks with meaningful content (not just whitespace/junk)
            if len(chunk) > 100:  # Minimum 100 chars for meaningful content
                chunks.append(chunk)
            
            start = end - self.chunk_overlap
        
        return chunks
    
    def process_pdf(self, pdf_path: Path) -> List[Dict[str, Any]]:
        """
        Process a single PDF into chunks with metadata
        Returns list of {text, metadata, id}
        """
        pages_data = self.extract_text_from_pdf(pdf_path)
        
        all_chunks = []
        for page_data in pages_data:
            chunks = self.chunk_text(page_data["text"])
            
            for chunk_idx, chunk in enumerate(chunks):
                # Generate unique ID
                chunk_id = hashlib.md5(
                    f"{pdf_path.name}-{page_data['page_num']}-{chunk_idx}".encode()
                ).hexdigest()
                
                all_chunks.append({
                    "text": chunk,
                    "metadata": {
                        "source": pdf_path.name,
                        "page": page_data["page_num"],
                        "chunk_index": chunk_idx,
                        "document_type": self._infer_doc_type(pdf_path.name)
                    },
                    "id": chunk_id
                })
        
        logger.info(f"📄 Created {len(all_chunks)} chunks from {pdf_path.name}")
        return all_chunks
    
    def _infer_doc_type(self, filename: str) -> str:
        """Infer document type from filename"""
        filename_lower = filename.lower()
        
        if "washing" in filename_lower or "machine" in filename_lower:
            return "washing_machine_manual"
        elif "tv" in filename_lower or "television" in filename_lower or "lcd" in filename_lower:
            return "tv_manual"
        elif "sop" in filename_lower or "procedure" in filename_lower:
            return "sop"
        else:
            return "manual"
    
    def ingest_directory(self, directory: Path):
        """Ingest all PDFs from a directory"""
        pdf_files = list(directory.glob("*.pdf"))
        
        if not pdf_files:
            logger.warning(f"⚠️ No PDF files found in {directory}")
            return
        
        logger.info(f"📂 Found {len(pdf_files)} PDF files to process")
        
        all_documents = []
        all_metadatas = []
        all_ids = []
        
        for pdf_path in pdf_files:
            logger.info(f"Processing: {pdf_path.name}")
            chunks = self.process_pdf(pdf_path)
            
            for chunk in chunks:
                all_documents.append(chunk["text"])
                all_metadatas.append(chunk["metadata"])
                all_ids.append(chunk["id"])
        
        # Add to ChromaDB
        if all_documents:
            chromadb_client.add_documents(
                documents=all_documents,
                metadatas=all_metadatas,
                ids=all_ids
            )
            logger.info(f"✅ Successfully ingested {len(all_documents)} chunks into ChromaDB")
        else:
            logger.warning("⚠️ No documents to ingest")


def ingest_knowledge_base():
    """Main function to ingest the knowledge base"""
    # Get the knowledge_base directory
    knowledge_base_dir = Path(__file__).parent.parent / "knowledge_base"
    
    # Also check root directory for PDFs
    root_dir = Path(__file__).parent.parent.parent
    
    ingester = PDFIngester(chunk_size=1500, chunk_overlap=300)
    
    # Ingest from knowledge_base directory
    if knowledge_base_dir.exists():
        logger.info(f"📂 Ingesting from: {knowledge_base_dir}")
        ingester.ingest_directory(knowledge_base_dir)
    
    # Ingest from root directory (where your PDFs currently are)
    logger.info(f"📂 Ingesting from root: {root_dir}")
    for pdf_file in root_dir.glob("*.pdf"):
        logger.info(f"Processing: {pdf_file.name}")
        chunks = ingester.process_pdf(pdf_file)
        
        if chunks:
            documents = [c["text"] for c in chunks]
            metadatas = [c["metadata"] for c in chunks]
            ids = [c["id"] for c in chunks]
            
            chromadb_client.add_documents(
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
    
    # Print stats
    stats = chromadb_client.get_collection_stats()
    logger.info(f"📊 Final ChromaDB stats: {stats}")


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    # Initialize ChromaDB
    chromadb_client.connect()
    
    # Ingest PDFs
    ingest_knowledge_base()
    
    # Test search
    print("\n" + "="*60)
    print("🔍 Testing Search...")
    print("="*60)
    
    test_query = "error code E4 drainage"
    results = chromadb_client.search(test_query, n_results=2)
    
    if results["documents"][0]:
        print(f"\nQuery: '{test_query}'")
        print("\nTop Result:")
        print(results["documents"][0][0][:500])
        print(f"\nSource: {results['metadatas'][0][0]}")
    else:
        print("No results found")
