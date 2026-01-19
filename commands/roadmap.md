---
description: Create or view the project roadmap.
---

# roadmap

Create or view the project roadmap.

## Behavior

### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:new-project to start a new project
```

If `.gsd/STATE.md` missing:
```
⚠️ Project State Missing
─────────────────────────────────────
.gsd/STATE.md not found.

→ Run /opti-gsd:init to reinitialize
```

This command has two modes: **create** (if no roadmap exists) or **view** (if roadmap exists).

---

## View Mode

If `.gsd/ROADMAP.md` exists, display it with live status:

### Step 2: Load State

Read `.gsd/STATE.md` and `.gsd/ROADMAP.md`.

### Step 3: Display Roadmap with Status

```markdown
# Roadmap: v1.0

## Phase 1: Authentication [COMPLETE]
- Requirements: AUTH-01, AUTH-02, AUTH-03
- Success: User can register, login, logout, reset password

## Phase 2: Dashboard [IN PROGRESS - Task 3/5]
- Requirements: DASH-01, DASH-02
- Success: User sees personalized dashboard with stats

## Phase 3: Settings [PENDING]
- Requirements: USER-01, USER-02
- Success: User can manage profile and preferences

## Phase 4: Payments [PENDING]
- Requirements: PAY-01, PAY-02
- Success: User can subscribe and manage billing

---
Progress: 1/4 phases complete (25%)
Current: Phase 2, Task 3
Next action: /opti-gsd:execute to continue
```

---

## Create Mode

If `.gsd/ROADMAP.md` doesn't exist, create one.

### Step 1: Check Prerequisites

Ensure these exist:
- `.gsd/PROJECT.md` — If missing, run `/opti-gsd:new-project`
- `.gsd/REQUIREMENTS.md` — If missing, create during this flow

### Step 2: Load Context

Read:
- `.gsd/PROJECT.md` for goals and constraints
- `.gsd/REQUIREMENTS.md` for v1 requirements
- `.gsd/research/SUMMARY.md` if exists

### Step 3: Ask About Milestones

> "What milestones do you see for this project? For most projects, v1.0 is the first milestone covering core functionality."

Common milestone patterns:
- **Single milestone**: v1.0 covers everything
- **Staged releases**: v0.1 (MVP) → v0.5 (beta) → v1.0 (launch)
- **Feature-based**: auth-release → dashboard-release → payments-release

### Step 4: Gather Items for Milestone

Read from all input buckets and present available items:

```markdown
## Planning Milestone: {milestone}

### What should this milestone include?

**User Stories** ({count} in backlog)
`.gsd/stories/`
☐ US001: Export to Excel (Client A) — high priority
☐ US002: Dark mode toggle (User feedback) — medium priority
☐ US003: Faster search (Multiple users) — high priority

**Issues** ({count} open)
`.gsd/issues/`
☐ #001: Login fails on Safari — medium severity
☐ #002: Memory leak in dashboard — high severity

**Ideas** ({count} pending)
`.gsd/IDEAS.md`
☐ I005: Add keyboard shortcuts — medium priority
☐ I008: Refactor auth module — low priority

**Requirements** (from PROJECT.md/REQUIREMENTS.md)
☐ AUTH-01: User registration
☐ AUTH-02: User login
☐ DASH-01: Dashboard layout

---
Select items to include, or type "all" for everything.
You can also add new items now.
```

**Selection options:**
- Select by ID: `US001, US003, #002, AUTH-01`
- Select by category: `all stories`, `all issues`
- Select all: `all`
- Add new: `add story: {title}` or `add idea: {title}`

### Step 5: Define Phases for Milestone

Ask:

> "How should we group these into phases? I'll suggest a structure based on dependencies."

Spawn opti-gsd-roadmapper agent if needed, or create manually:

**Phase Clustering Rules:**
1. Group related stories/issues that depend on each other
2. Order by technical dependencies (auth before dashboard)
3. Each phase should be deliverable/demonstrable
4. Target 2-5 tasks per phase when planned
5. Name phases by user outcome, not technology

**Example grouping:**
```markdown
## Suggested Phases

### Phase 1: Data Export
- US001: Export to Excel
- I005: Add keyboard shortcuts (for export)

### Phase 2: Performance & Stability
- US003: Faster search
- #002: Memory leak in dashboard

### Phase 3: User Experience
- US002: Dark mode toggle

Does this grouping work? Adjust as needed.
```

### Step 6: Validate Coverage

Ensure every selected item maps to exactly one phase:

```
Coverage Check:
- US001: Phase 1 ✓
- US003: Phase 2 ✓
- #002: Phase 2 ✓
- US002: Phase 3 ✓
- I005: Phase 1 ✓

All 5 items covered. No orphans.
```

If any item is orphaned, add to a phase or create new phase.

### Step 7: Define Success Criteria

For each phase, success criteria come from:
1. **Story acceptance criteria** — imported from story files
2. **Issue resolution** — the bug is fixed
3. **Idea completion** — the enhancement works

```markdown
### Phase 1: Data Export

**Delivers:** US001, I005

**Success Criteria:** (from US001 acceptance)
- [ ] Export button visible on dashboard
- [ ] Downloads as .xlsx format
- [ ] Includes all visible columns
- [ ] Keyboard shortcut works (Ctrl+E)
```

These MUST be user-observable outcomes, not implementation details.

### Step 8: Write ROADMAP.md

Create `.gsd/ROADMAP.md`:

```markdown
# Roadmap

## Milestone: v1.0

### Phase 1: {Title}
- [ ] Not started
- {Brief description}

**Delivers:** {US001}, {I005}

**Success Criteria:**
- [ ] {From story acceptance criteria}
- [ ] {Observable outcome 2}
- [ ] {Observable outcome 3}

---

### Phase 2: {Title}
- [ ] Not started
- {Brief description}

**Delivers:** {US003}, {#002}

**Success Criteria:**
- [ ] {From story acceptance criteria}
- [ ] {Issue is resolved}

---

{Continue for all phases}
```

### Step 9: Update Item Statuses

**Update story files** (`.gsd/stories/US*.md`):
```markdown
**Status:** planned
**Milestone:** v1.0
**Phase:** 1
```

**Update issues** (`.gsd/issues/*.md`):
```markdown
**Status:** planned
**Milestone:** v1.0
**Phase:** 2
```

**Update ideas** (mark as promoted in `.gsd/IDEAS.md`):
```markdown
**Status:** promoted
**Milestone:** v1.0
```

### Step 10: Create STATE.md (if needed)

If STATE.md doesn't exist or needs updating:

```yaml
---
milestone: v1.0
phase: 1
task: null
branch: null

last_active: {timestamp}
session_tokens: 0

phases_complete: []
phases_in_progress: []
phases_pending: [1, 2, 3, ...]

open_issues: []
---

## Session Context
Roadmap created with {N} phases.

## Recent Decisions
(none yet)
```

### Step 11: Create Phase Directories

```bash
mkdir -p .gsd/plans/phase-01
mkdir -p .gsd/plans/phase-02
# etc.
```

### Step 12: Commit

```bash
git add .gsd/ROADMAP.md .gsd/STATE.md .gsd/stories/ .gsd/issues/ .gsd/IDEAS.md
git commit -m "docs: create roadmap with {N} phases"
```

### Step 13: Report

```
Roadmap created!

Milestone: v1.0
Phases: {count}

Items Included:
- Stories: {count} (from users/clients)
- Issues: {count} (bugs/problems)
- Ideas: {count} (your enhancements)

Phase Overview:
1. {Phase 1 title} — delivers US001, I005
2. {Phase 2 title} — delivers US003, #002
3. {Phase 3 title} — delivers US002

Next steps:
→ /opti-gsd:plan-phase 1  — Create execution plan for phase 1
→ /opti-gsd:research      — Research best practices first (optional)

💾 State saved. Safe to /compact or start new session if needed.
```

---

## Context Budget

- View mode: ~5% (just reading files)
- Create mode: ~20% (analysis and writing)
