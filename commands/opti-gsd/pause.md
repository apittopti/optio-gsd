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

```json
{
  "milestone": "v1.0",
  "phase": 2,
  "task": 3,
  "status": "paused",
  "branch": "gsd/v1.0",
  "last_active": "{current_timestamp}",
  "phases": {
    "complete": [1],
    "in_progress": [2],
    "pending": [3, 4]
  },
  "context": "{User's notes about current state}. {What was in progress}. {Any blockers or considerations}"
}

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
