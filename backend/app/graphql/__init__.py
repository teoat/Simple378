"""
GraphQL Integration for AntiGravity Fraud Detection System

This module provides GraphQL API endpoints alongside the REST API.

## Available Endpoints:
- `/graphql` - GraphQL query endpoint (POST)
- `/graphql` - GraphiQL IDE (GET) - Interactive playground for development

## Example Query:
```graphql
query GetEvents {
  events(aggregateId: "some-uuid") {
    id
    aggregateId
    aggregateType
    eventType
    timestamp
    data
  }
}
```

## Setup:
The GraphQL integration is automatically enabled if strawberry-graphql is installed.
Install via: `poetry add strawberry-graphql`
"""
