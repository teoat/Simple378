# GitHub Copilot Coding Agent - Quick Reference

Quick links and reminders for working with GitHub Copilot coding agents in this repository.

## 📚 Essential Documentation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| [AGENTS.md](../AGENTS.md) | Complete repository guide for AI agents | Read first; reference for context |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to contribute to this project | Before making first contribution |
| [COPILOT_TASK_GUIDELINES.md](COPILOT_TASK_GUIDELINES.md) | Which tasks are good for AI | Before creating/assigning issues |
| [COPILOT_CONFIGURATION_GUIDE.md](COPILOT_CONFIGURATION_GUIDE.md) | How to use Copilot effectively | Setting up workflows |
| [Examples](examples/) | Sample issues showing best practices | Creating new issues |

## 🎯 Creating Issues for Copilot

### Use Templates
- `.github/ISSUE_TEMPLATE/bug_report.yml` - For bugs
- `.github/ISSUE_TEMPLATE/feature_request.yml` - For features
- `.github/ISSUE_TEMPLATE/documentation.yml` - For docs

### Must Include
✅ Clear, specific description  
✅ Acceptance criteria (checkboxes)  
✅ Affected files list  
✅ Testing requirements  
✅ Examples or context  

### Best Task Types
- Bug fixes with clear reproduction
- Adding tests to existing code
- UI components with mockups/specs
- API endpoints following patterns
- Documentation updates
- Refactoring with defined scope

### Avoid For Copilot
- Security-critical code
- Ambiguous requirements
- Major architecture changes
- Complex business logic
- Production data changes

## ⚡ Quick Commands

### Build & Test
```bash
# Frontend
cd frontend
npm install          # Setup
npm run lint         # Lint
npm test            # Test
npm run build       # Build

# Backend
cd backend
poetry install      # Setup
poetry run ruff check .    # Lint
poetry run pytest   # Test

# Docker (everything)
docker-compose up --build
```

### Key Files

**Frontend:**
- Components: `frontend/src/components/`
- Tests: `frontend/src/**/__tests__/`
- API client: `frontend/src/lib/api.ts`

**Backend:**
- API routes: `backend/app/api/v1/endpoints/`
- Services: `backend/app/services/`
- Models: `backend/app/models/`
- Tests: `backend/tests/`

## 🔍 Review Checklist

When reviewing Copilot PRs:

- [ ] Solves the issue completely
- [ ] Follows existing code patterns
- [ ] Tests included and passing
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Handles edge cases
- [ ] No breaking changes

## 📊 Task Evaluation

**Is this good for Copilot?**

✅ **YES if:**
- Clear requirements
- Follows existing patterns
- Not security-critical
- Testable outcome
- Well-scoped (< 5 files)

❌ **NO if:**
- Ambiguous requirements
- Novel architecture needed
- Security-sensitive
- Requires domain expertise
- Broad/undefined scope

## 🛠️ Troubleshooting

**Issue unclear → Add details:**
- Affected files
- Acceptance criteria
- Examples
- Test requirements

**Copilot makes mistakes → Check:**
- Is task suitable for AI?
- Are requirements clear?
- Are patterns documented?
- Is AGENTS.md up to date?

**Want better results → Update:**
- AGENTS.md with new patterns
- Issue templates with common fields
- Examples with successful tasks

## 🔗 External Resources

- [Copilot Docs](https://docs.github.com/en/copilot)
- [Best Practices](https://docs.github.com/en/copilot/tutorials/coding-agent/get-the-best-results)
- [Agentic Workflows](https://github.blog/ai-and-ml/github-copilot/from-idea-to-pr-a-guide-to-github-copilots-agentic-workflows/)

## 💡 Pro Tips

1. **Start small** - Test with simple docs/bug fixes first
2. **Be specific** - More detail = better results
3. **Link examples** - Reference similar code in the repo
4. **Iterate** - Use `@copilot` comments to refine
5. **Track metrics** - Learn what works for your repo
6. **Update docs** - Codify learnings in AGENTS.md

## 📝 Template Snippets

### Bug Report Checklist
```markdown
## Acceptance Criteria
- [ ] Bug no longer occurs
- [ ] Unit tests added to prevent regression
- [ ] Integration tests pass
- [ ] Documentation updated (if needed)
- [ ] No new bugs introduced
```

### Feature Request Checklist
```markdown
## Acceptance Criteria
- [ ] Feature works as described
- [ ] Unit tests added for new functionality
- [ ] Integration tests pass
- [ ] Documentation updated
- [ ] Accessibility requirements met
- [ ] No breaking changes
- [ ] Performance impact acceptable
```

### Files Template
```markdown
## Affected Files
- `frontend/src/components/path/Component.tsx` (modify)
- `frontend/src/components/path/Component.test.tsx` (add tests)
- `backend/app/api/v1/endpoints/resource.py` (add endpoint)
```

## 🎓 Learning Path

1. **Day 1:** Read AGENTS.md, understand repo structure
2. **Week 1:** Create sample issues using templates
3. **Week 2:** Assign simple docs/test tasks to Copilot
4. **Month 1:** Expand to bug fixes and simple features
5. **Ongoing:** Track metrics, update docs, iterate

## 📞 Getting Help

- **Questions:** Create issue with `question` label
- **Docs unclear:** Create issue with `documentation` label
- **Copilot issues:** Check COPILOT_CONFIGURATION_GUIDE.md troubleshooting
- **Bug in templates:** Create PR with fix

---

**Quick Start:** Read [AGENTS.md](../AGENTS.md) → Use [issue templates](.github/ISSUE_TEMPLATE/) → Check [examples](examples/) → Submit PR with [template](.github/pull_request_template.md)

**Last Updated:** 2024-12-04
