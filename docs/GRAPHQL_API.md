# GraphQL API Integration

## Overview
The AntiGravity system now includes a GraphQL API alongside the REST API, providing flexible querying capabilities for event sourcing data.

## Endpoints

### GraphQL Playground (GraphiQL)
- **URL**: `http://localhost:8000/graphql`
- **Method**: GET (browser)
- **Description**: Interactive GraphQL IDE for testing queries

### GraphQL Query Endpoint
- **URL**: `http://localhost:8000/graphql`
- **Method**: POST
- **Content-Type**: `application/json`

## Example Queries

### 1. Hello World Test
```graphql
query {
  hello
}
```

### 2. Fetch All Events (Limited to 100)
```graphql
query {
  events {
    id
    aggregateId
    aggregateType
    eventType
    timestamp
    nodeId
    version
    data
  }
}
```

### 3. Fetch Events for Specific Aggregate
```graphql
query GetCaseEvents {
  events(aggregateId: "your-uuid-here", limit: 50) {
    id
    eventType
    timestamp
    data
    version
  }
}
```

### 4. Query with Variables
```graphql
query GetEvents($aggregateId: String, $limit: Int) {
  events(aggregateId: $aggregateId, limit: $limit) {
    id
    aggregateId
    aggregateType
    eventType
    timestamp
  }
}
```

**Variables:**
```json
{
  "aggregateId": "123e4567-e89b-12d3-a456-426614174000",
  "limit": 20
}
```

## Testing

### Via Browser
1. Start the backend server
2. Navigate to `http://localhost:8000/graphql`
3. You should see the GraphiQL interface
4. Enter your query in the left panel
5. Click the "Play" button to execute

### Via cURL
```bash
curl -X POST http://localhost:8000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "{ events { id eventType timestamp } }"
  }'
```

### Via Python
```python
import requests

query = """
query {
  events(limit: 10) {
    id
    eventType
    timestamp
  }
}
"""

response = requests.post(
    "http://localhost:8000/graphql",
    json={"query": query},
    headers={"Authorization": "Bearer YOUR_TOKEN"}
)

print(response.json())
```

## Schema

### Types

#### EventType
- `id`: String! - Unique event identifier
- `aggregateId`: String! - Entity this event affects
- `aggregateType`: String! - Type of entity (Case, Subject, Evidence)
- `eventType`: String! - Event name (created, updated, deleted)
- `timestamp`: Float! - Event timestamp in milliseconds
- `nodeId`: String! - Node/instance that created the event
- `clock`: Int! - Lamport clock for causality
- `version`: Int! - Entity version after this event
- `data`: JSON! - Event payload
- `checksum`: String! - Checksum for conflict detection
- `correlationId`: String - Link to related events
- `causationId`: String - What caused this event

## Troubleshooting

### Playground Not Loading
1. Ensure `strawberry-graphql` is installed: `poetry add strawberry-graphql`
2. Restart the backend server
3. Check server logs for GraphQL initialization message
4. Verify the route is registered by checking `/openapi.json`

### Query Errors
- Ensure you're authenticated (add Authorization header)
- Check that the database has been migrated
- Verify event data exists in the `events` table

## Future Enhancements
- [ ] Mutations for creating/updating events
- [ ] Subscriptions for real-time event streaming
- [ ] DataLoader for batch optimization
- [ ] More complex filters and sorting options
- [ ] Pagination with cursor-based pagination
