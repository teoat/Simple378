## Description
<!-- Provide a clear and concise description of your changes -->



## Related Issue
<!-- Link to the issue this PR addresses -->
Closes #

## Type of Change
<!-- Check all that apply -->
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Test coverage improvement
- [ ] CI/CD improvement

## Changes Made
<!-- List the specific changes you made -->
- 
- 
- 

## Testing
<!-- Describe the testing you performed -->

**Test Coverage:**
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] Manual testing completed
- [ ] All existing tests pass

**Test Commands Run:**
```bash
# Backend
cd backend && poetry run pytest

# Frontend
cd frontend && npm test
```

## Impact Assessment

**Breaking Changes:**
- [ ] No breaking changes
- [ ] Breaking changes documented below

**Performance Impact:**
- [ ] No performance impact
- [ ] Performance tested and acceptable
- [ ] Performance benchmarks included

**Security Considerations:**
- [ ] No security implications
- [ ] Security review completed
- [ ] No secrets or credentials in code

## Screenshots (if applicable)
<!-- Add screenshots for UI changes -->


## Accessibility
<!-- For frontend changes -->
- [ ] Keyboard navigation tested
- [ ] Screen reader compatible
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] ARIA labels added where needed
- [ ] Not applicable (backend/infrastructure change)

## Documentation
- [ ] Code comments added for complex logic
- [ ] README.md updated (if needed)
- [ ] AGENTS.md updated (if patterns changed)
- [ ] API documentation updated (if endpoints changed)
- [ ] Architecture docs updated (if structure changed)
- [ ] No documentation changes needed

## Checklist
<!-- Verify all items before requesting review -->

**Code Quality:**
- [ ] Code follows the project's style guidelines
- [ ] Self-review of code completed
- [ ] No linter errors (`npm run lint` or `poetry run ruff check .`)
- [ ] No type errors (`npm run build` or `poetry run mypy app/`)
- [ ] Comments added for non-obvious code
- [ ] No unnecessary comments or commented-out code

**Testing:**
- [ ] Tests cover new functionality
- [ ] Tests follow existing test patterns
- [ ] Edge cases covered
- [ ] Error handling tested

**Dependencies:**
- [ ] No new dependencies added
- [ ] New dependencies justified and documented
- [ ] Dependencies checked for vulnerabilities
- [ ] Package-lock.json/poetry.lock updated

**Git Hygiene:**
- [ ] Commits have descriptive messages
- [ ] No merge conflicts
- [ ] Branch is up to date with main
- [ ] No unrelated changes included

**CI/CD:**
- [ ] All CI checks pass
- [ ] No new warnings introduced
- [ ] Build succeeds
- [ ] Docker build works (if applicable)

## For AI Coding Agents

<!-- If this PR was created by an AI coding agent -->
- [ ] I am an AI coding agent (GitHub Copilot, etc.)
- [ ] I have read and followed AGENTS.md guidelines
- [ ] Task was appropriate for AI agent (see CONTRIBUTING.md)
- [ ] All acceptance criteria from the issue are met
- [ ] I have tested the changes work correctly
- [ ] I did not modify security-critical code without supervision

**AI Agent Confidence:**
- [ ] High - Standard task following established patterns
- [ ] Medium - Some complexity or edge cases
- [ ] Low - Complex logic or unclear requirements (human review recommended)

## Reviewer Notes
<!-- Any specific areas you'd like reviewers to focus on -->


## Post-Merge Actions
<!-- Any actions needed after this PR is merged -->
- [ ] None
- [ ] Deploy to staging for testing
- [ ] Update related documentation
- [ ] Notify stakeholders
- [ ] Other: _______________

---

**For Reviewers:**
- Focus areas: 
- Risk level: Low / Medium / High
- Deployment notes:
