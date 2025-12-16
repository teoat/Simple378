# Architecture Documentation

## Overview
This directory contains the comprehensive architecture documentation for the Simple378 Fraud Detection System.

## 📋 Start Here
For a complete understanding of the system architecture, begin with:

1. **[CONSOLIDATED_ARCHITECTURE_SPEC.md](./CONSOLIDATED_ARCHITECTURE_SPEC.md)** ⭐ **PRIMARY REFERENCE**
   - Unified architecture specification
   - Consolidates all design proposals and implementations
   - Single source of truth for system design
   - Includes implementation status for all features

2. **[00_master_plan.md](./00_master_plan.md)** - Executive overview and phase plan

## 📚 Detailed Design Documents

### Core Design Orchestration (Detailed Implementation Specs)
- **[11_auth_page_design_orchestration.md](./11_auth_page_design_orchestration.md)** - Authentication & Security
- **[12_dashboard_page_design_orchestration.md](./12_dashboard_page_design_orchestration.md)** - Dashboard & Analytics
- **[13_case_management_design_orchestration.md](./13_case_management_design_orchestration.md)** - Case Management
- **[14_adjudication_queue_design_orchestration.md](./14_adjudication_queue_design_orchestration.md)** - Human Adjudication
- **[15_forensics_ingestion_design_orchestration.md](./15_forensics_ingestion_design_orchestration.md)** - Forensics & Data Ingestion
- **[16_frenly_ai_design_orchestration.md](./16_frenly_ai_design_orchestration.md)** - AI Assistant

### Supporting Documentation
- **[AGENTS.md](./AGENTS.md)** - AI agent architecture and personas
- **[ARCHITECTURE_AND_SYNC_DIAGRAMS.md](./ARCHITECTURE_AND_SYNC_DIAGRAMS.md)** - System diagrams
- **[SEARCH_ANALYTICS.md](./SEARCH_ANALYTICS.md)** - Search and analytics architecture
- **[SEMANTIC_SEARCH.md](./SEMANTIC_SEARCH.md)** - Semantic search implementation
- **[MULTI_MEDIA_EVIDENCE_SPEC.md](./MULTI_MEDIA_EVIDENCE_SPEC.md)** - Evidence handling specification

## 📂 File Organization

### Current Active Documents (24 files)
```
00-10: Foundation & Strategy
  00_master_plan.md - Executive plan
  01_system_architecture.md - System overview
  02_phase1_foundation.md - Phase 1 details
  05_gap_analysis.md - Gap identification
  06_ai_orchestration_spec.md - AI coordination
  07_graph_viz_spec.md - Graph visualization
  08_forensics_security_spec.md - Security specs
  09_scoring_algorithms.md - Risk scoring
  10_modularization_strategy.md - Module design

11-16: Detailed Orchestration
  [See list above]

CONSOLIDATED_ARCHITECTURE_SPEC.md - Unified specification ⭐
CONSOLIDATION_CLOSURE_REPORT.md - Consolidation details
```

### Historical Documents (Superseded)
These files are retained for historical reference but are no longer the primary source:
- **03_proposed_additions.md** (SUPERSEDED) - Original architecture proposals
- **04_ui_design_proposals.md** (SUPERSEDED) - Original UI/UX proposals

> ⚠️ **Note:** Files 03 and 04 have been superseded by CONSOLIDATED_ARCHITECTURE_SPEC.md
> All content has been integrated and conflicts resolved.
> See [CONSOLIDATION_CLOSURE_REPORT.md](./CONSOLIDATION_CLOSURE_REPORT.md) for details.

## 🔄 Document Consolidation

On **December 16, 2025**, we consolidated all open architecture proposals with reviewed orchestration specifications:

**What Changed:**
- ✅ Created unified CONSOLIDATED_ARCHITECTURE_SPEC.md
- ✅ Integrated content from files 03 (proposed additions) and 04 (UI proposals)
- ✅ Resolved conflicts with detailed orchestration files (11-16)
- ✅ Added implementation status for all features
- ✅ Created comprehensive cross-reference system

**Why:**
- Eliminate redundancy and conflicting information
- Provide single source of truth for architecture
- Make it easier to find complete information
- Track implementation status clearly

**Details:**
See [CONSOLIDATION_CLOSURE_REPORT.md](./CONSOLIDATION_CLOSURE_REPORT.md) for complete details on what was consolidated and how conflicts were resolved.

## 📖 How to Use This Documentation

### For New Team Members
1. Read [CONSOLIDATED_ARCHITECTURE_SPEC.md](./CONSOLIDATED_ARCHITECTURE_SPEC.md) - Get complete picture
2. Review [00_master_plan.md](./00_master_plan.md) - Understand phases and goals
3. Check detailed orchestration files (11-16) for implementation specifics

### For Developers
1. Start with [CONSOLIDATED_ARCHITECTURE_SPEC.md](./CONSOLIDATED_ARCHITECTURE_SPEC.md) - Understand what you're building
2. Refer to relevant orchestration file (11-16) for detailed specs
3. Check implementation status to see what's done vs planned

### For Product/Management
1. [CONSOLIDATED_ARCHITECTURE_SPEC.md](./CONSOLIDATED_ARCHITECTURE_SPEC.md) - Complete feature list with status
2. [00_master_plan.md](./00_master_plan.md) - Executive overview and phase plan
3. Section 9 of consolidated spec - Current implementation status

## 🔍 Finding Specific Information

**Authentication/Security?** → Section 2 of consolidated spec + file 11  
**Dashboard design?** → Section 3 of consolidated spec + file 12  
**Case management?** → Section 4 of consolidated spec + file 13  
**Adjudication workflow?** → Section 5 of consolidated spec + file 14  
**Data ingestion?** → Section 6 of consolidated spec + file 15  
**AI assistant?** → Section 7 of consolidated spec + file 16  
**Infrastructure?** → Section 8 of consolidated spec  
**Implementation status?** → Section 9 of consolidated spec  

## 📝 Maintenance

**To update architecture:**
1. Make changes in CONSOLIDATED_ARCHITECTURE_SPEC.md for overview/summary
2. Update detailed orchestration files (11-16) for implementation details
3. Keep both documents in sync
4. Update implementation status section

**Do not:**
- Update files 03 or 04 (they are historical)
- Create new conflicting documents
- Duplicate information across files

---

**Last Updated:** December 16, 2025  
**Maintained By:** Development Team  
**Questions?** See [CONSOLIDATION_CLOSURE_REPORT.md](./CONSOLIDATION_CLOSURE_REPORT.md) or ask the team
