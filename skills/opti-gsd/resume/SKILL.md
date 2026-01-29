---
name: resume
description: Resume work from last session.
disable-model-invocation: true
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

### Step 2a: Load Learnings

If `.opti-gsd/learnings.md` exists:

1. Read learnings file
2. Count entries by category
3. Display recent learnings summary:

```markdown
## Active Learnings

{count} learnings loaded:
- {count} DEPRECATED warnings
- {count} CI_FAILURE fixes
- {count} FILE_NOT_FOUND resolutions
- {count} WORKFLOW_BUG patches

Recent:
- DEPRECATED: `next lint` → Use ESLint CLI directly
- FILE_NOT_FOUND: plugin.json → Read from package.json
```

4. These learnings are now active for this session
5. Executor will check them before running commands

### Step 3: Show Context

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

### Step 4: Verify State

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

### Step 5: Continue

If user confirms, run /opti-gsd:execute to continue execution.

---

## Context Budget

Minimal: ~5%
