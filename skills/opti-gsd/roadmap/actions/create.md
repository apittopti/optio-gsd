# Create New Roadmap

Full procedure for creating a roadmap when `.opti-gsd/roadmap.md` does not yet exist.

## Step 1: Check Prerequisites

Ensure `.opti-gsd/` exists and is initialized.

## Step 2: Load Context

Read (if they exist):
- `.opti-gsd/project.md` for goals and constraints (optional)
- `.opti-gsd/research/summary.md` for research findings (optional)
- `.opti-gsd/stories/` for user stories
- `.opti-gsd/issues/` for open issues
- `.opti-gsd/features/` for feature ideas

## Step 3: Ask About Milestones

> "What milestones do you see for this project? For most projects, v1.0 is the first milestone covering core functionality."

Common milestone patterns:
- **Single milestone**: v1.0 covers everything
- **Staged releases**: v0.1 (MVP) -> v0.5 (beta) -> v1.0 (launch)
- **Feature-based**: auth-release -> dashboard-release -> payments-release

## Step 4: Gather Items for Milestone

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

## Step 5: Define Phases for Milestone

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

## Step 6: Validate Coverage

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

## Step 7: Define Success Criteria

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

## Step 8: Write roadmap.md

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

## Step 9: Update Item Statuses

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

## Step 10: Create state.json (if needed)

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

## Step 11: Create Phase Directories

```bash
mkdir -p .opti-gsd/plans/phase-01
mkdir -p .opti-gsd/plans/phase-02
# etc.
```

## Step 12: Commit

```bash
git add .opti-gsd/roadmap.md .opti-gsd/state.json .opti-gsd/stories/ .opti-gsd/issues/ .opti-gsd/features/
git commit -m "docs: create roadmap with {N} phases"
```

## Step 13: Report

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

## Context Budget

~20%
