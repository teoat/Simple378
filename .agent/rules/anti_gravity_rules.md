---
trigger: always_on
---

ANTIGRAVITY AGENTS - STRICT RULES & BEST PRACTICES

1. CORE PHILOSOPHY
- Agentic & Autonomous: Act as an intelligent partner. Plan, execute, and verify.
- Privacy by Design: GDPR compliance, encryption, and audit logging are mandatory.
- User-Centric: Prioritize user goals. Offer proactive solutions.
- Minimalism: Do more with less. Avoid file sprawl.

2. SSOT & DOCUMENTATION (STRICT)
- Single Source of Truth (SSOT): Never duplicate information. Maintain one authoritative file for each concept.
- Update vs. Create: NEVER create a new file if an existing one can be updated.
- Documentation:
  - Update existing docs alongside code changes.
  - Consolidate information. Merge and delete redundant docs.
  - Check `docs/` before writing new specifications.

3. CODING STYLE & STANDARDIZATION
- Naming Conventions:
  - Python: `snake_case` for variables/functions, `PascalCase` for classes, `UPPER_CASE` for constants.
  - TypeScript: `camelCase` for variables/functions, `PascalCase` for Components/Interfaces.
  - File Names: `snake_case.py` (Python), `camelCase.ts` or `PascalCase.tsx` (React Components).
- Structure:
  - SRP (Single Responsibility Principle): Functions should do one thing. Keep them small (< 50 lines).
  - DRY (Don't Repeat Yourself): Extract common logic into utilities.
- Comments & Docstrings:
  - Python: Google-style docstrings for complex functions/classes.
  - General: Comments should explain the *WHY*, not the *WHAT*.
- Preferences:
  - Immutability: Prefer `const` over `let` in TS. Avoid global state.
  - Async/Await: Use over raw promises or callbacks.
  - Functional: Prefer `map`/`filter`/`reduce` over loops where readable.

4. STRICT CODE QUALITY & LINTING (ZERO TOLERANCE)
- Python:
  - Formatter: Black (line length 88).
  - Linter: Flake8 or Ruff. No ignored errors without explicit justification.
  - Type Hints: MANDATORY for all function signatures.
  - Imports: Sorted via isort.
- TypeScript/React:
  - Strict Mode: Enabled. NO `any` types allowed.
  - Linter: ESLint with strict config. Fix all warnings.
  - Formatter: Prettier.
- General:
  - Fix ALL linting errors before requesting user review.
  - Remove unused imports and dead code immediately.

5. TECHNOLOGY STACK
- Backend: FastAPI (Async), Pydantic (Strict Models), SQLAlchemy 2.0 (Async), Alembic.
- Frontend: React + Vite, TypeScript, TailwindCSS (Premium/Dark), React Query.
- Infrastructure: Docker Compose, .env configuration.

6. MCP SERVERS
- Coordination: 'agent-coordination-mcp'.
- Data: 'postgres', 'redis'.
- Tools: 'sequential-thinking', 'memory'.
- Config: Verify settings.json paths match Simple378 workspace.

7. SPECIFIC RULES
- Offline Capability: Design for local SQLite mirror support.
- Mens Rea Engine: Define and log "intent" indicators.
- Error Handling: Use custom exception classes. NEVER return raw 500s.
