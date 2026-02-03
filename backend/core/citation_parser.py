from __future__ import annotations

import re
from typing import List, Dict, Any


INDIAN_CITATION_PATTERNS = [
    # e.g. (2020) 3 SCC 123
    r"\(\d{4}\)\s*\d+\s*SCC\s*\d+",
    # e.g. AIR 1997 SC 3014
    r"AIR\s*\d{4}\s*SC\s*\d+",
    # e.g. 1994 Supp (3) SCC 256
    r"\d{4}\s*Supp\s*\(\d+\)\s*SCC\s*\d+",
]


def extract_citations(text: str) -> List[Dict[str, str]]:
    """
    Extremely lightweight citation parser for Indian case law citations.
    Returns a list of dicts for easy JSON serialization.
    """
    citations: List[Dict[str, str]] = []

    for pattern in INDIAN_CITATION_PATTERNS:
        for match in re.finditer(pattern, text):
            span = match.span()
            snippet_start = max(0, span[0] - 60)
            snippet_end = min(len(text), span[1] + 60)
            snippet = text[snippet_start:snippet_end].replace("\n", " ")
            citations.append(
                {
                    "text": match.group(0),
                    "context": snippet.strip(),
                }
            )

    # Deduplicate by citation text
    seen = set()
    unique: List[Dict[str, str]] = []
    for c in citations:
        if c["text"] not in seen:
            seen.add(c["text"])
            unique.append(c)
    return unique


def extract_all_citations_comprehensive(text: str) -> Dict[str, Any]:
    """
    Comprehensive citation extractor for legal documents.
    Extracts case names, sections, articles, and counts occurrences.
    """
    citations = {
        'case_names': [],
        'ipc_sections': [],
        'crpc_sections': [], 
        'articles': [],
        'acts': [],
        'counts': {},
        'pages': {}
    }
    
    # Case names pattern (more comprehensive)
    case_patterns = [
        r'\b[A-Z][a-zA-Z\s]{2,}v\.\s*[A-Z][a-zA-Z\s]{2,}',
        r'\b[A-Z][a-zA-Z\s]{2,}vs\.\s*[A-Z][a-zA-Z\s]{2,}',
        r'\b[A-Z][a-zA-Z\s]{2,}versus\s*[A-Z][a-zA-Z\s]{2,}'
    ]
    
    for pattern in case_patterns:
        cases = re.findall(pattern, text)
        citations['case_names'].extend([c.strip() for c in cases])
    
    # Remove duplicates and clean
    citations['case_names'] = list(set([c.strip(' .,') for c in citations['case_names'] if len(c.strip()) > 10]))
    
    # Sections patterns
    ipc_pattern = r'Section\s+\d+[A-Z]?\s+IPC'
    crpc_pattern = r'Section\s+\d+[A-Z]?\s+CrPC'
    citations['ipc_sections'] = list(set(re.findall(ipc_pattern, text)))
    citations['crpc_sections'] = list(set(re.findall(crpc_pattern, text)))
    
    # Articles pattern (more flexible)
    article_pattern = r'(?:Article|Art\.)\s+\d+[A-Z]*(?:\([^)]+\))?'
    citations['articles'] = list(set(re.findall(article_pattern, text)))
    
    # Acts pattern
    act_pattern = r'[A-Z][a-zA-Z\s]*(?:Act|Law),?\s*(?:\d{4})?'
    acts_found = re.findall(act_pattern, text)
    citations['acts'] = list(set([act.strip(' .,') for act in acts_found if len(act.strip()) > 10]))
    
    # Count occurrences for all items
    all_items = (
        citations['case_names'] + 
        citations['ipc_sections'] + 
        citations['crpc_sections'] + 
        citations['articles'] + 
        citations['acts']
    )
    
    for item in all_items:
        if item:  # Skip empty items
            count = len(re.findall(re.escape(item), text, re.IGNORECASE))
            citations['counts'][item] = count
    
    return citations


def classify_citation_type(term: str) -> str:
    """Classify citation type for search results"""
    if 'Article' in term or 'Art.' in term:
        return 'constitutional'
    elif 'Section' in term and 'IPC' in term:
        return 'ipc'
    elif 'Section' in term and 'CrPC' in term:
        return 'crpc'
    elif 'v.' in term or 'vs.' in term:
        return 'case_law'
    elif 'Act' in term:
        return 'legislation'
    return 'other'

