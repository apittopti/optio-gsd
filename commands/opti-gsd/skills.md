---
description: Discover and configure Claude Code skills for the project.
---

# skills [action] [args...]

Discover and configure Claude Code skills for the project.

## Actions

- (no args) — List available skills
- `scan` — Scan for skills relevant to this stack
- `recommend` — Get skill recommendations based on project
- `add [skill]` — Add skill to project configuration

## Behavior

### List Skills (no args)

Check installed Claude Code skills and project usage:

```markdown
## Available Skills

### Currently Configured
Skills referenced in `.opti-gsd/config.json`:
- commit — Conventional commit generation
- test — Test file generation

### Installed Globally
Skills available in Claude Code:
- commit
- test
- explain
- refactor
- pr-review
- {others from claude code}

Configure for project: /opti-gsd:skills add {skill}
```

### Scan for Skills

Analyze project stack and suggest relevant skills:

```markdown
## Stack Analysis

**Detected:**
- Framework: Next.js 14
- Language: TypeScript
- Testing: Vitest
- Styling: Tailwind CSS

**Recommended Skills:**

| Skill | Relevance | Use Case |
|-------|-----------|----------|
| commit | High | Conventional commits |
| test | High | Generate Vitest tests |
| explain | Medium | Codebase onboarding |

Add recommended: /opti-gsd:skills add commit
```

### Recommend Skills

Deep analysis of project needs:

Spawn `opti-gsd-project-researcher` to analyze:
- Project type (web app, CLI, library, etc.)
- Development patterns used
- Testing approach
- Deployment target

```markdown
## Skill Recommendations

Based on project analysis:

### Essential
1. **commit** — Enforce consistent commit messages
   - Integrates with /opti-gsd:pause and phase completion

2. **test** — Generate tests for new code
   - Matches your Vitest setup
   - Useful during /opti-gsd:execute

### Recommended
3. **explain** — Document complex code
   - Good for knowledge transfer
   - Useful during research phases

### Optional
4. **pr-review** — Automated PR feedback
   - Integrates with /opti-gsd:complete-milestone

Add with: /opti-gsd:skills add {name}
```

### Add Skill

Configure skill for project use:

```markdown
## Add Skill: {skill}

This skill will be available during opti-gsd workflows.

**Integration points:**
- /opti-gsd:execute — Suggest usage after task completion
- /opti-gsd:pause — Include in commit workflow
- /opti-gsd:verify — Reference during verification

Added to `.opti-gsd/config.json`.
```

Update `.opti-gsd/config.json`:
```yaml
skills:
  - commit
  - test
  - {new_skill}
```

Commit:
```bash
git add .opti-gsd/config.json
git commit -m "chore: add {skill} skill to project"
```

---

## Skill Integration Points

| Workflow | Skill Usage |
|----------|-------------|
| execute | test (after implementation) |
| pause | commit (generate message) |
| verify | explain (document findings) |
| complete-milestone | pr-review (before PR) |
| debug | explain (understand code) |

---

## Context Budget

- List: ~2%
- Scan: ~5%
- Recommend: ~10% (uses researcher)
- Add: ~2%
