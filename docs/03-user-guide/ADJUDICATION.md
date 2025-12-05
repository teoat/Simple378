# ⚖️ Adjudication Guide

> Reviewing and deciding on fraud alerts

---

## Overview

The Adjudication Queue is where investigators review AI-detected alerts and make decisions. Each alert requires human review before action is taken.

---

## Queue Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚖️ Adjudication Queue                    127 pending    [📊 Stats ▼]       │
├──────────────────┬────────────────────────────────┬─────────────────────────┤
│ ALERT LIST       │ ALERT DETAILS                  │ AI REASONING           │
├──────────────────┼────────────────────────────────┼─────────────────────────┤
│                  │                                │                         │
│ ┌──────────────┐ │ Alert ID: ALT-2024-0127       │ 🤖 Frenly AI Analysis  │
│ │ 🔴 Risk: 95  │ │ Subject: PT ABC Industries    │                         │
│ │ MIRRORING    │ │ Pattern: Mirroring            │ "I detected a classic  │
│ │ PT ABC Ind.  │ │ Risk Score: 95                │  mirroring pattern!    │
│ │ 2 min ago    │ │                                │  96% of incoming funds │
│ └──────────────┘ │ ┌────────────────────────────┐ │  were transferred out  │
│                  │ │ TRANSACTION SUMMARY        │ │  within 3 days."       │
│ ┌──────────────┐ │ ├────────────────────────────┤ │                         │
│ │ 🟡 Risk: 72  │ │ │ Inbound:  Rp 500,000,000  │ │ Evidence:              │
│ │ ROUND_TRIP   │ │ │ Outbound: Rp 480,000,000  │ │ • 96% transfer ratio   │
│ │ CV XYZ Corp  │ │ │ Retained: Rp 20,000,000   │ │ • 3-day timing window  │
│ │ 15 min ago   │ │ │ Ratio:    96%             │ │ • 15 similar patterns  │
│ └──────────────┘ │ └────────────────────────────┘ │                         │
│                  │                                │ Confidence: 94%         │
│ ┌──────────────┐ │ ┌────────────────────────────┐ │                         │
│ │ 🟢 Risk: 45  │ │ │ AFFECTED TRANSACTIONS      │ │ ─────────────────────  │
│ │ VELOCITY     │ │ ├────────────────────────────┤ │                         │
│ │ John Doe     │ │ │ 01/15 +500M from PT XYZ   │ │ 📊 Risk Factors:       │
│ │ 1 hour ago   │ │ │ 01/16 -200M to CV ABC     │ │ ▪ Timing: 35 pts       │
│ └──────────────┘ │ │ 01/17 -280M to CV DEF     │ │ ▪ Amount: 25 pts       │
│                  │ └────────────────────────────┘ │ ▪ Pattern: 35 pts      │
│                  │                                │                         │
│                  │ ┌────────────────────────────┐ │                         │
│                  │ │ DECISION                   │ │                         │
│                  │ │ [✅ Approve] [❌ Reject]   │ │                         │
│                  │ │ [⏸️ Escalate] [💬 Note]   │ │                         │
│                  │ └────────────────────────────┘ │                         │
│                  │                                │                         │
└──────────────────┴────────────────────────────────┴─────────────────────────┘
```

---

## Decision Types

| Decision | Meaning | Next Steps |
|----------|---------|------------|
| ✅ **Approve** | Alert is valid fraud | Case updated, SAR prepared |
| ❌ **Reject** | False positive | Alert dismissed, AI learns |
| ⏸️ **Escalate** | Needs supervisor review | Sent to senior investigator |
| 🔄 **Defer** | Need more information | Returns to queue later |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `J` | Select next alert |
| `K` | Select previous alert |
| `A` | Approve alert |
| `R` | Reject alert |
| `E` | Escalate alert |
| `N` | Add note |
| `?` | Show keyboard help |

---

## Alert Types

### Mirroring (MIRROR)
Funds received and immediately transferred out with minimal retention.

**Indicators:**
- Transfer ratio > 90%
- Within 3-day window
- Multiple outbound transfers

### Round-Trip (ROUND_TRIP)
Money that returns to origin through intermediaries.

**Indicators:**
- Circular fund flow
- Same amount returns
- Within 7-day window

### Velocity (VELOCITY)
Unusual transaction frequency or volume.

**Indicators:**
- Sudden activity spike
- Exceeds historical average
- Off-hours transactions

### Shell Company (SHELL)
Transactions with suspected fake companies.

**Indicators:**
- No online presence
- Shared address with other shells
- Round-number invoices

---

## Review Process

### Step 1: Understand the Alert
- Read AI reasoning
- Review transaction summary
- Check affected transactions

### Step 2: Investigate Further
- Click transactions to see details
- View related documents
- Check entity relationships

### Step 3: Make Decision
- Choose appropriate action
- Add notes explaining reasoning
- Submit decision

### Step 4: Verification
- Decision logged with timestamp
- AI learns from decision
- Case updated automatically

---

## Four Personas Insights

When reviewing alerts, you'll see insights from 4 expert perspectives:

| Persona | Focus |
|---------|-------|
| 👮‍♀️ **Frenly AI** | Pattern detection, similar cases |
| ⚖️ **Legal Advisor** | Evidence requirements, legal implications |
| 📊 **Forensic Accountant** | Financial analysis, ratios |
| 🔍 **Senior Investigator** | Investigation strategy, questions to ask |

---

## Statistics

Access queue statistics:
- Total pending
- Average decision time
- Approval/rejection rate
- Escalation rate

---

## Related

- [Fraud Detection](./FRAUD_DETECTION.md)
- [Frenly AI](./FRENLY_AI.md)
