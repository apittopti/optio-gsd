---
description: Add a new phase to the end of the roadmap.
---

# add-phase [title]

Add a new phase to the end of the roadmap.

## Arguments

- `title` — Phase title (e.g., "Admin Dashboard", "Payment Integration")

## Behavior

### Step 1: Validate Context

Read `.opti-gsd/state.json` to confirm:
- Milestone is active
- roadmap.md exists

If no milestone:
```markdown
## No Active Milestone

Start a milestone first:
/opti-gsd:start-milestone v1.0
```

### Step 2: Determine Phase Number

Read roadmap.md, find highest phase number, increment by 1.

### Step 3: Gather Phase Details

If mode is interactive:
```markdown
## New Phase: {title}

**Phase Number:** {N}

Please provide:
1. **Goal:** What observable outcome does this phase deliver?
2. **Requirements:** List REQ-IDs this phase addresses (or "TBD")
3. **Dependencies:** Any phases this depends on? (or "none")
```

If mode is yolo:
- Use title as goal
- Set requirements to TBD
- Set dependencies to none

### Step 4: Update roadmap.md

Append to roadmap:

```markdown
### Phase {N}: {Title} [PENDING]

**Goal:** {goal}
**Requirements:** {req-ids or TBD}
**Dependencies:** {deps or none}

(Tasks to be defined during planning)
```

### Step 5: Update state.json

Add phase to `phases_pending` list.

### Step 6: Commit

```bash
git add .opti-gsd/roadmap.md .opti-gsd/state.json
git commit -m "chore: add phase {N} - {title}"
```

### Step 7: Report

```markdown
## Phase Added

**Phase {N}:** {title}
**Status:** Pending

```

**Next steps:**
→ /opti-gsd:plan-phase {N}       — Plan this phase
→ /opti-gsd:add-phase {another}  — Or add more phases

---

## Context Budget

Minimal: ~3%
