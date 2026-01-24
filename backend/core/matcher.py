
import json
import re
import numpy as np
from typing import List, Dict, Any

class CaseMatcher:
    def __init__(self, corpus_path: str, llm_engine):
        """
        Initialize the CaseMatcher with a corpus of past judgments.
        """
        self.llm_engine = llm_engine
        self.corpus: List[Dict[str, Any]] = []
        self.corpus_embeddings: Dict[str, np.ndarray] = {}
        
        # Load corpus
        try:
            with open(corpus_path, 'r', encoding='utf-8') as f:
                self.corpus = json.load(f)
            print(f"Loaded {len(self.corpus)} cases from corpus.")
            
            # Pre-compute embeddings for corpus
            self._embed_corpus()
            
        except Exception as e:
            print(f"Error loading corpus match data: {e}")
            self.corpus = []

    def _embed_corpus(self):
        """
        Generate embeddings for the corpus cases using the shared LLM engine's embedding model.
        """
        model = self.llm_engine._get_embedding_model()
        if not model:
            print("Embedding model not available for CaseMatcher.")
            return

        print("Generating embeddings for Case Matching Corpus...")
        for case in self.corpus:
            # Create a rich text representation for embedding
            # text = Title + Summary + Tags + Sections
            text_to_embed = f"{case.get('case_name', '')} {case.get('summary', '')} {' '.join(case.get('tags', []))} {' '.join(case.get('sections', []))}"
            
            embedding = model.encode(text_to_embed)
            self.corpus_embeddings[case['doc_id']] = embedding
        print("Corpus embeddings generated.")

    def extract_metadata_from_text(self, text: str) -> Dict[str, Any]:
        """
        Extract case metadata from the uploaded text using Regex and LLM.
        """
        # 1. Regex Extraction for Sections
        ipc_pattern = re.compile(r"Section\s+(\d+[A-Z]*)\s+of\s+the\s+Indian\s+Penal\s+Code", re.IGNORECASE)
        crpc_pattern = re.compile(r"Section\s+(\d+[A-Z]*)\s+of\s+the\s+Code\s+of\s+Criminal\s+Procedure", re.IGNORECASE)
        
        # Simple extraction (can be improved)
        ipc_matches = ["IPC " + m for m in set(re.findall(r"\bIPC\s+(\d+[A-Z]*)", text)) | set(ipc_pattern.findall(text))]
        crpc_matches = ["CrPC " + m for m in set(re.findall(r"\bCrPC\s+(\d+[A-Z]*)", text)) | set(crpc_pattern.findall(text))]
        
        sections = list(set(ipc_matches + crpc_matches))
        
        # 2. LLM Extraction for Case Type and Legal Issues
        # We'll use a fast prompt to get JSON
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are a legal expert. Extract the following from the text:
1. Case Type (e.g., Criminal Appeal, Civil Suit, Writ Petition)
2. Legal Issues (List of 2-3 key legal questions)
3. Key Facts (Brief 1 sentence)

Return ONLY JSON: {{ "case_type": "...", "legal_issues": ["..."], "key_facts": "..." }}<|eot_id|>
<|start_header_id|>user<|end_header_id|>
TEXT EXCERPT:
{text[:2000]}...<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>"""

        try:
            llm_response = self.llm_engine._call_llm(prompt, max_tokens=200)
            # Try to parse JSON
            start = llm_response.find('{')
            end = llm_response.rfind('}') + 1
            if start != -1 and end != -1:
                metadata = json.loads(llm_response[start:end])
            else:
                metadata = {"case_type": "Unknown", "legal_issues": [], "key_facts": ""}
        except Exception as e:
            print(f"LLM Metadata extraction failed: {e}")
            metadata = {"case_type": "Unknown", "legal_issues": [], "key_facts": ""}

        metadata["sections"] = sections
        return metadata

    def match_cases(self, target_text: str, target_metadata: Dict[str, Any], top_k: int = 5) -> List[Dict[str, Any]]:
        """
        Find similar cases from the corpus.
        """
        model = self.llm_engine._get_embedding_model()
        if not model or not self.corpus_embeddings:
            return []

        # Embed target
        text_to_embed = f"{target_metadata.get('key_facts', '')} {' '.join(target_metadata.get('legal_issues', []))} {' '.join(target_metadata.get('sections', []))}"
        # Fallback to raw text if metadata is sparse
        if len(text_to_embed) < 50:
            text_to_embed = target_text[:1000]

        target_embedding = model.encode(text_to_embed)

        scored_cases = []

        for case in self.corpus:
            doc_id = case['doc_id']
            corpus_emb = self.corpus_embeddings.get(doc_id)
            
            if corpus_emb is None:
                continue

            # 1. Cosine Similarity (70%)
            # Convert to float for safety
            sim = float(np.dot(target_embedding, corpus_emb) / (np.linalg.norm(target_embedding) * np.linalg.norm(corpus_emb) + 1e-9))
            
            # 2. Section Match Bonus (20%)
            uploaded_sections = set(target_metadata.get("sections", []))
            case_sections = set(case.get("sections", []))
            section_overlap = len(uploaded_sections.intersection(case_sections))
            section_bonus = min(section_overlap * 0.1, 0.2) # Max 20%
            
            # 3. Court/Type Bonus (10%)
            type_bonus = 0.05 if target_metadata.get("case_type", "").lower() in case.get("case_type", "").lower() else 0
            court_bonus = 0.05 if "Supreme Court" in case.get("court", "") else 0
            
            final_relevance = (sim * 0.7) + section_bonus + type_bonus + court_bonus
            final_relevance = min(max(final_relevance, 0), 0.99) # Cap at 99%

            scored_cases.append({
                **case,
                "relevance_score": round(final_relevance * 100)
            })

        # Sort by relevance
        scored_cases.sort(key=lambda x: x['relevance_score'], reverse=True)
        return scored_cases[:top_k]
