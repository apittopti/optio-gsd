---
description: Generate an executable plan for phase N with XML-structured tasks.
---

# plan-phase [N]

Generate an executable plan for phase N with XML-structured tasks.

## Arguments

- `N` — Phase number (optional, defaults to current phase from state.json)
- `--research` — Force phase research even if RESEARCH.md exists
- `--skip-research` — Skip research, use existing knowledge
- `--gaps` — Plan gap closure for failed verification

## Behavior

### Step 0: Validate Branch

If `branching: milestone` is configured in `.opti-gsd/config.json`:

1. Get current branch:
   ```bash
   git branch --show-current
   ```

2. Get base branch from config (default: `master`)

3. If current branch == base branch:

   **If no milestone set in state.json:**
   ```
   ⚠️ No Milestone Active
   ─────────────────────────────────────
   You're on {base} with branching: milestone configured,
   but no milestone is active.

   → Run /opti-gsd:start-milestone [name] to create a milestone branch
   ```
   Stop execution here.

   **If milestone is set but on base branch:**

   - **interactive mode**:
     > "You're on {base} but milestone {milestone} exists. Switch to {prefix}{milestone}? [Y/n]"

     If yes: `git checkout {prefix}{milestone}`
     If no: "Continuing on {base}. Changes will be on base branch."

   - **yolo mode**:
     Auto-switch: `git checkout {prefix}{milestone}`
     If branch doesn't exist: `git checkout -b {prefix}{milestone}`

### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .opti-gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:new-project to start a new project
```

If `.opti-gsd/state.json` missing:
```
⚠️ Project State Missing
─────────────────────────────────────
.opti-gsd/state.json not found.

→ Run /opti-gsd:init to reinitialize
```

If `.opti-gsd/roadmap.md` missing:
```
⚠️ No Roadmap Found
─────────────────────────────────────
.opti-gsd/roadmap.md not found. Create a roadmap before planning phases.

→ Run /opti-gsd:roadmap to create a roadmap
```

### Step 2: Determine Phase

If N provided, use it. Otherwise read from `.opti-gsd/state.json`.

Normalize phase number:
- `1` → `01`
- `2.1` → `02.1` (for inserted phases)

Validate phase exists in roadmap.md.

### Step 3: Load Context

Read these files (lazy loading):
- `.opti-gsd/config.json` — app_type, skills, MCPs, budgets
- `.opti-gsd/state.json` — current position
- `.opti-gsd/roadmap.md` — phase goals and items to deliver
- `.opti-gsd/stories/` — story details and acceptance criteria (for items in this phase)
- `.opti-gsd/issues/` — issue details (for items in this phase)
- `.opti-gsd/codebase/CONVENTIONS.md` — if exists, for consistency

**Do NOT load:**
- Other phase plans
- Research from other phases
- Archived content

### Step 4: Research (Conditional)

**Check for project-level research first:**
- If `.opti-gsd/research/SUMMARY.md` exists, load it for context
- If missing and this is phase 1, suggest: "Run /opti-gsd:research first for domain best practices?"

**Skip phase research if:**
- `--skip-research` flag
- `.opti-gsd/plans/phase-{N}/RESEARCH.md` already exists
- Discovery level 0 in config

**Do phase research if:**
- `--research` flag
- No existing phase research
- Phase involves new technology/integration
- Project research identified relevant pitfalls for this phase

If researching, spawn opti-gsd-phase-researcher agent:

```markdown
Research Phase {N}: {Phase Title}

