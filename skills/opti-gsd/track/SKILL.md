---
name: track
description: Capture and manage features, stories, issues, and decisions. Use when the user mentions a future idea, client request, bug, or architectural decision to capture.
---

# track [subcommand] [args...]

Capture and manage features, stories, issues, and decisions.

## Routing

| Subcommand | Description | Source |
|------------|-------------|--------|
| `feature [description]` | Capture a feature idea | Features |
| `story [description]` | Capture a user/client request | Stories |
| `issue [description]` | Log an issue/bug | Issues |
| `decision [description]` | Log an architectural decision | Decisions |
| `list [type]` | List items: features, stories, issues, decisions | All |
| `view [id]` | View a specific item by ID | All |
| `resolve [id]` | Resolve/close an item | Issues/Stories/Features |

## Usage

- `/opti-gsd:track feature [description]` — Capture a feature idea
- `/opti-gsd:track story [description]` — Capture a user/client request
- `/opti-gsd:track issue [description]` — Log a bug or issue
- `/opti-gsd:track decision [description]` — Log an architectural decision
- `/opti-gsd:track list features|stories|issues|decisions` — List tracked items
- `/opti-gsd:track view [ID]` — View details of a tracked item
- `/opti-gsd:track resolve [ID]` — Resolve/close a tracked item

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

# Subcommand: feature

## feature [description]

Capture a feature idea for later without interrupting current work.

**Note:** For bugs/problems, use `/opti-gsd:track issue` instead.

### Arguments

- `description` — Brief description of the feature

### Behavior

#### Step 1: Validate Input

If no description:
```markdown
## Add Feature

Please provide a description:
/opti-gsd:track feature Add caching layer for API responses
```

#### Step 2: Categorize Feature

Analyze description and assign category:

| Category | Triggers | Example |
|----------|----------|---------|
| enhancement | "add", "implement", "create", "new" | Add dark mode toggle |
| improvement | "improve", "optimize", "better" | Improve load time |
| refactor | "refactor", "clean", "reorganize" | Refactor auth module |
| docs | "document", "readme", "comment" | Document API endpoints |
| test | "test", "coverage", "spec" | Add tests for user service |
| exploration | (default) | Consider caching strategy |

#### Step 3: Determine Priority

Based on keywords:

| Priority | Triggers |
|----------|----------|
| high | "urgent", "critical", "important", "asap" |
| medium | "should", "needed", "would be nice" |
| low | (default) |

#### Step 4: Create Feature File

Create `.opti-gsd/features/F{NNN}.md`:

```markdown
# F{NNN}: {description}

**Added:** {timestamp}
**Category:** {category}
**Priority:** {priority}
**Status:** pending

## Description
{description}

## Notes
(none yet)
```

If `.opti-gsd/features/` doesn't exist, create the directory first.

#### Step 5: Confirm (No Commit)

Features are lightweight - no commit needed:

```markdown
## Feature Captured

**F{NNN}:** {description}
**Category:** {category}
**Priority:** {priority}

View all: /opti-gsd:track list features
Continue working - features are saved automatically.
```

### Quick Capture Examples

```
/opti-gsd:track feature Add loading states to dashboard
/opti-gsd:track feature Refactor database connection pooling
/opti-gsd:track feature Consider Redis for session storage
/opti-gsd:track feature important: Add export functionality
```

### Feature File Format

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

# Subcommand: story

## story [title]

Capture a user or client request as a story.

### Arguments

- `title` — Brief title for the story (optional, will prompt if missing)

### Behavior

#### Step 1: Gather Story Details

If title not provided, prompt for it:
```markdown
## New User Story

What's the request? (brief title)
```

Then gather details via prompts:

```markdown
## Story: {title}

**Who requested this?**
- Client name, user feedback, support ticket, etc.

**What do they want?** (in their words)
- Capture the request as they described it

**Why do they need it?**
- What problem does this solve for them?

**How will we know it's done?** (acceptance criteria)
- List specific, testable outcomes
```

#### Step 2: Create Story File

Write to `.opti-gsd/stories/US{NNN}-{slug}.md`:

