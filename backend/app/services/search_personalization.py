"""
Search history and personalization service.
Manages user search history, saved searches, and personalized recommendations.
"""

import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, func

from app.core.logging import get_logger
from app.models import mens_rea as models

logger = get_logger(__name__)


class SearchPersonalizationService:
    """
    Service for managing personalized search experiences.
    """

    def __init__(self):
        pass

    async def save_search_history(
        self,
        db: AsyncSession,
        user_id: str,
        query: str,
        search_type: str = "semantic",
        filters: Optional[Dict[str, Any]] = None,
        result_count: int = 0,
        search_time_ms: Optional[int] = None
    ) -> str:
        """
        Save a search to user's history.

        Args:
            db: Database session
            user_id: User who performed the search
            query: Search query
            search_type: Type of search (semantic, hybrid, etc.)
            filters: Applied filters
            result_count: Number of results returned
            search_time_ms: Search execution time

        Returns:
            Search history ID
        """
        try:
            search_id = str(uuid.uuid4())

            # Create search history record
            search_history = models.SearchHistory(
                id=search_id,
                user_id=user_id,
                query=query,
                search_type=search_type,
                filters=filters or {},
                result_count=result_count,
                search_time_ms=search_time_ms,
                created_at=datetime.utcnow()
            )

            db.add(search_history)
            await db.commit()

            # Clean up old history (keep last 100 per user)
            await self._cleanup_old_history(db, user_id)

            logger.info(f"Saved search history for user {user_id}: {query[:50]}...")
            return search_id

        except Exception as e:
            logger.error(f"Failed to save search history: {e}")
            await db.rollback()
            raise

    async def get_search_history(
        self,
        db: AsyncSession,
        user_id: str,
        limit: int = 20,
        days: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Get user's recent search history.

        Args:
            db: Database session
            user_id: User ID
            limit: Maximum number of results
            days: Number of days to look back

        Returns:
            List of search history records
        """
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=days)

            result = await db.execute(
                select(models.SearchHistory)
                .where(
                    and_(
                        models.SearchHistory.user_id == user_id,
                        models.SearchHistory.created_at >= cutoff_date
                    )
                )
                .order_by(desc(models.SearchHistory.created_at))
                .limit(limit)
            )

            history_records = result.scalars().all()

            return [
                {
                    "id": record.id,
                    "query": record.query,
                    "search_type": record.search_type,
                    "filters": record.filters,
                    "result_count": record.result_count,
                    "search_time_ms": record.search_time_ms,
                    "created_at": record.created_at.isoformat()
                }
                for record in history_records
            ]

        except Exception as e:
            logger.error(f"Failed to get search history: {e}")
            return []

    async def save_search_template(
        self,
        db: AsyncSession,
        user_id: str,
        name: str,
        description: str,
        query: str,
        search_type: str = "semantic",
        filters: Optional[Dict[str, Any]] = None,
        is_public: bool = False
    ) -> str:
        """
        Save a search as a reusable template.

        Args:
            db: Database session
            user_id: Template owner
            name: Template name
            description: Template description
            query: Search query
            search_type: Search type
            filters: Default filters
            is_public: Whether template is shared with team

        Returns:
            Template ID
        """
        try:
            template_id = str(uuid.uuid4())

            template = models.SearchTemplate(
                id=template_id,
                user_id=user_id,
                name=name,
                description=description,
                query=query,
                search_type=search_type,
                filters=filters or {},
                is_public=is_public,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )

            db.add(template)
            await db.commit()

            logger.info(f"Saved search template: {name} for user {user_id}")
            return template_id

        except Exception as e:
            logger.error(f"Failed to save search template: {e}")
            await db.rollback()
            raise

    async def get_search_templates(
        self,
        db: AsyncSession,
        user_id: str,
        include_public: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Get user's search templates.

        Args:
            db: Database session
            user_id: User ID
            include_public: Include team-shared templates

        Returns:
            List of search templates
        """
        try:
            conditions = []
            if include_public:
                conditions.append(or_(
                    models.SearchTemplate.user_id == user_id,
                    models.SearchTemplate.is_public == True
                ))
            else:
                conditions.append(models.SearchTemplate.user_id == user_id)

            result = await db.execute(
                select(models.SearchTemplate)
                .where(and_(*conditions))
                .order_by(desc(models.SearchTemplate.updated_at))
            )

            templates = result.scalars().all()

            return [
                {
                    "id": template.id,
                    "name": template.name,
                    "description": template.description,
                    "query": template.query,
                    "search_type": template.search_type,
                    "filters": template.filters,
                    "is_public": template.is_public,
                    "created_at": template.created_at.isoformat(),
                    "updated_at": template.updated_at.isoformat()
                }
                for template in templates
            ]

        except Exception as e:
            logger.error(f"Failed to get search templates: {e}")
            return []

    async def get_search_recommendations(
        self,
        db: AsyncSession,
        user_id: str,
        current_query: str = "",
        limit: int = 5
    ) -> List[str]:
        """
        Get personalized search recommendations based on user history.

        Args:
            db: Database session
            user_id: User ID
            current_query: Current partial query
            limit: Number of recommendations

        Returns:
            List of recommended search queries
        """
        try:
            # Get user's recent successful searches
            recent_searches = await self.get_search_history(db, user_id, limit=50, days=90)

            recommendations = []

            if current_query:
                # Find searches that start with current query
                matching_searches = [
                    search for search in recent_searches
                    if search["query"].lower().startswith(current_query.lower())
                    and len(search["query"]) > len(current_query)
                ]

                # Sort by recency and success (result count)
                matching_searches.sort(
                    key=lambda x: (x["created_at"], x["result_count"]),
                    reverse=True
                )

                recommendations = [
                    search["query"] for search in matching_searches[:limit]
                ]
            else:
                # General recommendations based on successful searches
                successful_searches = [
                    search for search in recent_searches
                    if search["result_count"] > 0
                ]

                # Group by query and count frequency
                query_counts = {}
                for search in successful_searches:
                    query = search["query"]
                    query_counts[query] = query_counts.get(query, 0) + 1

                # Sort by frequency and recency
                sorted_queries = sorted(
                    query_counts.items(),
                    key=lambda x: x[1],
                    reverse=True
                )

                recommendations = [query for query, count in sorted_queries[:limit]]

            # If we don't have enough recommendations, add some defaults
            if len(recommendations) < limit:
                defaults = [
                    "financial fraud evidence",
                    "suspicious transactions",
                    "money laundering patterns",
                    "case investigation",
                    "evidence analysis"
                ]

                for default in defaults:
                    if default not in recommendations and len(recommendations) < limit:
                        recommendations.append(default)

            return recommendations[:limit]

        except Exception as e:
            logger.error(f"Failed to get search recommendations: {e}")
            return [
                "financial fraud evidence",
                "suspicious transactions",
                "case investigation"
            ]

    async def _cleanup_old_history(self, db: AsyncSession, user_id: str, max_history: int = 100):
        """Clean up old search history, keeping only the most recent entries."""
        try:
            # Count current history entries
            result = await db.execute(
                select(func.count(models.SearchHistory.id))
                .where(models.SearchHistory.user_id == user_id)
            )
            count = result.scalar()

            if count > max_history:
                # Delete oldest entries
                to_delete = count - max_history

                # Get IDs of oldest entries to delete
                result = await db.execute(
                    select(models.SearchHistory.id)
                    .where(models.SearchHistory.user_id == user_id)
                    .order_by(models.SearchHistory.created_at)
                    .limit(to_delete)
                )

                old_ids = result.scalars().all()

                if old_ids:
                    await db.execute(
                        models.SearchHistory.__table__.delete()
                        .where(models.SearchHistory.id.in_(old_ids))
                    )
                    await db.commit()

                    logger.info(f"Cleaned up {len(old_ids)} old search history entries for user {user_id}")

        except Exception as e:
            logger.error(f"Failed to cleanup search history: {e}")
            await db.rollback()


# Global instance
search_personalization_service = SearchPersonalizationService()