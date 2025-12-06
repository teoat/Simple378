# Task Guidelines for GitHub Copilot Coding Agent

This document helps determine which tasks are appropriate for GitHub Copilot coding agents versus those that require human developers.

## ✅ Excellent Tasks for Copilot Agent

These tasks are well-suited for AI coding agents and typically yield high-quality results:

### 1. Bug Fixes with Clear Reproduction
**Why:** Deterministic issues with specific steps to reproduce
**Requirements:**
- Clear error message or unexpected behavior
- Reproducible steps provided
- Expected vs. actual behavior documented
- Affected files identified

**Example:**
> "Case list crashes when clicking 'Next' on the last page. Error: 'Cannot read property length of undefined'. File: `CaseList.tsx` line 42."

### 2. Adding Tests
**Why:** Test requirements are explicit and verifiable
**Requirements:**
- Existing code to test is stable
- Test patterns established in the codebase
- Clear coverage goals

**Example:**
> "Add unit tests for `CasePagination` component. Should test: page navigation, boundary conditions (first/last page), and accessibility."

### 3. UI Component Implementation from Specs
**Why:** Visual requirements can be precisely specified
**Requirements:**
- Mockup or detailed description provided
- Component behavior clearly defined
- Accessibility requirements specified
- Similar components exist as reference

**Example:**
> "Create a `FilterPanel` component following the shadcn/ui pattern. Should include: dropdown filters for status, date range picker, search input, and reset button. Mockup attached."

### 4. API Endpoint Following Patterns
**Why:** Follows established patterns in the codebase
**Requirements:**
- Similar endpoints exist as examples
- Request/response schema defined
- Database models already exist
- Validation rules specified

**Example:**
> "Add `GET /api/v1/cases/{id}/timeline` endpoint. Returns chronological list of case events. Follow pattern from `/cases/{id}/evidence`. Response schema: `{events: Event[], total: number}`."

### 5. Documentation Updates
**Why:** Factual content with clear success criteria
**Requirements:**
- Specific documentation to update identified
- Changes clearly described
- Examples provided if needed

**Example:**
> "Update README.md with Docker troubleshooting section. Include: port conflicts, permission errors, and database connection issues."

### 6. Refactoring with Narrow Scope
**Why:** Mechanical changes with clear before/after state
**Requirements:**
- Specific refactoring goal (extract function, rename variable, etc.)
- All tests pass before and after
- No behavior changes

**Example:**
> "Extract duplicate pagination logic from `CaseList` and `EvidenceList` into a shared `usePagination` hook. Maintain existing behavior."

### 7. Accessibility Improvements
**Why:** WCAG guidelines provide clear standards
**Requirements:**
- Specific accessibility issue identified
- WCAG success criteria referenced
- Testing method described

**Example:**
> "Add ARIA labels to all icon-only buttons in the header. Ensure keyboard navigation works (Tab, Enter). Test with screen reader."

### 8. Performance Optimizations (Data-Driven)
**Why:** Measurable improvements with benchmarks
**Requirements:**
- Performance issue quantified (load time, bundle size, etc.)
- Target improvement specified
- Profiling data provided
- No behavior changes

**Example:**
> "Reduce case list initial load time from 2.5s to <1s. Lazy load images, implement virtual scrolling. Measure with Lighthouse."

## ⚠️ Requires Human Oversight

These tasks are more complex but can work with AI assistance and human review:

### 1. New AI/ML Features
**Why:** Domain expertise and ethical considerations
**Approach:**
- Human designs the approach
- Agent implements following specifications
- Human reviews for bias, accuracy, privacy

### 2. Database Schema Changes
**Why:** Data integrity and migration risks
**Approach:**
- Human designs schema changes
- Agent writes migration scripts
- Human reviews for data loss risks

### 3. Integration with External APIs
**Why:** Authentication, rate limits, error handling complexity
**Approach:**
- Human sets up credentials and testing environment
- Agent implements API client following docs
- Human reviews security and error handling

### 4. Complex Business Logic
**Why:** Domain knowledge and edge case handling
**Approach:**
- Human provides detailed decision tree/flowchart
- Agent implements with unit tests
- Human reviews edge cases

## ❌ Not Recommended for Copilot Agent

These tasks should be handled primarily by human developers:

### 1. Security-Critical Code
**Examples:**
- Authentication/authorization logic
- Encryption/decryption implementation
- Input sanitization for SQL/XSS prevention
- Session management
- Password handling