```markdown
# US{NNN}: {title}

**From:** {source}
**Requested:** {date}
**Status:** backlog

## Request
{what they want in their words}

## Why
{why they need it}

## Acceptance Criteria
- [ ] {criterion 1}
- [ ] {criterion 2}
- [ ] {criterion 3}

## Milestone
Not yet assigned

## Notes
{any additional context}
```

#### Step 3: Confirm

```markdown
## Story Captured

**US{NNN}:** {title}
**From:** {source}

Acceptance criteria:
- {criterion 1}
- {criterion 2}
- {criterion 3}

Add to milestone: /opti-gsd:roadmap
View all stories: /opti-gsd:track list stories
```

### Quick Capture Mode

For rapid capture, provide details inline:

```
/opti-gsd:track story Export to Excel --from "Client A" --why "Share with finance team"
```

Will prompt only for acceptance criteria.

### Examples

```
/opti-gsd:track story Dashboard export feature
/opti-gsd:track story Dark mode toggle
/opti-gsd:track story "Faster search results" --from "User survey"
```

### Story Directory Structure

```
.opti-gsd/stories/
  US001-export-to-excel.md
  US002-dark-mode.md
  US003-faster-search.md
```

### Story File Format

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

# Subcommand: issue

## issue [description]

Log and track a project issue or bug.

### Arguments

- `description` — Brief description of the issue (optional, will prompt if missing)

### Behavior

#### Add Issue

Prompt for issue details:

```markdown
## Log New Issue

Please provide:

1. **Title:** (brief description)
2. **Severity:** (critical, high, medium, low)
3. **Description:** (what's happening?)
4. **Reproduction:** (steps to reproduce, if applicable)
5. **Impact:** (what does this block or affect?)
```

Create `.opti-gsd/issues/ISS{NNN}.md`:

```markdown
# ISS{NNN}: {Title}

**Status:** open
**Severity:** {severity}
**Logged:** {timestamp}
**Phase:** {current_phase}

## Description
{description}

## Reproduction
{steps}

## Impact
{impact}

## Resolution
(pending)
```

Update state.json `open_issues` array.

Commit:
```bash
git add .opti-gsd/issues/ISS{NNN}.md .opti-gsd/state.json
git commit -m "issue: log ISS{NNN} - {title}"
```

### Issue File Format

Each issue is stored in `.opti-gsd/issues/ISS{NNN}.md`:

```markdown
# ISS{NNN}: {Title}

**Status:** {open|resolved}
**Severity:** {critical|high|medium|low}
**Logged:** {date}
**Phase:** {phase number}

## Description
{what's happening}

## Reproduction
{steps to reproduce}

## Impact
{what does this block or affect}

## Resolution
{how it was fixed, if resolved}

**Resolved:** {date, if resolved}
**Resolved by:** {commit hash, if resolved}
```

### Severity Guide

| Level | Definition | Response |
|-------|------------|----------|
| critical | Blocks all work | Fix immediately |
| high | Blocks phase completion | Fix before phase end |
| medium | Causes problems | Fix this milestone |
| low | Minor inconvenience | Fix when convenient |

---

# Subcommand: decision

## decision [description]

Record an architectural decision.

### Arguments

- `description` — Brief description of the decision (optional, will prompt if missing)

### Behavior

#### Add Decision

Prompt for decision details:

```markdown
## Record Decision

Please provide:

1. **Title:** (brief name, e.g., "Use jose for JWT")
2. **Category:** (Auth, State, Structure, API, UI, Testing, Other)
3. **Context:** (Why was this decision needed?)
4. **Decision:** (What was decided?)
5. **Alternatives:** (What else was considered?)
6. **Consequences:** (What are the implications?)
```

After input, append to `.opti-gsd/decisions.md`:

```markdown
### D{NNN}: {Title}

**Date:** {timestamp}
**Category:** {category}
**Phase:** {current_phase or "Pre-planning"}

**Context:**
{context}

**Decision:**
{decision}

**Alternatives Considered:**
- {alt1}
- {alt2}

**Consequences:**
- {consequence1}
- {consequence2}

---
```

