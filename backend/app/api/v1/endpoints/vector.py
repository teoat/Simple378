"""
API endpoints for vector-based semantic search using Qdrant.
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.api import deps
from app.services.vector_service import vector_service
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


class SearchRequest(BaseModel):
    """Request model for semantic search."""
    query: str
    limit: Optional[int] = 10
    score_threshold: Optional[float] = 0.7
    filters: Optional[Dict[str, Any]] = None


class HybridSearchRequest(BaseModel):
    """Request model for hybrid search."""
    query: str
    keyword_boost: Optional[float] = 0.3
    limit: Optional[int] = 10
    score_threshold: Optional[float] = 0.6
    filters: Optional[Dict[str, Any]] = None


class ReindexRequest(BaseModel):
    """Request model for case re-indexing."""
    case_id: str


class SearchResult(BaseModel):
    """Response model for search results."""
    document_id: str
    content: str
    score: float
    metadata: Dict[str, Any]


class IndexRequest(BaseModel):
    """Request model for indexing documents."""
    document_id: str
    content: str
    metadata: Dict[str, Any]


class BatchIndexRequest(BaseModel):
    """Request model for batch indexing."""
    documents: List[Dict[str, Any]]  # List of {document_id, content, metadata}


@router.post("/search", response_model=List[SearchResult])
async def semantic_search(
    request: SearchRequest,
    current_user = Depends(deps.get_current_user)
):
    """
    Perform semantic search across indexed documents.

    Returns documents semantically similar to the query,
    ranked by relevance score.
    """
    try:
        results = vector_service.search_similar(
            query=request.query,
            limit=request.limit or 10,
            score_threshold=request.score_threshold or 0.7
        )

        # Apply additional filters if provided
        if request.filters:
            results = vector_service.apply_filters(results, request.filters)

        logger.info(f"Semantic search completed: {len(results)} results", user_id=str(current_user.id))
        return results

    except Exception as e:
        logger.error(f"Semantic search failed: {e}")
        raise HTTPException(status_code=500, detail="Search operation failed")


@router.post("/index")
async def index_document(
    request: IndexRequest,
    current_user = Depends(deps.get_current_user)
):
    """
    Index a document for semantic search.

    The document content will be embedded and stored in the vector database.
    """
    try:
        success = vector_service.index_document(
            document_id=request.document_id,
            content=request.content,
            metadata=request.metadata
        )

        if success:
            logger.info(f"Document indexed: {request.document_id}", user_id=str(current_user.id))
            return {"status": "success", "message": "Document indexed successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to index document")

    except Exception as e:
        logger.error(f"Document indexing failed: {e}")
        raise HTTPException(status_code=500, detail="Indexing operation failed")


@router.post("/batch-index")
async def batch_index_documents(
    request: BatchIndexRequest,
    current_user = Depends(deps.get_current_user)
):
    """
    Batch index multiple documents for semantic search.

    More efficient than individual indexing for large numbers of documents.
    """
    try:
        # Validate request format
        documents = []
        for doc in request.documents:
            if not all(k in doc for k in ["document_id", "content", "metadata"]):
                raise HTTPException(
                    status_code=400,
                    detail="Each document must have document_id, content, and metadata"
                )
            documents.append((doc["document_id"], doc["content"], doc["metadata"]))

        results = vector_service.batch_index_documents(documents)

        successful = sum(1 for success in results.values() if success)
        total = len(results)

        logger.info(f"Batch indexing completed: {successful}/{total} successful", user_id=str(current_user.id))

        return {
            "status": "completed",
            "successful": successful,
            "total": total,
            "results": results
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Batch indexing failed: {e}")
        raise HTTPException(status_code=500, detail="Batch indexing operation failed")


@router.delete("/documents/{document_id}")
async def delete_indexed_document(
    document_id: str,
    current_user = Depends(deps.get_current_user)
):
    """
    Delete a document from the semantic search index.
    """
    try:
        success = vector_service.delete_document(document_id)

        if success:
            logger.info(f"Document deleted from index: {document_id}", user_id=str(current_user.id))
            return {"status": "success", "message": "Document deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Document not found or deletion failed")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document deletion failed: {e}")
        raise HTTPException(status_code=500, detail="Deletion operation failed")


@router.put("/documents/{document_id}")
async def update_indexed_document(
    document_id: str,
    request: IndexRequest,
    current_user = Depends(deps.get_current_user)
):
    """
    Update a document in the semantic search index.

    This replaces the existing document with new content and metadata.
    """
    try:
        # Validate that the document_id in URL matches the request
        if request.document_id != document_id:
            raise HTTPException(
                status_code=400,
                detail="Document ID in URL must match document_id in request body"
            )

        success = vector_service.update_document(
            document_id=document_id,
            new_content=request.content,
            metadata=request.metadata
        )

        if success:
            logger.info(f"Document updated in index: {document_id}", user_id=str(current_user.id))
            return {"status": "success", "message": "Document updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update document")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Document update failed: {e}")
        raise HTTPException(status_code=500, detail="Update operation failed")


@router.get("/stats")
async def get_vector_stats(
    current_user = Depends(deps.get_current_user)
):
    """
    Get statistics about the vector database and indexed documents.
    """
    try:
        stats = vector_service.get_collection_stats()
        logger.info("Vector stats retrieved", user_id=str(current_user.id))
        return stats

    except Exception as e:
        logger.error(f"Failed to get vector stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve statistics")


@router.post("/hybrid-search", response_model=List[SearchResult])
async def hybrid_search(
    request: HybridSearchRequest,
    current_user = Depends(deps.get_current_user)
):
    """
    Perform hybrid search combining semantic similarity with keyword matching.

    This provides more accurate results by considering both meaning and exact terms.
    """
    try:
        results = vector_service.hybrid_search(
            query=request.query,
            keyword_boost=request.keyword_boost or 0.3,
            limit=request.limit or 10,
            score_threshold=request.score_threshold or 0.6
        )

        # Apply additional filters if provided
        if request.filters:
            results = vector_service.apply_filters(results, request.filters)

        logger.info(f"Hybrid search completed: {len(results)} results", user_id=str(current_user.id))
        return results

    except Exception as e:
        logger.error(f"Hybrid search failed: {e}")
        raise HTTPException(status_code=500, detail="Hybrid search operation failed")


@router.get("/analytics")
async def get_search_analytics(
    days: int = Query(30, description="Number of days to analyze"),
    current_user = Depends(deps.get_current_user)
):
    """
    Get search analytics and insights.

    Provides metrics on search usage, popular queries, and system performance.
    """
    try:
        analytics = vector_service.get_search_analytics(days=days)
        logger.info("Search analytics retrieved", user_id=str(current_user.id))
        return analytics

    except Exception as e:
        logger.error(f"Failed to get search analytics: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve analytics")


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., description="Partial search query"),
    limit: int = Query(5, description="Maximum number of suggestions"),
    current_user = Depends(deps.get_current_user)
):
    """
    Get search suggestions based on partial query.

    Helps users discover relevant search terms and improves search experience.
    """
    try:
        suggestions = vector_service.get_search_suggestions(
            partial_query=q,
            limit=limit
        )
        logger.info(f"Search suggestions provided: {len(suggestions)}", user_id=str(current_user.id))
        return {"suggestions": suggestions}

    except Exception as e:
        logger.error(f"Failed to get search suggestions: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve suggestions")


@router.post("/reindex-case")
async def reindex_case_documents(
    request: ReindexRequest,
    current_user = Depends(deps.get_current_user)
):
    """
    Re-index all documents associated with a specific case.

    Useful when case metadata changes or for bulk updates after system changes.
    """
    try:
        result = vector_service.reindex_case_documents(request.case_id)

        if result["status"] == "completed":
            logger.info(f"Case re-indexing completed: {result.get('successful', 0)} documents",
                       user_id=str(current_user.id), case_id=request.case_id)
        else:
            logger.warning(f"Case re-indexing failed: {result.get('error', 'Unknown error')}",
                          user_id=str(current_user.id), case_id=request.case_id)

        return result

    except Exception as e:
        logger.error(f"Case re-indexing failed: {e}")
        raise HTTPException(status_code=500, detail="Case re-indexing operation failed")


@router.get("/health")
async def check_vector_health():
    """
    Check the health of the vector database connection.
    """
    try:
        stats = vector_service.get_collection_stats()
        return {
            "status": "healthy",
            "collection": stats.get("collection_name"),
            "documents_indexed": stats.get("vector_count", 0)
        }
    except Exception as e:
        logger.error(f"Vector health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }
    except Exception as e:
        logger.error(f"Vector health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }