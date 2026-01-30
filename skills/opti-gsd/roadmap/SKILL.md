---
name: roadmap
description: Create, view, or modify the project roadmap and its phases. Subcommands: (view), add, insert, remove.
disable-model-invocation: true
---

# roadmap $ARGUMENTS

Create or view the project roadmap, and manage phases (add, insert, remove).

## Usage

- `/opti-gsd:roadmap` — View or create project roadmap
- `/opti-gsd:roadmap add [title]` — Add new phase to end of roadmap
- `/opti-gsd:roadmap insert [N] [title]` — Insert phase at position N
- `/opti-gsd:roadmap remove [N]` — Remove phase N from roadmap

## Subcommand Routing

Parse `$ARGUMENTS` and route to the appropriate action:

| Arguments | Action | Description |
|-----------|--------|-------------|
| (none) | Default | View existing roadmap or create a new one |
| `add [title]` | Add Phase | Add a new phase to the end of the roadmap |
| `insert [N] [title]` | Insert Phase | Insert a new phase at position N, renumbering subsequent phases |
| `remove [N]` | Remove Phase | Remove a pending phase and renumber subsequent phases |

If arguments don't match any subcommand, show usage help for this skill.

---

## Action: Default — View or Create Roadmap

Create or view the project roadmap.

### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
opti-gsd Not Initialized
─────────────────────────────────────
No .opti-gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:init new to start a new project
```

If `.opti-gsd/state.json` missing:
```
Project State Missing
─────────────────────────────────────
.opti-gsd/state.json not found.

→ Run /opti-gsd:init to reinitialize
```

This command has two modes: **create** (if no roadmap exists) or **view** (if roadmap exists).

---

### View Mode

If `.opti-gsd/roadmap.md` exists, display it with live status:

#### Step 2: Load State

Read `.opti-gsd/state.json` and `.opti-gsd/roadmap.md`.

#### Step 3: Display Roadmap with Status

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

### Create Mode

If `.opti-gsd/roadmap.md` doesn't exist, create one.

#### Step 1: Check Prerequisites

Ensure `.opti-gsd/` exists and is initialized.

#### Step 2: Load Context

Read (if they exist):
- `.opti-gsd/project.md` for goals and constraints (optional)
- `.opti-gsd/research/summary.md` for research findings (optional)
- `.opti-gsd/stories/` for user stories
- `.opti-gsd/issues/` for open issues
- `.opti-gsd/features/` for feature ideas

#### Step 3: Ask About Milestones

> "What milestones do you see for this project? For most projects, v1.0 is the first milestone covering core functionality."

Common milestone patterns:
- **Single milestone**: v1.0 covers everything
- **Staged releases**: v0.1 (MVP) → v0.5 (beta) → v1.0 (launch)
- **Feature-based**: auth-release → dashboard-release → payments-release

#### Step 4: Gather Items for Milestone

Read from all input buckets and present available items:

```markdown
## Planning Milestone: {milestone}

### What should this milestone include?

**User Stories** ({count} in backlog)
`.opti-gsd/stories/`
- US001: Export to Excel (Client A) — high priority
- US002: Dark mode toggle (User feedback) — medium priority
- US003: Faster search (Multiple users) — high priority

**Issues** ({count} open)
`.opti-gsd/issues/`
- #001: Login fails on Safari — medium severity
- #002: Memory leak in dashboard — high severity

**Features** ({count} pending)
`.opti-gsd/features/`
- F005: Add keyboard shortcuts — medium priority
- F008: Refactor auth module — low priority

---
Select items to include, or type "all" for everything.
You can also add new stories/features now.
```

**Selection options:**
- Select by ID: `US001, US003, #002, I005`
- Select by category: `all stories`, `all issues`, `all features`
- Select all: `all`
- Add new: `add story: {title}` or `add feature: {title}`

#### Step 5: Define Phases for Milestone

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

#### Step 6: Validate Coverage

Ensure every selected item maps to exactly one phase:

```
Coverage Check:
- US001: Phase 1
- US003: Phase 2
- #002: Phase 2
- US002: Phase 3
- I005: Phase 1

All 5 items covered. No orphans.
```

If any item is orphaned, add to a phase or create new phase.

#### Step 7: Define Success Criteria

For each phase, success criteria come from:
1. **Story acceptance criteria** — imported from story files
2. **Issue resolution** — the bug is fixed
3. **Feature completion** — the enhancement works

```markdown
### Phase 1: Data Export

**Delivers:** US001, F005

**Success Criteria:** (from US001 acceptance)
- [ ] Export button visible on dashboard
- [ ] Downloads as .xlsx format
- [ ] Includes all visible columns
- [ ] Keyboard shortcut works (Ctrl+E)
```

These MUST be user-observable outcomes, not implementation details.

#### Step 8: Write roadmap.md

