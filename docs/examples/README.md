# Example Issues for Copilot Coding Agent

This directory contains example issues that demonstrate best practices for creating issues suitable for GitHub Copilot coding agents.

## Purpose

These examples show:
- How to write clear, actionable issue descriptions
- What information to include for AI agents
- How to specify acceptance criteria
- How to identify affected files
- Different task types and complexity levels

## Examples

### 1. Simple Bug Fix
**File:** `example_bug_fix.md`
- Clear reproduction steps
- Expected vs actual behavior
- Single file affected
- Straightforward test requirements

**Complexity:** Low  
**Suitable for AI:** ✅ Excellent

### 2. Feature Addition
**File:** `example_feature.md`
- Detailed feature description
- UI/UX specifications
- Multiple files affected
- Comprehensive acceptance criteria

**Complexity:** Medium  
**Suitable for AI:** ✅ Good (with clear specs)

### 3. Documentation Update
**File:** `example_documentation.md`
- Specific documentation gaps
- Clear content requirements
- Examples provided
- Single file affected

**Complexity:** Low  
**Suitable for AI:** ✅ Excellent

## Template Structure

All good issues should include:

```markdown
## Title
Clear, specific title (e.g., "Add pagination to case list")

## Description
What needs to be done and why

## Affected Files
- path/to/file1.tsx
- path/to/file2.py

## Acceptance Criteria
- [ ] Specific requirement 1
- [ ] Specific requirement 2
- [ ] Tests added
- [ ] Documentation updated

## Testing Requirements
What tests should be added/updated
```

## Quality Indicators

### ✅ Good Issue Characteristics
- Clear, specific title
- Detailed description
- Measurable acceptance criteria
- Affected files listed
- Testing requirements specified
- Context and examples provided

### ❌ Poor Issue Characteristics
- Vague title ("Fix the UI")
- Minimal description
- No acceptance criteria
- No file references
- No testing guidance
- Missing context
