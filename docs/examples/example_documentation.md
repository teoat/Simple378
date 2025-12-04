# Example: Documentation Update (Excellent for Copilot Agent)

## Title
Docs: Add Docker troubleshooting section to README

## Description
Users frequently encounter common Docker issues when setting up the development environment for the first time. These issues are not currently documented, leading to repeated questions and setup delays.

Add a troubleshooting section to README.md that documents the most common Docker-related issues and their solutions.

## Problem Statement
New contributors struggle with Docker setup because common issues aren't documented. This creates friction in the onboarding process and generates repetitive support requests.

## Common Issues to Document

Based on actual user reports and GitHub issues, document solutions for:

### 1. Port Already in Use
**Problem:** Error starting services because ports 5173, 8000, 6333, 5432, or 6379 are already in use.

**Solution:** 
- How to identify what's using the port
- How to stop conflicting services
- How to change ports in docker-compose.yml

### 2. Permission Denied (Linux)
**Problem:** Docker commands fail with "permission denied" on Linux systems.

**Solution:**
- Add user to docker group
- Alternatively, use sudo (not recommended for development)
- Verify docker group membership

### 3. Database Connection Refused
**Problem:** Backend can't connect to PostgreSQL with error "connection refused".

**Solution:**
- Wait for database to fully initialize
- Check DATABASE_URL environment variable
- Verify database service is running
- Check docker network configuration

### 4. Volume Mount Issues (Windows)
**Problem:** Files not syncing between host and container on Windows.

**Solution:**
- Enable Docker Desktop file sharing
- Check drive is shared in Docker settings
- Use WSL2 backend if available

### 5. Out of Disk Space
**Problem:** Build fails with "no space left on device".

**Solution:**
- Clean up unused Docker images/containers
- Prune volumes: `docker volume prune`
- Increase Docker disk allocation

## Affected Files
- `README.md` - Add troubleshooting section after "Getting Started"

## Proposed Structure

Add the following section to README.md after "Local Development":

```markdown
## Troubleshooting

### Common Docker Issues

#### Port Already in Use

**Problem:** Error message like "port 5173 is already allocated"

**Solution:**

1. Find what's using the port:
   ```bash
   # Linux/Mac
   lsof -i :5173
   
   # Windows
   netstat -ano | findstr :5173
   ```

2. Stop the conflicting service or change the port in `docker-compose.yml`:
   ```yaml
   frontend:
     ports:
       - "5174:5173"  # Change host port
   ```

3. Restart Docker Compose:
   ```bash
   docker-compose down && docker-compose up
   ```

#### Permission Denied (Linux)

**Problem:** "permission denied while trying to connect to Docker daemon"

**Solution:**

1. Add your user to the docker group:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. Verify group membership:
   ```bash
   groups
   ```

3. Log out and back in for changes to take effect.

[... continue for other issues ...]
```

## Acceptance Criteria

### Content
- [ ] All 5 common issues documented
- [ ] Each issue has clear problem statement
- [ ] Each solution includes specific commands
- [ ] Commands tested on Linux, Mac, and Windows (where applicable)
- [ ] Examples are copy-paste ready
- [ ] Solutions are ordered by likelihood/severity

### Formatting
- [ ] Consistent heading structure (### for each issue)
- [ ] Code blocks use appropriate syntax highlighting
- [ ] Commands formatted as bash/shell code blocks
- [ ] Links to official Docker docs for advanced topics
- [ ] Matches existing README.md style

### Accessibility
- [ ] Clear, jargon-free language
- [ ] Step-by-step instructions
- [ ] Explanations for why solutions work (not just commands)
- [ ] Warning notes for destructive commands (e.g., `docker volume prune`)

### Completeness
- [ ] Each issue includes symptoms, cause, and solution
- [ ] Platform-specific notes (Linux/Mac/Windows) where relevant
- [ ] References to Docker documentation for more details
- [ ] Contact info for further help (link to issues)

## Testing Requirements

### Verification Checklist
- [ ] Commands are syntactically correct (no typos)
- [ ] Commands tested on at least 2 platforms
- [ ] Solutions actually solve the described problems
- [ ] No placeholder text or TODO items
- [ ] Links are valid and accessible
- [ ] Markdown renders correctly on GitHub

### Recommended Testing Process
1. Fresh clone of repository
2. Deliberately create each issue
3. Follow documented solution
4. Verify issue is resolved
5. Document any gaps or unclear steps

## Format Requirements

### Markdown Style
- Use `###` for each issue heading
- Use `**bold**` for "Problem:" and "Solution:"
- Use ` ```bash ` for command code blocks
- Use `> **Note:**` for important callouts
- Use numbered lists for multi-step solutions

### Example Format
```markdown
#### Issue Name

**Problem:** Description of the error/symptom

**Solution:**

1. First step with explanation
   ```bash
   command --with-options
   ```

2. Second step
   ```bash
   another command
   ```

3. Verify the fix
   ```bash
   verification command
   ```

**Note:** Additional context or warnings

**See also:** [Docker Documentation](link)
```

## Additional Context

### Reference Materials
- Existing troubleshooting in `.github/GITHUB_SETUP_GUIDE.md` (may have some overlap)
- Docker Compose documentation: https://docs.docker.com/compose/
- Past GitHub issues tagged with `docker` or `setup`

### Similar Documentation
- Evidence list in `/docs/CI_CD_QUICK_START.md` has troubleshooting section - use as style reference
- Keep tone consistent with rest of README

### Out of Scope for This Issue
- General Docker tutorial (link to external resources instead)
- Non-Docker setup issues (those can be separate docs)
- Kubernetes troubleshooting (separate from Docker Compose)
- Performance tuning (focus on getting it working first)

## Priority
**Medium** - Improves onboarding experience but doesn't block existing users

## Estimated Effort
**Low** - Documentation only, no code changes
- Research: 30 min (review existing issues)
- Writing: 1 hour
- Testing: 30 min (verify commands)
- Review: 15 min

## Labels
- `documentation`
- `good-first-issue`
- `copilot`
- `onboarding`

---

**This is an example of a well-structured documentation issue suitable for GitHub Copilot coding agent.**

**Why this is good:**
✅ Specific documentation gaps identified  
✅ Exact content to add is outlined  
✅ Format and structure specified  
✅ Examples provided for consistency  
✅ Testing requirements for accuracy  
✅ Out of scope clearly defined  
✅ Reference materials linked  
✅ Low complexity, high impact  
✅ Verification checklist included
