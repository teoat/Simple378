# Semantic Search

**Status:** 📋 Planned (Phase 2)  
**Technology:** Qdrant Vector Database + Claude Embeddings

---

## Overview

Semantic search enables natural language queries across cases, documents, and transactions by understanding the meaning and context behind search terms, not just keyword matching. This allows analysts to find relevant information even when exact keywords aren't present.

---

## Core Capabilities

### 1. Natural Language Queries
Instead of keyword searches, analysts can use natural language:

**Examples:**
```
Traditional:     "wire transfer fraud"
Semantic:        "Find cases involving suspicious international payments"

Traditional:     "document forgery"
Semantic:        "Show me investigations where documents were altered or faked"

Traditional:     "high risk"
Semantic:        "What are the most concerning fraud cases this month?"
```

### 2. Similarity Search
Find similar cases, documents, or patterns:
- "Find cases similar to Case #5678"
- "Show documents similar to this invoice"
- "Find subjects with similar transaction patterns"

### 3. Question Answering
Ask questions about your data:
- "What is the average fraud amount in wire transfer cases?"
- "Which analyst has the most closed cases this month?"
- "What are common patterns in check fraud investigations?"

---

## Architecture

### Vector Database: Qdrant

**Why Qdrant:**
- Self-hosted (on-premise data control)
- High performance (millions of vectors)
- Advanced filtering (combine vector + metadata search)
- HNSW algorithm for fast approximate search
- REST & gRPC APIs

**Configuration:**
```yaml
# docker-compose.yml
qdrant:
  image: qdrant/qdrant:latest
  ports:
    - "6333:6333"
  volumes:
    - qdrant_storage:/qdrant/storage
  environment:
    QDRANT__SERVICE__GRPC_PORT: 6334
```

### Embedding Generation

**Provider:** OpenAI (primary) or similar embedding service  
**Model:** `text-embedding-ada-002` (OpenAI) or `text-embedding-3-small`  
**Dimension:** 1536 (ada-002) or 1536/768 (configurable for v3)

**Process:**
```
Document Text → Embedding API → Vector [1536 floats] → Qdrant
```

---

## Data Collections

### 1. Cases Collection
**Indexed Fields:**
- Case title
- Case description
- Summary/notes
- AI reasoning text
- Tags

**Metadata Filters:**
- Status (open, closed, pending)
- Priority (low, medium, high)
- Created date range
- Risk score range
- Assigned analyst

**Example:**
```json
{
  "id": "case_123",
  "vector": [0.012, -0.043, 0.891, ...],
  "payload": {
    "title": "Wire Transfer Investigation",
    "description": "Suspicious wire transfer to offshore...",
    "status": "open",
    "priority": "high",
    "risk_score": 87,
    "created_at": "2025-12-01T10:00:00Z"
  }
}
```

### 2. Documents Collection
**Indexed Fields:**
- OCR extracted text
- Document title/filename
- Metadata (author, creation date)

**Metadata Filters:**
- File type (PDF, DOCX, image)
- Upload date
- Case association
- Forensic flags

### 3. Transaction Collection (Planned)
**Indexed Fields:**
- Transaction description
- Merchant/counterparty name
- Notes/memos

**Metadata Filters:**
- Amount range
- Date range
- Transaction type
- Subject/account

---

## Query Flow

### Standard Semantic Search

```typescript
async function semanticSearch(query: string, filters?: Filters) {
  // 1. Generate embedding for query
  const queryVector = await generateEmbedding(query);
  
  // 2. Search Qdrant
  const results = await qdrantClient.search('cases', {
    vector: queryVector,
    limit: 20,
    filter: filters,
    with_payload: true,
    score_threshold: 0.7  // Minimum similarity
  });
  
  // 3. Return results with scores
  return results.map(r => ({
    id: r.id,
    score: r.score,
    data: r.payload
  }));
}
```

### Hybrid Search
Combines semantic search with keyword search for best results:

