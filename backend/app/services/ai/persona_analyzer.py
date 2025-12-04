"""
Multi-Persona AI Analysis Service

Implements multiple AI personas that analyze fraud cases from different perspectives,
building consensus and identifying conflicts to improve decision accuracy.
"""

from typing import List, Dict, Any, Optional
from enum import Enum
from dataclasses import dataclass
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.ai.llm_service import LLMService
import asyncio
import json


class Persona(str, Enum):
    """AI analysis personas with different expertise and perspectives."""
    AUDITOR = "auditor"
    PROSECUTOR = "prosecutor"
    DEFENSE = "defense"
    FORENSIC = "forensic"
    PATTERN = "pattern"


@dataclass
class PersonaAnalysis:
    """Analysis result from a single persona."""
    persona: Persona
    confidence: float  # 0.0 to 1.0
    verdict: str  # fraud_detected, suspicious, clean, prosecutable, etc.
    reasoning: str
    key_evidence: List[str]
    concerns: List[str]
    recommendations: List[str]


@dataclass
class ConsensusResult:
    """Aggregated consensus from all personas."""
    consensus_score: float  # 0.0 to 1.0
    majority_verdict: str
    confidence_range: Dict[str, float]  # min, max, mean, median
    persona_analyses: Dict[str, PersonaAnalysis]
    conflicts: List[Dict[str, Any]]
    final_recommendation: str
    explanation: str


class PersonaPrompts:
    """System prompts for each AI persona."""
    
    AUDITOR = """You are a senior financial auditor with 20 years of experience in fraud detection.
Your role is to examine financial irregularities, compliance violations, and accounting anomalies.

Focus on:
- Transaction patterns and reconciliation discrepancies
- Unusual timing or sequencing of financial activities
- Compliance with accounting standards and regulations
- Internal control weaknesses

Provide your analysis in JSON format:
{
  "confidence": 0.0-1.0,
  "verdict": "fraud_detected|suspicious|compliance_issue|clean",
  "reasoning": "detailed explanation",
  "key_evidence": ["evidence 1", "evidence 2"],
  "concerns": ["concern 1", "concern 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}"""

    PROSECUTOR = """You are an experienced white-collar crime prosecutor evaluating prosecutability.
Your role is to assess whether the evidence is sufficient for criminal prosecution.

Focus on:
- Strength and admissibility of evidence
- Mens rea (criminal intent) indicators
- Chain of custody and evidence integrity
- Likelihood of conviction

Provide your analysis in JSON format:
{
  "confidence": 0.0-1.0,
  "verdict": "prosecutable|borderline|insufficient_evidence|not_criminal",
  "reasoning": "detailed legal assessment",
  "key_evidence": ["prosecutable evidence 1", "evidence 2"],
  "concerns": ["legal concern 1", "concern 2"],
  "recommendations": ["legal recommendation 1", "recommendation 2"]
}"""

    DEFENSE = """You are a defense attorney playing devil's advocate.
Your role is to identify weaknesses in the fraud allegation and alternative explanations.

Focus on:
- Gaps or weaknesses in the evidence
- Alternative innocent explanations
- Procedural errors or rights violations
- Burden of proof concerns

Provide your analysis in JSON format:
{
  "confidence": 0.0-1.0,
  "verdict": "strong_defense|reasonable_doubt|weak_defense|no_defense",
  "reasoning": "defense perspective",
  "key_evidence": ["exculpatory evidence 1", "evidence 2"],
  "concerns": ["prosecution weakness 1", "weakness 2"],
  "recommendations": ["defense strategy 1", "strategy 2"]
}"""

    FORENSIC = """You are a digital forensics expert specializing in document analysis and evidence authentication.
Your role is to verify authenticity and detect manipulation of digital evidence.

Focus on:
- Document metadata and EXIF analysis
- Signs of tampering or manipulation
- Digital signatures and timestamps
- Forensic artifacts and anomalies

Provide your analysis in JSON format:
{
  "confidence": 0.0-1.0,
  "verdict": "authentic|tampered|suspicious|inconclusive",
  "reasoning": "forensic findings",
  "key_evidence": ["forensic indicator 1", "indicator 2"],
  "concerns": ["authenticity concern 1", "concern 2"],
  "recommendations": ["forensic recommendation 1", "recommendation 2"]
}"""

    PATTERN = """You are a data scientist specializing in fraud pattern recognition and behavioral analysis.
Your role is to identify patterns, anomalies, and connections across cases.

Focus on:
- Statistical anomalies and outliers
- Network connections and relationships
- Behavioral patterns and red flags
- Historical fraud pattern matching

Provide your analysis in JSON format:
{
  "confidence": 0.0-1.0,
  "verdict": "pattern_match|anomaly_detected|normal|uncertain",
  "reasoning": "pattern analysis",
  "key_evidence": ["pattern indicator 1", "indicator 2"],
  "concerns": ["pattern concern 1", "concern 2"],
  "recommendations": ["pattern-based recommendation 1", "recommendation 2"]
}"""


