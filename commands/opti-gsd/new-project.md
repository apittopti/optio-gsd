# /opti-gsd:new-project

Create a new project with guided setup, research, and roadmap generation.

## Behavior

This command guides the user through complete project setup. Stay conversational but efficient.

### Step 1: Check Prerequisites

If `.gsd/` doesn't exist, run `/opti-gsd:init` first.

### Step 2: Deep Questioning

Gather project understanding through conversation. Ask these in natural flow, not as a checklist:

**Core Questions:**
1. What are you building? (one sentence)
2. Who is it for? (target users)
3. What's the core problem it solves?
4. What does success look like?

**Scope Questions:**
5. What are the must-have features for v1?
6. What's explicitly out of scope?
7. Any hard constraints? (tech, time, budget, compliance)

**Technical Questions:**
8. Any tech stack preferences or requirements?
9. What integrations are needed? (payments, auth, email, etc.)
10. Any existing code or systems to integrate with?

Keep asking clarifying questions until you fully understand the project. Don't proceed with ambiguity.

### Step 3: Write PROJECT.md

Create `.gsd/PROJECT.md`:

```markdown
# {Project Name}

## Overview
{One paragraph synthesizing what this project is}

## Goals
- {Goal 1: Specific, measurable}
- {Goal 2: Specific, measurable}
- {Goal 3: Specific, measurable}

## Non-Goals
- {What this project is NOT}
- {Scope boundaries}

## Target Users
{Who uses this and why}

## Tech Stack
- Framework: {framework}
- Database: {database}
- Auth: {auth_solution}
- Payments: {if applicable}
- Hosting: {if known}

## Constraints
- {Hard constraint 1}
- {Hard constraint 2}

## Success Criteria
- {How we know v1 is successful}
```

### Step 4: Research Decision

Ask user:

> "Would you like me to research best practices for this type of project before planning? This helps avoid common pitfalls but adds ~5 minutes."

**If yes**, spawn 4 parallel opti-gsd-project-researcher agents:
- Focus: stack (technology recommendations)
- Focus: features (table stakes vs differentiators)
- Focus: architecture (patterns and structure)
- Focus: pitfalls (common mistakes to avoid)

Then spawn opti-gsd-research-synthesizer to consolidate findings into `.gsd/research/SUMMARY.md`.

**If no**, proceed directly to requirements.

### Step 5: Define Requirements

Create `.gsd/REQUIREMENTS.md` with REQ-IDs:

```markdown
# Requirements

## v1 (Must Ship)

### {CATEGORY}-01: {Requirement Title}
- **Phase:** TBD
- **Status:** pending
- **Verification:** {How to verify this works}

### {CATEGORY}-02: {Requirement Title}
- **Phase:** TBD
- **Status:** pending
- **Verification:** {How to verify this works}

{Continue for all v1 requirements}

## v2 (Future)

### {CATEGORY}-XX: {Requirement Title}
- **Phase:** TBD
- **Verification:** {How to verify this works}

## Out of Scope

- {Explicit exclusion 1}
- {Explicit exclusion 2}
```

**REQ-ID Format:**
- AUTH-01, AUTH-02 (authentication)
- DASH-01, DASH-02 (dashboard)
- PAY-01, PAY-02 (payments)
- USER-01, USER-02 (user management)
- etc.

### Step 6: Generate Roadmap

Spawn opti-gsd-roadmapper agent with:
- PROJECT.md
- REQUIREMENTS.md
- SUMMARY.md (if research was done)

The roadmapper will:
1. Cluster requirements into phases
2. Order phases by dependencies
3. Create observable success criteria per phase
4. Validate 100% requirement coverage

### Step 7: Present Roadmap for Approval

Show the generated roadmap to user:

```markdown
## Proposed Roadmap: v1.0

### Phase 1: {Title}
- {REQ-IDs covered}
- Success: {Observable outcomes}

### Phase 2: {Title}
- {REQ-IDs covered}
- Success: {Observable outcomes}

{etc.}

Does this phasing make sense? Any adjustments?
```

Iterate until user approves.

### Step 8: Write ROADMAP.md

Create `.gsd/ROADMAP.md`:

```markdown
# Roadmap

## Milestone: v1.0

### Phase 1: {Title}
- [ ] Not started
- {Description}

**Success Criteria:**
- [ ] {Observable outcome 1}
- [ ] {Observable outcome 2}

**Requirements:** {REQ-ID-1}, {REQ-ID-2}

---

### Phase 2: {Title}
- [ ] Not started
- {Description}

**Success Criteria:**
- [ ] {Observable outcome 1}
- [ ] {Observable outcome 2}

**Requirements:** {REQ-ID-3}, {REQ-ID-4}

{Continue for all phases}
```

### Step 9: Update STATE.md

Update `.gsd/STATE.md`:

```yaml
---
milestone: v1.0
phase: 1
task: null
branch: null

last_active: {current_timestamp}
session_tokens: {estimated}

phases_complete: []
phases_in_progress: []
phases_pending: [1, 2, 3, ...]

open_issues: []
---

## Session Context
Project defined. Ready to plan Phase 1.

## Recent Decisions
- {Any decisions made during setup}
```

### Step 10: Create Phase Directories

```bash
mkdir -p .gsd/plans/phase-01
mkdir -p .gsd/plans/phase-02
# etc. for each phase
```

### Step 11: Commit

```bash
git add .gsd/
git commit -m "chore: initialize opti-gsd project

- Created PROJECT.md with goals and constraints
- Defined REQUIREMENTS.md with REQ-IDs
- Generated ROADMAP.md with {N} phases
- Research: {yes/no}"
```

### Step 12: Report

```
Project initialized!

Project: {name}
Phases: {count}
Requirements: {v1_count} for v1, {v2_count} for v2

Files created:
  .gsd/PROJECT.md
  .gsd/REQUIREMENTS.md
  .gsd/ROADMAP.md
  .gsd/STATE.md
  {.gsd/research/* if researched}

Next: Run /opti-gsd:plan-phase 1 to plan the first phase
```

## Context Budget

This command may use significant context for research. Target allocations:
- Questioning: ~10%
- Research (if enabled): ~40% (spawned as subagents)
- Roadmapping: ~15%
- File writing: ~5%

Total orchestrator usage: ~30% (within budget)