**Why:** Security vulnerabilities can have severe consequences and require expert review.

### 2. Production Data Modifications
**Examples:**
- Data migrations on production databases
- Bulk data updates
- Schema changes affecting existing data
- User data deletion/anonymization

**Why:** Risk of data loss or corruption; legal/compliance implications.

### 3. Architectural Decisions
**Examples:**
- Choosing between microservices vs. monolith
- Selecting state management library
- Database technology selection
- Deployment strategy

**Why:** Requires understanding of long-term implications, team expertise, and project constraints.

### 4. Ambiguous Requirements
**Examples:**
- "Make the UI better"
- "Improve performance"
- "Add fraud detection"
- "Fix the bugs"

**Why:** Lack of clear success criteria leads to incorrect implementations. These need human clarification first.

### 5. Legal/Compliance Features
**Examples:**
- GDPR data retention policies
- Audit logging requirements
- Data export for subject access requests
- Consent management

**Why:** Legal implications require human understanding of regulations and consequences.

### 6. Breaking API Changes
**Examples:**
- Removing or renaming public API endpoints
- Changing response schema in incompatible ways
- Modifying authentication requirements

**Why:** Affects external consumers; requires coordination and versioning strategy.

## Task Evaluation Checklist

Before assigning a task to Copilot coding agent, verify:

- [ ] **Clear Requirements:** Success criteria are explicit and measurable
- [ ] **Established Patterns:** Similar code exists in the repository as reference
- [ ] **Low Risk:** Not security-critical or affecting production data
- [ ] **Testable:** Automated tests can verify correctness
- [ ] **Well-Scoped:** Changes limited to specific files/components
- [ ] **Documented:** Enough context provided in issue description
- [ ] **Reversible:** Changes can be easily rolled back if needed

## Improving Task Descriptions for AI Agents

### Bad Example:
> "Fix the case list page"

**Problems:**
- No specific issue identified
- No acceptance criteria
- No affected files mentioned

### Good Example:
> **Title:** Fix case list pagination - page count incorrect
> 
> **Description:** The case list shows "Page 1 of 1" even when there are 50 cases (should be 3 pages with 20 per page).
>
> **Steps to Reproduce:**
> 1. Create 50+ test cases
> 2. Navigate to /cases
> 3. Observe pagination shows only 1 page
>
> **Expected:** Shows "Page 1 of 3" with working Next button
> 
> **Affected Files:**
> - `frontend/src/components/cases/CaseList.tsx` (pagination logic)
> - `frontend/src/hooks/useCases.ts` (API query)
>
> **Acceptance Criteria:**
> - [ ] Correct page count displayed
> - [ ] Next/Previous buttons work
> - [ ] Tests added for pagination edge cases
> - [ ] No regression in existing functionality

## Complexity Assessment

### Low Complexity (Good for AI Agent)
- Follows existing patterns exactly
- <50 lines of code changed
- Single file or closely related files
- Clear input/output specification
- Comprehensive test coverage possible

### Medium Complexity (AI + Human Review)
- Some new patterns needed
- 50-200 lines of code changed
- Multiple files across components
- Some edge cases require judgment
- Partial test coverage possible

### High Complexity (Human-Led, AI-Assisted)
- Novel approach required
- >200 lines of code changed
- Cross-cutting concerns (affects many areas)
- Many edge cases and trade-offs
- Difficult to test exhaustively

## Monitoring AI Agent Performance

Track and improve AI agent task success:

### Success Metrics
- **First-time pass rate:** PR approved without requested changes
- **Time to completion:** Issue assigned to PR merged
- **Bug introduction rate:** Issues created within 2 weeks of merge
- **Test coverage:** New code covered by tests

### Red Flags
- Multiple iterations needed for simple tasks
- Introduces bugs in existing functionality
- Skips tests or documentation
- Doesn't follow established patterns
- Adds unnecessary complexity

### Continuous Improvement
- Update AGENTS.md based on learnings
- Refine issue templates for clarity
- Document new patterns as they emerge
- Provide feedback on AI-generated PRs

## Conclusion

The key to successful AI coding agent usage is:
1. **Clear task definition** with acceptance criteria
2. **Appropriate task selection** (complexity and risk)
3. **Human oversight** for review and approval
4. **Continuous learning** from outcomes

When in doubt, err on the side of human review. AI agents are powerful tools but work best with clear guidance and oversight.