class MultiPersonaAnalyzer:
    """Orchestrates multi-persona analysis of fraud cases."""
    
    def __init__(self):
        self.llm_service = LLMService()
        self.persona_prompts = {
            Persona.AUDITOR: PersonaPrompts.AUDITOR,
            Persona.PROSECUTOR: PersonaPrompts.PROSECUTOR,
            Persona.DEFENSE: PersonaPrompts.DEFENSE,
            Persona.FORENSIC: PersonaPrompts.FORENSIC,
            Persona.PATTERN: PersonaPrompts.PATTERN,
        }
    
    async def analyze_with_persona(
        self,
        persona: Persona,
        case_data: Dict[str, Any]
    ) -> PersonaAnalysis:
        """
        Analyze a case from a single persona's perspective.
        
        Args:
            persona: The AI persona to use
            case_data: Case information including evidence, transactions, etc.
        
        Returns:
            PersonaAnalysis with the persona's assessment
        """
        system_prompt = self.persona_prompts[persona]
        
        # Construct analysis request
        case_summary = self._format_case_data(case_data)
        user_message = f"""Analyze this fraud case:

{case_summary}

Provide your expert analysis following the JSON format specified."""
        
        messages = [HumanMessage(content=user_message)]
        
        # Get LLM response
        response = await self.llm_service.generate_response(messages, system_prompt)
        
        # Parse JSON response
        try:
            # Extract JSON from response (handle markdown code blocks)
            json_str = response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            
            analysis_data = json.loads(json_str)
            
            return PersonaAnalysis(
                persona=persona,
                confidence=analysis_data.get("confidence", 0.5),
                verdict=analysis_data.get("verdict", "uncertain"),
                reasoning=analysis_data.get("reasoning", ""),
                key_evidence=analysis_data.get("key_evidence", []),
                concerns=analysis_data.get("concerns", []),
                recommendations=analysis_data.get("recommendations", [])
            )
        except (json.JSONDecodeError, KeyError, IndexError) as e:
            # Fallback if JSON parsing fails
            return PersonaAnalysis(
                persona=persona,
                confidence=0.5,
                verdict="error",
                reasoning=f"Analysis parsing failed: {str(e)}. Raw response: {response[:200]}",
                key_evidence=[],
                concerns=["Failed to parse structured analysis"],
                recommendations=["Re-run analysis with clearer formatting"]
            )
    
    async def multi_persona_analysis(
        self,
        case_data: Dict[str, Any],
        personas: Optional[List[Persona]] = None
    ) -> ConsensusResult:
        """
        Run parallel analysis across multiple personas and build consensus.
        
        Args:
            case_data: Case information to analyze
            personas: List of personas to use (default: all)
        
        Returns:
            ConsensusResult with aggregated findings
        """
        if personas is None:
            personas = list(Persona)
        
        # Run analyses in parallel
        analysis_tasks = [
            self.analyze_with_persona(persona, case_data)
            for persona in personas
        ]
        
        persona_results = await asyncio.gather(*analysis_tasks)
        
        # Build consensus
        consensus = self._build_consensus(persona_results)
        
        return consensus
    
    def _build_consensus(self, analyses: List[PersonaAnalysis]) -> ConsensusResult:
        """
        Aggregate multiple persona analyses into consensus result.
        
        Args:
            analyses: List of PersonaAnalysis from different personas
        
        Returns:
            ConsensusResult with aggregated findings
        """
        # Calculate confidence statistics
        confidences = [a.confidence for a in analyses]
        confidence_range = {
            "min": min(confidences),
            "max": max(confidences),
            "mean": sum(confidences) / len(confidences),
            "median": sorted(confidences)[len(confidences) // 2]
        }
        
        # Determine majority verdict
        verdicts = [a.verdict for a in analyses]
        verdict_counts = {}
        for verdict in verdicts:
            verdict_counts[verdict] = verdict_counts.get(verdict, 0) + 1
        
        majority_verdict = max(verdict_counts.items(), key=lambda x: x[1])[0]
        
        # Calculate consensus score (penalize conflicts)
        max_count = verdict_counts[majority_verdict]
        consensus_score = (max_count / len(analyses)) * confidence_range["mean"]
        
        # Identify conflicts
        conflicts = []
        for i, analysis1 in enumerate(analyses):
            for analysis2 in analyses[i+1:]:
                if self._are_conflicting(analysis1, analysis2):
                    conflicts.append({
                        "personas": [analysis1.persona.value, analysis2.persona.value],
                        "verdicts": [analysis1.verdict, analysis2.verdict],
                        "explanation": f"{analysis1.persona.value} says {analysis1.verdict}, "
                                     f"but {analysis2.persona.value} says {analysis2.verdict}"
                    })
        
        # Generate final recommendation
        final_recommendation = self._generate_recommendation(
            analyses, majority_verdict, consensus_score, conflicts
        )
        
        # Create explanation
        explanation = self._generate_explanation(
            analyses, majority_verdict, consensus_score
        )
        
        # Build persona analyses dict
        persona_analyses = {
            a.persona.value: a for a in analyses
        }
        
        return ConsensusResult(
            consensus_score=consensus_score,
            majority_verdict=majority_verdict,
            confidence_range=confidence_range,
            persona_analyses=persona_analyses,
            conflicts=conflicts,
            final_recommendation=final_recommendation,
            explanation=explanation
        )
    
    def _are_conflicting(self, a1: PersonaAnalysis, a2: PersonaAnalysis) -> bool:
        """Check if two analyses have significant conflicts."""
        # Define conflicting verdict pairs
        conflicts = {
            ("fraud_detected", "clean"),
            ("fraud_detected", "not_criminal"),
            ("prosecutable", "strong_defense"),
            ("prosecutable", "insufficient_evidence"),
            ("tampered", "authentic"),
        }
        
        verdict_pair = (a1.verdict, a2.verdict)
        return verdict_pair in conflicts or tuple(reversed(verdict_pair)) in conflicts
    
    def _generate_recommendation(
        self,
        analyses: List[PersonaAnalysis],
        majority_verdict: str,
        consensus_score: float,
        conflicts: List[Dict[str, Any]]
    ) -> str:
        """Generate final recommendation based on consensus."""
        if consensus_score >= 0.8 and not conflicts:
            if majority_verdict in ["fraud_detected", "prosecutable"]:
                return "RECOMMEND_PROSECUTION"
            elif majority_verdict == "clean":
                return "CLOSE_CASE"
            else:
                return "ADDITIONAL_INVESTIGATION_RECOMMENDED"
        
        elif consensus_score >= 0.6:
            if conflicts:
                return "ESCALATE_FOR_REVIEW_CONFLICTS_DETECTED"
            else:
                return "MODERATE_CONFIDENCE_PROCEED_WITH_CAUTION"
        
        else:
            return "INSUFFICIENT_CONSENSUS_ADDITIONAL_ANALYSIS_NEEDED"
    
    def _generate_explanation(
        self,
        analyses: List[PersonaAnalysis],format
        majority_verdict: str,
        consensus_score: float
    ) -> str:
        """Generate human-readable explanation of the consensus."""
        persona_summaries = []
        for analysis in analyses:
            confidence_pct = int(analysis.confidence * 100)
            persona_summaries.append(
                f"- **{analysis.persona.value.title()}**: {analysis.verdict} "
                f"({confidence_pct}% confidence)"
            )
        
        summary_text = "\n".join(persona_summaries)
        consensus_pct = int(consensus_score * 100)
        
        return f"""**Multi-Persona Analysis Summary**

{summary_text}

**Majority Verdict**: {majority_verdict}
**Overall Consensus**: {consensus_pct}%

The analysis team has reviewed this case from multiple expert perspectives. 
The consensus score reflects both the agreement between personas and their 
individual confidence levels."""
    
    def _format_case_data(self, case_data: Dict[str, Any]) -> str:
        """Format case data for persona analysis."""
        sections = []
        
        if "case_id" in case_data:
            sections.append(f"**Case ID**: {case_data['case_id']}")
        
        if "subject" in case_data:
            sections.append(f"**Subject**: {case_data['subject']}")
        
        if "description" in case_data:
            sections.append(f"**Description**: {case_data['description']}")
        
        if "evidence" in case_data:
            evidence_list = case_data['evidence']
            if evidence_list:
                evidence_text = "\n".join(f"  - {ev}" for ev in evidence_list)
                sections.append(f"**Evidence**:\n{evidence_text}")
        
        if "transactions" in case_data:
            trans = case_data['transactions']
            if trans:
                sections.append(f"**Transactions**: {len(trans)} transactions analyzed")
                # Add sample or summary
                if len(trans) > 0:
                    sections.append(f"  Sample: {trans[0]}")
        
        if "risk_score" in case_data:
            sections.append(f"**Automated Risk Score**: {case_data['risk_score']}")
        
        if "indicators" in case_data:
            indicators = case_data['indicators']
            if indicators:
                ind_text = "\n".join(f"  - {ind}" for ind in indicators)
                sections.append(f"**Fraud Indicators**:\n{ind_text}")
        
        return "\n\n".join(sections)


# Singleton instance
_analyzer_instance = None

def get_persona_analyzer() -> MultiPersonaAnalyzer:
    """Get singleton instance of MultiPersonaAnalyzer."""
    global _analyzer_instance
    if _analyzer_instance is None:
        _analyzer_instance = MultiPersonaAnalyzer()
    return _analyzer_instance
