---
description: Capture an idea for later without interrupting current work.
---

# add-idea [description]

Capture an idea for later without interrupting current work.

## Arguments

- `description` — Brief description of the idea

## Behavior

### Step 1: Validate Input

If no description:
```markdown
## Add Idea

Please provide a description:
`/opti-gsd:add-idea Add caching layer for API responses`
```

### Step 2: Categorize Idea

Analyze description and assign category:

| Category | Triggers | Example |
|----------|----------|---------|
| bug | "fix", "broken", "error", "fails" | Fix login timeout |
| feature | "add", "implement", "create", "new" | Add dark mode toggle |
| refactor | "refactor", "clean", "improve", "optimize" | Refactor auth module |
| docs | "document", "readme", "comment" | Document API endpoints |
| test | "test", "coverage", "spec" | Add tests for user service |
| idea | (default) | Consider caching strategy |

### Step 3: Determine Priority

Based on keywords:

| Priority | Triggers |
|----------|----------|
| high | "urgent", "critical", "blocker", "asap" |
| medium | "should", "important", "needed" |
| low | (default) |

### Step 4: Add to IDEAS.md

Append to `.gsd/IDEAS.md`:

```markdown
### I{NNN}: {description}

- **Added:** {timestamp}
- **Category:** {category}
- **Priority:** {priority}
- **Status:** pending

---
```

If IDEAS.md doesn't exist, create it:

```markdown
# Ideas Backlog

Quick capture for ideas to explore later.

---

## Pending

### I001: {description}
...
```

### Step 5: Confirm (No Commit)

Ideas are lightweight - no commit needed:

```markdown
## Idea Captured

**I{NNN}:** {description}
**Category:** {category}
**Priority:** {priority}

View all: `/opti-gsd:ideas`
Continue working - ideas are saved automatically.
```

---

## Quick Capture Examples

```
/opti-gsd:add-idea Fix the race condition in auth refresh
/opti-gsd:add-idea Add loading states to dashboard
/opti-gsd:add-idea Refactor database connection pooling
/opti-gsd:add-idea Consider Redis for session storage
/opti-gsd:add-idea urgent: Handle token expiry edge case
```

---

## Context Budget

Minimal: ~2%
