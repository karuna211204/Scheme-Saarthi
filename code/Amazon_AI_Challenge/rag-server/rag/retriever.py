"""
RAG Retriever for querying the knowledge base
Features:
- Google text-embedding-004 for semantic understanding (768-dim vectors)
- Appliance-specific filtering (washing machine, TV, AC)
- Query preprocessing and intelligent result formatting
- Smart extraction of key troubleshooting information
"""
from typing import List, Dict, Any
from db.chromadb_client import chromadb_client
import logging
import re

logger = logging.getLogger(__name__)


class KnowledgeRetriever:
    """
    Retrieve information from the knowledge base with semantic search.
    
    Uses Google text-embedding-004 for true semantic understanding.
    Automatically filters by appliance type when detected in queries.
    Understands natural language: 'clothes wet' → spinning/drainage issues.
    """
    
    # Mapping of appliance keywords to PDF source patterns
    APPLIANCE_MAP = {
        "washing machine": ["washing_maching.pdf"],  # Note: typo in original filename
        "washer": ["washing_maching.pdf"],
        "tv": ["lcd_colour_television.pdf", "zenith_z47lcd4f.pdf"],
        "television": ["lcd_colour_television.pdf", "zenith_z47lcd4f.pdf"],
        "lcd": ["lcd_colour_television.pdf", "zenith_z47lcd4f.pdf"],
        "air conditioner": ["c5e0f2.pdf"],
        "ac": ["c5e0f2.pdf"],
        "aircon": ["c5e0f2.pdf"],
    }
    
    def __init__(self):
        self.client = chromadb_client
    
    def _detect_appliance_type(self, query: str) -> List[str]:
        """Detect appliance type from query and return matching PDF sources"""
        query_lower = query.lower()
        
        for keyword, sources in self.APPLIANCE_MAP.items():
            if keyword in query_lower:
                logger.info(f"Detected appliance: '{keyword}' -> filtering for {sources}")
                return sources
        
        return []  # No specific appliance detected
    
    def _preprocess_query(self, query: str, query_type: str = "general") -> str:
        """Enhance query with relevant keywords based on type"""
        query = query.lower().strip()
        
        # Remove filler words
        filler_words = ["my", "the", "is", "are", "was", "were", "a", "an"]
        words = query.split()
        filtered = [w for w in words if w not in filler_words]
        query = " ".join(filtered)
        
        # Add context based on query type
        if query_type == "error_code":
            return f"error code {query} fault diagnosis solution fix repair steps troubleshoot"
        elif query_type == "symptom":
            return f"problem symptom {query} cause reason solution fix troubleshoot repair check"
        elif query_type == "spare_parts":
            return f"spare part component {query} part number price cost replacement"
        elif query_type == "sop":
            return f"policy procedure guideline rule {query} standard operating"
        
        return query
    
    def _extract_key_info(self, text: str) -> str:
        """Extract most relevant sentences from text"""
        sentences = re.split(r'[.!?]\s+', text)
        
        # Prioritize sentences with key technical terms
        key_terms = ["error", "code", "cause", "solution", "fix", "check", "replace", 
                     "problem", "issue", "step", "procedure", "warning", "note"]
        
        scored_sentences = []
        for sent in sentences:
            sent = sent.strip()
            if len(sent) < 20:  # Skip very short sentences
                continue
            
            score = sum(1 for term in key_terms if term in sent.lower())
            scored_sentences.append((score, sent))
        
        # Sort by score and take top sentences
        scored_sentences.sort(reverse=True, key=lambda x: x[0])
        top_sentences = [s[1] for s in scored_sentences[:5]]
        
        return ". ".join(top_sentences) if top_sentences else text[:600]
    
    def search_error_code(self, error_code: str) -> str:
        """
        Search for information about an error code
        Returns formatted troubleshooting information
        """
        # Detect appliance type if mentioned
        appliance_sources = self._detect_appliance_type(error_code)
        
        # Enhance query
        enhanced_query = self._preprocess_query(error_code, "error_code")
        
        logger.info(f"Enhanced query: '{enhanced_query}'")
        
        # Search with optional filtering
        if appliance_sources:
            all_docs = []
            all_metas = []
            for source in appliance_sources:
                results = self.client.search(
                    query=enhanced_query,
                    n_results=3,
                    filter_metadata={'source': source}
                )
                if results["documents"][0]:
                    all_docs.extend(results["documents"][0])
                    all_metas.extend(results["metadatas"][0])
            
            if not all_docs:
                return f"❌ No information found for error code '{error_code}' in {appliance_sources[0].replace('.pdf', '').replace('_', ' ')}.\n\n💡 Please check the manual or contact support."
            
            results = {"documents": [all_docs], "metadatas": [all_metas]}
        else:
            results = self.client.search(
                query=enhanced_query,
                n_results=5
            )
        
        if not results["documents"][0]:
            return f"❌ No information found for error code '{error_code}'. Please check the manual or contact support."
        
        # Format with extracted key information
        response_parts = [f"🚨 ERROR CODE: {error_code.upper()}\n"]
        response_parts.append("="*70)
        
        seen_content = set()
        result_count = 0
        
        for i, doc in enumerate(results["documents"][0]):
            metadata = results["metadatas"][0][i]
            source = metadata.get("source", "Unknown")
            page = metadata.get("page", "")
            
            # Skip short or duplicate content
            if len(doc.strip()) < 100:
                continue
            
            # Extract key info
            key_info = self._extract_key_info(doc)
            
            # Skip if we've seen similar content
            if key_info[:100] in seen_content:
                continue
            seen_content.add(key_info[:100])
            
            result_count += 1
            response_parts.append(f"\n📖 SOURCE {result_count}: {source} (Page {page})")
            response_parts.append("-"*70)
            response_parts.append(key_info)
            
            if result_count >= 3:  # Limit to 3 unique results
                break
        
        if result_count == 0:
            return f"❌ No detailed information found for error code '{error_code}'."
        
        response_parts.append("\n" + "="*70)
        return "\n".join(response_parts)
    
    def search_symptom(self, symptom_description: str) -> str:
        """
        Search for solutions based on symptom description
        """
        # Detect appliance type for filtering
        appliance_sources = self._detect_appliance_type(symptom_description)
        
        # Enhance query
        enhanced_query = self._preprocess_query(symptom_description, "symptom")
        
        logger.info(f"Enhanced query: '{enhanced_query}'")
        
        # Search with appliance filtering if detected
        if appliance_sources:
            # Try each source and combine results
            all_docs = []
            all_metas = []
            for source in appliance_sources:
                results = self.client.search(
                    query=enhanced_query,
                    n_results=5,
                    filter_metadata={'source': source}
                )
                if results["documents"][0]:
                    all_docs.extend(results["documents"][0])
                    all_metas.extend(results["metadatas"][0])
            
            if not all_docs:
                return f"❌ No troubleshooting information found for {appliance_sources[0].replace('.pdf', '').replace('_', ' ')}.\n\n💡 Try describing the problem differently."
            
            # Convert back to expected format
            results = {"documents": [all_docs], "metadatas": [all_metas]}
        else:
            # No appliance detected, search all
            results = self.client.search(
                query=enhanced_query,
                n_results=7  # Get more for better coverage
            )
        
        if not results["documents"][0]:
            return "❌ No relevant troubleshooting information found. Please describe the issue in more detail."
        
        # Format results with extracted key info
        response_parts = [f"🔧 TROUBLESHOOTING: {symptom_description}\n"]
        response_parts.append("="*70)
        
        seen_content = set()
        result_count = 0
        
        for i, doc in enumerate(results["documents"][0]):
            metadata = results["metadatas"][0][i]
            source = metadata.get("source", "Unknown")
            page = metadata.get("page", "")
            
            # Skip short content
            if len(doc.strip()) < 150:
                continue
            
            # Extract key troubleshooting info
            key_info = self._extract_key_info(doc)
            
            # Skip duplicates
            if key_info[:100] in seen_content:
                continue
            seen_content.add(key_info[:100])
            
            result_count += 1
            response_parts.append(f"\n💡 SOLUTION {result_count} - {source} (Page {page})")
            response_parts.append("-"*70)
            
            # Show up to 1000 chars of key info
            content = key_info[:1000] + "..." if len(key_info) > 1000 else key_info
            response_parts.append(content)
            
            if result_count >= 3:
                break
        
        if result_count == 0:
            return f"❌ No detailed troubleshooting steps found for: {symptom_description}\n\n💡 Try describing the problem differently or mention any error codes shown."
        
        response_parts.append("\n" + "="*70)
        return "\n".join(response_parts)
    
    def search_spare_parts(self, part_query: str) -> str:
        """
        Search for spare part information
        """
        enhanced_query = self._preprocess_query(part_query, "spare_parts")
        
        logger.info(f"Enhanced query: '{enhanced_query}'")
        
        results = self.client.search(
            query=enhanced_query,
            n_results=5
        )
        
        if not results["documents"][0]:
            return f"❌ No spare part information found for '{part_query}'."
        
        # Extract pricing and part number information
        response_parts = [f"💰 SPARE PARTS: {part_query}\n"]
        response_parts.append("="*70)
        
        found_info = False
        for i, doc in enumerate(results["documents"][0]):
            metadata = results["metadatas"][0][i]
            source = metadata.get("source", "Unknown")
            page = metadata.get("page", "")
            
            # Look for pricing or part number patterns
            has_price = "₹" in doc or "rs" in doc.lower() or "price" in doc.lower()
            has_part_num = "part" in doc.lower() and any(c.isdigit() for c in doc)
            
            if has_price or has_part_num:
                found_info = True
                response_parts.append(f"\n📦 {source} (Page {page})")
                response_parts.append("-"*70)
                
                # Extract relevant lines
                lines = doc.split('\n')
                relevant_lines = [l for l in lines if any(kw in l.lower() for kw in ["price", "cost", "part", "₹", "rs"])]
                
                if relevant_lines:
                    response_parts.append("\n".join(relevant_lines[:5]))
                else:
                    response_parts.append(doc[:400])
        
        if not found_info:
            response_parts.append(f"\n⚠️ No specific pricing found. Available information:\n")
            response_parts.append(results["documents"][0][0][:400] if results["documents"][0] else "No details available")
        
        response_parts.append("\n" + "="*70)
        response_parts.append("\n💡 TIP: For exact pricing and availability, contact our parts department.")
        
        return "\n".join(response_parts)
    
    def search_sop(self, query: str) -> str:
        """
        Search for Standard Operating Procedures
        """
        enhanced_query = self._preprocess_query(query, "sop")
        
        results = self.client.search(
            query=enhanced_query,
            n_results=3,
            filter_metadata={"document_type": "sop"}
        )
        
        if not results["documents"][0]:
            # Try without filter
            results = self.client.search(
                query=enhanced_query,
                n_results=3
            )
        
        if not results["documents"][0]:
            return f"❌ No policy/procedure found for: {query}"
        
        response_parts = [f"📋 POLICY/PROCEDURE: {query}\n"]
        response_parts.append("="*70)
        
        for i, doc in enumerate(results["documents"][0], 1):
            metadata = results["metadatas"][0][i-1]
            source = metadata.get("source", "Unknown")
            
            response_parts.append(f"\n{i}. {source}")
            response_parts.append("-"*70)
            response_parts.append(doc[:600] + "..." if len(doc) > 600 else doc)
        
        response_parts.append("\n" + "="*70)
        return "\n".join(response_parts)
    
    def general_search(self, query: str, n_results: int = 3) -> Dict[str, Any]:
        """
        General purpose search
        Returns raw results for custom processing
        """
        enhanced_query = self._preprocess_query(query)
        return self.client.search(enhanced_query, n_results=n_results)


# Global retriever instance
knowledge_retriever = KnowledgeRetriever()


def get_retriever() -> KnowledgeRetriever:
    """Get the global knowledge retriever"""
    return knowledge_retriever
