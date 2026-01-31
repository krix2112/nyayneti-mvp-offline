"""
Argument Strength Analyzer for NyayNeti

Analyzes legal documents and provides strength scoring with detailed breakdown:
- Citation Strength (40%)
- Argument Quality (30%)
- Evidence Support (20%)
- Legal Basis (10%)

Returns actionable recommendations for improvement.
"""

import re
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field

logger = logging.getLogger("strength_analyzer")


# Court hierarchy for scoring
COURT_SCORES = {
    'supreme court': 100,
    'constitutional bench': 95,
    'high court': 70,
    'district court': 40,
    'sessions court': 40,
    'magistrate': 30,
    'tribunal': 50,
    'commission': 45,
}

# Keywords indicating different evidence types
EVIDENCE_KEYWORDS = {
    'documentary': ['document', 'exhibit', 'annexure', 'certificate', 'record', 'letter', 'contract', 'agreement', 'deed'],
    'witness': ['witness', 'deponent', 'complainant', 'informant', 'eye witness', 'eyewitness', 'statement', 'deposition'],
    'expert': ['expert', 'specialist', 'medical report', 'forensic', 'technical opinion', 'valuation'],
    'material': ['material evidence', 'physical evidence', 'seized', 'recovered', 'weapon', 'substance'],
    'electronic': ['electronic', 'digital', 'cctv', 'video', 'audio', 'recording', 'email', 'message'],
}


@dataclass
class AnalysisResult:
    """Represents the analysis result for a document."""
    overall_score: int
    grade: str
    components: Dict[str, Any]
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[Dict[str, str]]
    analysis_time: float


