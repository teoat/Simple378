"""
Vector database service for semantic search using Qdrant.
Provides document embedding, indexing, and similarity search capabilities.
"""

import uuid
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import numpy as np
import re
from collections import Counter

from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance, VectorParams
from sentence_transformers import SentenceTransformer

from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


class VectorService:
    """
    Service for managing vector embeddings and semantic search using Qdrant.
    """

    def __init__(self):
        self.client = QdrantClient(url=settings.QDRANT_URL)
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.collection_name = "fraud_documents"

        # Initialize collection if it doesn't exist
        self._ensure_collection()

    def _ensure_collection(self):
        """Ensure the vector collection exists with proper configuration."""
        try:
            # Check if collection exists
            collections = self.client.get_collections()
            collection_names = [c.name for c in collections.collections]

            if self.collection_name not in collection_names:
                # Create collection with cosine similarity
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=384,  # all-MiniLM-L6-v2 produces 384-dimensional vectors
                        distance=Distance.COSINE
                    )
                )
                logger.info(f"Created Qdrant collection: {self.collection_name}")
            else:
                logger.info(f"Qdrant collection already exists: {self.collection_name}")

        except Exception as e:
            logger.error(f"Failed to initialize Qdrant collection: {e}")
            raise

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate vector embedding for text using sentence transformer.

        Args:
            text: Text to embed

        Returns:
            List of float values representing the embedding vector
        """
        try:
            embedding = self.embedding_model.encode(text, convert_to_numpy=True)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise

    def index_document(self, document_id: str, content: str, metadata: Dict[str, Any]) -> bool:
        """
        Index a document in the vector database.

        Args:
            document_id: Unique identifier for the document
            content: Full text content to embed
            metadata: Additional metadata (case_id, subject_id, etc.)

        Returns:
            True if indexing was successful
        """
        try:
            # Generate embedding for the content
            embedding = self.generate_embedding(content)

            # Prepare point for indexing
            point = models.PointStruct(
                id=str(uuid.uuid4()),
                vector=embedding,
                payload={
                    "document_id": document_id,
                    "content": content[:1000],  # Store truncated content
                    "indexed_at": datetime.utcnow().isoformat(),
                    **metadata
                }
            )

            # Upsert the point
            self.client.upsert(
                collection_name=self.collection_name,
                points=[point]
            )

            logger.info(f"Indexed document: {document_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to index document {document_id}: {e}")
            return False

    def search_similar(self, query: str, limit: int = 10, score_threshold: float = 0.7) -> List[Dict[str, Any]]:
        """
        Search for semantically similar documents.

        Args:
            query: Search query text
            limit: Maximum number of results
            score_threshold: Minimum similarity score (0-1)

        Returns:
            List of similar documents with scores and metadata
        """
        try:
            # Generate embedding for the query
            query_embedding = self.generate_embedding(query)

            # Perform vector search
            search_result = self.client.search(
                collection_name=self.collection_name,
                query_vector=query_embedding,
                limit=limit,
                score_threshold=score_threshold
            )

            # Format results
            results = []
            for hit in search_result:
                results.append({
                    "document_id": hit.payload.get("document_id"),
                    "content": hit.payload.get("content"),
                    "score": hit.score,
                    "metadata": {k: v for k, v in hit.payload.items()
                               if k not in ["document_id", "content", "indexed_at"]}
                })

            logger.info(f"Vector search completed: {len(results)} results for query")
            return results

        except Exception as e:
            logger.error(f"Failed to search similar documents: {e}")
            return []

    def apply_filters(self, results: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Apply additional filters to search results.

        Args:
            results: Search results to filter
            filters: Filter criteria

        Returns:
            Filtered results
        """
        filtered_results = results

        # Filter by date range
        if "date_from" in filters or "date_to" in filters:
            filtered_results = self._filter_by_date(filtered_results, filters)

        # Filter by file type
        if "file_types" in filters:
            file_types = filters["file_types"]
            if isinstance(file_types, list):
                filtered_results = [
                    r for r in filtered_results
                    if r.get("metadata", {}).get("file_type") in file_types
                ]

        # Filter by risk level
        if "risk_levels" in filters:
            risk_levels = filters["risk_levels"]
            if isinstance(risk_levels, list):
                filtered_results = [
                    r for r in filtered_results
                    if r.get("metadata", {}).get("risk_level") in risk_levels
                ]

        # Filter by case ID
        if "case_id" in filters:
            case_id = filters["case_id"]
            filtered_results = [
                r for r in filtered_results
                if r.get("metadata", {}).get("case_id") == case_id
            ]

        # Filter by subject ID
        if "subject_id" in filters:
            subject_id = filters["subject_id"]
            filtered_results = [
                r for r in filtered_results
                if r.get("metadata", {}).get("subject_id") == subject_id
            ]

        return filtered_results

    def _filter_by_date(self, results: List[Dict[str, Any]], filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Filter results by date range."""
        from datetime import datetime

        date_from = None
        date_to = None

        if "date_from" in filters:
            try:
                date_from = datetime.fromisoformat(filters["date_from"].replace('Z', '+00:00'))
            except ValueError:
                pass

        if "date_to" in filters:
            try:
                date_to = datetime.fromisoformat(filters["date_to"].replace('Z', '+00:00'))
            except ValueError:
                pass

        if not date_from and not date_to:
            return results

        filtered_results = []
        for result in results:
            indexed_at = result.get("metadata", {}).get("indexed_at")
            if not indexed_at:
                continue

            try:
                doc_date = datetime.fromisoformat(indexed_at.replace('Z', '+00:00'))

                if date_from and doc_date < date_from:
                    continue
                if date_to and doc_date > date_to:
                    continue

                filtered_results.append(result)
            except ValueError:
                # Skip documents with invalid dates
                continue

        return filtered_results

    def hybrid_search(self, query: str, keyword_boost: float = 0.3, limit: int = 10, score_threshold: float = 0.6) -> List[Dict[str, Any]]:
        """
        Perform hybrid search combining semantic similarity with keyword matching.

        Args:
            query: Search query text
            keyword_boost: Weight for keyword matches (0-1)
            limit: Maximum number of results
            score_threshold: Minimum similarity score

        Returns:
            List of documents with combined scores
        """
        try:
            # Get semantic search results
            semantic_results = self.search_similar(query, limit * 2, score_threshold * 0.8)

            # Extract keywords from query
            keywords = self._extract_keywords(query)

            # Calculate hybrid scores
            hybrid_results = []
            for result in semantic_results:
                content = result.get("content", "").lower()
                semantic_score = result.get("score", 0)

                # Calculate keyword score
                keyword_score = 0
                for keyword in keywords:
                    if keyword.lower() in content:
                        keyword_score += 1

                # Normalize keyword score (0-1)
                keyword_score = min(keyword_score / len(keywords), 1.0) if keywords else 0

                # Combine scores
                hybrid_score = (1 - keyword_boost) * semantic_score + keyword_boost * keyword_score

                if hybrid_score >= score_threshold:
                    result_copy = result.copy()
                    result_copy["score"] = hybrid_score
                    result_copy["semantic_score"] = semantic_score
                    result_copy["keyword_score"] = keyword_score
                    hybrid_results.append(result_copy)

            # Sort by hybrid score and limit results
            hybrid_results.sort(key=lambda x: x["score"], reverse=True)
            hybrid_results = hybrid_results[:limit]

            logger.info(f"Hybrid search completed: {len(hybrid_results)} results")
            return hybrid_results

        except Exception as e:
            logger.error(f"Hybrid search failed: {e}")
            return []

    def _extract_keywords(self, query: str) -> List[str]:
        """Extract keywords from query for hybrid search."""
        # Remove common stop words and split
        stop_words = {'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
                     'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
                     'to', 'was', 'will', 'with'}

        words = re.findall(r'\b\w+\b', query.lower())
        keywords = [word for word in words if word not in stop_words and len(word) > 2]

        return list(set(keywords))  # Remove duplicates

    def get_search_analytics(self, days: int = 30) -> Dict[str, Any]:
        """
        Get search analytics and insights.

        Args:
            days: Number of days to analyze

        Returns:
            Analytics data including popular queries, performance metrics
        """
        try:
            # This would typically query a search logs table
            # For now, return mock analytics based on collection stats
            stats = self.get_collection_stats()

            # Mock analytics data
            analytics = {
                "total_documents": stats.get("vector_count", 0),
                "search_metrics": {
                    "total_searches": 0,  # Would be populated from logs
                    "average_results": 0,
                    "popular_queries": [],  # Would be populated from logs
                    "average_response_time": 0.15  # Mock value
                },
                "content_distribution": {
                    "by_file_type": {},  # Would analyze metadata
                    "by_case": {},  # Would analyze case associations
                    "by_date": {}  # Would analyze indexing dates
                },
                "performance_metrics": {
                    "indexing_rate": 0,  # Documents per hour
                    "search_success_rate": 0.95,
                    "average_similarity_score": 0.75
                }
            }

            # Try to get some real distribution data from sample documents
            try:
                # Get a sample of documents to analyze distribution
                sample_results = self.client.scroll(
                    collection_name=self.collection_name,
                    limit=100,
                    with_payload=True
                )

                file_types = Counter()
                cases = Counter()

                for record in sample_results[0]:
                    payload = record.payload
                    file_type = payload.get("file_type", "unknown")
                    case_id = payload.get("case_id")

                    file_types[file_type] += 1
                    if case_id:
                        cases[case_id] += 1

                analytics["content_distribution"]["by_file_type"] = dict(file_types.most_common(5))
                analytics["content_distribution"]["by_case"] = dict(cases.most_common(5))

            except Exception as e:
                logger.warning(f"Could not analyze content distribution: {e}")

            return analytics

        except Exception as e:
            logger.error(f"Failed to get search analytics: {e}")
            return {}

    def get_search_suggestions(self, partial_query: str, limit: int = 5) -> List[str]:
        """
        Get search suggestions based on partial query.

        Args:
            partial_query: Partial search query
            limit: Maximum number of suggestions

        Returns:
            List of suggested query completions
        """
        try:
            # This would typically use a query log or NLP model
            # For now, provide basic suggestions based on common terms
            suggestions = []

            if len(partial_query) < 2:
                # General suggestions for short queries
                suggestions = [
                    "financial fraud",
                    "suspicious transactions",
                    "money laundering",
                    "evidence analysis",
                    "case investigation"
                ]
            else:
                # Context-aware suggestions
                partial_lower = partial_query.lower()

                if "fraud" in partial_lower:
                    suggestions = [
                        "financial fraud evidence",
                        "fraud investigation",
                        "fraud patterns"
                    ]
                elif "transaction" in partial_lower:
                    suggestions = [
                        "suspicious transactions",
                        "transaction analysis",
                        "large transactions"
                    ]
                elif "evidence" in partial_lower:
                    suggestions = [
                        "evidence analysis",
                        "evidence collection",
                        "evidence review"
                    ]
                else:
                    suggestions = [
                        f"{partial_query} analysis",
                        f"{partial_query} investigation",
                        f"{partial_query} evidence"
                    ]

            return suggestions[:limit]

        except Exception as e:
            logger.error(f"Failed to get search suggestions: {e}")
            return []

    def reindex_case_documents(self, case_id: str) -> Dict[str, Any]:
        """
        Re-index all documents associated with a case.
        Useful when case metadata changes or for bulk updates.

        Args:
            case_id: ID of the case to re-index

        Returns:
            Re-indexing results
        """
        try:
            # Find all documents for this case
            filter_condition = models.Filter(
                must=[
                    models.FieldCondition(
                        key="case_id",
                        match=models.MatchValue(value=case_id)
                    )
                ]
            )

            # Get all documents for this case
            documents = []
            scroll_result = self.client.scroll(
                collection_name=self.collection_name,
                scroll_filter=filter_condition,
                limit=1000,  # Reasonable batch size
                with_payload=True
            )

            for record in scroll_result[0]:
                payload = record.payload
                documents.append({
                    "document_id": payload.get("document_id"),
                    "content": payload.get("content", ""),
                    "metadata": {k: v for k, v in payload.items()
                               if k not in ["document_id", "content", "indexed_at"]}
                })

            if not documents:
                return {
                    "case_id": case_id,
                    "status": "completed",
                    "message": "No documents found for case",
                    "documents_processed": 0
                }

            # Re-index all documents
            results = self.batch_index_documents([
                (doc["document_id"], doc["content"], doc["metadata"])
                for doc in documents
            ])

            successful = sum(1 for success in results.values() if success)
            total = len(results)

            logger.info(f"Case re-indexing completed: {successful}/{total} for case {case_id}")

            return {
                "case_id": case_id,
                "status": "completed",
                "documents_processed": total,
                "successful": successful,
                "failed": total - successful,
                "results": results
            }

        except Exception as e:
            logger.error(f"Case re-indexing failed for {case_id}: {e}")
            return {
                "case_id": case_id,
                "status": "failed",
                "error": str(e)
            }

    def delete_document(self, document_id: str) -> bool:
        """
        Delete a document from the vector index.

        Args:
            document_id: ID of the document to delete

        Returns:
            True if deletion was successful
        """
        try:
            # Delete points with matching document_id
            self.client.delete(
                collection_name=self.collection_name,
                points_selector=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="document_id",
                            match=models.MatchValue(value=document_id)
                        )
                    ]
                )
            )

            logger.info(f"Deleted document from vector index: {document_id}")
            return True

        except Exception as e:
            logger.error(f"Failed to delete document {document_id}: {e}")
            return False

    def update_document(self, document_id: str, new_content: str, metadata: Dict[str, Any]) -> bool:
        """
        Update a document in the vector index.

        Args:
            document_id: ID of the document to update
            new_content: New content to embed
            metadata: Updated metadata

        Returns:
            True if update was successful
        """
        try:
            # Delete old document
            self.delete_document(document_id)

            # Index new content
            return self.index_document(document_id, new_content, metadata)

        except Exception as e:
            logger.error(f"Failed to update document {document_id}: {e}")
            return False

    def get_collection_stats(self) -> Dict[str, Any]:
        """
        Get statistics about the vector collection.

        Returns:
            Dictionary with collection statistics
        """
        try:
            collection_info = self.client.get_collection(self.collection_name)
            return {
                "collection_name": self.collection_name,
                "vector_count": collection_info.points_count,
                "vector_size": collection_info.config.params.vectors.size,
                "distance_metric": collection_info.config.params.vectors.distance
            }
        except Exception as e:
            logger.error(f"Failed to get collection stats: {e}")
            return {}

    def batch_index_documents(self, documents: List[Tuple[str, str, Dict[str, Any]]]) -> Dict[str, bool]:
        """
        Batch index multiple documents for efficiency.

        Args:
            documents: List of (document_id, content, metadata) tuples

        Returns:
            Dictionary mapping document_id to success status
        """
        results = {}

        try:
            points = []
            for document_id, content, metadata in documents:
                try:
                    embedding = self.generate_embedding(content)
                    point = models.PointStruct(
                        id=str(uuid.uuid4()),
                        vector=embedding,
                        payload={
                            "document_id": document_id,
                            "content": content[:1000],
                            "indexed_at": datetime.utcnow().isoformat(),
                            **metadata
                        }
                    )
                    points.append(point)
                    results[document_id] = True
                except Exception as e:
                    logger.error(f"Failed to prepare document {document_id}: {e}")
                    results[document_id] = False

            if points:
                # Batch upsert
                self.client.upsert(
                    collection_name=self.collection_name,
                    points=points
                )
                logger.info(f"Batch indexed {len(points)} documents")

        except Exception as e:
            logger.error(f"Failed to batch index documents: {e}")
            # Mark all as failed if batch operation failed
            for document_id, _, _ in documents:
                results[document_id] = False

        return results


# Global instance
vector_service = VectorService()