Commit:
```bash
git add .opti-gsd/decisions.md
git commit -m "doc: decision D{NNN} - {title}"
```

### decisions.md Format

```markdown
# Decisions Log

## Summary

Quick reference for all architectural decisions.

| ID | Decision | Category | Date |
|----|----------|----------|------|
| D001 | jose > jsonwebtoken | Auth | 2026-01-15 |

---

## Decisions

### D001: jose > jsonwebtoken

**Date:** 2026-01-15
**Category:** Auth
**Phase:** Phase 2

**Context:**
Needed JWT library for authentication.

**Decision:**
Use jose instead of jsonwebtoken.

**Alternatives Considered:**
- jsonwebtoken (most popular)
- jose (ESM native)

**Consequences:**
- ESM compatible out of the box
- Smaller bundle size
- Better TypeScript support

---
```

---

# Subcommand: list

## list [type]

List tracked items by type.

### Arguments

- `type` — One of: `features`, `stories`, `issues`, `decisions`

### Behavior

#### list features

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
- Complete: /opti-gsd:track resolve F003
- Promote to story: /opti-gsd:track story (from feature)
- Add new: /opti-gsd:track feature {description}
```

To show all features including completed, use `list features all`:

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

Clear completed: /opti-gsd:track resolve --clear features
```

#### list stories

Read `.opti-gsd/stories/` and display by status:

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
- Add: /opti-gsd:track story {title}
- Plan: /opti-gsd:roadmap (assign to milestone)
- View: /opti-gsd:track view US001
```

#### list issues

Read `.opti-gsd/issues/` directory and show open issues:

```markdown
## Open Issues

| ID | Severity | Title | Phase | Age |
|----|----------|-------|-------|-----|
| I003 | high | Auth tokens not refreshing | 3 | 2d |
| I005 | medium | Dashboard layout shift | 4 | 1d |
| I006 | low | Typo in error message | 4 | 4h |

Open: 3 | Resolved: 2 | Total: 5

View details: /opti-gsd:track view I003
Add new: /opti-gsd:track issue
```

To show all issues including resolved, use `list issues all`:

```markdown
## All Issues

### Open (3)
| ID | Severity | Title | Age |
|----|----------|-------|-----|
| I003 | high | Auth tokens not refreshing | 2d |
| I005 | medium | Dashboard layout shift | 1d |
| I006 | low | Typo in error message | 4h |

### Resolved (2)
| ID | Title | Resolved |
|----|-------|----------|
| I001 | Build failing on CI | 2026-01-14 |
| I002 | Missing env vars | 2026-01-15 |

Total: 5 issues (3 open, 2 resolved)
```

#### list decisions

Read `.opti-gsd/decisions.md` and display summary:

```markdown
## Decisions

| ID | Date | Decision | Category |
|----|------|----------|----------|
| D001 | 2026-01-15 | jose > jsonwebtoken | Auth |
| D002 | 2026-01-16 | Zustand for state | State |
| D003 | 2026-01-16 | Feature-based folders | Structure |

Total: 3 decisions

View details: /opti-gsd:track view D001
Add new: /opti-gsd:track decision
```

---

# Subcommand: view

## view [id]

View full details of a tracked item by ID.

### Arguments

- `id` — Item ID (e.g., F003, US001, ISS005, D001)

### Behavior

Route based on ID prefix:

| Prefix | Type | Source |
|--------|------|--------|
| F | Feature | `.opti-gsd/features/F{NNN}.md` |
| US | Story | `.opti-gsd/stories/US{NNN}-*.md` |
| ISS or I | Issue | `.opti-gsd/issues/ISS{NNN}.md` |
| D | Decision | `.opti-gsd/decisions.md` (section) |

#### View Feature

```markdown
## F{NNN}: {title}

**Added:** {date}
**Category:** {category}
**Priority:** {priority}
**Status:** {status}

### Description
{description}

### Notes
{notes}
```

#### View Story

```markdown
## US{NNN}: {title}

**From:** {source}
**Requested:** {date}
**Status:** {status}
**Milestone:** {milestone}
**Phase:** {phase}