class ArgumentStrengthAnalyzer:
    """
    Analyzes legal arguments and provides strength scoring.
    """
    
    def __init__(self, llm_engine=None):
        """
        Initialize analyzer.
        
        Args:
            llm_engine: Optional LLM engine for quality analysis
        """
        self.llm_engine = llm_engine
        logger.info("Argument Strength Analyzer initialized")
    
    def analyze_document(self, text: str, doc_metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Analyze a legal document and return strength score using AI.
        
        Args:
            text: Document text to analyze
            doc_metadata: Optional metadata about the document
            
        Returns:
            Complete analysis with scores, strengths, weaknesses, recommendations
        """
        start_time = datetime.now()
        
        try:
            if not self.llm_engine:
                raise ValueError("LLM Engine not initialized for Strength Analysis")

            # Extract a reasonable snippet if text is too long (LLM context limits)
            # We take the first 4000 chars and last 2000 chars for context
            analysis_text = text
            if len(text) > 8000:
                analysis_text = text[:5000] + "\n... [SNIP] ...\n" + text[-3000:]

            prompt = f"""### AI Legal Strength Analysis Task
System: You are a Senior Legal Analyst. Analyze the provided legal text and quantify its litigation strength.
Your response MUST be a valid JSON object.

Analysis Criteria:
1. Citation Strength (0-100): Quality and relevance of case laws and statutes cited.
2. Argument Quality (0-100): Logical flow, coherence, and persuasiveness of the reasoning.
3. Evidence Support (0-100): Robustness of documentary or witness evidence referenced.
4. Legal Basis (0-100): Accuracy of the statutory foundation (IPC, CrPC, etc.)

Document Text:
{analysis_text}

Output format (STRICT JSON):
{{
  "overall_score": <int 0-100>,
  "grade": "<string A-F or Excellent-Weak>",
  "components": {{
    "citation_strength": {{ "score": <int>, "summary": "<string>" }},
    "argument_quality": {{ "score": <int>, "summary": "<string>" }},
    "evidence_support": {{ "score": <int>, "summary": "<string>" }},
    "legal_basis": {{ "score": <int>, "summary": "<string>" }}
  }},
  "strengths": ["<string>", ...],
  "weaknesses": ["<string>", ...],
  "recommendations": [
    {{ "priority": "high|medium|low", "area": "<string>", "suggestion": "<string>" }},
    ...
  ]
}}

Analysis:"""

            logger.info("Starting LLM-based strength analysis...")
            raw_response = self.llm_engine._call_llm(prompt, max_tokens=1500, stream=False)
            
            # Clean up JSON response in case of markdown blocks
            json_str = raw_response.strip()
            if "```json" in json_str:
                json_str = json_str.split("```json")[1].split("```")[0].strip()
            elif "```" in json_str:
                json_str = json_str.split("```")[1].split("```")[0].strip()
            
            # Find the first { and last } to isolate JSON
            start_idx = json_str.find('{')
            end_idx = json_str.rfind('}')
            if start_idx != -1 and end_idx != -1:
                json_str = json_str[start_idx:end_idx+1]

            analysis_data = json.loads(json_str)
            
            analysis_time = (datetime.now() - start_time).total_seconds()
            analysis_data["analysis_time"] = round(analysis_time, 2)
            analysis_data["success"] = True
            
            # Log success
            logger.info(f"AI Analysis completed in {analysis_time}s with score {analysis_data.get('overall_score')}")
            
            return analysis_data
            
        except Exception as e:
            logger.error(f"AI Analysis failed: {e}", exc_info=True)
            # Fallback to heuristics if AI fails
            return self._analyze_via_heuristics(text, start_time)

    def _analyze_via_heuristics(self, text: str, start_time: datetime) -> Dict[str, Any]:
        """Fallback heuristic method if LLM fails."""
        try:
            # Extract citations from document
            citations = self._extract_citations(text)
            
            # Analyze each component
            citation_analysis = self._analyze_citations(text, citations)
            argument_analysis = self._analyze_argument_quality(text)
            evidence_analysis = self._analyze_evidence(text)
            legal_basis_analysis = self._analyze_legal_basis(text, citations)
            
            # Calculate overall score (weighted average)
            overall_score = int(
                citation_analysis['score'] * 0.40 +
                argument_analysis['score'] * 0.30 +
                evidence_analysis['score'] * 0.20 +
                legal_basis_analysis['score'] * 0.10
            )
            
            # Determine grade
            grade = self._get_grade(overall_score)
            
            # Generate insights
            strengths = self._identify_strengths(citation_analysis, argument_analysis, evidence_analysis, legal_basis_analysis)
            weaknesses = self._identify_weaknesses(citation_analysis, argument_analysis, evidence_analysis, legal_basis_analysis)
            recommendations = self._generate_recommendations(citation_analysis, argument_analysis, evidence_analysis, legal_basis_analysis)
            
            analysis_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "success": True,
                "overall_score": overall_score,
                "grade": grade,
                "components": {
                    "citation_strength": citation_analysis,
                    "argument_quality": argument_analysis,
                    "evidence_support": evidence_analysis,
                    "legal_basis": legal_basis_analysis
                },
                "strengths": strengths,
                "weaknesses": weaknesses,
                "recommendations": recommendations,
                "analysis_time": round(analysis_time, 2),
                "is_fallback": True
            }
        except Exception as e:
            logger.error(f"Heuristic fallback also failed: {e}")
            return {"success": False, "error": str(e)}
    
    def _extract_citations(self, text: str) -> Dict[str, List[str]]:
        """Extract all citations from text."""
        citations = {
            'cases': [],
            'sections': [],
            'articles': [],
            'acts': []
        }
        
        # Case name pattern
        case_pattern = re.compile(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+v\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', re.IGNORECASE)
        for match in case_pattern.finditer(text):
            case = f"{match.group(1)} v. {match.group(2)}"
            if len(case) > 10 and case not in citations['cases']:
                citations['cases'].append(case)
        
        # Section pattern
        section_pattern = re.compile(r'Section\s+(\d+[A-Z]?)\s+(?:of\s+)?(?:the\s+)?(\w+)', re.IGNORECASE)
        for match in section_pattern.finditer(text):
            section = f"Section {match.group(1)} {match.group(2)}"
            if section not in citations['sections']:
                citations['sections'].append(section)
        
        # Article pattern
        article_pattern = re.compile(r'Article\s+(\d+[A-Z]?)', re.IGNORECASE)
        for match in article_pattern.finditer(text):
            article = f"Article {match.group(1)}"
            if article not in citations['articles']:
                citations['articles'].append(article)
        
        # Act pattern
        act_pattern = re.compile(r'([\w\s]+Act),?\s+(\d{4})', re.IGNORECASE)
        for match in act_pattern.finditer(text):
            act = f"{match.group(1).strip()}, {match.group(2)}"
            if len(match.group(1).strip()) > 5 and act not in citations['acts']:
                citations['acts'].append(act)
        
        return citations
    
    def _analyze_citations(self, text: str, citations: Dict[str, List[str]]) -> Dict[str, Any]:
        """Analyze citation strength."""
        score = 50  # Base score
        details = []
        
        total_citations = sum(len(v) for v in citations.values())
        
        if total_citations == 0:
            return {
                'score': 30,
                'details': [],
                'total_citations': 0,
                'summary': 'No citations found'
            }
        
        # Score based on number of cases cited
        case_count = len(citations['cases'])
        if case_count >= 5:
            score += 20
        elif case_count >= 3:
            score += 15
        elif case_count >= 1:
            score += 10
        
        # Check for Supreme Court citations
        sc_pattern = re.compile(r'supreme\s*court|scc|scr|air\s+sc', re.IGNORECASE)
        sc_citations = sum(1 for case in citations['cases'] if sc_pattern.search(text[text.lower().find(case.lower()):text.lower().find(case.lower())+200] if case.lower() in text.lower() else ''))
        
        if sc_citations >= 3:
            score += 15
            details.append({'type': 'Supreme Court', 'count': sc_citations, 'impact': 'Very Strong'})
        elif sc_citations >= 1:
            score += 10
            details.append({'type': 'Supreme Court', 'count': sc_citations, 'impact': 'Strong'})
        
        # Check for High Court citations
        hc_pattern = re.compile(r'high\s*court', re.IGNORECASE)
        hc_count = len(hc_pattern.findall(text))
        if hc_count >= 3:
            score += 10
            details.append({'type': 'High Court', 'count': hc_count, 'impact': 'Moderate'})
        elif hc_count >= 1:
            score += 5
            details.append({'type': 'High Court', 'count': hc_count, 'impact': 'Supporting'})
        
        # Check for recent citations (year mentions)
        year_pattern = re.compile(r'\b(20[12][0-9]|2024|2025)\b')
        recent_years = year_pattern.findall(text)
        recent_count = len(recent_years)
        
        if recent_count >= 5:
            score += 10
            details.append({'type': 'Recent Cases (2020+)', 'count': recent_count, 'impact': 'Current'})
        elif recent_count >= 2:
            score += 5
        
        # Cap score at 100
        score = min(score, 100)
        
        return {
            'score': score,
            'details': details,
            'total_citations': total_citations,
            'cases_cited': len(citations['cases']),
            'sections_cited': len(citations['sections']),
            'articles_cited': len(citations['articles']),
            'summary': f"Found {total_citations} citations including {len(citations['cases'])} cases"
        }
    
    def _analyze_argument_quality(self, text: str) -> Dict[str, Any]:
        """Analyze argument quality."""
        score = 50  # Base score
        breakdown = {}
        
        # Check for logical structure indicators
        structure_keywords = ['therefore', 'hence', 'thus', 'consequently', 'accordingly', 
                            'in view of', 'considering', 'as established', 'it follows']
        structure_count = sum(1 for kw in structure_keywords if kw.lower() in text.lower())
        
        if structure_count >= 5:
            breakdown['logical_coherence'] = 85
            score += 15
        elif structure_count >= 3:
            breakdown['logical_coherence'] = 70
            score += 10
        else:
            breakdown['logical_coherence'] = 55
            score += 5
        
        # Check for legal reasoning
        reasoning_keywords = ['as held in', 'ratio decidendi', 'obiter dicta', 'precedent', 
                            'binding', 'applicable', 'distinguishable', 'analogy']
        reasoning_count = sum(1 for kw in reasoning_keywords if kw.lower() in text.lower())
        
        if reasoning_count >= 4:
            breakdown['legal_reasoning'] = 85
            score += 15
        elif reasoning_count >= 2:
            breakdown['legal_reasoning'] = 70
            score += 10
        else:
            breakdown['legal_reasoning'] = 55
            score += 5
        
        # Check for completeness (sections present)
        sections = ['facts', 'grounds', 'prayer', 'relief', 'conclusion', 'submission']
        sections_found = sum(1 for s in sections if s.lower() in text.lower())
        
        if sections_found >= 4:
            breakdown['completeness'] = 85
            score += 10
        elif sections_found >= 2:
            breakdown['completeness'] = 65
            score += 5
        else:
            breakdown['completeness'] = 50
        
        # Check for counter-argument anticipation
        counter_keywords = ['prosecution may argue', 'it may be contended', 'notwithstanding', 
                          'even if', 'without prejudice', 'in the alternative']
        counter_count = sum(1 for kw in counter_keywords if kw.lower() in text.lower())
        
        if counter_count >= 2:
            breakdown['counter_arguments'] = 80
            score += 10
        elif counter_count >= 1:
            breakdown['counter_arguments'] = 65
            score += 5
        else:
            breakdown['counter_arguments'] = 45
        
        # Cap score
        score = min(score, 100)
        
        return {
            'score': score,
            'breakdown': breakdown,
            'summary': 'Good' if score >= 70 else 'Needs improvement'
        }
    
    def _analyze_evidence(self, text: str) -> Dict[str, Any]:
        """Analyze evidence support."""
        evidence_types = {}
        total_evidence = 0
        
        for evidence_type, keywords in EVIDENCE_KEYWORDS.items():
            count = sum(1 for kw in keywords if kw.lower() in text.lower())
            evidence_types[evidence_type] = count
            total_evidence += count
        
        # Calculate score based on evidence diversity and quantity
        score = 30  # Base score
        
        types_present = sum(1 for count in evidence_types.values() if count > 0)
        
        if types_present >= 4:
            score += 40
        elif types_present >= 3:
            score += 30
        elif types_present >= 2:
            score += 20
        elif types_present >= 1:
            score += 10
        
        # Bonus for quantity
        if total_evidence >= 15:
            score += 20
        elif total_evidence >= 10:
            score += 15
        elif total_evidence >= 5:
            score += 10
        
        score = min(score, 100)
        
        return {
            'score': score,
            'evidence_types': evidence_types,
            'total_pieces': total_evidence,
            'types_present': types_present,
            'summary': f"{types_present} types of evidence referenced"
        }
    
    def _analyze_legal_basis(self, text: str, citations: Dict[str, List[str]]) -> Dict[str, Any]:
        """Analyze legal basis."""
        score = 40  # Base score
        
        # Check for sections cited
        sections_count = len(citations.get('sections', []))
        if sections_count >= 5:
            score += 25
        elif sections_count >= 3:
            score += 20
        elif sections_count >= 1:
            score += 10
        
        # Check for articles cited
        articles_count = len(citations.get('articles', []))
        if articles_count >= 3:
            score += 20
        elif articles_count >= 1:
            score += 10
        
        # Check for acts cited
        acts_count = len(citations.get('acts', []))
        if acts_count >= 3:
            score += 15
        elif acts_count >= 1:
            score += 10
        
        score = min(score, 100)
        
        return {
            'score': score,
            'sections_cited': sections_count,
            'articles_cited': articles_count,
            'acts_cited': acts_count,
            'summary': f"Legal foundation based on {sections_count} sections, {articles_count} articles"
        }
    
    def _get_grade(self, score: int) -> str:
        """Convert score to grade."""
        if score >= 90:
            return "Excellent"
        elif score >= 80:
            return "Very Strong"
        elif score >= 70:
            return "Strong"
        elif score >= 60:
            return "Good"
        elif score >= 50:
            return "Moderate"
        elif score >= 40:
            return "Needs Work"
        else:
            return "Weak"
    
    def _identify_strengths(self, citation: Dict, argument: Dict, evidence: Dict, legal: Dict) -> List[str]:
        """Identify document strengths."""
        strengths = []
        
        if citation['score'] >= 70:
            strengths.append(f"Strong citation base with {citation.get('cases_cited', 0)} cases cited")
        
        if citation.get('details'):
            for detail in citation['details']:
                if detail.get('impact') in ['Very Strong', 'Strong']:
                    strengths.append(f"{detail['type']} precedents cited ({detail['count']} references)")
        
        if argument['score'] >= 70:
            strengths.append("Well-structured legal reasoning")
        
        if argument.get('breakdown', {}).get('counter_arguments', 0) >= 65:
            strengths.append("Anticipates counter-arguments effectively")
        
        if evidence['score'] >= 70:
            strengths.append(f"Diverse evidence support ({evidence.get('types_present', 0)} types)")
        
        if legal['score'] >= 70:
            strengths.append("Solid legal foundation with proper statutory basis")
        
        return strengths if strengths else ["Document has basic legal structure"]
    
    def _identify_weaknesses(self, citation: Dict, argument: Dict, evidence: Dict, legal: Dict) -> List[str]:
        """Identify document weaknesses."""
        weaknesses = []
        
        if citation['score'] < 60:
            if citation.get('total_citations', 0) < 3:
                weaknesses.append("Limited case law citations - consider adding more precedents")
            else:
                weaknesses.append("Citation quality could be improved with higher court decisions")
        
        if argument['score'] < 60:
            breakdown = argument.get('breakdown', {})
            if breakdown.get('logical_coherence', 0) < 60:
                weaknesses.append("Logical flow could be strengthened")
            if breakdown.get('counter_arguments', 0) < 60:
                weaknesses.append("Missing anticipation of counter-arguments")
        
        if evidence['score'] < 60:
            types = evidence.get('evidence_types', {})
            if types.get('expert', 0) == 0:
                weaknesses.append("No expert testimony or opinion referenced")
            if types.get('documentary', 0) < 2:
                weaknesses.append("Limited documentary evidence")
        
        if legal['score'] < 60:
            if legal.get('sections_cited', 0) < 2:
                weaknesses.append("Insufficient statutory provisions cited")
        
        return weaknesses if weaknesses else ["No significant weaknesses identified"]
    
    def _generate_recommendations(self, citation: Dict, argument: Dict, evidence: Dict, legal: Dict) -> List[Dict[str, str]]:
        """Generate actionable recommendations."""
        recommendations = []
        
        # Citation recommendations
        if citation['score'] < 70:
            recommendations.append({
                'priority': 'high',
                'area': 'Citations',
                'suggestion': 'Add Supreme Court precedents directly on point to strengthen your argument'
            })
        
        if citation.get('total_citations', 0) < 5:
            recommendations.append({
                'priority': 'medium',
                'area': 'Citations',
                'suggestion': 'Include more recent case law (2020-2025) for contemporary legal support'
            })
        
        # Argument recommendations
        if argument.get('breakdown', {}).get('counter_arguments', 0) < 60:
            recommendations.append({
                'priority': 'high',
                'area': 'Arguments',
                'suggestion': 'Anticipate and address potential counter-arguments from the opposing side'
            })
        
        if argument.get('breakdown', {}).get('logical_coherence', 0) < 70:
            recommendations.append({
                'priority': 'medium',
                'area': 'Structure',
                'suggestion': 'Use transitional phrases (therefore, hence, accordingly) to improve logical flow'
            })
        
        # Evidence recommendations
        if evidence.get('evidence_types', {}).get('expert', 0) == 0:
            recommendations.append({
                'priority': 'medium',
                'area': 'Evidence',
                'suggestion': 'Consider including expert opinion or testimony to support technical claims'
            })
        
        if evidence['score'] < 60:
            recommendations.append({
                'priority': 'medium',
                'area': 'Evidence',
                'suggestion': 'Reference more documentary evidence and attach relevant exhibits'
            })
        
        # Legal basis recommendations
        if legal.get('articles_cited', 0) == 0:
            recommendations.append({
                'priority': 'low',
                'area': 'Constitutional',
                'suggestion': 'Consider citing relevant Constitutional Articles if applicable'
            })
        
        return recommendations[:5]  # Return top 5 recommendations


# Create singleton instance
strength_analyzer = None

def get_strength_analyzer(llm_engine=None) -> ArgumentStrengthAnalyzer:
    """Get or create analyzer instance."""
    global strength_analyzer
    if strength_analyzer is None:
        strength_analyzer = ArgumentStrengthAnalyzer(llm_engine=llm_engine)
    elif llm_engine and strength_analyzer.llm_engine is None:
        strength_analyzer.llm_engine = llm_engine
    return strength_analyzer
