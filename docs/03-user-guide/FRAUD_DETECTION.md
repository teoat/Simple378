# 🔍 Fraud Detection Guide

> Understanding fraud patterns and detection methods

---

## Overview

Simple378 uses advanced AI and rule-based detection to identify fraud based on the ACFE Fraud Tree methodology and forensic accounting best practices.

---

## ACFE Fraud Tree

The Association of Certified Fraud Examiners categorizes fraud into three main types:

```
                        FRAUD
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
   CORRUPTION      ASSET MISAPPROP.   FINANCIAL STMT
    (46% cases)     (89% cases)        (5% cases)
```

---

## Asset Misappropriation (89%)

The most common fraud type - stealing company assets.

### Cash Schemes

| Scheme | Description | Detection |
|--------|-------------|-----------|
| **Skimming** | Stealing before recording | Revenue vs deposit gaps |
| **Cash Larceny** | Stealing after recording | Missing deposits |
| **Check Kiting** | Float manipulation | Circular transfers |
| **Ghost Employee** | Fake payroll | No attendance record |
| **Expense Padding** | Inflated claims | Receipt vs payment gap |

### Non-Cash Schemes

| Scheme | Description | Detection |
|--------|-------------|-----------|
| **Shell Company** | Fake vendor | No real operations |
| **Inventory Theft** | Missing stock | Physical vs records |
| **Asset Misuse** | Personal use | Unauthorized access |

---

## Corruption (46%)

### Bribery & Kickbacks

| Scheme | Description | Detection |
|--------|-------------|-----------|
| **Kickbacks** | Vendor payments | Consistent % patterns |
| **Bid Rigging** | Fixed contracts | Same losing bidders |
| **Gratuities** | Improper gifts | Lifestyle mismatch |

### Conflicts of Interest

| Scheme | Description | Detection |
|--------|-------------|-----------|
| **Related Party** | Hidden relationships | Entity network analysis |
| **Self-Dealing** | Personal benefit | Undisclosed ownership |

---

## Financial Statement Fraud (5%)

### Revenue Schemes

| Scheme | Description | Detection |
|--------|-------------|-----------|
| **Fictitious Revenue** | Fake sales | Unusual spikes |
| **Early Recognition** | Premature booking | Period-end anomalies |

### Expense/Liability Schemes

| Scheme | Description | Detection |
|--------|-------------|-----------|
| **Concealed Liabilities** | Hidden debt | Off-book accounts |
| **Understated Expenses** | Hidden costs | Ratio analysis |

---

## Detection Patterns

### Mirroring Pattern
```
Funds In (Day 1)  →  96% Out (Day 3)  →  4% Retained
   Rp 500M              Rp 480M             Rp 20M
```
**Red Flags:**
- >90% transfer ratio
- Within 3-day window
- Consistent retention %

### Round-Trip Pattern
```
A → B → C → D → A
(Money returns to origin through intermediaries)
```
**Red Flags:**
- Circular fund flow
- Same amounts
- Within 7 days

### Velocity Pattern
```
Normal: 5 transactions/week
Actual: 47 transactions/week
Spike:  840% increase
```
**Red Flags:**
- Sudden activity spike
- Off-hours transactions
- Sequential amounts

### Shell Company Pattern
```
Vendor: CV Jaya Abadi
Address: Same as 5 other vendors
Website: None
Phone: Disconnected
```
**Red Flags:**
- No online presence
- Shared addresses
- Round-number invoices
- Generic names

---

## Risk Scoring

### Score Calculation

| Factor | Weight | Points |
|--------|--------|--------|
| Timing & Velocity | 25% | 0-25 |
| Amount Pattern | 20% | 0-20 |
| Entity Relationship | 20% | 0-20 |
| Vendor Profile | 15% | 0-15 |
| Transaction Type | 20% | 0-20 |

### Risk Levels

| Score | Level | Action |
|-------|-------|--------|
| 0-30 | 🟢 Low | Monitor |
| 31-60 | 🟡 Medium | Review |
| 61-85 | 🔴 High | Investigate |
| 86-100 | ⚫ Critical | Escalate |

---

## Forensic Techniques

### Benford's Law
Natural numbers follow a predictable distribution:
- 30.1% start with "1"
- 17.6% start with "2"
- etc.

Fabricated numbers often deviate from this pattern.

### Ratio Analysis
Compare financial ratios:
- Revenue/Expenses
- Payroll/Headcount
- Inventory/Sales

Unusual ratios indicate anomalies.

### Network Analysis
Map entity relationships:
- Common addresses
- Shared directors
- Transaction flows

Hidden connections reveal schemes.

---

## Red Flags Checklist

### Behavioral
- [ ] Lives beyond means
- [ ] Financial difficulties
- [ ] Unusually close with vendors
- [ ] Control issues
- [ ] Refuses vacation

### Organizational
- [ ] Weak internal controls
- [ ] Overridden approvals
- [ ] Missing documents
- [ ] Delayed audits

### Transaction
- [ ] Round numbers only
- [ ] Just below threshold
- [ ] Duplicate payments
- [ ] Sequential invoices
- [ ] Weekend processing

---

## Related

- [Adjudication](./ADJUDICATION.md)
- [Frenly AI](./FRENLY_AI.md)
- [Reconciliation](./RECONCILIATION.md)