Create `.opti-gsd/roadmap.md`:

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

#### Step 9: Update Item Statuses

**Update story files** (`.opti-gsd/stories/US*.md`):
```markdown
**Status:** planned
**Milestone:** v1.0
**Phase:** 1
```

**Update issues** (`.opti-gsd/issues/*.md`):
```markdown
**Status:** planned
**Milestone:** v1.0
**Phase:** 2
```

**Update features** (update `.opti-gsd/features/F{NNN}.md`):
```markdown
**Status:** promoted
**Milestone:** v1.0
```

#### Step 10: Create state.json (if needed)

If state.json doesn't exist or needs updating:

```json
{
  "milestone": "v1.0",
  "phase": 1,
  "task": null,
  "status": "roadmap_created",
  "branch": null,
  "last_active": "{timestamp}",
  "phases": {
    "complete": [],
    "in_progress": [],
    "pending": [1, 2, 3]
  },
  "context": "Roadmap created with {N} phases."
}
```

#### Step 11: Create Phase Directories

```bash
mkdir -p .opti-gsd/plans/phase-01
mkdir -p .opti-gsd/plans/phase-02
# etc.
```

#### Step 12: Commit

```bash
git add .opti-gsd/roadmap.md .opti-gsd/state.json .opti-gsd/stories/ .opti-gsd/issues/ .opti-gsd/features/
git commit -m "docs: create roadmap with {N} phases"
```

#### Step 13: Report

```
Roadmap created!

Milestone: v1.0
Phases: {count}

Items Included:
- Stories: {count} (from users/clients)
- Issues: {count} (bugs/problems)
- Features: {count} (your enhancements)

Phase Overview:
1. {Phase 1 title} — delivers US001, F005
2. {Phase 2 title} — delivers US003, #002
3. {Phase 3 title} — delivers US002

```

**Next steps:**
-> /opti-gsd:plan 1  — Create execution plan for phase 1
-> /opti-gsd:plan research      — Research best practices first (optional)

State saved. Safe to /compact or start new session if needed.

---

## Action: Add Phase

Add a new phase to the end of the roadmap.

### Arguments

- `title` — Phase title (e.g., "Admin Dashboard", "Payment Integration")

### Step 1: Validate Context

Read `.opti-gsd/state.json` to confirm:
- Milestone is active
- roadmap.md exists

If no milestone:
```markdown
## No Active Milestone

Start a milestone first:
/opti-gsd:milestone start v1.0
```

### Step 2: Determine Phase Number

Read roadmap.md, find highest phase number, increment by 1.

### Step 3: Gather Phase Details

If mode is interactive:
```markdown
## New Phase: {title}

**Phase Number:** {N}

Please provide:
1. **Goal:** What observable outcome does this phase deliver?
2. **Requirements:** List REQ-IDs this phase addresses (or "TBD")
3. **Dependencies:** Any phases this depends on? (or "none")
```

If mode is yolo:
- Use title as goal
- Set requirements to TBD
- Set dependencies to none

### Step 4: Update roadmap.md

Append to roadmap:

```markdown
### Phase {N}: {Title} [PENDING]

**Goal:** {goal}
**Requirements:** {req-ids or TBD}
**Dependencies:** {deps or none}

(Tasks to be defined during planning)
```

### Step 5: Update state.json

Add phase to `phases_pending` list.

### Step 6: Commit

```bash
git add .opti-gsd/roadmap.md .opti-gsd/state.json
git commit -m "chore: add phase {N} - {title}"
```

### Step 7: Report

```markdown
## Phase Added

**Phase {N}:** {title}
**Status:** Pending

```

**Next steps:**
-> /opti-gsd:plan {N}       — Plan this phase
-> /opti-gsd:roadmap add {another} — Or add more phases

### Context Budget

Minimal: ~3%

---

## Action: Insert Phase

Insert a new phase at a specific position, renumbering subsequent phases.

### Arguments

- `position` — Phase number where new phase should be inserted
- `title` — Phase title

### Step 1: Validate Context

Check:
- Milestone is active
- roadmap.md exists
- Position is valid (1 to N+1 where N is current phase count)

If position out of range:
```markdown
## Invalid Position

Position {position} is out of range.
Valid range: 1 to {max+1}

Use /opti-gsd:roadmap add {title} to add at end.
```

### Step 2: Check for Conflicts

If any phase >= position is in progress or complete:
```markdown
## Cannot Insert Phase

Phase {N} is already {status}. Inserting would disrupt active work.

Options:
1. Add at end: /opti-gsd:roadmap add {title}
2. Complete current phase first
3. Use `--force` to insert anyway (will renumber)
```

### Step 3: Renumber Phases

For each phase >= position:
- Increment phase number by 1
- Update all references in roadmap.md
- Update plan file paths if they exist

### Step 4: Insert New Phase

