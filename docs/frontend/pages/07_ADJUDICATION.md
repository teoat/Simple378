# ⚖️ Adjudication Queue Page

> Review and decide on fraud alerts

**Route:** `/adjudication`  
**File:** `src/pages/AdjudicationQueue.tsx`

---

## Overview

The Adjudication Queue is where investigators review AI-detected fraud alerts and make decisions. It features a three-panel layout with alert list, details, and AI reasoning.

---

## Screenshot

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ ⚖️ Adjudication Queue                    127 pending    [📊 Stats ▼]       │
├──────────────────┬────────────────────────────────┬─────────────────────────┤
│ ALERT LIST       │ ALERT DETAILS                  │ AI REASONING           │
├──────────────────┼────────────────────────────────┼─────────────────────────┤
│                  │                                │                         │
│ ┌──────────────┐ │ Alert ID: ALT-2024-0127       │ 👮‍♀️ Frenly AI Analysis  │
│ │ 🔴 Risk: 95  │ │ Subject: PT ABC Industries    │                         │
│ │ MIRRORING    │ │ Pattern: Mirroring            │ "Hey! I spotted a       │
│ │ PT ABC Ind.  │ │ Risk Score: 95                │  classic mirroring      │
│ │ 2 min ago    │ │                                │  pattern here! 96% of   │
│ │ ► SELECTED   │ │ ┌────────────────────────────┐ │  funds transferred out  │
│ └──────────────┘ │ │ TRANSACTION SUMMARY        │ │  within 3 days."        │
│                  │ ├────────────────────────────┤ │                         │
│ ┌──────────────┐ │ │ Inbound:  Rp 500,000,000  │ │ Evidence:              │
│ │ 🟡 Risk: 72  │ │ │ Outbound: Rp 480,000,000  │ │ • 96% transfer ratio   │
│ │ ROUND_TRIP   │ │ │ Retained: Rp 20,000,000   │ │ • 3-day timing window  │
│ │ CV XYZ Corp  │ │ │ Ratio:    96%             │ │ • 15 similar patterns  │
│ │ 15 min ago   │ │ └────────────────────────────┘ │                         │
│ └──────────────┘ │                                │ Confidence: 94%         │
│                  │ ┌────────────────────────────┐ │                         │
│ ┌──────────────┐ │ │ AFFECTED TRANSACTIONS      │ │ ─────────────────────  │
│ │ 🟢 Risk: 45  │ │ ├────────────────────────────┤ │ 📊 Risk Factors:       │
│ │ VELOCITY     │ │ │ 01/15 +500M from PT XYZ   │ │ ▪ Timing: 35 pts       │
│ │ John Doe     │ │ │ 01/16 -200M to CV ABC     │ │ ▪ Amount: 25 pts       │
│ │ 1 hour ago   │ │ │ 01/17 -280M to CV DEF     │ │ ▪ Pattern: 35 pts      │
│ └──────────────┘ │ └────────────────────────────┘ │                         │
│                  │                                │                         │
│                  │ ┌────────────────────────────┐ │                         │
│                  │ │ DECISION                   │ │                         │
│                  │ │                            │ │                         │
│                  │ │ [✅ Approve] [❌ Reject]   │ │                         │
│                  │ │ [⏸️ Escalate] [💬 Note]   │ │                         │
│                  │ │                            │ │                         │
│                  │ │ Notes: ________________    │ │                         │
│                  │ └────────────────────────────┘ │                         │
│                  │                                │                         │
└──────────────────┴────────────────────────────────┴─────────────────────────┘
```

---

## Features

| Feature | Status | Description |
|---------|--------|-------------|
| Three-Panel Layout | ✅ | List, details, AI reasoning |
| Alert List | ✅ | Scrollable, sorted by priority |
| Alert Details | ✅ | Full transaction breakdown |
| AI Reasoning | ✅ | Frenly AI analysis |
| Decision Buttons | ✅ | Approve, Reject, Escalate |
| Notes | ✅ | Add decision notes |
| Keyboard Navigation | ✅ | Power user shortcuts |
| Real-time Updates | ✅ | WebSocket for new alerts |

---

## Decision Types

| Decision | Meaning | Keyboard |
|----------|---------|----------|
| ✅ **Approve** | Alert is valid fraud | `A` |
| ❌ **Reject** | False positive | `R` |
| ⏸️ **Escalate** | Needs supervisor | `E` |
| 🔄 **Defer** | Need more info | `D` |

---

## Alert Types

| Pattern | Description | Risk Range |
|---------|-------------|------------|
| **MIRRORING** | Funds in/out with minimal retention | 80-100 |
| **ROUND_TRIP** | Circular fund flow | 75-95 |
| **VELOCITY** | Unusual transaction frequency | 50-85 |
| **SHELL** | Suspected shell company | 70-100 |
| **GHOST** | Ghost employee indicators | 85-100 |

---

## Components Used

| Component | Purpose |
|-----------|---------|
| `AlertList` | Left panel with alerts |
| `AlertCard` | Individual alert display |
| `AlertDetails` | Center detail panel |
| `TransactionSummary` | Transaction breakdown |
| `DecisionPanel` | Action buttons |
| `AIReasoningTab` | Frenly AI insights |
| `FrenlyBubble` | AI speech bubble |

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
| `?` | Show help |
| `Enter` | Confirm decision |

---

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/adjudication/queue` | Fetch queue |
| POST | `/api/v1/adjudication/decide` | Submit decision |
| GET | `/api/v1/adjudication/:id` | Get alert details |
| WS | `/ws` | Real-time updates |

---

## State Management

```typescript
// Fetch queue
const { data: queue } = useQuery({
  queryKey: ['adjudication', 'queue'],
  queryFn: api.getAdjudicationQueue,
});

// Selected alert
const [selectedId, setSelectedId] = useState<string | null>(null);

// Submit decision
const decideMutation = useMutation({
  mutationFn: api.submitDecision,
  onSuccess: () => {
    queryClient.invalidateQueries(['adjudication']);
    moveToNext();
  },
});
```

---

## Four Personas Integration

The AI Reasoning panel shows insights from 4 perspectives:

| Persona | Focus |
|---------|-------|
| 👮‍♀️ **Frenly AI** | Pattern detection |
| ⚖️ **Legal Advisor** | Evidence requirements |
| 📊 **Forensic Accountant** | Financial analysis |
| 🔍 **Senior Investigator** | Case strategy |


---

## 🚀 Decision Intelligence (Proposed)

Enhances the human decision process with automated guardrails.

### 1. 🛡️ Inconsistency Guardrails
Warns investigators if they contradict their own history.
- **Scenario:** Analyst approves "Pattern A". One week later, rejects identical "Pattern A".
- **Alert:** "You previously approved a similar alert (ID: 123) on Jan 15. Are you sure?"

### 2. ⚖️ Bias Detector
Monitors decision patterns for statistical anomalies.
- **Metric:** `Reject Rate` per Subject Type / Region.
- **Alert:** "You are rejecting 85% of alerts from 'Region X' (Team Average: 45%). Please review guidance."

### 3. 🧠 Consensus Scoring
Aggregates the 4 AI Personas into a single confidence metric.
- **Logic:** If Frenly AI (`Risk`) and Forensic Accountant (`Math`) agree, confidence = High.
- **Highlight:** Visual "Green Light" when consensus is > 90%.

---

## Related Pages

- [Case Detail](./03_CASE_DETAIL.md) - View full case
- [Dashboard](./08_DASHBOARD.md) - Return to overview
