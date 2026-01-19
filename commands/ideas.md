---
description: Manage captured ideas.
---

# ideas [action] [args...]

Manage captured ideas.

## Actions

- (no args) — List pending ideas
- `all` — Show all ideas including completed
- `complete [id]` — Mark idea as done
- `promote [id]` — Convert idea to issue
- `delete [id]` — Remove an idea
- `clear` — Remove all completed ideas

## Behavior

### List Pending Ideas (no args)

Read `.gsd/IDEAS.md` and display pending items:

```markdown
## Pending Ideas

| ID | Priority | Category | Description | Age |
|----|----------|----------|-------------|-----|
| I003 | high | bug | Fix race condition in auth | 2d |
| I005 | medium | feature | Add loading states | 1d |
| I007 | low | idea | Consider Redis caching | 4h |

**Pending:** 3 | **Completed:** 4 | **Total:** 7

Actions:
- Complete: `/opti-gsd:ideas complete I003`
- Promote to issue: `/opti-gsd:ideas promote I003`
- Add new: `/opti-gsd:add-idea {description}`
```

### Show All Ideas

```markdown
## All Ideas

### Pending (3)
| ID | Priority | Description | Age |
|----|----------|-------------|-----|
| I003 | high | Fix race condition in auth | 2d |
| I005 | medium | Add loading states | 1d |
| I007 | low | Consider Redis caching | 4h |

### Completed (4)
| ID | Description | Completed |
|----|-------------|-----------|
| I001 | Setup ESLint config | 2026-01-14 |
| I002 | Add TypeScript strict mode | 2026-01-14 |
| I004 | Document env variables | 2026-01-15 |
| I006 | Fix typo in header | 2026-01-16 |

Clear completed: `/opti-gsd:ideas clear`
```

### Complete Idea

Mark an idea as done (handled outside of milestone workflow):

```markdown
## Complete Idea I{id}

**I{id}:** {description}

Marked as complete.

Remaining: {count} pending ideas
```

Update IDEAS.md - move to Completed section.

### Promote Idea to Issue

Convert an idea into a tracked issue (for inclusion in a milestone):

```markdown
## Promote Idea I{id}

**I{id}:** {description}

This will create an issue in `.gsd/issues/` for milestone planning.

Confirm? (yes/no)
```

On confirm:
- Create issue in `.gsd/issues/`
- Mark idea as "promoted"

```markdown
## Idea Promoted

**I{id}** → **Issue #{NNN}**

The idea is now a tracked issue.
Add to milestone via `/opti-gsd:roadmap`
```

### Delete Idea

Remove an idea entirely:

```markdown
## Delete Idea I{id}?

**I{id}:** {description}
**Status:** {status}
**Added:** {date}

This cannot be undone. Confirm? (yes/no)
```

On confirm, remove from IDEAS.md.

### Clear Completed

Remove all completed ideas:

```markdown
## Clear Completed Ideas?

This will remove {count} completed ideas:
- I001: Setup ESLint config
- I002: Add TypeScript strict mode
- I004: Document env variables
- I006: Fix typo in header

Confirm? (yes/no)
```

On confirm:
- Archive to `.gsd/archive/ideas-{date}.md`
- Remove from IDEAS.md

```markdown
## Completed Ideas Cleared

Archived {count} items to `.gsd/archive/ideas-{date}.md`
Remaining: {pending_count} pending ideas
```

---

## IDEAS.md Format

```markdown
# Ideas Backlog

Quick capture for ideas to explore later.

## Summary
- Pending: 3
- Completed: 4

---

## Pending

### I003: Fix race condition in auth

- **Added:** 2026-01-14
- **Category:** bug
- **Priority:** high
- **Status:** pending

---

### I005: Add loading states to dashboard
...

---

## Completed

### I001: Setup ESLint config

- **Added:** 2026-01-12
- **Category:** refactor
- **Priority:** medium
- **Status:** completed
- **Completed:** 2026-01-14

---
```

---

## Integration Points

| Command | Idea Integration |
|---------|------------------|
| roadmap | Can pull from high-priority ideas |
| status | Shows idea count in summary |
| pause | Reminder to check pending ideas |

---

## Context Budget

- List: ~2%
- Complete/Delete: ~2%
- Promote: ~5%
- Clear: ~3%
