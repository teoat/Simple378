from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

from app.api import deps
from app.services.meilisearch_service import meilisearch_service
from app.db.models import Subject, Transaction
from app.db import models
from sqlalchemy.future import select
import uuid

router = APIRouter()

class SearchRequest(BaseModel):
    query: str
    index: str = "all"  # 'all', 'cases', 'transactions', 'evidence'
    limit: int = 20
    offset: int = 0
    filters: Optional[Dict[str, Any]] = None
    sort: Optional[List[str]] = None

class SearchPreset(BaseModel):
    name: str
    config: Dict[str, Any]

@router.post("/index-data", response_model=Dict[str, Any])
async def index_all_data(
    db: AsyncSession = Depends(deps.get_db),
    current_user = Depends(deps.get_current_user)
):
    """
    Index all relevant data into Meilisearch for full-text search.
    This should be called periodically or after data updates.
    """
    try:
        # Index cases/subjects
        subjects_result = await db.execute(select(Subject))
        subjects = subjects_result.scalars().all()

        case_documents = []
        for subject in subjects:
            # Get latest analysis for risk score
            analysis_result = await db.execute(
                select(models.AnalysisResult)
                .where(models.AnalysisResult.subject_id == subject.id)
                .order_by(models.AnalysisResult.created_at.desc())
            )
            analysis = analysis_result.scalars().first()

            case_doc = {
                'id': str(subject.id),
                'name': subject.encrypted_pii.get('name', f'Subject {str(subject.id)[:8]}') if isinstance(subject.encrypted_pii, dict) else f'Subject {str(subject.id)[:8]}',
                'type': 'case',
                'status': 'active',  # Could be enhanced with actual status
                'risk_score': analysis.risk_score if analysis else 0,
                'created_at': subject.created_at.isoformat() if subject.created_at else None,
                'updated_at': subject.updated_at.isoformat() if subject.updated_at else None,
                'content': f"Case for {subject.encrypted_pii.get('name', 'Unknown') if isinstance(subject.encrypted_pii, dict) else 'Unknown'}"
            }
            case_documents.append(case_doc)

        # Index transactions
        transactions_result = await db.execute(select(Transaction))
        transactions = transactions_result.scalars().all()

        transaction_documents = []
        for tx in transactions:
            tx_doc = {
                'id': str(tx.id),
                'name': f"Transaction {str(tx.id)[:8]}",
                'type': 'transaction',
                'amount': float(tx.amount) if tx.amount else 0,
                'date': tx.date.isoformat() if tx.date else None,
                'description': tx.description or '',
                'source_bank': tx.source_bank or '',
                'subject_id': str(tx.subject_id),
                'currency': tx.currency or 'USD',
                'created_at': tx.created_at.isoformat() if tx.created_at else None,
                'content': f"Transaction: {tx.description or ''} Amount: {tx.amount or 0} Bank: {tx.source_bank or ''}"
            }
            transaction_documents.append(tx_doc)

        # Create indexes and add documents
        await meilisearch_service.create_index('cases')
        await meilisearch_service.create_index('transactions')
        await meilisearch_service.create_index('search_presets')

        # Configure indexes
        await meilisearch_service.configure_index('cases')
        await meilisearch_service.configure_index('transactions')
        await meilisearch_service.configure_index('search_presets')

        # Add documents
        if case_documents:
            await meilisearch_service.add_documents('cases', case_documents)
        if transaction_documents:
            await meilisearch_service.add_documents('transactions', transaction_documents)

        return {
            "message": "Data indexed successfully",
            "cases_indexed": len(case_documents),
            "transactions_indexed": len(transaction_documents)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing failed: {str(e)}")

@router.post("/search", response_model=Dict[str, Any])
async def search_all(
    request: SearchRequest,
    current_user = Depends(deps.get_current_user)
):
    """
    Perform full-text search across all indexed data.
    """
    try:
        results = []

        # Search in cases index
        if request.index in ['all', 'cases']:
            case_results = await meilisearch_service.search(
                'cases',
                request.query,
                limit=request.limit,
                offset=request.offset,
                filters=request.filters.get('cases') if request.filters else None,
                sort=request.sort
            )
            results.extend([{
                **hit,
                '_index': 'cases',
                '_formatted': hit.get('_formatted', {})
            } for hit in case_results.get('hits', [])])

        # Search in transactions index
        if request.index in ['all', 'transactions']:
            tx_results = await meilisearch_service.search(
                'transactions',
                request.query,
                limit=request.limit,
                offset=request.offset,
                filters=request.filters.get('transactions') if request.filters else None,
                sort=request.sort
            )
            results.extend([{
                **hit,
                '_index': 'transactions',
                '_formatted': hit.get('_formatted', {})
            } for hit in tx_results.get('hits', [])])

        # Sort combined results by relevance (estimated hits)
        results.sort(key=lambda x: x.get('_rankingScore', 0), reverse=True)
        results = results[:request.limit]

        return {
            "query": request.query,
            "hits": results,
            "total": len(results),
            "offset": request.offset,
            "limit": request.limit
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/suggestions", response_model=List[str])
async def get_search_suggestions(
    q: str = Query(..., description="Search query"),
    limit: int = Query(5, description="Number of suggestions"),
    current_user = Depends(deps.get_current_user)
):
    """
    Get search suggestions based on the query.
    """
    try:
        # Get suggestions from all indexes
        all_suggestions = []

        for index_name in ['cases', 'transactions']:
            suggestions = await meilisearch_service.get_search_suggestions(index_name, q, limit)
            all_suggestions.extend(suggestions)

        # Remove duplicates and limit
        unique_suggestions = list(set(all_suggestions))[:limit]

        return unique_suggestions

    except Exception as e:
        return []

@router.post("/presets", response_model=Dict[str, Any])
async def save_search_preset(
    preset: SearchPreset,
    current_user = Depends(deps.get_current_user)
):
    """
    Save a search preset for the current user.
    """
    try:
        await meilisearch_service.save_search_preset(
            str(current_user.id),
            preset.name,
            preset.config
        )
        return {"message": "Preset saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save preset: {str(e)}")

@router.get("/presets", response_model=List[Dict[str, Any]])
async def get_search_presets(
    current_user = Depends(deps.get_current_user)
):
    """
    Get saved search presets for the current user.
    """
    try:
        presets = await meilisearch_service.get_search_presets(str(current_user.id))
        return presets
    except Exception as e:
        return []

@router.delete("/presets/{preset_name}")
async def delete_search_preset(
    preset_name: str,
    current_user = Depends(deps.get_current_user)
):
    """
    Delete a search preset.
    """
    try:
        await meilisearch_service.delete_documents(
            'search_presets',
            [f"preset_{current_user.id}_{preset_name}"]
        )
        return {"message": "Preset deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete preset: {str(e)}")

@router.get("/facets/{index_name}", response_model=Dict[str, Any])
async def get_facets(
    index_name: str,
    facet_name: str = Query(..., description="Facet field name"),
    current_user = Depends(deps.get_current_user)
):
    """
    Get facet distribution for a specific field.
    """
    try:
        facets = await meilisearch_service.get_facets(index_name, facet_name)
        return facets
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get facets: {str(e)}")

@router.post("/advanced-search", response_model=Dict[str, Any])
async def advanced_search(
    request: SearchRequest,
    current_user = Depends(deps.get_current_user)
):
    """
    Perform advanced search with multiple filters and facets.
    """
    try:
        # Build filter string from request.filters
        filter_parts = []
        if request.filters:
            for field, value in request.filters.items():
                if isinstance(value, list):
                    # Multiple values for the same field
                    filter_parts.append(f"{field} IN [{', '.join(f'\"{v}\"' for v in value)}]")
                elif isinstance(value, dict):
                    # Range filters
                    if 'min' in value:
                        filter_parts.append(f"{field} >= {value['min']}")
                    if 'max' in value:
                        filter_parts.append(f"{field} <= {value['max']}")
                else:
                    # Exact match
                    filter_parts.append(f"{field} = \"{value}\"")

        filter_string = " AND ".join(filter_parts) if filter_parts else None

        results = await meilisearch_service.search(
            request.index if request.index != 'all' else 'cases',  # Default to cases for now
            request.query,
            limit=request.limit,
            offset=request.offset,
            filters=filter_string,
            sort=request.sort,
            attributes_to_highlight=['name', 'description', 'content']
        )

        # Get facet distributions for common fields
        facets = {}
        if request.index in ['all', 'cases']:
            try:
                risk_facets = await meilisearch_service.get_facets('cases', 'risk_score')
                type_facets = await meilisearch_service.get_facets('cases', 'type')
                facets['cases'] = {
                    'risk_score': risk_facets,
                    'type': type_facets
                }
            except:
                pass

        if request.index in ['all', 'transactions']:
            try:
                amount_facets = await meilisearch_service.get_facets('transactions', 'amount')
                bank_facets = await meilisearch_service.get_facets('transactions', 'source_bank')
                facets['transactions'] = {
                    'amount': amount_facets,
                    'source_bank': bank_facets
                }
            except:
                pass

        return {
            "query": request.query,
            "hits": results.get('hits', []),
            "total": results.get('estimatedTotalHits', 0),
            "offset": request.offset,
            "limit": request.limit,
            "facets": facets,
            "processing_time": results.get('processingTimeMs', 0)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced search failed: {str(e)}")