---
description: Resume work from last session.
---

# resume

Resume work from last session.

## Behavior

### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .opti-gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:new-project to start a new project
```

If `.opti-gsd/state.json` missing:
```
⚠️ Project State Missing
─────────────────────────────────────
.opti-gsd/state.json not found. No session to resume.

→ Run /opti-gsd:init to start fresh
```

### Step 2: Load State

Read `.opti-gsd/state.json` for:
- Current milestone, phase, task
- Last active timestamp
- Session context notes

### Step 2: Show Context

```markdown
# Resume Session

## Last Session
- **Date:** {last_active}
- **Position:** Phase {N}, Task {M}
- **Notes:** {session context from state.json}

## What Was Happening
{Extracted from session context}

## Pending Work
- Task {M}: {task title from plan.json}
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

If user confirms, run /opti-gsd:execute to continue execution.

---

## Context Budget

Minimal: ~5%
