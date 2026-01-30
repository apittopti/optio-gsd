---
name: track
description: Capture and manage features, stories, issues, and architectural decisions. Use when the user mentions a future idea, client request, bug report, or design decision to record for later.
argument-hint: feature|story|issue|decision|list|view|resolve [description]
---

# track [subcommand] [args...]

Capture and manage features, stories, issues, and decisions.

## Routing

| Subcommand | Description | Detail File |
|------------|-------------|-------------|
| `feature [description]` | Capture a feature idea | [actions/feature.md](actions/feature.md) |
| `story [description]` | Capture a user/client request | [actions/story.md](actions/story.md) |
| `issue [description]` | Log an issue/bug | [actions/issue.md](actions/issue.md) |
| `decision [description]` | Log an architectural decision | [actions/decision.md](actions/decision.md) |
| `list [type]` | List items: features, stories, issues, decisions | [actions/list.md](actions/list.md) |
| `view [id]` | View a specific item by ID | [actions/view.md](actions/view.md) |
| `resolve [id]` | Resolve/close an item | [actions/resolve.md](actions/resolve.md) |

## Usage

- `/opti-gsd:track feature [description]` -- Capture a feature idea
- `/opti-gsd:track story [description]` -- Capture a user/client request
- `/opti-gsd:track issue [description]` -- Log a bug or issue
- `/opti-gsd:track decision [description]` -- Log an architectural decision
- `/opti-gsd:track list features|stories|issues|decisions` -- List tracked items
- `/opti-gsd:track view [ID]` -- View details of a tracked item
- `/opti-gsd:track resolve [ID]` -- Resolve/close a tracked item

---

## The Four Tracking Systems

| Tracking | Purpose | ID Scheme | Directory |
|----------|---------|-----------|-----------|
| **Features** | Ideas for improvements (internal) | F{NNN} | `.opti-gsd/features/` |
| **Stories** | User/client requests (external) | US{NNN} | `.opti-gsd/stories/` |
| **Issues** | Bugs, problems, things broken | ISS{NNN} | `.opti-gsd/issues/` |
| **Decisions** | Architectural decisions | D{NNN} | `.opti-gsd/decisions.md` |

**Flow:**
- Features can be promoted to Stories (for formal acceptance criteria)
- Issues can be linked to Stories (bugs reported by users)
- Stories are assigned to milestones and tracked to delivery

---

## Subcommand Overview

### feature

Capture a feature idea for later without interrupting current work. Automatically categorizes (enhancement, improvement, refactor, docs, test, exploration) and assigns priority (high, medium, low) based on keywords. Creates a file in `.opti-gsd/features/F{NNN}.md`. No commit needed -- features are lightweight.

See [actions/feature.md](actions/feature.md) for full procedure, categorization rules, priority triggers, file format, and additional actions (promote, delete, clear completed).

### story

Capture a user or client request as a formal story with acceptance criteria. Gathers details about who requested it, what they want, why, and how to verify completion. Creates a file in `.opti-gsd/stories/US{NNN}-{slug}.md`.

See [actions/story.md](actions/story.md) for full procedure, file format, quick capture mode, and additional actions (edit, archive).

### issue

Log and track a project issue or bug. Gathers severity, description, reproduction steps, and impact. Creates a file in `.opti-gsd/issues/ISS{NNN}.md` and updates state.json. Commits the issue.

See [actions/issue.md](actions/issue.md) for full procedure, file format, and severity guide.

### decision

Record an architectural decision with context, alternatives, and consequences. Appends to `.opti-gsd/decisions.md` with a summary table entry. Commits the decision.

See [actions/decision.md](actions/decision.md) for full procedure, file format, and search functionality.

### list

List tracked items by type. Supports: `features`, `stories`, `issues`, `decisions`. Append `all` to include completed/resolved items (e.g., `list features all`).

See [actions/list.md](actions/list.md) for display formats and actions for each type.

### view

View full details of a tracked item by ID. Routes based on ID prefix: F (feature), US (story), ISS/I (issue), D (decision).

See [actions/view.md](actions/view.md) for display formats per item type.

### resolve

Resolve or close a tracked item. Routes based on ID prefix: ISS/I (resolve issue), US (deliver story), F (complete feature). Each has its own confirmation and update flow.

See [actions/resolve.md](actions/resolve.md) for resolution procedures per item type.

---

## Integration Points

| Skill | Integration |
|-------|-------------|
| /opti-gsd:roadmap | Can pull from high-priority features; pulls from backlog stories for milestone planning |
| /opti-gsd:plan | References stories being delivered |
| /opti-gsd:verify | Checks story acceptance criteria |
| /opti-gsd:milestone complete | Reports stories delivered |
| /opti-gsd:status | Shows feature count and issue count in summary |
| /opti-gsd:session pause | Reminder to check pending features |

---

## Context Budget

- feature (add): ~2%
- story (add): ~3%
- issue (add): ~5%
- decision (add): ~5%
- list: ~2-3%
- view: ~2-3%
- resolve: ~2-5%
