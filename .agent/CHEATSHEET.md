# Sprint 2 - Quick Cheat Sheet

## This Week (Week 1)

**Day 1-2: Testing**
```bash
cd frontend
npm install -D vitest @testing-library/react
# Create: AlertList.test.tsx, DecisionPanel.test.tsx, UploadZone.test.tsx
npm run test
```

**Day 3-4: Advanced Forensics**
```bash
# Create: frontend/src/components/forensics/ELAVisualization.tsx
# Create: frontend/src/components/forensics/CloneDetection.tsx
# Create: backend/app/api/v1/endpoints/forensics.py (analyze-advanced route)
```

**Day 5: Undo**
```bash
# Create: frontend/src/hooks/useDecisionHistory.ts
# Update: AdjudicationQueue.tsx (add Ctrl+Z handler)
```

## Next Week (Week 2)

**Day 1-2: Subjects**
- Create `backend/app/api/v1/endpoints/subjects.py`
- Add `GET /subjects/{id}` endpoint
- Update `frontend/src/lib/api.ts`

**Day 3-4: Batch**
- Add checkboxes to CaseList
- Create batch action bar
- Add `PATCH /cases/batch`

**Day 5: Performance**
- Add lazy loading
- Install react-virtual
- Create VirtualCaseList

## Week After (Week 3)

**Day 1-2: Tests** - More coverage
**Day 3-4: PWA** - Offline support  
**Day 5: Polish** - Deploy

---

## File Locations

**Tests:** `frontend/src/components/**/__tests__/`  
**Components:** `frontend/src/components/`  
**Hooks:** `frontend/src/hooks/`  
**API:** `frontend/src/lib/api.ts`  
**Backend:** `backend/app/api/v1/endpoints/`

## Quick Commands

```bash
# Run tests
npm test

# Build check
npm run build

# Start dev
npm run dev

# Coverage report
npm run test -- --coverage
```

## Success = ✅ All checkboxes in `.agent/TODO.md`