### Request
{request in their words}

### Why
{why they need it}

### Acceptance Criteria
- [ ] {criterion 1}
- [ ] {criterion 2}
- [ ] {criterion 3}

### Notes
{notes}

---
Actions:
- Edit: /opti-gsd:track story edit US{NNN}
- Mark delivered: /opti-gsd:track resolve US{NNN}
```

#### View Issue

```markdown
## ISS{NNN}: {Title}

**Status:** {status}
**Severity:** {severity}
**Logged:** {date} ({age} ago)
**Phase:** {phase}

### Description
{description}

### Reproduction Steps
{steps}

### Impact
{impact}

### Resolution
{resolution or "Pending"}

### Related
- Debug session: {if any}
- Commit: {if resolved}
```

#### View Decision

```markdown
## D{NNN}: {Title}

**Recorded:** {date}
**Category:** {category}
**Phase:** {phase}

### Context
{context}

### Decision
{decision}

### Alternatives Considered
{alternatives}

### Consequences
{consequences}
```

---

# Subcommand: resolve

## resolve [id]

Resolve or close a tracked item.

### Arguments

- `id` — Item ID (e.g., F003, US001, ISS005)

### Behavior

Route based on ID prefix:

#### Resolve Issue (ISS/I prefix)

```markdown
## Resolve Issue ISS{NNN}

Please provide:

1. **Resolution:** (how was it fixed?)
2. **Commit:** (commit hash if applicable)
3. **Verified:** (yes/no - has fix been verified?)
```

Update `.opti-gsd/issues/ISS{NNN}.md`:

```markdown
# ISS{NNN}: {Title}

**Status:** resolved
**Severity:** {severity}
**Logged:** {date}
**Resolved:** {timestamp}
**Phase:** {phase}

## Description
{description}

## Resolution
{resolution}

**Resolved by:** {commit}
```

Remove from state.json `open_issues`.

Commit:
```bash
git add .opti-gsd/issues/ISS{NNN}.md .opti-gsd/state.json
git commit -m "fix: resolve ISS{NNN} - {title}"
```

#### Deliver Story (US prefix)

```markdown
## Deliver Story US{NNN}?

**US{NNN}:** {title}
**From:** {source}
**Milestone:** {milestone}

### Acceptance Criteria Check
- [x] {criterion 1}
- [x] {criterion 2}
- [x] {criterion 3}

All criteria met? Mark as delivered? (yes/no)
```

On confirm:
- Update story status to `delivered`
- Add delivery date and milestone
- Optionally archive

```markdown
## Story Delivered

**US{NNN}:** {title}
**Delivered in:** {milestone}
**Date:** {date}

{source}'s request has been fulfilled.
```

#### Complete Feature (F prefix)

Mark a feature as done (handled outside of milestone workflow):

```markdown
## Complete Feature F{id}

**F{id}:** {description}

Marked as complete.

Remaining: {count} pending features
```

Update feature file - change status to `completed`.

---

## Additional Feature Actions

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

**F{id}** -> **US{NNN}**

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

### Clear Completed Features

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

## Additional Story Actions

### Edit Story

Open story for editing. Update fields as needed:

```markdown
## Edit Story US{NNN}

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

### Archive Delivered Stories

Move delivered stories to archive:

```markdown
## Archive Delivered Stories?

This will archive {count} delivered stories:
- US000: User login (v1.0.0)
- US001: Export to Excel (v1.2.0)
- US002: Dark mode (v1.2.0)

Stories will be moved to `.opti-gsd/archive/stories/`

Confirm? (yes/no)
```

On confirm:
- Move to `.opti-gsd/archive/stories/`
- Keep reference in archive index

---

## Additional Decision Actions

### Search Decisions

Search decisions by keyword:

```markdown
## Search Results: "{query}"

Found 2 matching decisions:

### D001: jose > jsonwebtoken
Matched in: Title, Decision
Preview: "Use jose for JWT handling because..."

### D005: JWT refresh token strategy
Matched in: Context
Preview: "Need to handle token refresh for..."

View details: /opti-gsd:track view D001
```

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
