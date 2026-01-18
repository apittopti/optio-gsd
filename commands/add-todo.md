# /opti-gsd:add-todo [description]

Capture an idea or task for later without interrupting current work.

## Arguments

- `description` — Brief description of the todo item

## Behavior

### Step 1: Validate Input

If no description:
```markdown
## Add Todo

Please provide a description:
`/opti-gsd:add-todo Fix the login timeout issue`
```

### Step 2: Categorize Todo

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

### Step 4: Add to TODOS.md

Append to `.gsd/TODOS.md`:

```markdown
### T{NNN}: {description}

- **Added:** {timestamp}
- **Category:** {category}
- **Priority:** {priority}
- **Phase:** {current_phase or "backlog"}
- **Status:** pending

---
```

If TODOS.md doesn't exist, create it:

```markdown
# Project Todos

Quick capture for ideas and tasks to address later.

---

## Pending

### T001: {description}
...
```

### Step 5: Update STATE.md

Add to session context:
```
Todo T{NNN} added: {description}
```

### Step 6: Confirm (No Commit)

Todos are lightweight - no commit needed:

```markdown
## Todo Added

**T{NNN}:** {description}
**Category:** {category}
**Priority:** {priority}

View all: `/opti-gsd:todos`
Continue working - todos are saved automatically.
```

---

## Quick Capture Examples

```
/opti-gsd:add-todo Fix the race condition in auth refresh
/opti-gsd:add-todo Add loading states to dashboard
/opti-gsd:add-todo Refactor database connection pooling
/opti-gsd:add-todo Consider Redis for session storage
/opti-gsd:add-todo urgent: Handle token expiry edge case
```

---

## Context Budget

Minimal: ~2%
