---
description: Resume work from last session.
---

# resume

Resume work from last session.

## Behavior

### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:new-project to start a new project
```

If `.gsd/STATE.md` missing:
```
⚠️ Project State Missing
─────────────────────────────────────
.gsd/STATE.md not found. No session to resume.

→ Run /opti-gsd:init to start fresh
```

### Step 2: Load State

Read `.gsd/STATE.md` for:
- Current milestone, phase, task
- Last active timestamp
- Session context notes

### Step 2: Show Context

```markdown
# Resume Session

## Last Session
- **Date:** {last_active}
- **Position:** Phase {N}, Task {M}
- **Notes:** {session context from STATE.md}

## What Was Happening
{Extracted from session context}

## Pending Work
- Task {M}: {task title from plan.md}
- {Remaining tasks in phase}

## Continue?
Ready to continue from Task {M}?
```

### Step 3: Verify State

Check git status:
- Any uncommitted changes?
- Any conflicts?

If issues:
```markdown
## Warning: Uncommitted Changes

There are uncommitted changes in the working directory:
{git status output}

Options:
A) Commit changes and continue
B) Stash changes and continue
C) Abort and resolve manually
```

### Step 4: Continue

If user confirms, run `/opti-gsd:execute` to continue execution.

---

## Context Budget

Minimal: ~5%
