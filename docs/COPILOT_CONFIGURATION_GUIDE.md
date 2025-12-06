# GitHub Copilot Coding Agent - Configuration Guide

This document describes how GitHub Copilot coding agent integrates with this repository and best practices for using it effectively.

## Overview

GitHub Copilot coding agent can autonomously work on issues, create pull requests, and iterate based on feedback. This guide explains how to get the most out of it in this repository.

## Repository Configuration

### 1. AGENTS.md File ✅

Located at the repository root, this file provides:
- Project overview and technology stack
- Coding standards and conventions
- Repository structure and file organization
- Build, test, and deployment commands
- Common patterns and examples
- Security guidelines

**The agent reads this file automatically** to understand repository context.

### 2. Issue Templates ✅

Located in `.github/ISSUE_TEMPLATE/`:
- **bug_report.yml** - Structured bug reports with reproduction steps
- **feature_request.yml** - Feature requests with acceptance criteria
- **documentation.yml** - Documentation update requests

These templates guide users to provide:
- Clear problem descriptions
- Affected files/components
- Acceptance criteria
- Testing requirements

### 3. Pull Request Template ✅

Located in `.github/pull_request_template.md`:
- Standardized PR descriptions
- Testing checklist
- Documentation updates
- AI agent confidence self-assessment

### 4. Contributing Guidelines ✅

Located in `CONTRIBUTING.md`:
- Development workflow
- Code standards
- Testing requirements
- PR process
- Specific guidelines for AI agents

### 5. Task Suitability Guidelines ✅

Located in `docs/COPILOT_TASK_GUIDELINES.md`:
- Which tasks are good for AI agents
- Which tasks require human oversight
- Task complexity assessment
- Quality metrics

## Using Copilot Coding Agent

### 1. Creating Good Issues

**Use issue templates** and include:

✅ **Do:**
```markdown
## Issue: Add pagination to case list

**Description:** The case list loads all cases at once, causing 
performance issues with 100+ cases.

**Acceptance Criteria:**
- [ ] Display 20 cases per page
- [ ] Add prev/next navigation buttons
- [ ] Update URL with page number (?page=2)
- [ ] Unit tests for pagination logic
- [ ] Keyboard accessible (Tab, Enter)

**Affected Files:**
- frontend/src/components/cases/CaseList.tsx
- frontend/src/lib/api.ts
- backend/app/api/v1/endpoints/cases.py

**Testing:**
- Add tests to CaseList.test.tsx
- Manually test with 100+ cases
```

❌ **Don't:**
```markdown
Fix the case list
```

### 2. Assigning Tasks to Copilot

**Via GitHub UI:**
1. Create or find an issue
2. Comment: `@copilot help me implement this`
3. Copilot will analyze and create a PR

**Via Issue Label:**
- Label issues with `copilot` or `good-first-issue`
- Copilot may proactively work on these

### 3. Reviewing Copilot PRs

**Automated Checks:**
All Copilot PRs run through GitHub Actions:
- Linting (Ruff, ESLint)
- Type checking (TypeScript, MyPy)
- Unit tests (pytest, Vitest)
- Integration tests
- Security scanning
- Accessibility tests

**Human Review Required:**
Even if all checks pass, review for:
- **Logic correctness** - Does it solve the issue?
- **Edge cases** - Are error conditions handled?
- **Security** - Any vulnerabilities introduced?
- **Performance** - Any degradation?
- **Documentation** - Are changes explained?

**Providing Feedback:**
```markdown
@copilot This looks good, but can you also:
- Add error handling for the 404 case
- Update the documentation in README.md
- Add a test for the edge case when limit=0
```

Copilot will update the PR based on feedback.

### 4. Iterating with Copilot

You can have a conversation in PR comments:

```markdown
You: @copilot The pagination buttons should be disabled 
when there are no more pages

Copilot: [Updates code and commits]

You: @copilot Can you also add ARIA labels for accessibility?

Copilot: [Adds ARIA labels and commits]
```

## Workflow Examples

### Example 1: Simple Bug Fix

