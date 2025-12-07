from meilisearch import Client
from typing import List, Dict, Any, Optional
from app.core.config import settings
from datetime import datetime
import json


class MeilisearchService:
    def __init__(self):
        self.client = Client(
            url=settings.MEILISEARCH_URL, api_key=settings.MEILISEARCH_API_KEY
        )

    async def create_index(self, index_name: str, primary_key: str = "id"):
        """Create a Meilisearch index if it doesn't exist."""
        try:
            self.client.create_index(index_name, {"primaryKey": primary_key})
        except Exception as e:
            # Index might already exist
            print(f"Index {index_name} creation note: {e}")

    async def add_documents(self, index_name: str, documents: List[Dict[str, Any]]):
        """Add documents to a Meilisearch index."""
        index = self.client.index(index_name)
        return index.add_documents(documents)

    async def update_documents(self, index_name: str, documents: List[Dict[str, Any]]):
        """Update documents in a Meilisearch index."""
        index = self.client.index(index_name)
        return index.update_documents(documents)

    async def delete_documents(self, index_name: str, document_ids: List[str]):
        """Delete documents from a Meilisearch index."""
        index = self.client.index(index_name)
        return index.delete_documents(document_ids)

    async def search(
        self,
        index_name: str,
        query: str,
        limit: int = 20,
        offset: int = 0,
        filters: Optional[str] = None,
        sort: Optional[List[str]] = None,
        attributes_to_highlight: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Perform a search query."""
        index = self.client.index(index_name)

        search_params = {"limit": limit, "offset": offset}

        if filters:
            search_params["filter"] = filters

        if sort:
            search_params["sort"] = sort

        if attributes_to_highlight:
            search_params["attributesToHighlight"] = attributes_to_highlight

        return index.search(query, search_params)

    async def get_facets(self, index_name: str, facet_name: str) -> Dict[str, Any]:
        """Get facet distribution for a specific facet."""
        index = self.client.index(index_name)
        return index.get_facets_distribution(facet_name)

    async def configure_index(self, index_name: str):
        """Configure index settings for optimal search."""
        index = self.client.index(index_name)

        # Configure searchable attributes
        index.update_searchable_attributes(
            [
                "name",
                "description",
                "subject_name",
                "amount",
                "date",
                "source_bank",
                "category",
                "status",
                "risk_score",
                "type",
                "content",
            ]
        )

        # Configure filterable attributes
        index.update_filterable_attributes(
            [
                "type",
                "status",
                "risk_score",
                "source_bank",
                "date",
                "amount",
                "subject_id",
                "source_type",
                "category",
            ]
        )

        # Configure sortable attributes
        index.update_sortable_attributes(
            ["date", "amount", "risk_score", "created_at", "updated_at"]
        )

        # Configure displayed attributes
        index.update_displayed_attributes(
            [
                "id",
                "name",
                "description",
                "subject_name",
                "amount",
                "date",
                "source_bank",
                "category",
                "status",
                "risk_score",
                "type",
                "created_at",
                "updated_at",
                "content",
            ]
        )

        # Configure ranking rules
        index.update_ranking_rules(
            ["words", "typo", "proximity", "attribute", "sort", "exactness"]
        )

        # Configure typo tolerance
        index.update_typo_tolerance(
            {
                "enabled": True,
                "minWordSizeForTypos": {"oneTypo": 5, "twoTypos": 9},
                "disableOnWords": [],
                "disableOnAttributes": [],
            }
        )

    async def get_search_suggestions(
        self, index_name: str, query: str, limit: int = 5
    ) -> List[str]:
        """Get search suggestions based on existing data."""
        # This is a simplified implementation - in production you'd want more sophisticated suggestions
        try:
            results = await self.search(index_name, query, limit=limit)
            suggestions = []

            # Extract unique terms from results
            seen_terms = set()
            for hit in results.get("hits", []):
                # Add name variations
                if "name" in hit and hit["name"]:
                    name_parts = hit["name"].lower().split()
                    for part in name_parts:
                        if len(part) > 2 and part not in seen_terms:
                            suggestions.append(part)
                            seen_terms.add(part)
                            if len(suggestions) >= limit:
                                break

                if len(suggestions) >= limit:
                    break

            return suggestions[:limit]
        except Exception:
            return []

    async def save_search_preset(
        self, user_id: str, preset_name: str, search_config: Dict[str, Any]
    ):
        """Save a search preset for a user."""
        # This would typically be stored in a database
        # For now, we'll store in Meilisearch as a document
        preset_doc = {
            "id": f"preset_{user_id}_{preset_name}",
            "user_id": user_id,
            "preset_name": preset_name,
            "search_config": json.dumps(search_config),
            "created_at": json.dumps(
                {
                    "$date": {
                        "$numberLong": str(int(datetime.utcnow().timestamp() * 1000))
                    }
                }
            ),
        }

        await self.add_documents("search_presets", [preset_doc])

    async def get_search_presets(self, user_id: str) -> List[Dict[str, Any]]:
        """Get saved search presets for a user."""
        try:
            results = await self.search(
                "search_presets", "", filters=f"user_id = {user_id}", limit=50
            )
            presets = []
            for hit in results.get("hits", []):
                presets.append(
                    {
                        "name": hit["preset_name"],
                        "config": json.loads(hit["search_config"]),
                    }
                )
            return presets
        except Exception:
            return []


# Global instance
meilisearch_service = MeilisearchService()
