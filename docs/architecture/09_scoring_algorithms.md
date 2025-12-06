# Scoring Algorithms Specification

## 1. Evidence Quality Scoring
**Purpose:** Rate evidence strength for legal admissibility and fraud detection confidence.

### Scoring Dimensions (0-100)
- **Authenticity (30%):** Detects manipulation (ELA, cloning, metadata tampering).
- **Completeness (20%):** Checks for required fields (Vendor, Date, Amount).
- **Chain of Custody (25%):** Verifies upload integrity, access logs, and hash chains.
- **Metadata Integrity (15%):** Checks EXIF presence, timestamp consistency, and GPS.
- **Legal Admissibility (10%):** Verifies consent, preservation, and GDPR compliance.

### Algorithm
```python
def calculate_overall_evidence_score(evidence):
    weights = {
        "authenticity": 0.30,
        "completeness": 0.20,
        "chain_of_custody": 0.25,
        "metadata_integrity": 0.15,
        "legal_admissibility": 0.10
    }
    # ... implementation details ...
    return weighted_average
```

## 2. Expense-Transaction Matching
**Purpose:** Calculate confidence that an expense claim matches a bank transaction.

### Matching Dimensions (0-1)
- **Amount Match (35%):** Exact match = 1.0, <1% diff = 0.95, etc.
- **Date Proximity (25%):** Same day = 1.0, within week = 0.60.
- **Vendor Similarity (20%):** Levenshtein distance, substring match, alias lookup.
- **Description Match (15%):** Keyword Jaccard similarity.
- **Location Match (5%):** GPS distance (if available).

## 3. Fraud Confidence Scoring
**Purpose:** Combine mens rea, evidence quality, and matching into a final fraud score.

### Signals
- **Mens Rea (40%):** Intent probability from `MensReaDetector`.
- **Evidence Quality (25%):** Inverse of evidence score (Poor evidence = higher fraud risk).
- **Matching Failure (20%):** Inverse of matching confidence (No match = higher risk).
- **AI Consensus (15%):** Agreement between Auditor and Prosecutor personas.

### Prosecution Readiness
`min(overall_confidence * 100, evidence_quality * 100)`
Requires both high fraud confidence AND high quality evidence to be ready for court.