```typescript
async function hybridSearch(query: string) {
  // Get results from both methods
  const semanticResults = await semanticSearch(query);
  const keywordResults = await keywordSearch(query);
  
  // Combine and re-rank using RRF (Reciprocal Rank Fusion)
  return rerankResults(semanticResults, keywordResults);
}
```

---

## API Endpoints

### Search Endpoint
```http
POST /api/v1/search/semantic
Content-Type: application/json

{
  "query": "Find cases involving altered bank documents",
  "collection": "cases" | "documents" | "transactions",
  "limit": 20,
  "filters": {
    "status": "open",
    "risk_score": { "gte": 70 }
  },
  "hybrid": true
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "case_456",
      "score": 0.89,
      "title": "Document Forgery Investigation",
      "snippet": "Analysis revealed altered bank statements with inconsistent fonts...",
      "metadata": {
        "status": "open",
        "priority": "high",
        "created_at": "2025-11-28T14:30:00Z"
      }
    }
  ],
  "took_ms": 45,
  "total": 7
}
```

### Similar Items
```http
GET /api/v1/search/similar/{type}/{id}?limit=10
```

Example: `/api/v1/search/similar/case/case_123?limit=10`

### Question Answering (Advanced)
```http
POST /api/v1/search/ask
Content-Type: application/json

{
  "question": "What are the most common fraud patterns this month?",
  "context": "cases",  // Search within cases
  "include_sources": true
}
```

**Response:**
```json
{
  "answer": "Based on the analysis of cases this month, the most common fraud patterns are: 1) Wire transfer fraud (45% of cases), particularly targeting elderly victims...",
  "sources": [
    { "case_id": "case_123", "relevance": 0.92 },
    { "case_id": "case_456", "relevance": 0.87 }
  ],
  "confidence": 0.85
}
```

---

## Indexing Pipeline

### Automatic Indexing
When new content is created or updated:

```python
@app.post("/api/v1/cases")
async def create_case(case: CaseCreate):
    # 1. Save to PostgreSQL
    db_case = await save_case(case)
    
    # 2. Generate embedding (async task)
    await index_case_in_qdrant.delay(db_case.id)
    
    return db_case

# Celery task
@celery.task
def index_case_in_qdrant(case_id: str):
    case = get_case(case_id)
    
    # Combine title + description + tags
    text = f"{case.title} {case.description} {' '.join(case.tags)}"
    
    # Generate embedding
    vector = generate_embedding(text)
    
    # Index in Qdrant
    qdrant_client.upsert(
        collection_name="cases",
        points=[
            {
                "id": case_id,
                "vector": vector,
                "payload": {
                    "title": case.title,
                    "description": case.description[:500],
                    "status": case.status,
                    "priority": case.priority,
                    "risk_score": case.risk_score,
                    "created_at": case.created_at.isoformat()
                }
            }
        ]
    )
```

### Bulk Reindexing
For initial setup or after schema changes:

```bash
# Backend management command
poetry run python -m app.cli index-all-cases
poetry run python -m app.cli index-all-documents
```

---

## Advanced Features

### 1. Faceted Search
Combine semantic search with facets:
```json
{
  "query": "fraud cases",
  "facets": {
    "status": ["open", "pending"],
    "priority": ["high", "critical"],
    "date_range": {
      "from": "2025-11-01",
      "to": "2025-12-01"
    }
  }
}
```

### 2. Multi-Vector Search
Search across multiple collections simultaneously:
```json
{
  "query": "forged invoice",
  "collections": ["cases", "documents"],
  "weights": {
    "cases": 0.6,
    "documents": 0.4
  }
}
```

### 3. Contextual Embeddings
Generate different embeddings based on context:
- **Subject-focused:** Emphasize subject relationships
- **Transaction-focused:** Emphasize transaction patterns
- **Document-focused:** Emphasize document content

### 4. Feedback Loop
Improve search quality through user feedback:
```typescript
// User clicks on result #3 instead of #1
await recordSearchFeedback({
  query: "wire fraud",
  clicked_result: "case_789",
  position: 3,
  session_id: "sess_xyz"
});

// Use feedback to fine-tune rankings
```

