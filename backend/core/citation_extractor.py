"""
Smart Citation Extractor for NyayNeti

Extracts legal citations from text using regex patterns.
Supports:
- Case names (e.g., "Kesavananda v. State of Kerala")
- IPC sections (e.g., "Section 420 IPC")
- CrPC sections (e.g., "Section 438 CrPC")
- Constitutional Articles (e.g., "Article 21")
- Acts (e.g., "Indian Evidence Act, 1872")
- Year citations (e.g., "(2020) 5 SCC 123")
"""

import re
import logging
from typing import Dict, List, Any
from dataclasses import dataclass, field

logger = logging.getLogger("citation_extractor")


@dataclass
class Citation:
    """Represents a single citation found in text"""
    type: str
    value: str
    count: int = 1
    pages: List[int] = field(default_factory=list)
    positions: List[int] = field(default_factory=list)


class CitationExtractor:
    """
    Extract legal citations from text using regex patterns.
    """
    
    # Citation patterns for Indian legal documents
    PATTERNS = {
        'case_name': re.compile(
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+v\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',
            re.IGNORECASE
        ),
        'ipc_section': re.compile(
            r'Section\s+(\d+[A-Z]?)\s+(?:of\s+)?(?:the\s+)?I\.?P\.?C\.?',
            re.IGNORECASE
        ),
        'crpc_section': re.compile(
            r'Section\s+(\d+[A-Z]?)\s+(?:of\s+)?(?:the\s+)?Cr\.?P\.?C\.?',
            re.IGNORECASE
        ),
        'cpc_section': re.compile(
            r'Section\s+(\d+[A-Z]?)\s+(?:of\s+)?(?:the\s+)?C\.?P\.?C\.?',
            re.IGNORECASE
        ),
        'article': re.compile(
            r'Article\s+(\d+[A-Z]?)(?:\s+of\s+(?:the\s+)?Constitution)?',
            re.IGNORECASE
        ),
        'act': re.compile(
            r'([\w\s]+Act),?\s+(\d{4})',
            re.IGNORECASE
        ),
        'year_citation': re.compile(
            r'\((\d{4})\)\s+(\d+)\s+([A-Z]+)\s+(\d+)'
        ),
        'air_citation': re.compile(
            r'AIR\s+(\d{4})\s+([A-Z]+)\s+(\d+)',
            re.IGNORECASE
        ),
        'scc_citation': re.compile(
            r'\((\d{4})\)\s+(\d+)\s+SCC\s+(\d+)',
            re.IGNORECASE
        ),
    }
    
    def __init__(self):
        logger.info("Citation Extractor initialized")
    
    def extract_all_citations(self, text: str) -> Dict[str, List[str]]:
        """
        Extract all types of citations from text.
        
        Args:
            text: Document text to analyze
            
        Returns:
            Dict mapping citation types to lists of found citations
        """
        citations = {
            'case_names': [],
            'ipc_sections': [],
            'crpc_sections': [],
            'cpc_sections': [],
            'articles': [],
            'acts': [],
            'year_citations': [],
            'air_citations': [],
            'scc_citations': []
        }
        
        # Extract case names
        for match in self.PATTERNS['case_name'].finditer(text):
            case_name = f"{match.group(1)} v. {match.group(2)}"
            # Filter out common false positives
            if len(case_name) > 10 and case_name not in citations['case_names']:
                citations['case_names'].append(case_name)
        
        # Extract IPC sections
        for match in self.PATTERNS['ipc_section'].finditer(text):
            section = f"Section {match.group(1)} IPC"
            if section not in citations['ipc_sections']:
                citations['ipc_sections'].append(section)
        
        # Extract CrPC sections
        for match in self.PATTERNS['crpc_section'].finditer(text):
            section = f"Section {match.group(1)} CrPC"
            if section not in citations['crpc_sections']:
                citations['crpc_sections'].append(section)
        
        # Extract CPC sections
        for match in self.PATTERNS['cpc_section'].finditer(text):
            section = f"Section {match.group(1)} CPC"
            if section not in citations['cpc_sections']:
                citations['cpc_sections'].append(section)
        
        # Extract Constitutional Articles
        for match in self.PATTERNS['article'].finditer(text):
            article = f"Article {match.group(1)}"
            if article not in citations['articles']:
                citations['articles'].append(article)
        
        # Extract Acts
        for match in self.PATTERNS['act'].finditer(text):
            act_name = match.group(1).strip()
            year = match.group(2)
            # Filter out short names that might be false positives
            if len(act_name) > 5:
                act = f"{act_name}, {year}"
                if act not in citations['acts']:
                    citations['acts'].append(act)
        
        # Extract year citations (e.g., "(2020) 5 SCC 123")
        for match in self.PATTERNS['year_citation'].finditer(text):
            citation = f"({match.group(1)}) {match.group(2)} {match.group(3)} {match.group(4)}"
            if citation not in citations['year_citations']:
                citations['year_citations'].append(citation)
        
        # Extract AIR citations
        for match in self.PATTERNS['air_citation'].finditer(text):
            citation = f"AIR {match.group(1)} {match.group(2)} {match.group(3)}"
            if citation not in citations['air_citations']:
                citations['air_citations'].append(citation)
        
        # Extract SCC citations
        for match in self.PATTERNS['scc_citation'].finditer(text):
            citation = f"({match.group(1)}) {match.group(2)} SCC {match.group(3)}"
            if citation not in citations['scc_citations']:
                citations['scc_citations'].append(citation)
        
        return citations
    
    def find_citation_locations(self, text: str, citation: str) -> List[int]:
        """
        Find all character positions where citation appears.
        
        Args:
            text: Document text
            citation: Citation to search for
            
        Returns:
            List of character positions
        """
        locations = []
        start = 0
        citation_lower = citation.lower()
        text_lower = text.lower()
        
        while True:
            pos = text_lower.find(citation_lower, start)
            if pos == -1:
                break
            locations.append(pos)
            start = pos + len(citation)
        
        return locations
    
    def count_citations(self, text: str) -> Dict[str, int]:
        """
        Count how many times each citation type appears.
        
        Args:
            text: Document text
            
        Returns:
            Dict mapping citation types to counts
        """
        all_citations = self.extract_all_citations(text)
        return {
            citation_type: len(citation_list)
            for citation_type, citation_list in all_citations.items()
        }
    
    def get_total_citations(self, text: str) -> int:
        """Get total number of unique citations found."""
        all_citations = self.extract_all_citations(text)
        return sum(len(v) for v in all_citations.values())
    
    def search_documents_by_citation(
        self, 
        documents: List[Dict], 
        citation: str,
        citation_type: str = 'all'
    ) -> List[Dict]:
        """
        Search documents for a specific citation.
        
        Args:
            documents: List of documents with 'text' and metadata
            citation: Citation to search for
            citation_type: Type of citation ('all' for any type)
            
        Returns:
            List of matching documents with citation counts
        """
        results = []
        
        for doc in documents:
            text = doc.get('text', '')
            doc_citations = self.extract_all_citations(text)
            
            found = False
            count = 0
            
            if citation_type == 'all':
                # Search all citation types
                for cit_list in doc_citations.values():
                    for cit in cit_list:
                        if citation.lower() in cit.lower():
                            found = True
                            count = text.lower().count(citation.lower())
                            break
                    if found:
                        break
            else:
                # Search specific citation type
                type_map = {
                    'article': 'articles',
                    'ipc': 'ipc_sections',
                    'crpc': 'crpc_sections',
                    'case': 'case_names',
                    'act': 'acts'
                }
                search_key = type_map.get(citation_type, citation_type)
                if search_key in doc_citations:
                    for cit in doc_citations[search_key]:
                        if citation.lower() in cit.lower():
                            found = True
                            count = text.lower().count(citation.lower())
                            break
            
            if found:
                results.append({
                    'doc_id': doc.get('doc_id', 'unknown'),
                    'filename': doc.get('metadata', {}).get('filename', 'unknown'),
                    'count': count,
                    'all_citations': doc_citations
                })
        
        # Sort by count (most citations first)
        results.sort(key=lambda x: x['count'], reverse=True)
        
        return results


# Singleton instance
citation_extractor = CitationExtractor()
