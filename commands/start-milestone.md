# /opti-gsd:start-milestone [name]

Start a new milestone branch.

## Arguments

- `name` — Milestone name (e.g., "v1.0", "v1.1-hotfix")

## Behavior

### Step 1: Check Prerequisites

```bash
# Check for uncommitted changes
git status --porcelain
```

If uncommitted changes:
```markdown
## Cannot Start Milestone

Uncommitted changes detected:
{list of files}

Please commit or stash changes first:
- `git add . && git commit -m "wip: current state"`
- Or: `git stash`
```

### Step 2: Validate Name

Check name format:
- Should match pattern: `v{major}.{minor}` or `v{major}.{minor}-{suffix}`
- Examples: `v1.0`, `v1.1`, `v2.0-redesign`, `v1.0.1-hotfix`

### Step 3: Create Branch

```bash
# Get prefix from config
prefix=$(grep 'prefix:' .gsd/config.md | awk '{print $2}')

# Create and checkout branch
git checkout -b "${prefix}${name}"
```

### Step 4: Update STATE.md

```yaml
---
milestone: {name}
phase: null
task: null
branch: {prefix}{name}

last_active: {timestamp}
session_tokens: 0

phases_complete: []
phases_in_progress: []
phases_pending: []

open_issues: []
---

## Session Context
Started milestone {name}. Ready to create roadmap.
```

### Step 5: Update ROADMAP.md

If ROADMAP.md exists, add new milestone section:

```markdown
## Milestone: {name}

(Phases to be defined)
```

### Step 6: Commit

```bash
git add .gsd/STATE.md .gsd/ROADMAP.md
git commit -m "chore: start milestone {name}"
```

### Step 7: Report

```markdown
## Milestone Started

**Name:** {name}
**Branch:** {prefix}{name}

Next steps:
1. Define roadmap: `/opti-gsd:roadmap`
2. Or if roadmap exists: `/opti-gsd:plan-phase 1`
```

---

## Context Budget

Minimal: ~3%
