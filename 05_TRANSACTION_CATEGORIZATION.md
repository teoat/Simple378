# Transaction Categorization

**Status:** 📋 Planned Feature

---

## Overview

The Transaction Categorization system provides automated and manual classification of financial transactions to support fraud detection analysis. It uses AI-powered categorization combined with rule-based classification to identify transaction types, patterns, and anomalies.

---

## Features

### Automated Categorization
- **AI-Powered Classification:** Uses Claude 3.5 Sonnet to analyze transaction descriptions and metadata
- **Rule-Based Categories:** Predefined rules for common transaction types
- **Pattern Recognition:** Identifies recurring transaction patterns
- **Confidence Scoring:** Each categorization includes a confidence score

### Transaction Categories
1. **Wire Transfers** - Domestic and international wire transfers
2. **ACH Payments** - Automated Clearing House transactions
3. **Check Payments** - Physical and digital check transactions
4. **Card Transactions** - Credit/debit card purchases
5. **Cash Deposits/Withdrawals** - ATM and teller transactions
6. **Recurring Payments** - Subscriptions and recurring transfers
7. **Peer-to-Peer** - P2P payment platform transactions
8. **Other** - Uncategorized transactions requiring manual review

### Anomaly Detection
- Detects transactions that deviate from historical patterns
- Flags unusual transaction categories for a given subject
- Identifies category switching patterns (potential fraud indicator)

---

## Data Model

```typescript
interface TransactionCategory {
  id: string;
  name: string;
  description: string;
  rules: CategoryRule[];
  priority: number;
}

interface CategoryRule {
  field: 'description' | 'amount' | 'merchant' | 'mcc';
  operator: 'contains' | 'equals' | 'greater_than' | 'less_than' | 'matches';
  value: string | number;
}

interface CategorizedTransaction {
  transaction_id: string;
  category: string;
  confidence: number;
  method: 'ai' | 'rule' | 'manual';
  categorized_at: string;
  categorized_by?: string;
}
```

---

## API Endpoints

### Categorize Transactions
```http
POST /api/v1/transactions/categorize
Content-Type: application/json

{
  "transaction_ids": ["txn_123", "txn_456"],
  "method": "ai" | "rule" | "auto"
}
```

### Get Category Statistics
```http
GET /api/v1/analytics/categories?subject_id={id}&start_date={date}&end_date={date}
```

### Update Category
```http
PATCH /api/v1/transactions/{id}/category
Content-Type: application/json

{
  "category": "wire_transfer",
  "notes": "Manual override based on supporting documentation"
}
```

---

## Integration Points

### With Reconciliation Page
- Categories used to group transactions during reconciliation
- Filtering by category for efficient matching
- Category-specific matching rules

### With Analytics Dashboard
- Category distribution charts
- Category trends over time
- Category-based risk metrics

### With AI Assistant
- Category suggestions based on context
- Anomaly explanations referencing category patterns
- Category-aware fraud reasoning

---

## Business Rules

1. **High-Value Categorization:** Transactions over $10,000 require AI + manual review
2. **Category Confidence:** Confidence < 70% flagged for manual review
3. **Category History:** Subject's transaction category history influences fraud scoring
4. **Suspicious Categories:** Certain category combinations trigger alerts

---

## Performance Metrics

- **Categorization Accuracy:** Target 95%+ for rule-based, 90%+ for AI
- **Processing Speed:** < 100ms per transaction for rule-based
- **Manual Override Rate:** Track frequency of category changes
- **Category Coverage:** % of transactions successfully categorized

---

## Future Enhancements

- [ ] Machine learning model trained on historical categorizations
- [ ] Merchant category code (MCC) integration
- [ ] Custom category creation per organization
- [ ] Category-specific fraud detection rules
- [ ] Bulk categorization with CSV import/export

---

**Related Documentation:**
- [Reconciliation Page](./06_RECONCILIATION.md)
- [Dashboard](./08_DASHBOARD.md)
- [AI Assistant Integration](./docs/architecture/06_ai_orchestration_spec.md)
