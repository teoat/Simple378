---
description: ANTIGRAVITY AGENTS - WORKFLOW
---

PHASE 1: PLANNING
1. Understand Goal: Read docs/architecture/00_master_plan.md.
2. SSOT Check:
   - Search for existing files/docs relevant to the task.
   - Confirm NO new files are needed unless absolutely necessary.
   - Plan updates to existing files instead of creating new ones.
3. Create Artifacts:
   - task.md: Granular step breakdown.
   - implementation_plan.md: Technical approach and verification steps.
4. Approval: Request user review of the plan before major coding.

PHASE 2: EXECUTION
1. Atomic Changes: Make small, testable edits.
2. Task Boundaries: Use the task_boundary tool to track progress.
3. Tool Selection: Prefer specific tools (replace_file_content) over generic ones.
4. Continuous Cleanup: Run linters/formatters after every significant edit.

PHASE 3: VERIFICATION
1. Static Analysis: Run `cargo check` (if Rust) or `npm run lint` / `flake8`. FIX ALL ERRORS.
2. Test First: Run existing tests to ensure no regressions.
3. New Tests: Write unit/integration tests for new features.
4. Manual Verification: Use browser_subagent or curl.
5. Walkthrough: Create walkthrough.md to demonstrate success.