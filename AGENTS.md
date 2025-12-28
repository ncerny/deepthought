# AI Agent Instructions

**All AI agents (Claude, Copilot, etc.) must read this file first.** This is the single source of truth for development context.

## Required Reading Before Starting

1. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contributing Guidelines and Code Standards
2. **[docs/tech-stack.md](./docs/tech-stack.md)** - Technical Stack and Architecture Summary (read before starting any plans)
3. **[docs/architecture.md](./docs/architecture.md)** - Complete technical specs and architectural design (read on-demand when deeper understanding is needed)

## Dependency Management

1. Beads - This project uses [Beads](https://github.com/steveyegge/beads/tree/main).
   If beads (`bd version`) is not installed on the machine, read the README.md in the repo linked above, and install beads.
   If beads is not initialized in this repository, before you do anything else, decide on a project prefix from the directory name. It must be alphanumeric only (no dashs or special characters). Run `bd init --prefix <project_prefix>`.

## Development Workflow

**IMPORTANT** All work must have an accompanying beads issue - do not write anything other than documentation without an in progress beads task. When we move a beads task to in progress, the first thing we will do is create a plan - the plan MUST be documented in `docs/tasks/<id>-plan.md`. This plan document MUST be kept up to date as we implement and change things during the task implementation. We will also keep a full history in `docs/tasks/<id>-history.md`. This document MUST be considered immutable - once we write something in it, we can never edit it. We can add to it, but you can never change anything already written. This serves as a implementation history, so we can trace our decisions and context if we need it. Finally, we MUST always keep a summary of the most important context, what we're currently working on, and the immediate next steps in `docs/tasks/<id>-summary.md`. This document will be used if we have to start a new session, or if we have a compaction and need to refresh our context.

```bash
# 1. Check for work
bd ready

# 2. Claim issue
bd update <id> --status=in_progress

# 3. Document our plan in `docs/tasks/<id>-plan.md`

# 4. Write tests

# 5. Update the plan summary and history doc

# 6. Make code changes

# 7. Test locally

# 8. Commit (trunk-based - direct to main)
git commit -m "type(scope): [bbva-xxx] description of change"

# 9. Repeat steps 3-8 as necessary until the task is complete and the tests pass.

# 10. Push to the remote
git push origin main

# 10. Close issue
bd close <id> --reason="description"
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds
