---
name: features
description: Manage captured feature ideas.
disable-model-invocation: true
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

Read `.opti-gsd/features/` directory and display pending items:

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

Update feature file - change status to `completed`.

### Promote Feature to Story

Convert a feature into a user story (for formal tracking with acceptance criteria):

```markdown
## Promote Feature F{id}

**F{id}:** {description}

This will create a user story in `.opti-gsd/stories/` with formal acceptance criteria.

Confirm? (yes/no)
```

On confirm:
- Create story in `.opti-gsd/stories/US{NNN}.md`
- Prompt for acceptance criteria
- Update feature file status to `promoted`

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

On confirm, delete `.opti-gsd/features/F{id}.md`.

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
- Move completed feature files to `.opti-gsd/archive/features/`
- Keep reference in archive index

```markdown
## Completed Features Cleared

Archived {count} items to `.opti-gsd/archive/features-{date}.md`
Remaining: {pending_count} pending features
```

---

## Feature File Format

Each feature is stored in `.opti-gsd/features/F{NNN}.md`:

```markdown
# F{NNN}: {title}

**Added:** {date}
**Category:** {enhancement|improvement|refactor|docs|test|exploration}
**Priority:** {high|medium|low}
**Status:** {pending|completed|promoted}

## Description
{what the feature is}

## Notes
{additional context}

## Completion
**Completed:** {date, if applicable}
**Promoted to:** {US{NNN}, if promoted}
```

---

## The Three Tracking Systems

| Tracking | Purpose | Command | Directory |
|----------|---------|---------|-----------|
| **Issues** | Bugs, problems, things broken | /opti-gsd:issues | `.opti-gsd/issues/` |
| **Features** | Ideas for improvements (internal) | /opti-gsd:features | `.opti-gsd/features/` |
| **Stories** | User/client requests (external) | /opti-gsd:stories | `.opti-gsd/stories/` |

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
