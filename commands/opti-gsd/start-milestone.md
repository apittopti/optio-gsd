---
description: Start a new milestone branch.
---

# start-milestone [name]

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
prefix=$(grep 'prefix:' .opti-gsd/config.json | awk '{print $2}')

# Create and checkout branch
git checkout -b "${prefix}${name}"
```

### Step 4: Update state.json

```json
{
  "milestone": "{name}",
  "phase": null,
  "task": null,
  "status": "milestone_started",
  "branch": "{prefix}{name}",
  "last_active": "{timestamp}",
  "phases": {
    "complete": [],
    "in_progress": [],
    "pending": []
  },
  "context": "Started milestone {name}. Ready to create roadmap."
}
```

### Step 5: Update roadmap.md

If roadmap.md exists, add new milestone section:

```markdown
## Milestone: {name}

(Phases to be defined)
```

### Step 6: Commit

```bash
git add .opti-gsd/state.json .opti-gsd/roadmap.md
git commit -m "chore: start milestone {name}"
```

### Step 7: Report

```markdown
## Milestone Started

**Name:** {name}
**Branch:** {prefix}{name}

```

**Next steps:**
→ /opti-gsd:roadmap      — Define roadmap
→ /opti-gsd:plan-phase 1 — Or start planning if roadmap exists

---

## Context Budget

Minimal: ~3%
