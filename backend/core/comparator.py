
import re
import numpy as np
from typing import List, Dict, Any
from .citation_parser import extract_citations as basic_extract

class Comparator:
    def __init__(self, llm_engine):
        self.llm_engine = llm_engine

    def extract_legal_metadata(self, text: str) -> Dict[str, List[str]]:
        """Extract citations and key legal sections using patterns."""
        # Citation patterns
        patterns = {
            "articles": r"(?i)Article\s+\d+[A-Z]*",
            "sections": r"(?i)Section\s+\d+[A-Z]*",
            "ipc_sections": r"(?i)Section\s+\d+\s+of\s+(the\s+)?IPC",
            "constitution": r"(?i)Constitution\s+of\s+India",
            "cases": r"(?i)[A-Z][a-z]+\s+[vV][.]?\s+[A-Z][a-z]+"
        }
        
        results = {}
        for key, pattern in patterns.items():
            matches = re.finditer(pattern, text)
            results[key] = sorted(list(set(m.group(0) for m in matches)))
            
        # Also use the basic extract for SCC/AIR citations
        basic_cits = basic_extract(text)
        results["citations"] = [c["text"] for c in basic_cits]
        
        return results

    def compute_cosine_similarity(self, v1: np.ndarray, v2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors."""
        if v1 is None or v2 is None: return 0.0
        return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-8))

    def analyze_differences(self, doc1_data: Dict, doc2_data: Dict) -> str:
        """Use LLM to perform side-by-side analysis."""
        
        prompt = f"""<|begin_of_text|><|start_header_id|>system<|end_header_id|>
You are an Indian legal expert comparing two legal documents. 
Provide a structured analysis focusing on legal reasoning, citations, and outcomes.
<|eot_id|>
<|start_header_id|>user<|end_header_id|>
Please compare these two legal documents:

DOCUMENT 1:
{doc1_data['text'][:3000]}

DOCUMENT 2:
{doc2_data['text'][:3000]}

Analyze and provide:
1. Three key similarities (with references)
2. Three major differences (with legal significance)
3. Overall comparison summary (2-3 sentences)
4. Which document has stronger legal reasoning? (brief explanation)
<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>"""

        return self.llm_engine._call_llm(prompt, max_tokens=1000)

    def compare_documents(self, doc1_id: str, doc2_id: str, comp_type: str = "full") -> Dict[str, Any]:
        """Core logic to compare two indexed documents."""
        
        # 1. Load Data from Engine
        all_chunks = self.llm_engine._load_index()
        doc1_chunks = [ch for ch in all_chunks if ch.doc_id == doc1_id]
        doc2_chunks = [ch for ch in all_chunks if ch.doc_id == doc2_id]
        
        if not doc1_chunks or not doc2_chunks:
            return {"error": "One or both documents not found in index."}

        doc1_text = "\n".join(ch.text for ch in doc1_chunks)
        doc2_text = "\n".join(ch.text for ch in doc2_chunks)
        
        # 2. Extract Metadata
        meta1 = self.extract_legal_metadata(doc1_text)
        meta2 = self.extract_legal_metadata(doc2_text)
        
        common_citations = list(set(meta1["citations"]) & set(meta2["citations"]))
        unique1 = list(set(meta1["citations"]) - set(meta2["citations"]))
        unique2 = list(set(meta2["citations"]) - set(meta1["citations"]))
        
        # 3. Semantic Similarity
        # Calculate doc-level similarity (averaging first 5 chunk embeddings)
        v1 = np.mean([ch.embedding for ch in doc1_chunks[:5] if ch.embedding is not None], axis=0)
        v2 = np.mean([ch.embedding for ch in doc2_chunks[:5] if ch.embedding is not None], axis=0)
        overall_similarity = self.compute_cosine_similarity(v1, v2)

        # 4. Similar Chunks
        similarities = []
        if comp_type == "full":
            for c1 in doc1_chunks[:10]:
                for c2 in doc2_chunks[:10]:
                    score = self.compute_cosine_similarity(c1.embedding, c2.embedding)
                    if score > 0.8:
                        similarities.append({
                            "text": f"Semantic overlap found (Score: {score:.2f})",
                            "doc1_sample": c1.text[:100] + "...",
                            "doc2_sample": c2.text[:100] + "...",
                            "score": score
                        })

        # 5. AI Analysis
        ai_summary = ""
        if comp_type != "citations":
            ai_summary = self.analyze_differences(
                {"text": doc1_text}, 
                {"text": doc2_text}
            )

        return {
            "doc1_id": doc1_id,
            "doc2_id": doc2_id,
            "overall_similarity": overall_similarity,
            "common_citations": common_citations,
            "unique_to_doc1": unique1,
            "unique_to_doc2": unique2,
            "similar_segments": similarities[:5],
            "ai_analysis": ai_summary,
            "meta": {"doc1": meta1, "doc2": meta2}
        }
