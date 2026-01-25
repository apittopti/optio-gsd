---
description: Pause work with context save for later resumption.
---

# pause

Pause work with context save for later resumption.

## Behavior

### Step 1: Capture State

Read current position from state.json.

### Step 2: Ask for Context

> "Any notes about where you left off? This helps when resuming."

### Step 3: Update state.json

```yaml
---
milestone: v1.0
phase: 2
task: 3/5
branch: gsd/v1.0

last_active: {current_timestamp}
session_tokens: {current_usage}

phases_complete: [1]
phases_in_progress: [2]
phases_pending: [3, 4]

open_issues: [ISS-001, ISS-002]
---

## Session Context
{User's notes about current state}
{What was in progress}
{Any blockers or considerations}

## Recent Decisions
- {existing decisions}
```

### Step 4: Commit

```bash
git add .opti-gsd/state.json
git commit -m "wip: pause at phase {N} task {M}

{Brief context note}"
```

### Step 5: Confirm

```markdown
## Session Paused

Saved at: Phase {N}, Task {M}
Context: {notes summary}

To resume: Run /opti-gsd:resume
```

---

## Context Budget

Minimal: ~5%
