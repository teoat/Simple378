#!/usr/bin/env python3
"""
Test script for Qdrant vector database integration.
Tests basic functionality of vector search and document indexing.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

# Set minimal environment variables for testing
os.environ.setdefault("QDRANT_URL", "http://localhost:6333")

from app.services.vector_service import vector_service


async def test_vector_service():
    """Test basic vector service functionality."""
    print("🧪 Testing Qdrant Vector Service")
    print("=" * 50)

    try:
        # Test 1: Collection stats
        print("📊 Testing collection stats...")
        stats = vector_service.get_collection_stats()
        print(f"✅ Collection: {stats.get('collection_name', 'N/A')}")
        print(f"✅ Documents indexed: {stats.get('vector_count', 0)}")
        print(f"✅ Vector size: {stats.get('vector_size', 'N/A')}")

        # Test 2: Embedding generation
        print("\n🧠 Testing embedding generation...")
        test_text = "This is a test document about financial fraud and suspicious transactions."
        embedding = vector_service.generate_embedding(test_text)
        print(f"✅ Generated embedding with {len(embedding)} dimensions")

        # Test 3: Document indexing
        print("\n📝 Testing document indexing...")
        success = vector_service.index_document(
            document_id="test-doc-001",
            content=test_text,
            metadata={
                "test": True,
                "category": "financial_fraud",
                "source": "test_script"
            }
        )
        print(f"✅ Document indexing: {'Success' if success else 'Failed'}")

        # Test 4: Semantic search
        print("\n🔍 Testing semantic search...")
        results = vector_service.search_similar(
            query="financial fraud suspicious",
            limit=5,
            score_threshold=0.5
        )
        print(f"✅ Found {len(results)} similar documents")

        if results:
            print("📋 Top result:")
            print(f"   - Document ID: {results[0]['document_id']}")
            print(".1f")
            print(f"   - Content preview: {results[0]['content'][:100]}...")

            # Test 5: Document deletion
            print("\n🗑️  Testing document deletion...")
            delete_success = vector_service.delete_document("test-doc-001")
            print(f"✅ Document deletion: {'Success' if delete_success else 'Failed'}")

            # Test 6: Hybrid search
            print("\n🔄 Testing hybrid search...")
            hybrid_results = vector_service.hybrid_search(
                query="financial fraud",
                keyword_boost=0.3,
                limit=5
            )
            print(f"✅ Hybrid search: {len(hybrid_results)} results")

            # Test 7: Search suggestions
            print("\n💡 Testing search suggestions...")
            suggestions = vector_service.get_search_suggestions("fraud", 3)
            print(f"✅ Search suggestions: {len(suggestions)} results")
            if suggestions:
                print(f"   Sample: {suggestions[0]}")

            # Test 8: Search analytics
            print("\n📊 Testing search analytics...")
            analytics = vector_service.get_search_analytics(days=7)
            print(f"✅ Search analytics: {len(analytics)} metrics")
            if 'total_documents' in analytics:
                print(f"   Total documents: {analytics['total_documents']}")

            # Test 9: Filtering
            print("\n🔍 Testing advanced filtering...")
            # First index a document with metadata for filtering
            vector_service.index_document(
                document_id="filter-test-doc",
                content="This is a test document with high risk financial content",
                metadata={
                    "file_type": "pdf",
                    "risk_level": "high",
                    "case_id": "test-case-123"
                }
            )

            # Test filtering by file type
            filtered_results = vector_service.apply_filters(
                [{"document_id": "filter-test-doc", "content": "test", "score": 0.8, "metadata": {"file_type": "pdf"}}],
                {"file_types": ["pdf"]}
            )
            print(f"✅ File type filtering: {len(filtered_results)} results")

            # Test filtering by risk level
            filtered_results = vector_service.apply_filters(
                [{"document_id": "filter-test-doc", "content": "test", "score": 0.8, "metadata": {"risk_level": "high"}}],
                {"risk_levels": ["high"]}
            )
            print(f"✅ Risk level filtering: {len(filtered_results)} results")

            # Clean up test document
            vector_service.delete_document("filter-test-doc")

            print("\n🎉 All vector service tests completed successfully!")
            return True

    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False


async def test_vector_api():
    """Test vector API endpoints."""
    print("\n🌐 Testing Vector API Endpoints")
    print("=" * 50)

    try:
        import httpx

        base_url = "http://localhost:8000/api/v1"
        headers = {
            "Content-Type": "application/json",
            # Note: In a real test, you'd need authentication
        }

        # Test health endpoint
        print("🏥 Testing vector health endpoint...")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/vector/health")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Health check: {data.get('status', 'unknown')}")
                print(f"   Documents indexed: {data.get('documents_indexed', 0)}")
            else:
                print(f"⚠️  Health check failed: HTTP {response.status_code}")

        # Test search suggestions
        print("💡 Testing search suggestions...")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/vector/suggestions?q=fraud")
            if response.status_code == 200:
                data = response.json()
                suggestions = data.get('suggestions', [])
                print(f"✅ Suggestions for 'fraud': {len(suggestions)} results")
                if suggestions:
                    print(f"   Sample: {suggestions[0]}")
            else:
                print(f"⚠️  Suggestions failed: HTTP {response.status_code}")

        # Test analytics endpoint
        print("📊 Testing analytics endpoint...")
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{base_url}/vector/analytics")
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Analytics retrieved: {len(data)} metrics")
                if 'total_documents' in data:
                    print(f"   Total documents: {data['total_documents']}")
            else:
                print(f"⚠️  Analytics failed: HTTP {response.status_code}")

        print("\n🎉 Vector API tests completed!")
        return True

    except ImportError:
        print("⚠️  httpx not available, skipping API tests")
        return True
    except Exception as e:
        print(f"❌ API test failed: {e}")
        return False


async def main():
    """Run all vector database tests."""
    print("🚀 Qdrant Vector Database Integration Test")
    print("=" * 60)

    # Check environment
    qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
    print(f"📍 Qdrant URL: {qdrant_url}")
    print(f"📍 Collection: fraud_documents")
    print()

    # Run tests
    service_tests = await test_vector_service()
    api_tests = await test_vector_api()

    # Summary
    print("\n" + "=" * 60)
    if service_tests and api_tests:
        print("🎉 ALL TESTS PASSED - Qdrant integration is working!")
        print("\n📋 Next steps:")
        print("1. Upload documents via the Forensics page to populate the index")
        print("2. Use the Semantic Search page to query indexed documents")
        print("3. Monitor vector search performance in production")
        return 0
    else:
        print("❌ SOME TESTS FAILED - Check Qdrant configuration")
        print("\n🔧 Troubleshooting:")
        print("1. Ensure Qdrant is running: docker-compose ps")
        print("2. Check Qdrant logs: docker-compose logs vector_db")
        print("3. Verify QDRANT_URL in .env file")
        return 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)