---

## Performance Optimization

### Caching Strategy
```python
# Cache embeddings for common queries
@lru_cache(maxsize=1000)
def get_query_embedding(query: str):
    return generate_embedding(query)

# Cache search results (5 min TTL)
@cache.memoize(timeout=300)
def search_cached(query: str, filters: dict):
    return semantic_search(query, filters)
```

### Batch Processing
```python
# Batch embedding generation
async def batch_generate_embeddings(texts: list[str]):
    # Send all texts in single API call
    return await embedding_api.create(input=texts)
```

### Index Optimization
- **Quantization:** Reduce vector size (1536 → 768 floats)
- **HNSW Parameters:** Balance speed vs accuracy
- **Sharding:** Distribute across multiple Qdrant nodes

---

## Integration Points

### With AI Assistant
- AI suggests search queries based on conversation
- Search results used as context for AI responses
- AI explains why results are relevant

### With Dashboard
- "Find similar" button on high-risk cases
- Semantic filtering in analytics
- Trend detection using similarity clustering

### With Reconciliation
- "Find matching transactions" using descriptions
- Semantic categorization of transactions
- Duplicate detection based on similarity

---

## Security & Privacy

### Data Isolation
- Separate Qdrant collections per organization (multi-tenant)
- Access control via metadata filters
- Encrypted vectors at rest

### PII Handling
- Strip sensitive data before indexing
- Anonymize subject names in embeddings
- Configurable data retention policies

---

## Monitoring & Metrics

### Search Quality Metrics
- **Precision@K:** Relevance of top K results
- **Mean Reciprocal Rank (MRR):** Position of first relevant result
- **Click-Through Rate (CTR):** % of searches with clicks
- **Zero Result Rate:** % of searches with no results

### Performance Metrics
- Embedding generation time
- Search latency (target < 100ms)
- Index size and growth rate
- Cache hit rate

---

## Future Enhancements

### Phase 2 (Q1 2026)
- [ ] Multi-language support
- [ ] Image similarity search
- [ ] Audio transcription + semantic search
- [ ] Automatic entity extraction from queries

### Phase 3 (Q2 2026)
- [ ] Graph-aware embeddings (consider network structure)
- [ ] Time-aware search (recent events weighted higher)
- [ ] Custom domain-specific embedding models
- [ ] Federated search across multiple systems

---

## Example Use Cases

### 1. Find Similar Cases
**User:** "Find cases similar to this wire fraud case"
```typescript
const similar = await findSimilarCases(currentCase.id, {
  limit: 10,
  min_score: 0.75
});
```

### 2. Document Discovery
**User:** "Show me all documents mentioning shell companies"
```typescript
const docs = await semanticSearchDocuments(
  "shell companies offshore accounts",
  { file_type: "pdf" }
);
```

### 3. Pattern Detection
**User:** "Are there other cases with this transaction pattern?"
```typescript
const pattern = extractTransactionPattern(currentCase);
const matches = await findSimilarPatterns(pattern);
```

---

## Cost Estimation

**Embedding Costs (OpenAI ada-002):**
- $0.0001 per 1K tokens
- Average case: ~500 tokens = $0.00005
- 10K cases = $0.50
- 100K documents = $5.00

**Infrastructure Costs:**
- Qdrant: Self-hosted (included in existing infra)
- Storage: ~1GB per 100K vectors
- RAM: ~4GB per 1M vectors

---

## Related Documentation
- [Search & Analytics](./SEARCH_ANALYTICS.md)
- [Case List Search](./02_CASE_LIST.md#search)
- [AI Integration](./docs/architecture/06_ai_orchestration_spec.md)
- [Vector Database Setup](./docs/architecture/01_system_architecture.md#vector-search)

---

**References:**
- [Qdrant Documentation](https://qdrant.tech/documentation/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Hybrid Search Best Practices](https://www.pinecone.io/learn/hybrid-search/)