**Issue:**
```markdown
Title: Fix crash when clicking Next on last page

Description: Error "Cannot read property 'length' of undefined"
occurs when clicking Next button on the last page of case list.

Steps to Reproduce:
1. Navigate to /cases
2. Click Next until last page
3. Click Next again
4. See crash

Expected: Next button should be disabled on last page

Affected Files: frontend/src/components/cases/CaseList.tsx

Acceptance Criteria:
- [ ] No crash when clicking Next on last page
- [ ] Next button disabled on last page
- [ ] Test added for boundary condition
```

**Copilot Process:**
1. Reads issue
2. Analyzes affected file
3. Identifies the bug (missing bounds check)
4. Fixes the code
5. Adds test
6. Creates PR with description

**Review Time:** ~5 minutes (automated checks + quick human review)

### Example 2: New Feature

**Issue:**
```markdown
Title: Add case status filter dropdown

Description: Users need to filter cases by status 
(Open, In Review, Closed)

UI Design:
- Dropdown above case list
- Options: All, Open, In Review, Closed
- Default: All
- Updates URL param: ?status=open

Affected Files:
- frontend/src/components/cases/CaseList.tsx (add filter UI)
- frontend/src/components/cases/StatusFilter.tsx (new component)
- frontend/src/lib/api.ts (add status param to API call)

Acceptance Criteria:
- [ ] Dropdown renders with 4 options
- [ ] Selecting option filters cases
- [ ] URL updates with selection
- [ ] Initial state from URL param
- [ ] Tests for filter logic
- [ ] Keyboard accessible
```

**Copilot Process:**
1. Creates StatusFilter component
2. Updates CaseList to use filter
3. Updates API client
4. Adds tests
5. Creates PR

**Review Time:** ~15 minutes (more complex, needs thorough testing)

### Example 3: Documentation Update

**Issue:**
```markdown
Title: Document Docker troubleshooting steps

Description: Users encounter common Docker issues that aren't 
documented. Add troubleshooting section to README.

Issues to Document:
1. Port already in use (5173, 8000)
2. Permission denied on Linux
3. Database connection refused

Format:
## Troubleshooting

### Port Already in Use
Problem: ...
Solution: ...

Affected Files: README.md

Acceptance Criteria:
- [ ] All 3 issues documented
- [ ] Solutions tested and work
- [ ] Examples provided
- [ ] Formatting consistent with rest of README
```

**Copilot Process:**
1. Reads existing README structure
2. Adds troubleshooting section
3. Formats consistently
4. Creates PR

**Review Time:** ~2 minutes (documentation is lower risk)

## Best Practices

### 1. Start Small

Begin with simple tasks to calibrate:
- Documentation updates
- Simple bug fixes
- Adding tests
- UI component tweaks

Gradually increase complexity as you see results.

### 2. Provide Context

Link to:
- Related issues or PRs
- Design mockups or screenshots
- API documentation
- Similar existing code

Example:
```markdown
See #123 for related discussion.
Design mockup: [link]
Follow pattern from CaseCard component.
```

### 3. Set Clear Boundaries

Specify what NOT to change:
```markdown
**Out of Scope for This Issue:**
- Don't modify the authentication logic
- Don't change the database schema
- Don't update other pages
```

### 4. Use Labels Effectively

Suggested labels:
- `copilot` - Good for Copilot agent
- `good-first-issue` - Simple, well-defined
- `needs-human` - Too complex for agent
- `security` - Requires expert review
- `breaking-change` - API compatibility affected

### 5. Review Promptly

- Copilot PRs should be reviewed within 24 hours
- Quick feedback helps the agent learn
- Delayed reviews may result in stale PRs

### 6. Measure Success

Track metrics:
- Time from issue to merged PR
- Number of review iterations
- Bug introduction rate
- Test coverage of new code

Adjust task assignment based on results.

## Troubleshooting

### Issue: Copilot Doesn't Understand Requirements

**Solution:**
- Break down into smaller, more specific tasks
- Provide examples from existing code
- Add mockups or detailed descriptions
- Link to relevant documentation

