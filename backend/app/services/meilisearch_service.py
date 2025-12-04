"""
Meilisearch Integration Service

Provides fast, typo-tolerant full-text search capabilities for cases,
subjects, evidence, and transactions.
"""

from typing import List, Dict, Any, Optional
import meilisearch
from app.core.config import settings


class MeilisearchService:
    """Service for integrating with Meilisearch full-text search engine."""
    
    def __init__(self):
        self.client = meilisearch.Client(
            url=settings.MEILI_URL,
            api_key=settings.MEILI_MASTER_KEY
        )
        self._initialize_indexes()
    
    def _initialize_indexes(self):
        """Create and configure search indexes."""
        # Cases Index
        try:
            self.cases_index = self.client.index('cases')
        except Exception:
            self.cases_index = self.client.create_index('cases', {'primaryKey': 'id'})
        
        # Configure searchable attributes and filters
        self.cases_index.update_settings({
            'searchableAttributes': [
                'title',
                'description',
                'subject_name',
                'evidence_summary',
                'tags'
            ],
            'filterableAttributes': [
                'status',
                'risk_score',
                'assigned_to',
                'created_at',
                'priority'
            ],
            'sortableAttributes': [
                'created_at',
                'updated_at',
                'risk_score'
            ],
            'rankingRules': [
                'words',
                'typo',
                'proximity',
                'attribute',
                'sort',
                'exactness',
                'risk_score:desc'  # Custom ranking: prioritize high risk
            ]
        })
        
        # Subjects Index
        try:
            self.subjects_index = self.client.index('subjects')
        except Exception:
            self.subjects_index = self.client.create_index('subjects', {'primaryKey': 'id'})
        
        self.subjects_index.update_settings({
            'searchableAttributes': [
                'name',
                'description',
                'identifiers',
                'tags'
            ],
            'filterableAttributes': [
                'status',
                'risk_score',
                'fraud_detected'
            ],
            'sortableAttributes': [
                'risk_score',
                'created_at'
            ]
        })
        
        # Evidence Index
        try:
            self.evidence_index = self.client.index('evidence')
        except Exception:
            self.evidence_index = self.client.create_index('evidence', {'primaryKey': 'id'})
        
        self.evidence_index.update_settings({
            'searchableAttributes': [
                'filename',
                'extracted_text',
                'metadata',
                'tags'
            ],
            'filterableAttributes': [
                'file_type',
                'tampered',
                'case_id',
                'uploaded_at'
            ]
        })
    
    async def index_case(self, case_data: Dict[str, Any]):
        """
        Index a case document for searching.
        
        Args:
            case_data: Case information to index
        """
        self.cases_index.add_documents([case_data])
    
    async def index_cases_bulk(self, cases: List[Dict[str, Any]]):
        """Bulk index multiple cases."""
        self.cases_index.add_documents(cases)
    
    async def search_cases(
        self,
        query: str,
        filters: Optional[str] = None,
        limit: int = 20,
        offset: int = 0,
        sort: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Search cases with filters and sorting.
        
        Args:
            query: Search query string
            filters: Meilisearch filter string (e.g., "risk_score > 0.7 AND status = open")
            limit: Number of results to return
            offset: Pagination offset
            sort: List of sort fields (e.g., ['created_at:desc'])
        
        Returns:
            Search results with hits, estimated total, and facets
        """
        search_params = {
            'limit': limit,
            'offset': offset
        }
        
        if filters:
            search_params['filter'] = filters
        
        if sort:
            search_params['sort'] = sort
        
        # Enable facets for filters
        search_params['facets'] = ['status', 'priority', 'assigned_to']
        
        # Enable highlighting
        search_params['attributesToHighlight'] = ['title', 'description']
        
        results = self.cases_index.search(query, search_params)
        
        return {
            'hits': results['hits'],
            'total': results['estimatedTotalHits'],
            'facets': results.get('facetDistribution', {}),
            'processing_time_ms': results['processingTimeMs'],
            'query': query
        }
    
    async def search_subjects(
        self,
        query: str,
        filters: Optional[str] = None,
        limit: int = 20
    ) -> Dict[str, Any]:
        """Search subjects."""
        search_params = {'limit': limit}
        
        if filters:
            search_params['filter'] = filters
        
        results = self.subjects_index.search(query, search_params)
        
        return {
            'hits': results['hits'],
            'total': results['estimatedTotalHits']
        }
    
    async def search_evidence(
        self,
        query: str,
        case_id: Optional[str] = None,
        limit: int = 20
    ) -> Dict[str, Any]:
        """
        Search evidence documents.
        
        Args:
            query: Search query
            case_id: Filter by case ID
            limit: Number of results
        """
        search_params = {'limit': limit}
        
        if case_id:
            search_params['filter'] = f'case_id = {case_id}'
        
        search_params['attributesToHighlight'] = ['filename', 'extracted_text']
        
        results = self.evidence_index.search(query, search_params)
        
        return {
            'hits': results['hits'],
            'total': results['estimatedTotalHits']
        }
    
    async def autocomplete(
        self,
        query: str,
        index_name: str = 'cases',
        limit: int = 5
    ) -> List[str]:
        """
        Get autocomplete suggestions.
        
        Args:
            query: Partial query string
            index_name: Index to search
            limit: Number of suggestions
        """
        index = self.client.index(index_name)
        results = index.search(query, {'limit': limit})
        
        # Extract suggested queries from hits
        suggestions = []
        for hit in results['hits']:
            if 'title' in hit:
                suggestions.append(hit['title'])
            elif 'name' in hit:
                suggestions.append(hit['name'])
        
        return suggestions[:limit]
    
    async def delete_case(self, case_id: str):
        """Remove a case from the search index."""
        self.cases_index.delete_document(case_id)
    
    async def delete_subject(self, subject_id: str):
        """Remove a subject from the search index."""
        self.subjects_index.delete_document(subject_id)
    
    async def update_case(self, case_id: str, updates: Dict[str, Any]):
        """Update indexed case data."""
        updates['id'] = case_id
        self.cases_index.update_documents([updates])
    
    async def get_stats(self) -> Dict[str, Any]:
        """Get search index statistics."""
        return {
            'cases': self.cases_index.get_stats(),
            'subjects': self.subjects_index.get_stats(),
            'evidence': self.evidence_index.get_stats()
        }


# Singleton instance
_meili_service = None

def get_meilisearch_service() -> MeilisearchService:
    """Get singleton instance of MeilisearchService."""
    global _meili_service
    if _meili_service is None:
        _meili_service = MeilisearchService()
    return _meili_service
