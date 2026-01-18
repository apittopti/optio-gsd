# /opti-gsd:plan-phase [N]

Generate an executable plan for phase N with XML-structured tasks.

## Arguments

- `N` — Phase number (optional, defaults to current phase from STATE.md)
- `--research` — Force phase research even if RESEARCH.md exists
- `--skip-research` — Skip research, use existing knowledge
- `--gaps` — Plan gap closure for failed verification

## Behavior

### Step 1: Validate Environment

```bash
# Check .gsd/ exists
test -d .gsd || echo "Run /opti-gsd:init first"

# Check ROADMAP.md exists
test -f .gsd/ROADMAP.md || echo "Run /opti-gsd:roadmap first"
```

### Step 2: Determine Phase

If N provided, use it. Otherwise read from `.gsd/STATE.md`.

Normalize phase number:
- `1` → `01`
- `2.1` → `02.1` (for inserted phases)

Validate phase exists in ROADMAP.md.

### Step 3: Load Context

Read these files (lazy loading):
- `.gsd/config.md` — app_type, skills, MCPs, budgets
- `.gsd/STATE.md` — current position
- `.gsd/ROADMAP.md` — phase goals and requirements
- `.gsd/REQUIREMENTS.md` — REQ details for this phase
- `.gsd/ISSUES.md` — known issues to avoid
- `.gsd/codebase/CONVENTIONS.md` — if exists, for consistency

**Do NOT load:**
- Other phase plans
- Research from other phases
- Archived content

### Step 4: Research (Conditional)

**Skip research if:**
- `--skip-research` flag
- `.gsd/plans/phase-{N}/RESEARCH.md` already exists
- Discovery level 0 in config

**Do research if:**
- `--research` flag
- No existing research
- Phase involves new technology/integration

If researching, spawn opti-gsd-phase-researcher agent:

```markdown
Research Phase {N}: {Phase Title}

Requirements to cover:
- {REQ-ID-1}: {description}
- {REQ-ID-2}: {description}

Focus on:
- Best libraries/patterns for these requirements
- Common pitfalls
- Integration considerations
```

Save output to `.gsd/plans/phase-{N}/RESEARCH.md`.

### Step 5: Generate Plan

Spawn opti-gsd-planner agent with:
- Phase goals from ROADMAP.md
- Requirements from REQUIREMENTS.md
- Research from RESEARCH.md (if exists)
- Conventions from codebase analysis (if exists)
- Known issues from ISSUES.md

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

### Step 7: Write plan.md

Create `.gsd/plans/phase-{N}/plan.md`:

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

### Step 8: Update STATE.md

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
git add .gsd/plans/phase-{N}/
git add .gsd/STATE.md
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

Ready to execute? Run /opti-gsd:execute
```

---

## Gap Closure Mode

When `--gaps` flag is used:

1. Read `.gsd/plans/phase-{N}/VERIFICATION.md` for failed items
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