### Issue: Copilot Makes Unrelated Changes

**Solution:**
- Make scope more explicit in issue
- List specific files to modify
- Use "Out of Scope" section
- Review and request focused changes

### Issue: Tests Fail in Copilot PR

**Solution:**
- Check if tests were passing before
- Comment with test output
- Ask Copilot to fix: `@copilot The test is failing with error: ...`
- If persistent, assign to human developer

### Issue: Copilot Suggests Insecure Code

**Solution:**
- Reject PR and explain security concern
- Update AGENTS.md with security guideline
- Mark similar issues as `needs-human`
- Consider if task is appropriate for AI

## Continuous Improvement

### Update AGENTS.md

When you discover new patterns or conventions:
```markdown
## New Pattern: Error Handling in API Routes

Always use try/catch with structured error responses:

```python
@router.get("/items/{id}")
async def get_item(id: int):
    try:
        return await service.get_item(id)
    except ItemNotFound:
        raise HTTPException(status_code=404, detail="Item not found")
```
```

### Refine Issue Templates

If certain fields are consistently missing:
1. Add them to issue templates
2. Make them required
3. Provide examples

### Document Common Pitfalls

Add to `docs/COPILOT_TASK_GUIDELINES.md`:
```markdown
## Common Mistakes

### Forgetting to Update Tests
Always update tests when changing behavior.
Location: `frontend/src/**/__tests__/`
```

## Security Considerations

### What Copilot Cannot Do

- Merge its own PRs (requires human approval)
- Access production systems
- Read secrets or environment variables
- Modify protected branches directly

### What to Watch For

- Accidentally committing API keys
- Insecure authentication logic
- SQL injection vulnerabilities
- XSS vulnerabilities
- Hardcoded credentials

**Always review security-sensitive changes carefully.**

## Metrics and Reporting

### Suggested Metrics to Track

**Efficiency:**
- Average time from issue creation to PR
- Average time from PR to merge
- Number of review iterations

**Quality:**
- Test coverage of Copilot PRs
- Bug reports within 2 weeks of merge
- Security issues introduced

**Adoption:**
- Percentage of issues handled by Copilot
- Types of tasks successfully completed
- Types of tasks requiring human takeover

### Monthly Review

1. Analyze metrics
2. Identify successful task types
3. Update guidelines based on learnings
4. Refine issue templates
5. Update AGENTS.md with new patterns

## FAQ

**Q: Can Copilot work on any issue?**
A: No. See [COPILOT_TASK_GUIDELINES.md](COPILOT_TASK_GUIDELINES.md) for task suitability.

**Q: Does Copilot replace human developers?**
A: No. It's a productivity tool that handles routine tasks, freeing humans for complex work.

**Q: How do I disable Copilot for an issue?**
A: Add label `needs-human` or remove `copilot` label.

**Q: Can Copilot learn from feedback?**
A: Within a conversation thread, yes. Across issues, update AGENTS.md to codify learnings.

**Q: What if Copilot creates a bad PR?**
A: Close it with explanation. Update issue with clarifications. Copilot or a human can retry.

**Q: How do I know if a task is good for Copilot?**
A: Use the checklist in [COPILOT_TASK_GUIDELINES.md](COPILOT_TASK_GUIDELINES.md).

## Resources

**Repository Documentation:**
- [AGENTS.md](../AGENTS.md) - AI agent guidelines
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution process
- [COPILOT_TASK_GUIDELINES.md](COPILOT_TASK_GUIDELINES.md) - Task suitability

**External Resources:**
- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Best Practices for Copilot Coding Agent](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [From Idea to PR: Agentic Workflows](https://github.blog/ai-and-ml/github-copilot/from-idea-to-pr-a-guide-to-github-copilots-agentic-workflows/)

## Feedback

Help improve this guide:
- Create an issue with `documentation` label
- Suggest additions based on your experience
- Share successful task examples
- Report problems or unclear sections

---

**Last Updated:** 2024-12-04  
**Version:** 1.0
