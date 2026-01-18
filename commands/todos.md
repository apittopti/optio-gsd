# /opti-gsd:todos [action] [args...]

Manage captured todos.

## Actions

- (no args) — List pending todos
- `all` — Show all todos including completed
- `complete [id]` — Mark todo as done
- `promote [id]` — Convert todo to phase task
- `delete [id]` — Remove a todo
- `clear` — Remove all completed todos

## Behavior

### List Pending Todos (no args)

Read `.gsd/TODOS.md` and display pending items:

```markdown
## Pending Todos

| ID | Priority | Category | Description | Age |
|----|----------|----------|-------------|-----|
| T003 | high | bug | Fix race condition in auth | 2d |
| T005 | medium | feature | Add loading states | 1d |
| T007 | low | idea | Consider Redis caching | 4h |

**Pending:** 3 | **Completed:** 4 | **Total:** 7

Actions:
- Complete: `/opti-gsd:todos complete T003`
- Promote to task: `/opti-gsd:todos promote T003`
- Add new: `/opti-gsd:add-todo {description}`
```

### Show All Todos

```markdown
## All Todos

### Pending (3)
| ID | Priority | Description | Age |
|----|----------|-------------|-----|
| T003 | high | Fix race condition in auth | 2d |
| T005 | medium | Add loading states | 1d |
| T007 | low | Consider Redis caching | 4h |

### Completed (4)
| ID | Description | Completed |
|----|-------------|-----------|
| T001 | Setup ESLint config | 2026-01-14 |
| T002 | Add TypeScript strict mode | 2026-01-14 |
| T004 | Document env variables | 2026-01-15 |
| T006 | Fix typo in header | 2026-01-16 |

Clear completed: `/opti-gsd:todos clear`
```

### Complete Todo

Mark a todo as done:

```markdown
## Complete Todo T{id}

**T{id}:** {description}

Marked as complete.

Remaining: {count} pending todos
```

Update TODOS.md - move to Completed section:
```markdown
### T{id}: {description}

- **Added:** {original_date}
- **Category:** {category}
- **Priority:** {priority}
- **Status:** completed
- **Completed:** {timestamp}

---
```

### Promote Todo to Task

Convert a todo into a phase task:

```markdown
## Promote Todo T{id}

**T{id}:** {description}

This will:
1. Add as task to Phase {current_phase} plan
2. Mark todo as promoted (not pending)

Confirm? (yes/no)
```

On confirm:
- Add task to current phase plan XML
- Update todo status to "promoted"
- Reference the task ID

```markdown
## Todo Promoted

**T{id}** → **Task {task_id}** in Phase {N}

The todo is now a tracked task in your current phase.
Execute with: `/opti-gsd:execute`
```

### Delete Todo

Remove a todo entirely:

```markdown
## Delete Todo T{id}?

**T{id}:** {description}
**Status:** {status}
**Added:** {date}

This cannot be undone. Confirm? (yes/no)
```

On confirm, remove from TODOS.md.

### Clear Completed

Remove all completed todos:

```markdown
## Clear Completed Todos?

This will remove {count} completed todos:
- T001: Setup ESLint config
- T002: Add TypeScript strict mode
- T004: Document env variables
- T006: Fix typo in header

Confirm? (yes/no)
```

On confirm:
- Archive to `.gsd/archive/todos-{date}.md`
- Remove from TODOS.md

```markdown
## Completed Todos Cleared

Archived {count} items to `.gsd/archive/todos-{date}.md`
Remaining: {pending_count} pending todos
```

---

## TODOS.md Format

```markdown
# Project Todos

Quick capture for ideas and tasks.

## Summary
- Pending: 3
- Completed: 4

---

## Pending

### T003: Fix race condition in auth

- **Added:** 2026-01-14
- **Category:** bug
- **Priority:** high
- **Phase:** backlog
- **Status:** pending

---

### T005: Add loading states to dashboard
...

---

## Completed

### T001: Setup ESLint config

- **Added:** 2026-01-12
- **Category:** refactor
- **Priority:** medium
- **Status:** completed
- **Completed:** 2026-01-14

---
```

---

## Integration Points

| Command | Todo Integration |
|---------|------------------|
| plan-phase | Can pull from high-priority todos |
| execute | Promoted todos become tasks |
| pause | Reminder to check pending todos |
| status | Shows todo count in summary |

---

## Context Budget

- List: ~2%
- Complete/Delete: ~2%
- Promote: ~5%
- Clear: ~3%