Items to deliver:
- {US001}: {title} — {acceptance criteria summary}
- {#002}: {issue title}

Project context (from SUMMARY.md if exists):
- Recommended patterns: {patterns}
- Pitfalls to avoid: {pitfalls}

Focus on:
- Best practices for implementing these stories/fixes
- Libraries/patterns that fit the existing codebase
- Common mistakes to avoid for this feature type
- How to integrate with existing code conventions
- Security considerations if applicable
- Performance considerations if applicable
```

Save output to `.opti-gsd/plans/phase-{N}/RESEARCH.md`.

### Step 5: Generate Plan

Spawn opti-gsd-planner agent with:
- Phase goals from roadmap.md
- Stories with acceptance criteria from `.opti-gsd/stories/`
- Issues to fix from `.opti-gsd/issues/`
- Research from RESEARCH.md (if exists)
- Conventions from codebase analysis (if exists)
- **Available MCPs from .opti-gsd/config.json** (e.g., postgres, github, browser)
- **Available skills from .opti-gsd/config.json** (e.g., commit, review-pr)

The planner will:
1. Derive must-haves using goal-backward methodology
2. Break into 2-4 atomic tasks
3. Assign waves for parallelization
4. Size tasks (15-60 min each)
5. Determine skill applicability
6. Create verification steps

### Step 6: Validate Plan

Spawn opti-gsd-plan-checker agent to verify:
1. Requirement coverage — every REQ has a task
2. Task completeness — all fields present
3. Dependency correctness — no circular deps
4. Key links planned — artifacts will be wired
5. Scope sanity — within context budget
6. Verification derivation — grounded in outcomes

**If issues found:**
- Severity: blocker → return to planner for revision
- Severity: warning → show user, offer to proceed
- Severity: info → note and proceed

Iterate up to 3 times if blocker issues.

### Step 7: Write plan.json

Create `.opti-gsd/plans/phase-{N}/plan.json`:

```markdown
---
phase: {N}
title: {Phase Title}
wave_count: {count}
discovery_level: {0-3}
reqs: [{REQ-IDs}]
estimated_tokens: {estimate}
---

# Phase {N}: {Title}

## Must-Haves (Goal-Backward)

- [ ] {Observable outcome 1}
- [ ] {Observable outcome 2}
- [ ] {Observable outcome 3}

## Wave 1 (Parallel)

<task id="01" wave="1" reqs="{REQ-ID}">
  <files>
    <file action="create">{path}</file>
    <file action="modify">{path}</file>
  </files>
  <action>
    {Specific implementation instructions}
    - {Detail 1}
    - {Detail 2}
    - Reference: {relevant file or doc}
  </action>
  <libraries>{libraries needing current docs, e.g., "tanstack-query, zod" or "none"}</libraries>
  <verify>
    <check type="test" cmd="{command}">{description}</check>
    <check type="browser" url="{url}">{description}</check>
    <check type="console">{description}</check>
  </verify>
  <done>{Measurable completion criteria}</done>
  <skills>{comma-separated skills or "none"}</skills>
</task>

<task id="02" wave="1" reqs="{REQ-ID}">
  ...
</task>

## Wave 2 (After Wave 1)

<task id="03" wave="2" depends="01,02" reqs="{REQ-ID}">
  ...
</task>
```

### Step 8: Update state.json

```yaml
---
milestone: v1.0
phase: {N}
task: 0/{task_count}
branch: {current_branch}

last_active: {timestamp}
session_tokens: {updated}

phases_complete: [...]
phases_in_progress: [{N}]
phases_pending: [...]
---

## Session Context
Phase {N} planned with {task_count} tasks in {wave_count} waves.
Ready for execution.
```

### Step 9: Commit

```bash
git add .opti-gsd/plans/phase-{N}/
git add .opti-gsd/state.json
git commit -m "docs: plan phase {N}

- {task_count} tasks in {wave_count} waves
- Requirements: {REQ-IDs}
- Discovery level: {level}"
```

### Step 10: Present Plan

Display the plan structure:

```markdown
## Phase {N}: {Title}

### Wave Structure
Wave 1 (parallel): Task 01, Task 02, Task 03
Wave 2 (sequential): Task 04

### Tasks
01. {Task title} - {files count} files
02. {Task title} - {files count} files
03. {Task title} - {files count} files
04. {Task title} - {files count} files

### Requirements Covered
- {REQ-ID-1} ✓
- {REQ-ID-2} ✓

### Estimated Context
~{tokens}k tokens ({percentage}% of budget)

Next steps:
→ /opti-gsd:execute         — Start executing tasks
→ /opti-gsd:discuss-phase   — Refine decisions before executing (optional)

💾 State saved. Safe to /compact or start new session if needed.
```

---

## Gap Closure Mode

When `--gaps` flag is used:

1. Read `.opti-gsd/plans/phase-{N}/verification.md` for failed items
2. Create targeted tasks to close specific gaps
3. Mark plan as `gap_closure: true` in frontmatter
4. Only address failed verification items

---

## Context Budget

- Loading context: ~10%
- Research (if needed): spawned as subagent
- Planning: spawned as subagent
- Validation: spawned as subagent
- File writing: ~5%

Orchestrator stays under 15%.
