# /opti-gsd:resume

Resume work from last session.

## Behavior

### Step 1: Load State

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
