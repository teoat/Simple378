from typing import Dict, List, Optional
import re
from datetime import datetime

class AutoMapper:
    """
    Service to auto-detect field mappings using heuristic and pattern-based matching.
    Future: Can be enhanced with ML-based approaches.
    """
    
    # Target fields in our system
    TARGET_FIELDS = ["date", "amount", "description", "category"]
    
    # Mapping patterns: target_field -> list of possible source patterns
    FIELD_PATTERNS: Dict[str, List[str]] = {
        "date": [
            r"^date$",
            r"^trans.*date$",
            r"^posting.*date$",
            r"^transaction.*date$",
            r"^time",
            r"^when$",
        ],
        "amount": [
            r"^amount$",
            r"^debit$",
            r"^credit$",
            r"^value$",
            r"^total$",
            r"^balance$",
            r"^sum$",
        ],
        "description": [
            r"^desc",
            r"^details?$",
            r"^memo",
            r"^narrative",
            r"^remarks?$",
            r"^transaction.*desc",
            r"^payee",
            r"^merchant",
        ],
        "category": [
            r"^category",
            r"^cat$",
            r"^type$",
            r"^class",
        ],
    }
    
    @classmethod
    def suggest_mapping(
        cls,
        source_columns: List[str],
        sample_data: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, str]:
        """
        Suggest field mappings based on column names and optionally sample data.
        
        Returns:
            Dict mapping target_field -> source_column
        """
        suggested = {}
        
        # Normalize source columns
        normalized_sources = {col: col.lower().strip() for col in source_columns}
        
        for target_field in cls.TARGET_FIELDS:
            patterns = cls.FIELD_PATTERNS.get(target_field, [])
            
            # Try pattern matching
            for source_col, normalized in normalized_sources.items():
                for pattern in patterns:
                    if re.search(pattern, normalized, re.IGNORECASE):
                        suggested[target_field] = source_col
                        break
                if target_field in suggested:
                    break
            
            # If no match found, try content-based matching (if sample data provided)
            if target_field not in suggested and sample_data:
                matched_col = cls._match_by_content(target_field, source_columns, sample_data)
                if matched_col:
                    suggested[target_field] = matched_col
        
        return suggested
    
    @classmethod
    def _match_by_content(
        cls,
        target_field: str,
        source_columns: List[str],
        sample_data: List[Dict[str, str]]
    ) -> Optional[str]:
        """
        Match field based on content heuristics.
        """
        if target_field == "date":
            return cls._find_date_column(source_columns, sample_data)
        elif target_field == "amount":
            return cls._find_amount_column(source_columns, sample_data)
        
        return None
    
    @classmethod
    def _find_date_column(cls, columns: List[str], sample_data: List[Dict[str, str]]) -> Optional[str]:
        """
        Find the column that most likely contains dates.
        """
        date_formats = [
            r"\d{4}-\d{2}-\d{2}",  # YYYY-MM-DD
            r"\d{2}/\d{2}/\d{4}",  # MM/DD/YYYY
            r"\d{2}-\d{2}-\d{4}",  # MM-DD-YYYY
            r"\d{1,2}/\d{1,2}/\d{2,4}",  # M/D/YY or MM/DD/YYYY
        ]
        
        for col in columns:
            date_like_count = 0
            for row in sample_data[:5]:  # Check first 5 rows
                value = str(row.get(col, ""))
                for fmt in date_formats:
                    if re.search(fmt, value):
                        date_like_count += 1
                        break
            
            if date_like_count >= 3:  # At least 3 out of 5 look like dates
                return col
        
        return None
    
    @classmethod
    def _find_amount_column(cls, columns: List[str], sample_data: List[Dict[str, str]]) -> Optional[str]:
        """
        Find the column that most likely contains numeric amounts.
        """
        amount_pattern = r"^-?\$?\d+([,\d]*)?\.?\d*$"
        
        for col in columns:
            numeric_count = 0
            for row in sample_data[:5]:
                value = str(row.get(col, "")).strip().replace(",", "")
                if re.match(amount_pattern, value):
                    numeric_count += 1
            
            if numeric_count >= 3:
                return col
        
        return None
    
    @classmethod
    def calculate_confidence(cls, target_field: str, source_col: str, sample_data: Optional[List[Dict[str, str]]] = None) -> float:
        """
        Calculate confidence score (0.0 to 1.0) for a mapping suggestion.
        """
        score = 0.0
        normalized_col = source_col.lower().strip()
        
        # Pattern match contributes 0.7
        patterns = cls.FIELD_PATTERNS.get(target_field, [])
        for pattern in patterns:
            if re.search(pattern, normalized_col, re.IGNORECASE):
                score += 0.7
                break
        
        # Content match contributes 0.3
        if sample_data:
            if target_field == "date":
                if cls._find_date_column([source_col], sample_data) == source_col:
                    score += 0.3
            elif target_field == "amount":
                if cls._find_amount_column([source_col], sample_data) == source_col:
                    score += 0.3
        
        return min(score, 1.0)
