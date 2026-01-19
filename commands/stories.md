---
description: Manage user stories.
---

# stories [action] [args...]

Manage user stories from users and clients.

## Actions

- (no args) — List stories by status
- `view [id]` — View full story details
- `edit [id]` — Edit a story
- `deliver [id]` — Mark story as delivered
- `archive` — Archive delivered stories

## Behavior

### List Stories (no args)

Read `.gsd/stories/` and display by status:

```markdown
## User Stories

### Backlog (3)
| ID | Title | From | Requested |
|----|-------|------|-----------|
| US003 | Faster search | User survey | 2026-01-10 |
| US004 | Bulk delete | Client B | 2026-01-12 |
| US005 | API access | Client A | 2026-01-15 |

### Planned (2)
| ID | Title | Milestone | Phase |
|----|-------|-----------|-------|
| US001 | Export to Excel | v1.2.0 | Phase 1 |
| US002 | Dark mode | v1.2.0 | Phase 2 |

### Delivered (1)
| ID | Title | Delivered |
|----|-------|-----------|
| US000 | User login | v1.0.0 |

**Total:** 6 stories (3 backlog, 2 planned, 1 delivered)

Actions:
- Add: `/opti-gsd:add-story {title}`
- Plan: `/opti-gsd:roadmap` (assign to milestone)
- View: `/opti-gsd:stories view US001`
```

### View Story

Display full story details:

```markdown
## US001: Export to Excel

**From:** Client A
**Requested:** 2026-01-08
**Status:** planned
**Milestone:** v1.2.0
**Phase:** 1

### Request
"I need to export my dashboard data to Excel so I can share reports with my finance team."

### Why
Client's finance team requires Excel format for their reporting tools. Currently they manually copy/paste data.

### Acceptance Criteria
- [ ] Export button visible on dashboard
- [ ] Downloads as .xlsx format
- [ ] Includes all visible columns
- [ ] Preserves number formatting

### Notes
Client mentioned this is blocking their quarterly reporting process.

---
Actions:
- Edit: `/opti-gsd:stories edit US001`
- Mark delivered: `/opti-gsd:stories deliver US001`
```

### Edit Story

Open story for editing. Update fields as needed:

```markdown
## Edit Story US001

Current values shown. Provide new values or press Enter to keep.

**Title:** [Export to Excel]
**From:** [Client A]
**Status:** [planned]

**Acceptance Criteria:**
1. [Export button visible on dashboard]
2. [Downloads as .xlsx format]
3. [Includes all visible columns]
4. [Add new criterion...]

Save changes? (yes/no)
```

### Deliver Story

Mark a story as delivered:

```markdown
## Deliver Story US001?

**US001:** Export to Excel
**From:** Client A
**Milestone:** v1.2.0

### Acceptance Criteria Check
- [x] Export button visible on dashboard
- [x] Downloads as .xlsx format
- [x] Includes all visible columns
- [x] Preserves number formatting

All criteria met? Mark as delivered? (yes/no)
```

On confirm:
- Update story status to `delivered`
- Add delivery date and milestone
- Optionally archive

```markdown
## Story Delivered

**US001:** Export to Excel
**Delivered in:** v1.2.0
**Date:** 2026-01-19

Client A's request has been fulfilled.
```

### Archive Delivered

Move delivered stories to archive:

```markdown
## Archive Delivered Stories?

This will archive 3 delivered stories:
- US000: User login (v1.0.0)
- US001: Export to Excel (v1.2.0)
- US002: Dark mode (v1.2.0)

Stories will be moved to `.gsd/archive/stories/`

Confirm? (yes/no)
```

On confirm:
- Move to `.gsd/archive/stories/`
- Keep reference in archive index

---

## Story File Format

```markdown
# US{NNN}: {title}

**From:** {source}
**Requested:** {date}
**Status:** backlog | planned | in_progress | delivered

## Request
{what they want in their words}

## Why
{why they need it - the problem it solves}

## Acceptance Criteria
- [ ] {criterion 1}
- [ ] {criterion 2}
- [ ] {criterion 3}

## Milestone
{milestone version or "Not yet assigned"}

## Phase
{phase number or "Not yet assigned"}

## Notes
{additional context, history, related items}

## Delivery
**Delivered:** {date}
**Version:** {milestone}
```

---

## Integration Points

| Command | Story Integration |
|---------|-------------------|
| roadmap | Pulls from backlog stories for milestone planning |
| plan-phase | References stories being delivered |
| verify | Checks story acceptance criteria |
| complete-milestone | Reports stories delivered |

---

## Context Budget

- List: ~3%
- View: ~2%
- Edit: ~3%
- Deliver: ~2%
