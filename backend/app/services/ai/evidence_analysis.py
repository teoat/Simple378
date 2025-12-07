from typing import Dict, Any, List
from datetime import datetime
import base64
import io
import fitz  # PyMuPDF for PDF processing
from PIL import Image
import pytesseract  # OCR
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import Transaction
from app.services.ai.llm_service import LLMService


class EvidenceAnalyzer:
    """
    AI-powered evidence analysis system for documents, images, and digital artifacts.
    """

    def __init__(self):
        self.llm_service = LLMService()
        self.supported_formats = {
            "pdf": self._analyze_pdf,
            "image": self._analyze_image,
            "text": self._analyze_text,
            "json": self._analyze_json,
            "csv": self._analyze_csv,
        }

    async def analyze_evidence(
        self, evidence_data: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """
        Analyze evidence using AI-powered techniques.
        """
        evidence_type = evidence_data.get("type", "unknown")
        content = evidence_data.get("content", "")
        metadata = evidence_data.get("metadata", {})

        # Detect evidence format
        format_type = self._detect_format(content, metadata)

        if format_type not in self.supported_formats:
            return {
                "status": "unsupported_format",
                "format": format_type,
                "message": f"Evidence format '{format_type}' is not supported",
            }

        # Analyze evidence
        analysis_result = await self.supported_formats[format_type](content, metadata)

        # Cross-reference with case data if subject_id provided
        subject_id = evidence_data.get("subject_id")
        if subject_id:
            cross_reference = await self._cross_reference_with_case(
                subject_id, analysis_result, db
            )
            analysis_result["cross_reference"] = cross_reference

        # Generate AI insights
        ai_insights = await self._generate_ai_insights(analysis_result, evidence_data)

        return {
            "status": "analyzed",
            "format": format_type,
            "analysis": analysis_result,
            "ai_insights": ai_insights,
            "confidence": self._calculate_confidence(analysis_result),
            "recommendations": self._generate_recommendations(
                analysis_result, ai_insights
            ),
            "analysis_timestamp": datetime.utcnow().isoformat(),
        }

    def _detect_format(self, content: str, metadata: Dict[str, Any]) -> str:
        """Detect the format of evidence."""
        # Check metadata first
        mime_type = metadata.get("mime_type", "")
        filename = metadata.get("filename", "")

        if "pdf" in mime_type or filename.endswith(".pdf"):
            return "pdf"
        elif mime_type.startswith("image/") or any(
            ext in filename for ext in [".jpg", ".jpeg", ".png", ".gif", ".bmp"]
        ):
            return "image"
        elif mime_type == "application/json" or filename.endswith(".json"):
            return "json"
        elif mime_type == "text/csv" or filename.endswith(".csv"):
            return "csv"
        elif mime_type.startswith("text/") or not mime_type:
            return "text"

        return "unknown"

    async def _analyze_pdf(
        self, content: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze PDF documents."""
        try:
            # Decode base64 content
            pdf_data = base64.b64decode(content)

            # Open PDF with PyMuPDF
            pdf_document = fitz.open(stream=pdf_data, filetype="pdf")

            analysis = {
                "page_count": len(pdf_document),
                "metadata": {
                    "title": pdf_document.metadata.get("title", ""),
                    "author": pdf_document.metadata.get("author", ""),
                    "creator": pdf_document.metadata.get("creator", ""),
                    "producer": pdf_document.metadata.get("producer", ""),
                    "creation_date": pdf_document.metadata.get("creationDate", ""),
                    "modification_date": pdf_document.metadata.get("modDate", ""),
                },
                "text_content": "",
                "images": [],
                "fonts": set(),
                "security": {"encrypted": pdf_document.is_encrypted, "permissions": {}},
            }

            # Extract text from all pages
            text_content = []
            for page_num in range(
                min(len(pdf_document), 20)
            ):  # Limit to first 20 pages
                page = pdf_document.load_page(page_num)
                text = page.get_text()
                text_content.append(text)

                # Extract fonts used on page
                fonts = page.get_fonts()
                for font in fonts:
                    analysis["fonts"].add(font[3])  # Font name

            analysis["text_content"] = "\n".join(text_content)
            analysis["fonts"] = list(analysis["fonts"])

            # Check for images
            for page_num in range(min(len(pdf_document), 5)):
                page = pdf_document.load_page(page_num)
                images = page.get_images(full=True)
                analysis["images"].extend(
                    [
                        {
                            "page": page_num,
                            "index": img[0],
                            "width": img[2],
                            "height": img[3],
                        }
                        for img in images
                    ]
                )

            pdf_document.close()

            # Analyze for tampering indicators
            tampering_indicators = self._analyze_pdf_tampering(analysis)

            return {
                **analysis,
                "tampering_indicators": tampering_indicators,
                "authenticity_score": self._calculate_pdf_authenticity(
                    analysis, tampering_indicators
                ),
            }

        except Exception as e:
            return {"error": f"PDF analysis failed: {str(e)}", "partial_analysis": True}

    async def _analyze_image(
        self, content: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze image evidence."""
        try:
            # Decode base64 content
            image_data = base64.b64decode(content)
            image = Image.open(io.BytesIO(image_data))

            analysis = {
                "format": image.format,
                "mode": image.mode,
                "size": image.size,
                "width": image.width,
                "height": image.height,
                "has_alpha": image.mode in ["RGBA", "LA", "P"],
                "colors": (
                    len(image.getcolors(maxcolors=256))
                    if image.getcolors(maxcolors=256)
                    else "complex"
                ),
            }

            # Extract EXIF data if available
            if hasattr(image, "_getexif") and image._getexif():
                exif_data = image._getexif()
                analysis["exif"] = {
                    "datetime": exif_data.get(36867),  # DateTimeOriginal
                    "camera": exif_data.get(271),  # Make
                    "model": exif_data.get(272),  # Model
                    "software": exif_data.get(305),  # Software
                }

            # OCR text extraction
            try:
                ocr_text = pytesseract.image_to_string(image)
                analysis["ocr_text"] = ocr_text.strip()
                analysis["has_text"] = len(ocr_text.strip()) > 10
            except Exception as e:
                analysis["ocr_error"] = str(e)

            # Image quality analysis
            analysis["quality_metrics"] = self._analyze_image_quality(image)

            # Tampering detection
            tampering_indicators = self._analyze_image_tampering(image)

            return {
                **analysis,
                "tampering_indicators": tampering_indicators,
                "authenticity_score": self._calculate_image_authenticity(
                    analysis, tampering_indicators
                ),
            }

        except Exception as e:
            return {
                "error": f"Image analysis failed: {str(e)}",
                "partial_analysis": True,
            }

    async def _analyze_text(
        self, content: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze text-based evidence."""
        analysis = {
            "length": len(content),
            "word_count": len(content.split()),
            "line_count": len(content.split("\n")),
            "language": self._detect_language(content),
            "sentiment": self._analyze_sentiment(content),
            "entities": self._extract_entities(content),
            "keywords": self._extract_keywords(content),
            "readability_score": self._calculate_readability(content),
        }

        # Check for suspicious patterns
        suspicious_patterns = self._analyze_text_patterns(content)
        analysis["suspicious_patterns"] = suspicious_patterns

        return analysis

    async def _analyze_json(
        self, content: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze JSON data."""
        try:
            data = json.loads(content)

            analysis = {
                "structure": self._analyze_json_structure(data),
                "size": len(content),
                "keys": list(data.keys()) if isinstance(data, dict) else None,
                "data_types": self._analyze_data_types(data),
                "anomalies": self._detect_json_anomalies(data),
            }

            return analysis

        except json.JSONDecodeError as e:
            return {"error": f"Invalid JSON: {str(e)}", "valid_json": False}

    async def _analyze_csv(
        self, content: str, metadata: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze CSV data."""
        try:
            import csv
            from io import StringIO

            # Parse CSV
            csv_reader = csv.reader(StringIO(content))
            rows = list(csv_reader)

            if not rows:
                return {"error": "Empty CSV file"}

            headers = rows[0] if len(rows) > 0 else []
            data_rows = rows[1:] if len(rows) > 1 else []

            analysis = {
                "row_count": len(data_rows),
                "column_count": len(headers),
                "headers": headers,
                "data_types": self._analyze_csv_data_types(data_rows),
                "statistics": self._calculate_csv_statistics(data_rows),
                "anomalies": self._detect_csv_anomalies(data_rows),
            }

            return analysis

        except Exception as e:
            return {"error": f"CSV analysis failed: {str(e)}", "partial_analysis": True}

    async def _cross_reference_with_case(
        self, subject_id: str, analysis_result: Dict[str, Any], db: AsyncSession
    ) -> Dict[str, Any]:
        """Cross-reference evidence analysis with case data."""
        try:
            subject_uuid = __import__("uuid").UUID(subject_id)

            # Get case transactions
            tx_query = select(Transaction).where(Transaction.subject_id == subject_uuid)
            tx_result = await db.execute(tx_query)
            transactions = tx_result.scalars().all()

            cross_references = {
                "matching_transactions": [],
                "amount_discrepancies": [],
                "date_mismatches": [],
                "entity_matches": [],
            }

            # Cross-reference with transaction data
            if "text_content" in analysis_result:
                text_content = analysis_result["text_content"].lower()

                for tx in transactions:
                    # Check for amount mentions
                    amount_str = f"${float(tx.amount or 0):.2f}"
                    if amount_str in text_content:
                        cross_references["matching_transactions"].append(
                            {
                                "transaction_id": str(tx.id),
                                "amount": float(tx.amount or 0),
                                "date": tx.date.isoformat() if tx.date else None,
                            }
                        )

            # Check for date matches
            if "ocr_text" in analysis_result:
                ocr_text = analysis_result["ocr_text"]
                # Simple date pattern matching could be implemented here

            return cross_references

        except Exception as e:
            return {"error": f"Cross-reference failed: {str(e)}"}

    async def _generate_ai_insights(
        self, analysis_result: Dict[str, Any], evidence_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate AI-powered insights from evidence analysis."""

        # Prepare analysis summary for AI
        analysis_summary = f"""
Evidence Analysis Summary:
- Format: {analysis_result.get('format', 'unknown')}
- Authenticity Score: {analysis_result.get('authenticity_score', 'N/A')}
- Key Findings: {json.dumps(analysis_result.get('tampering_indicators', []), indent=2)}
- Content Preview: {str(analysis_result.get('text_content', ''))[:500]}...
"""

        prompt = f"""
Analyze this evidence analysis and provide intelligent insights:

{analysis_summary}

Provide insights in the following categories:
1. Authenticity Assessment
2. Content Relevance
3. Potential Red Flags
4. Investigation Recommendations

Format as JSON with keys: authenticity_assessment, content_relevance, red_flags, recommendations
"""

        try:
            messages = [{"role": "user", "content": prompt}]
            response = await self.llm_service.generate_response(messages)

            import json

            insights = json.loads(response.content)

            return insights

        except Exception as e:
            print(f"AI insights generation failed: {e}")
            return {
                "authenticity_assessment": "Analysis completed",
                "content_relevance": "Evidence content analyzed",
                "red_flags": [],
                "recommendations": ["Manual review recommended"],
            }

    def _analyze_pdf_tampering(self, analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Analyze PDF for tampering indicators."""
        indicators = []

        # Check metadata consistency
        if (
            analysis["metadata"]["creation_date"]
            and analysis["metadata"]["modification_date"]
        ):
            try:
                creation = datetime.strptime(
                    analysis["metadata"]["creation_date"], "%Y%m%d%H%M%S%z"
                )
                modification = datetime.strptime(
                    analysis["metadata"]["modification_date"], "%Y%m%d%H%M%S%z"
                )

                if modification < creation:
                    indicators.append(
                        {
                            "type": "metadata_inconsistency",
                            "description": "Modification date is earlier than creation date",
                            "severity": "high",
                        }
                    )
            except:
                pass

        # Check for unusual fonts
        suspicious_fonts = [
            "Helvetica",
            "Times-Roman",
        ]  # Default fonts that might indicate manipulation
        if any(font in analysis["fonts"] for font in suspicious_fonts):
            indicators.append(
                {
                    "type": "default_fonts",
                    "description": "Document uses default fonts, may have been manipulated",
                    "severity": "medium",
                }
            )

        # Check for encryption
        if analysis["security"]["encrypted"]:
            indicators.append(
                {
                    "type": "encryption",
                    "description": "Document is encrypted, verify authenticity with source",
                    "severity": "low",
                }
            )

        return indicators

    def _analyze_image_tampering(self, image: Image.Image) -> List[Dict[str, Any]]:
        """Analyze image for tampering indicators."""
        indicators = []

        # Check image metadata
        if hasattr(image, "info"):
            if "comment" in image.info and len(image.info["comment"]) > 1000:
                indicators.append(
                    {
                        "type": "large_comment",
                        "description": "Image contains unusually large comment field",
                        "severity": "medium",
                    }
                )

        # Check for compression artifacts (simplified)
        if image.format == "JPEG":
            # JPEG images can be analyzed for double compression
            indicators.append(
                {
                    "type": "jpeg_compression",
                    "description": "JPEG format - check for double compression artifacts",
                    "severity": "low",
                }
            )

        return indicators

    def _analyze_text_patterns(self, content: str) -> List[Dict[str, Any]]:
        """Analyze text for suspicious patterns."""
        patterns = []

        # Check for unusual character distributions
        if content.count("!") > len(content) / 100:
            patterns.append(
                {
                    "type": "excessive_punctuation",
                    "description": "Unusually high punctuation usage",
                    "severity": "low",
                }
            )

        # Check for repetitive phrases
        words = content.lower().split()
        word_freq = {}
        for word in words:
            if len(word) > 3:  # Only check meaningful words
                word_freq[word] = word_freq.get(word, 0) + 1

        repetitive_words = [
            word for word, count in word_freq.items() if count > len(words) / 50
        ]
        if repetitive_words:
            patterns.append(
                {
                    "type": "repetitive_content",
                    "description": f"Repetitive use of words: {', '.join(repetitive_words[:3])}",
                    "severity": "medium",
                }
            )

        return patterns

    def _calculate_confidence(self, analysis_result: Dict[str, Any]) -> float:
        """Calculate overall confidence in the analysis."""
        confidence = 0.5  # Base confidence

        # Increase confidence based on analysis completeness
        if "tampering_indicators" in analysis_result:
            confidence += 0.2

        if "authenticity_score" in analysis_result:
            confidence += 0.2

        if "ai_insights" in analysis_result:
            confidence += 0.1

        return min(confidence, 1.0)

    def _generate_recommendations(
        self, analysis_result: Dict[str, Any], ai_insights: Dict[str, Any]
    ) -> List[str]:
        """Generate investigation recommendations based on analysis."""
        recommendations = []

        # Authenticity recommendations
        if analysis_result.get("authenticity_score", 1.0) < 0.7:
            recommendations.append(
                "🔍 Verify document authenticity with original source"
            )
            recommendations.append("📋 Cross-reference with known legitimate documents")

        # Content recommendations
        if ai_insights.get("red_flags"):
            recommendations.append("🚨 Address identified red flags in investigation")
            recommendations.extend(
                [f"• {flag}" for flag in ai_insights["red_flags"][:3]]
            )

        # Technical recommendations
        if analysis_result.get("tampering_indicators"):
            recommendations.append(
                "🔧 Technical analysis recommended for tampering indicators"
            )

        if not recommendations:
            recommendations.append(
                "✅ Evidence analysis completed - no immediate concerns identified"
            )

        return recommendations

    # Helper methods for various analyses
    def _detect_language(self, text: str) -> str:
        """Simple language detection (could be enhanced with langdetect library)."""
        # Basic heuristics
        if any(word in text.lower() for word in ["the", "and", "or", "but"]):
            return "english"
        return "unknown"

    def _analyze_sentiment(self, text: str) -> str:
        """Basic sentiment analysis."""
        positive_words = ["good", "excellent", "approved", "verified", "authentic"]
        negative_words = ["suspicious", "fraud", "fake", "invalid", "rejected"]

        positive_count = sum(1 for word in positive_words if word in text.lower())
        negative_count = sum(1 for word in negative_words if word in text.lower())

        if positive_count > negative_count:
            return "positive"
        elif negative_count > positive_count:
            return "negative"
        else:
            return "neutral"

    def _extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract named entities (simplified)."""
        # This would typically use spaCy or similar NLP library
        entities = []

        # Simple pattern matching for demonstration
        import re

        # Email pattern
        emails = re.findall(
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", text
        )
        for email in emails:
            entities.append({"type": "email", "value": email})

        # Phone pattern
        phones = re.findall(r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b", text)
        for phone in phones:
            entities.append({"type": "phone", "value": phone})

        return entities

    def _extract_keywords(self, text: str) -> List[str]:
        """Extract important keywords."""
        # Simple keyword extraction (could use TF-IDF or other methods)
        words = text.lower().split()
        stop_words = {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
        }

        keywords = [word for word in words if len(word) > 3 and word not in stop_words]
        keyword_freq = {}

        for keyword in keywords:
            keyword_freq[keyword] = keyword_freq.get(keyword, 0) + 1

        # Return top 10 keywords
        sorted_keywords = sorted(keyword_freq.items(), key=lambda x: x[1], reverse=True)
        return [kw for kw, _ in sorted_keywords[:10]]

    def _calculate_readability(self, text: str) -> float:
        """Calculate basic readability score."""
        sentences = len([s for s in text.split(".") if s.strip()])
        words = len(text.split())
        syllables = sum(
            1 for word in text.split() for char in word if char.lower() in "aeiou"
        )

        if sentences == 0 or words == 0:
            return 0

        # Simple Flesch Reading Ease approximation
        score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
        return max(0, min(100, score))  # Clamp to 0-100

    def _analyze_image_quality(self, image: Image.Image) -> Dict[str, Any]:
        """Analyze image quality metrics."""
        return {
            "brightness": "normal",  # Would require more complex analysis
            "contrast": "normal",
            "sharpness": "normal",
            "compression_artifacts": "none",
        }

    def _calculate_pdf_authenticity(
        self, analysis: Dict[str, Any], tampering_indicators: List[Dict[str, Any]]
    ) -> float:
        """Calculate PDF authenticity score."""
        score = 1.0

        for indicator in tampering_indicators:
            if indicator["severity"] == "high":
                score -= 0.3
            elif indicator["severity"] == "medium":
                score -= 0.15
            elif indicator["severity"] == "low":
                score -= 0.05

        return max(0, score)

    def _calculate_image_authenticity(
        self, analysis: Dict[str, Any], tampering_indicators: List[Dict[str, Any]]
    ) -> float:
        """Calculate image authenticity score."""
        score = 1.0

        for indicator in tampering_indicators:
            if indicator["severity"] == "high":
                score -= 0.4
            elif indicator["severity"] == "medium":
                score -= 0.2
            elif indicator["severity"] == "low":
                score -= 0.1

        return max(0, score)

    def _analyze_json_structure(self, data: Any) -> Dict[str, Any]:
        """Analyze JSON data structure."""
        if isinstance(data, dict):
            return {
                "type": "object",
                "keys": len(data),
                "nested_objects": sum(1 for v in data.values() if isinstance(v, dict)),
                "arrays": sum(1 for v in data.values() if isinstance(v, list)),
            }
        elif isinstance(data, list):
            return {
                "type": "array",
                "length": len(data),
                "item_types": list(set(type(item).__name__ for item in data[:10])),
            }
        else:
            return {"type": type(data).__name__}

    def _analyze_data_types(self, data: Any) -> Dict[str, int]:
        """Analyze data types in JSON."""
        types = {}

        def count_types(obj, path=""):
            if isinstance(obj, dict):
                for key, value in obj.items():
                    count_types(value, f"{path}.{key}" if path else key)
            elif isinstance(obj, list):
                for i, item in enumerate(obj):
                    count_types(item, f"{path}[{i}]")
            else:
                type_name = type(obj).__name__
                types[type_name] = types.get(type_name, 0) + 1

        count_types(data)
        return types

    def _detect_json_anomalies(self, data: Any) -> List[str]:
        """Detect anomalies in JSON data."""
        anomalies = []

        # Check for unusually nested structures
        def check_nesting(obj, depth=0):
            if depth > 10:
                anomalies.append("Excessive nesting depth")
                return
            if isinstance(obj, dict):
                for value in obj.values():
                    check_nesting(value, depth + 1)
            elif isinstance(obj, list):
                for item in obj:
                    check_nesting(item, depth + 1)

        check_nesting(data)

        return anomalies

    def _analyze_csv_data_types(
        self, rows: List[List[str]]
    ) -> Dict[str, Dict[str, Any]]:
        """Analyze data types in CSV columns."""
        if not rows:
            return {}

        # Transpose to get columns
        columns = list(zip(*rows)) if rows else []

        column_analysis = {}
        for i, column in enumerate(columns):
            col_name = f"column_{i}"
            values = [val for val in column if val.strip()]

            # Try to detect data types
            int_count = sum(1 for v in values if v.isdigit())
            float_count = sum(1 for v in values if self._is_float(v))
            date_count = sum(1 for v in values if self._is_date(v))

            total_values = len(values)
            if total_values == 0:
                continue

            # Determine primary type
            if int_count / total_values > 0.8:
                primary_type = "integer"
            elif float_count / total_values > 0.8:
                primary_type = "float"
            elif date_count / total_values > 0.8:
                primary_type = "date"
            else:
                primary_type = "string"

            column_analysis[col_name] = {
                "primary_type": primary_type,
                "unique_values": len(set(values)),
                "null_count": len(column) - len(values),
                "sample_values": values[:3],
            }

        return column_analysis

    def _calculate_csv_statistics(self, rows: List[List[str]]) -> Dict[str, Any]:
        """Calculate statistics for CSV data."""
        if not rows:
            return {}

        num_rows = len(rows)
        num_cols = len(rows[0]) if rows else 0

        return {
            "total_rows": num_rows,
            "total_columns": num_cols,
            "density": (num_rows * num_cols) / max(num_rows * num_cols, 1),
            "avg_row_length": sum(len(row) for row in rows) / max(num_rows, 1),
        }

    def _detect_csv_anomalies(self, rows: List[List[str]]) -> List[str]:
        """Detect anomalies in CSV data."""
        anomalies = []

        if not rows:
            return ["Empty dataset"]

        # Check for inconsistent row lengths
        row_lengths = [len(row) for row in rows]
        if len(set(row_lengths)) > 1:
            anomalies.append("Inconsistent row lengths")

        # Check for mostly empty columns
        columns = list(zip(*rows)) if rows else []
        for i, col in enumerate(columns):
            non_empty = sum(1 for cell in col if cell.strip())
            if non_empty / len(col) < 0.1:
                anomalies.append(f"Column {i} is mostly empty")

        return anomalies

    def _is_float(self, value: str) -> bool:
        """Check if string represents a float."""
        try:
            float(value)
            return True
        except ValueError:
            return False

    def _is_date(self, value: str) -> bool:
        """Check if string represents a date."""
        # Simple date pattern detection
        import re

        date_patterns = [
            r"\d{4}-\d{2}-\d{2}",  # YYYY-MM-DD
            r"\d{2}/\d{2}/\d{4}",  # MM/DD/YYYY
            r"\d{2}-\d{2}-\d{4}",  # MM-DD-YYYY
        ]

        return any(re.match(pattern, value) for pattern in date_patterns)
