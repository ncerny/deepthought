# Contributing Guidelines

This document contains development workflow and coding standards for the Basketball Video Analyzer project.

## Git Workflow

We use **trunk-based development** - commit directly to `main`.

### Quick Start

```bash
git pull origin main          # Get latest
# Make your changes
git add <files>
git commit -m "type(scope): [<project_id>-xxx] description"
git push origin main
```

### Commit Convention

Every commit MUST follow Conventional Commits with a Beads issue ID:

**Format**: `<type>(<scope>): [<issue-id>] <description>`

| Type       | Description                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | New feature                                             |
| `fix`      | Bug fix                                                 |
| `docs`     | Documentation only                                      |
| `style`    | Formatting, no code change                              |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or updating tests                                |
| `chore`    | Build process, dependencies, etc.                       |
| `perf`     | Performance improvement                                 |

**Examples**:

```bash
git commit -m "feat(backend): [<project_id>-a58df2] add video upload endpoint"
git commit -m "fix(frontend): [<project_id>-b72f1a] fix timeline scrubber position"
git commit -m "test(backend): [<project_id>-a58df2] add unit tests for video processor"
git commit -m "docs: [<project_id>-c93e4b] update API documentation"
```

## Task Management (Beads)

We use **Beads** task tracker instead of GitHub Issues.

### Finding Work

```bash
bd ready                     # Show issues ready to work (no blockers)
bd list --status=open        # All open issues
bd list --status=in_progress # Your active work
bd show <id>                 # Detailed issue view
bd blocked                   # Show blocked issues
```

### Working on Issues

```bash
bd update <id> --status=in_progress   # Claim work
bd close <id> --reason="description"  # Complete work
bd sync                               # Sync with git (run often)
```

### Creating Issues

```bash
bd create --title="..." --type=task|bug|feature|epic|chore
bd dep add <issue> <depends-on>  # Add dependency
```

**Issue ID Format**: `<project_id>-<random>` (e.g., `example-a58df2`)

## Code Standards

### General

- Keep components/functions small and focused
- Use meaningful names
- Write self-documenting code
- Add comments only when "why" isn't obvious

### Testing

- Write tests alongside code
- Test edge cases and error conditions
- Keep tests fast and isolated

### Git Hygiene

- Keep commits atomic (one logical change)
- Don't commit commented-out code
- Don't commit debugging statements
- Review your diff before committing

### Performance

- Profile before optimizing
- Optimize for readability first
- Use lazy loading for large files where possible

### Security

- Never commit secrets or credentials
- Sanitize user input
- Validate data at API boundaries

## Semantic Versioning

Releases follow **MAJOR.MINOR.PATCH**:

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward-compatible)
- **PATCH**: Bug fixes (backward-compatible)

## Release process:

<< Replace this section with the Release Process depending on the architecture designed >>