Add new phase at position with:
- Status: PENDING
- Goal: (to be defined)
- Requirements: TBD

### Step 5: Update state.json

Update phase arrays to reflect new numbering:
- `phases_complete`: update numbers
- `phases_in_progress`: update numbers
- `phases_pending`: add new phase, update numbers

### Step 6: Rename Plan Directories

```bash
# Rename from highest to lowest to avoid conflicts
for phase in {highest..position}; do
  if [ -d ".opti-gsd/plans/phase-${phase}" ]; then
    mv ".opti-gsd/plans/phase-${phase}" ".opti-gsd/plans/phase-$((phase+1))"
  fi
done

# Create new phase directory
mkdir -p ".opti-gsd/plans/phase-{position}"
```

### Step 7: Commit

```bash
git add .opti-gsd/
git commit -m "chore: insert phase {position} - {title}

Renumbered phases {position}+ to {position+1}+"
```

### Step 8: Report

```markdown
## Phase Inserted

**New Phase {position}:** {title}

**Renumbered:**
- Phase {position} -> Phase {position+1}
- Phase {position+1} -> Phase {position+2}
- ...

```

**Next steps:**
-> /opti-gsd:plan {position} — Plan new phase

### Context Budget

- Analysis: ~3%
- Renumbering: ~5%
- Total: ~8%

---

## Action: Remove Phase

Remove a future phase from the roadmap and renumber subsequent phases.

### Arguments

- `phase` — Phase number to remove

### Step 1: Validate Phase

Check phase status:
- Must be PENDING (not started)
- Cannot remove IN_PROGRESS or COMPLETE phases

If invalid:
```markdown
## Cannot Remove Phase {N}

Phase {N} is {status}. Only PENDING phases can be removed.

{If IN_PROGRESS}
Options:
- Pause work: /opti-gsd:session pause
- Complete phase first
- Use `--force` to remove anyway (will lose progress)

{If COMPLETE}
This phase is already complete. Removing it would break history.
Consider archiving instead: /opti-gsd:session archive {N}
```

### Step 2: Show Phase Details

```markdown
## Remove Phase {N}?

**Title:** {title}
**Goal:** {goal}
**Requirements:** {req-ids}
**Status:** Pending

This will:
1. Remove Phase {N} from roadmap.md
2. Renumber Phase {N+1} -> {N}, Phase {N+2} -> {N+1}, etc.
3. Update all phase references
4. Delete `.opti-gsd/plans/phase-{N}/` if exists

**Confirm removal?** (yes/no)
```

### Step 3: Check for Dependencies

Scan other phases for dependencies on this phase:

```markdown
## Warning: Dependencies Found

The following phases depend on Phase {N}:
- Phase {M}: "Requires auth from Phase {N}"
- Phase {K}: "Builds on Phase {N} API"

Removing Phase {N} will break these dependencies.

Options:
1. Update dependent phases first
2. Use `--force` to remove anyway
3. Cancel removal
```

### Step 4: Remove Phase

Delete from roadmap.md:
```markdown
### Phase {N}: {Title} [PENDING]
{...content...}
```

### Step 5: Renumber Subsequent Phases

For each phase > N:
- Decrement phase number by 1
- Update phase header in roadmap.md
- Rename plan directory if exists

```bash
# Rename from lowest to highest to avoid conflicts
for phase in {N+1..highest}; do
  if [ -d ".opti-gsd/plans/phase-${phase}" ]; then
    mv ".opti-gsd/plans/phase-${phase}" ".opti-gsd/plans/phase-$((phase-1))"
  fi
done
```

### Step 6: Update state.json

Update phase arrays:
- Remove from `phases_pending`
- Renumber remaining phases

### Step 7: Update References

Search and update phase references in:
- roadmap.md (dependency mentions)
- decisions.md (phase references)
- Other plan files

### Step 8: Commit and Report

```bash
git add .opti-gsd/
git commit -m "chore: remove phase {N} - {title}

Renumbered phases {N+1}+ to {N}+"
```

```markdown
## Phase Removed

**Removed:** Phase {N} - {title}

**Renumbered:**
- Phase {N+1} -> Phase {N}
- Phase {N+2} -> Phase {N+1}
- ...

**Updated:** {count} phase references

Roadmap now has {total} phases.
```

### Safety Features

1. **Cannot remove active phases** - Must be PENDING
2. **Dependency warning** - Shows what depends on this phase
3. **Confirmation required** - Interactive mode always asks
4. **Atomic operation** - All changes in single commit

### Context Budget

- Validation: ~3%
- Renumbering: ~5%
- Reference updates: ~5%
- Total: ~13%

---

## Context Budget Summary

| Action | Budget |
|--------|--------|
| Default (view) | ~5% |
| Default (create) | ~20% |
| Add Phase | ~3% |
| Insert Phase | ~8% |
| Remove Phase | ~13% |
