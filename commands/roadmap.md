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

### Step 4: Define Phases for v1.0

Ask:

> "For v1.0, what are the main phases of work? I'll suggest a structure based on requirements."

Spawn opti-gsd-roadmapper agent if needed, or create manually:

**Phase Clustering Rules:**
1. Group requirements that depend on each other
2. Order by technical dependencies (auth before dashboard)
3. Each phase should be deliverable/demonstrable
4. Target 2-5 tasks per phase when planned
5. Name phases by outcome, not technology

### Step 5: Validate Coverage

Ensure every v1 requirement maps to exactly one phase:

```
Requirement Coverage Check:
- AUTH-01: Phase 1 ✓
- AUTH-02: Phase 1 ✓
- DASH-01: Phase 2 ✓
- DASH-02: Phase 2 ✓
- USER-01: Phase 3 ✓
- PAY-01: Phase 4 ✓

All 6 requirements covered. No orphans.
```

If any requirement is orphaned, add to a phase or create new phase.

### Step 6: Define Success Criteria

For each phase, define 2-5 observable success criteria:

```markdown
### Phase 1: Authentication

**Success Criteria:**
- [ ] User can create account with email/password
- [ ] User can log in and sees authenticated state
- [ ] User can log out
- [ ] User can reset forgotten password
- [ ] Invalid credentials show appropriate errors
```

These MUST be user-observable outcomes, not implementation details.

### Step 7: Write ROADMAP.md

Create `.gsd/ROADMAP.md`:

```markdown
# Roadmap

## Milestone: v1.0

### Phase 1: {Title}
- [ ] Not started
- {Brief description}

**Success Criteria:**
- [ ] {Observable outcome 1}
- [ ] {Observable outcome 2}
- [ ] {Observable outcome 3}

**Requirements:** {REQ-ID-1}, {REQ-ID-2}

---

### Phase 2: {Title}
- [ ] Not started
- {Brief description}

**Success Criteria:**
- [ ] {Observable outcome 1}
- [ ] {Observable outcome 2}

**Requirements:** {REQ-ID-3}, {REQ-ID-4}

---

{Continue for all phases}
```

### Step 8: Update REQUIREMENTS.md

Update each requirement with its phase assignment:

```markdown
### AUTH-01: User Registration
- **Phase:** 1
- **Status:** pending
- **Verification:** User can create account with email/password
```

### Step 9: Create STATE.md (if needed)

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

### Step 10: Create Phase Directories

```bash
mkdir -p .gsd/plans/phase-01
mkdir -p .gsd/plans/phase-02
# etc.
```

### Step 11: Commit

```bash
git add .gsd/ROADMAP.md .gsd/REQUIREMENTS.md .gsd/STATE.md
git commit -m "docs: create roadmap with {N} phases"
```

### Step 12: Report

```
Roadmap created!

Milestone: v1.0
Phases: {count}
Requirements mapped: {count}

Phase Overview:
1. {Phase 1 title} - {req_count} requirements
2. {Phase 2 title} - {req_count} requirements
3. {Phase 3 title} - {req_count} requirements

Next steps:
→ /opti-gsd:plan-phase 1  — Create execution plan for phase 1
→ /opti-gsd:research      — Research best practices first (optional)

💾 State saved. Safe to /compact or start new session if needed.
```

---

## Context Budget

- View mode: ~5% (just reading files)
- Create mode: ~20% (analysis and writing)
