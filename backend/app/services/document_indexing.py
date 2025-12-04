"""
Document indexing service that integrates forensic analysis with vector search.
Automatically indexes processed documents for semantic search capabilities.
"""

import os
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime

from app.services.forensics import ForensicsService
from app.services.vector_service import vector_service
from app.core.logging import get_logger

logger = get_logger(__name__)


class DocumentIndexingService:
    """
    Service for indexing documents with both forensic analysis and vector embeddings.
    """

    def __init__(self):
        self.forensics_service = ForensicsService()

    async def process_and_index_document(
        self,
        file_path: str,
        document_id: Optional[str] = None,
        case_id: Optional[str] = None,
        subject_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Process a document with forensic analysis and index it for semantic search.

        Args:
            file_path: Path to the document file
            document_id: Optional custom document ID (generated if not provided)
            case_id: Associated case ID
            subject_id: Associated subject ID
            metadata: Additional metadata

        Returns:
            Dictionary with processing results and indexing status
        """
        try:
            # Generate document ID if not provided
            if not document_id:
                document_id = str(uuid.uuid4())

            # Step 1: Perform forensic analysis
            logger.info(f"Starting forensic analysis for document: {document_id}")
            forensic_result = await self.forensics_service.analyze_document(file_path)

            # Step 2: Extract text content for embedding
            text_content = await self._extract_text_content(file_path, forensic_result)

            # Step 3: Prepare metadata for indexing
            index_metadata = self._prepare_index_metadata(
                document_id=document_id,
                case_id=case_id,
                subject_id=subject_id,
                forensic_result=forensic_result,
                additional_metadata=metadata
            )

            # Step 4: Index document in vector database
            logger.info(f"Indexing document in vector database: {document_id}")
            vector_success = vector_service.index_document(
                document_id=document_id,
                content=text_content,
                metadata=index_metadata
            )

            # Step 5: Compile results
            result = {
                "document_id": document_id,
                "processing_status": "completed",
                "forensic_analysis": forensic_result,
                "vector_indexing": {
                    "success": vector_success,
                    "content_length": len(text_content),
                    "indexed_at": datetime.utcnow().isoformat()
                },
                "metadata": index_metadata
            }

            if vector_success:
                logger.info(f"Document processing and indexing completed: {document_id}")
            else:
                logger.warning(f"Document processed but vector indexing failed: {document_id}")

            return result

        except Exception as e:
            logger.error(f"Document processing failed: {e}")
            return {
                "document_id": document_id,
                "processing_status": "failed",
                "error": str(e)
            }

    async def _extract_text_content(self, file_path: str, forensic_result: Dict[str, Any]) -> str:
        """
        Extract text content from the document for vector embedding.

        This combines multiple sources of text content for comprehensive indexing.
        """
        text_parts = []

        # Extract filename
        filename = os.path.basename(file_path)
        text_parts.append(f"Filename: {filename}")

        # Extract forensic summary
        if "summary" in forensic_result:
            text_parts.append(f"Summary: {forensic_result['summary']}")

        # Extract metadata as text
        if "metadata" in forensic_result and forensic_result["metadata"]:
            metadata_text = self._metadata_to_text(forensic_result["metadata"])
            if metadata_text:
                text_parts.append(f"Metadata: {metadata_text}")

        # Extract OCR text if available (from future OCR integration)
        if "ocr_text" in forensic_result:
            text_parts.append(f"OCR Content: {forensic_result['ocr_text']}")

        # Combine all text parts
        full_text = " | ".join(text_parts)

        # Ensure we have minimum content for embedding
        if len(full_text.strip()) < 10:
            full_text = f"Document: {filename} | Type: {forensic_result.get('file_type', 'unknown')} | Processed at: {datetime.utcnow().isoformat()}"

        return full_text

    def _metadata_to_text(self, metadata: Dict[str, Any]) -> str:
        """Convert metadata dictionary to readable text."""
        text_parts = []

        # Extract common metadata fields
        for key, value in metadata.items():
            if isinstance(value, (str, int, float)) and value:
                text_parts.append(f"{key}: {value}")
            elif isinstance(value, dict):
                # Handle nested metadata (e.g., GPS coordinates)
                for nested_key, nested_value in value.items():
                    if isinstance(nested_value, (str, int, float)) and nested_value:
                        text_parts.append(f"{key}.{nested_key}: {nested_value}")

        return " | ".join(text_parts)

    def _prepare_index_metadata(
        self,
        document_id: str,
        case_id: Optional[str],
        subject_id: Optional[str],
        forensic_result: Dict[str, Any],
        additional_metadata: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Prepare metadata for vector indexing."""
        metadata = {
            "document_id": document_id,
            "indexed_at": datetime.utcnow().isoformat(),
            "file_type": forensic_result.get("file_type", "unknown"),
            "manipulation_score": forensic_result.get("manipulation_analysis", {}).get("score", 0),
        }

        # Add optional associations
        if case_id:
            metadata["case_id"] = case_id
        if subject_id:
            metadata["subject_id"] = subject_id

        # Add forensic analysis results
        if "metadata" in forensic_result:
            # Include key forensic metadata
            forensic_metadata = forensic_result["metadata"]
            if "FileType" in forensic_metadata:
                metadata["file_type_detailed"] = forensic_metadata["FileType"]
            if "FileSize" in forensic_metadata:
                metadata["file_size"] = forensic_metadata["FileSize"]
            if "CreateDate" in forensic_metadata:
                metadata["creation_date"] = forensic_metadata["CreateDate"]

        # Add any additional metadata
        if additional_metadata:
            metadata.update(additional_metadata)

        return metadata

    async def search_similar_documents(
        self,
        query: str,
        case_id: Optional[str] = None,
        subject_id: Optional[str] = None,
        limit: int = 10,
        score_threshold: float = 0.7
    ) -> List[Dict[str, Any]]:
        """
        Search for semantically similar documents with optional filtering.

        Args:
            query: Search query text
            case_id: Filter by case ID
            subject_id: Filter by subject ID
            limit: Maximum results
            score_threshold: Minimum similarity score

        Returns:
            List of similar documents with metadata
        """
        try:
            # Perform vector search
            results = vector_service.search_similar(
                query=query,
                limit=limit,
                score_threshold=score_threshold
            )

            # Apply filters if specified
            filtered_results = []
            for result in results:
                metadata = result.get("metadata", {})

                # Apply case filter
                if case_id and metadata.get("case_id") != case_id:
                    continue

                # Apply subject filter
                if subject_id and metadata.get("subject_id") != subject_id:
                    continue

                filtered_results.append(result)

            logger.info(f"Filtered semantic search: {len(filtered_results)} results")
            return filtered_results

        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            return []

    async def reindex_case_documents(self, case_id: str) -> Dict[str, Any]:
        """
        Re-index all documents associated with a case.
        Useful when case metadata changes or for bulk updates.
        """
        try:
            # This would typically query the database for all documents in a case
            # For now, return a placeholder implementation
            logger.info(f"Re-indexing documents for case: {case_id}")

            return {
                "case_id": case_id,
                "status": "completed",
                "documents_processed": 0,
                "message": "Re-indexing functionality ready for implementation"
            }

        except Exception as e:
            logger.error(f"Case re-indexing failed: {e}")
            return {
                "case_id": case_id,
                "status": "failed",
                "error": str(e)
            }


# Global instance
document_indexing_service = DocumentIndexingService()