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
        self._cache: Dict[str, Dict[str, Any]] = {}
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

    def count_citations(self, text: str) -> Dict[str, int]:
        """Count citations by type."""
        all_cits = self.extract_all_citations(text)
        return {
            'total': sum(len(v) for v in all_cits.values()),
            'case_names': len(all_cits.get('case_names', [])),
            'ipc_sections': len(all_cits.get('ipc_sections', [])),
            'crpc_sections': len(all_cits.get('crpc_sections', [])),
            'articles': len(all_cits.get('articles', [])),
            'acts': len(all_cits.get('acts', []))
        }
    
    def extract_all_citations_comprehensive(self, text: str, doc_id: str | None = None) -> Dict[str, Any]:
        """
        Extends extract_all_citations with counts for EVERY tokenized word
        to support the specific 'Citation Finder' search logic.
        """
        if doc_id and doc_id in self._cache:
            return self._cache[doc_id]

        base = self.extract_all_citations(text)
        
        # Calculate counts for all unique tokens/phrases for the 'finder'
        counts = {}
        # Simple word-based counting for the search term logic
        words = re.findall(r'\w+', text.lower())
        for word in words:
            counts[word] = counts.get(word, 0) + 1
            
        # Also count the specific citations found
        for cat in base:
            if isinstance(base[cat], list):
                for cit in base[cat]:
                    counts[cit.lower()] = counts.get(cit.lower(), 0) + 1
        
        base['counts'] = counts
        
        if doc_id:
            self._cache[doc_id] = base
            
        return base

    def classify_citation_type(self, term: str) -> str:
        """Categorizes a search term into legal types"""
        t = term.lower()
        if "section" in t or re.match(r'u/s\s+\d+', t): return "Statute/Section"
        if "article" in t: return "Constitutional"
        if " v. " in t or " vs " in t: return "Case Law"
        if "act" in t: return "Legislation"
        return "Legal Term"

# Singleton instance
citation_extractor = CitationExtractor()
