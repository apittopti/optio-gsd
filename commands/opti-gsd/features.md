---
description: Manage captured feature ideas.
---

# features [action] [args...]

Manage captured feature ideas.

**Note:** For bugs/problems, use /opti-gsd:issues instead.

## Actions

- (no args) — List pending features
- `all` — Show all features including completed
- `complete [id]` — Mark feature as done
- `promote [id]` — Convert feature to user story
- `delete [id]` — Remove a feature
- `clear` — Remove all completed features

## Behavior

### List Pending Features (no args)

Read `.opti-gsd/FEATURES.md` and display pending items:

```markdown
## Pending Features

| ID | Priority | Category | Description | Age |
|----|----------|----------|-------------|-----|
| F003 | high | enhancement | Add loading states | 2d |
| F005 | medium | improvement | Optimize API calls | 1d |
| F007 | low | exploration | Consider Redis caching | 4h |

**Pending:** 3 | **Completed:** 4 | **Total:** 7

Actions:
- Complete: /opti-gsd:features complete F003
- Promote to story: /opti-gsd:features promote F003
- Add new: /opti-gsd:add-feature {description}
```

### Show All Features

```markdown
## All Features

### Pending (3)
| ID | Priority | Description | Age |
|----|----------|-------------|-----|
| F003 | high | Add loading states | 2d |
| F005 | medium | Optimize API calls | 1d |
| F007 | low | Consider Redis caching | 4h |

### Completed (4)
| ID | Description | Completed |
|----|-------------|-----------|
| F001 | Setup ESLint config | 2026-01-14 |
| F002 | Add TypeScript strict mode | 2026-01-14 |
| F004 | Document env variables | 2026-01-15 |
| F006 | Improve header styling | 2026-01-16 |

Clear completed: /opti-gsd:features clear
```

### Complete Feature

Mark a feature as done (handled outside of milestone workflow):

```markdown
## Complete Feature F{id}

**F{id}:** {description}

Marked as complete.

Remaining: {count} pending features
```

Update FEATURES.md - move to Completed section.

### Promote Feature to Story

Convert a feature into a user story (for formal tracking with acceptance criteria):

```markdown
## Promote Feature F{id}

**F{id}:** {description}

This will create a user story in `.opti-gsd/stories/` with formal acceptance criteria.

Confirm? (yes/no)
```

On confirm:
- Create story in `.opti-gsd/stories/`
- Prompt for acceptance criteria
- Mark feature as "promoted"

```markdown
## Feature Promoted

**F{id}** → **US{NNN}**

The feature is now a tracked user story.
Add to milestone via /opti-gsd:roadmap
```

### Delete Feature

Remove a feature entirely:

```markdown
## Delete Feature F{id}?

**F{id}:** {description}
**Status:** {status}
**Added:** {date}

This cannot be undone. Confirm? (yes/no)
```

On confirm, remove from FEATURES.md.

### Clear Completed

Remove all completed features:

```markdown
## Clear Completed Features?

This will remove {count} completed features:
- F001: Setup ESLint config
- F002: Add TypeScript strict mode
- F004: Document env variables
- F006: Improve header styling

Confirm? (yes/no)
```

On confirm:
- Archive to `.opti-gsd/archive/features-{date}.md`
- Remove from FEATURES.md

```markdown
## Completed Features Cleared

Archived {count} items to `.opti-gsd/archive/features-{date}.md`
Remaining: {pending_count} pending features
```

---

## FEATURES.md Format

```markdown
# Feature Backlog

Quick capture for feature ideas to explore later.
For bugs/problems, see ISSUES.md instead.

## Summary
- Pending: 3
- Completed: 4

---

## Pending

### F003: Add loading states to dashboard

- **Added:** 2026-01-14
- **Category:** enhancement
- **Priority:** high
- **Status:** pending

---

### F005: Optimize API calls
...

---

## Completed

### F001: Setup ESLint config

- **Added:** 2026-01-12
- **Category:** refactor
- **Priority:** medium
- **Status:** completed
- **Completed:** 2026-01-14

---
```

---

## The Three Tracking Systems

| Tracking | Purpose | Command | File |
|----------|---------|---------|------|
| **Issues** | Bugs, problems, things broken | /opti-gsd:issues | ISSUES.md |
| **Features** | Ideas for improvements (internal) | /opti-gsd:features | FEATURES.md |
| **Stories** | User/client requests (external) | /opti-gsd:stories | stories/ |

**Flow:**
- Features can be promoted to Stories (for formal acceptance criteria)
- Issues can be linked to Stories (bugs reported by users)
- Stories are assigned to milestones and tracked to delivery

---

## Integration Points

| Command | Feature Integration |
|---------|---------------------|
| roadmap | Can pull from high-priority features |
| status | Shows feature count in summary |
| pause | Reminder to check pending features |

---

## Context Budget

- List: ~2%
- Complete/Delete: ~2%
- Promote: ~5%
- Clear: ~3%
