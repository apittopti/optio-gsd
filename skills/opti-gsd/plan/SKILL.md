---
name: plan
description: Plan project phases with research, discussion, and execution plans. Subcommands: (phase), fix, discuss, research.
disable-model-invocation: true
---

# plan

Plan project phases with research, discussion, and execution plans.

## Usage

- `/opti-gsd:plan [N]` — Generate execution plan for phase N
- `/opti-gsd:plan fix` — Generate fix plan for verification gaps
- `/opti-gsd:plan discuss [N]` — Capture implementation decisions before planning
- `/opti-gsd:plan research [topic]` — Research best practices for a topic

## Routing

| Input | Subcommand | Description |
|-------|------------|-------------|
| `[N]` or (no args) | **phase** | Generate executable plan for phase N |
| `fix` | **fix** | Generate fix plan for verification gaps |
| `discuss [N]` | **discuss** | Capture decisions before planning |
| `research [topic]` | **research** | Research best practices |

---

# Subcommand: phase

## plan-phase [N]

Generate an executable plan for phase N with XML-structured tasks.

### Arguments

- `N` — Phase number (optional, defaults to current phase from state.json)
- `--research` — Force phase research even if research.md exists
- `--skip-research` — Skip research, use existing knowledge
- `--gaps` — Plan gap closure for failed verification

### Behavior

#### Step 0: Validate Branch (CRITICAL - Protected Branch Check)

**ALWAYS check for protected branches first, regardless of config:**

1. Get current branch:
   ```bash
   git branch --show-current
   ```

2. **BLOCK planning on protected branches:**
   ```bash
   if [[ "$current_branch" =~ ^(master|main|production|prod)$ ]]; then
     # HARD STOP - Never commit to protected branches
   fi
   ```

   If on protected branch:
   ```
   🛑 BLOCKED: Protected Branch
   ─────────────────────────────────────
   Cannot plan on '{current_branch}'. This is a protected branch.

   All development work MUST happen on milestone branches.
   Master/main can ONLY be updated via pull request.

   → Run /opti-gsd:milestone start [name] to create a milestone branch
   → Then run /opti-gsd:plan again
   ```
   **STOP here. Do NOT offer to continue on master.**

3. If `branching: milestone` is configured in `.opti-gsd/config.json`:

   **If no milestone set in state.json:**
   ```
   ⚠️ No Milestone Active
   ─────────────────────────────────────
   You're on {current_branch} but no milestone is active.

   → Run /opti-gsd:milestone start [name] to create a milestone branch
   ```
   Stop execution here.

   **If milestone is set but on wrong branch:**

   Auto-switch to milestone branch:
   ```bash
   git checkout {prefix}{milestone}
   ```
   If branch doesn't exist: `git checkout -b {prefix}{milestone}`

   Report: "Switched to milestone branch: {prefix}{milestone}"

#### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .opti-gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:init new to start a new project
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

#### Step 2: Determine Phase

If N provided, use it. Otherwise read from `.opti-gsd/state.json`.

Normalize phase number:
- `1` → `01`
- `2.1` → `02.1` (for inserted phases)

Validate phase exists in roadmap.md.

#### Step 3: Load Context

Read these files (lazy loading):
- `.opti-gsd/config.json` — app_type, skills, MCPs, budgets
- `.opti-gsd/state.json` — current position
- `.opti-gsd/roadmap.md` — phase goals and items to deliver
- `.opti-gsd/stories/` — story details and acceptance criteria (for items in this phase)
- `.opti-gsd/issues/` — issue details (for items in this phase)
- `.opti-gsd/codebase/conventions.md` — if exists, for consistency

**Do NOT load:**
- Other phase plans
- Research from other phases
- Archived content

#### Step 4: Research (Conditional)

**Check for project-level research first:**
- If `.opti-gsd/research/summary.md` exists, load it for context
- If missing and this is phase 1, suggest: "Run /opti-gsd:research first for domain best practices?"

**Skip phase research if:**
- `--skip-research` flag
- `.opti-gsd/plans/phase-{N}/research.md` already exists
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

Project context (from summary.md if exists):
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

Save output to `.opti-gsd/plans/phase-{N}/research.md`.

#### Step 5: Generate Plan

Spawn opti-gsd-planner agent with:
- Phase goals from roadmap.md
- Stories with acceptance criteria from `.opti-gsd/stories/`
- Issues to fix from `.opti-gsd/issues/`
- Research from research.md (if exists)
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

#### Step 6: Validate Plan

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

#### Step 7: Write plan.json

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

#### Step 8: Update state.json

```json
{
  "milestone": "v1.0",
  "phase": "{N}",
  "task": 0,
  "status": "planned",
  "branch": "{current_branch}",
  "last_active": "{timestamp}",
  "phases": {
    "complete": ["..."],
    "in_progress": ["{N}"],
    "pending": ["..."]
  },
  "context": "Phase {N} planned with {task_count} tasks in {wave_count} waves. Ready for execution."
}
```

#### Step 9: Commit

```bash
git add .opti-gsd/plans/phase-{N}/
git add .opti-gsd/state.json
git commit -m "docs: plan phase {N}

- {task_count} tasks in {wave_count} waves
- Requirements: {REQ-IDs}
- Discovery level: {level}"
```

#### Step 10: Present Plan

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

```

**Next steps:**
→ /opti-gsd:execute         — Start executing tasks
→ /opti-gsd:plan discuss    — Refine decisions before executing (optional)

State saved. Safe to /compact or start new session if needed.

### Gap Closure Mode

When `--gaps` flag is used:

1. Read `.opti-gsd/plans/phase-{N}/verification.md` for failed items
2. Create targeted tasks to close specific gaps
3. Mark plan as `gap_closure: true` in frontmatter
4. Only address failed verification items

### Context Budget

- Loading context: ~10%
- Research (if needed): spawned as subagent
- Planning: spawned as subagent
- Validation: spawned as subagent
- File writing: ~5%

Orchestrator stays under 15%.

---

# Subcommand: fix

## plan-fix [phase]

Generate targeted fix plans for gaps identified during verification.

### Arguments

- `phase` — Phase number with gaps (optional, defaults to last verified phase)

### Philosophy

Following GSD principles: **"Human judgment gates continuation."**

This command is explicitly triggered by the user after reviewing verification gaps.
No automatic fix loops - you decide when and how to address issues.

### Behavior

#### Step 1: Load Verification Report

Read `.opti-gsd/plans/phase-{N}/verification.md` and extract:
- Gap list with types and affected files
- CI failures with error messages
- Integration issues with break points

If no verification.md exists:
```
⚠️ No Verification Report
─────────────────────────────────────
Phase {N} has not been verified yet.

→ Run /opti-gsd:verify {N} first
```

#### Step 2: Parse Gaps

Extract gaps from verification.md `<gaps>` section:

```xml
<gaps>
  <gap type="orphan" file="components/StatsCard.tsx">
    Component exists but not imported in Dashboard
  </gap>
  <gap type="ci_failure" check="typecheck">
    src/api/stats.ts:15 - Property 'userId' does not exist
  </gap>
</gaps>
```

#### Step 3: Generate Fix Tasks

For each gap, create a targeted fix task:

| Gap Type | Fix Strategy | Task Structure |
|----------|--------------|----------------|
| orphan | Add import + usage | Modify parent file |
| broken_link | Fix path/reference | Modify caller file |
| stub | Full implementation | Modify stub file |
| missing_export | Add export | Modify source file |
| ci_failure | Fix specific error | Based on error type |

#### Step 4: Create Fix Plan

Write `.opti-gsd/plans/phase-{N}/fix-plan.json`:

```markdown
# Fix Plan: Phase {N} Gaps

## Source
Generated from: verification.md
Gaps identified: {count}

## Fix Tasks

### Fix 1: Import StatsCard in Dashboard
- **Type:** orphan
- **Files:** src/app/dashboard/page.tsx
- **Test Required:** false (wiring only)
- **Action:** Add import and usage of StatsCard component
- **Verify:** Component renders in dashboard
- **Done:** StatsCard visible on dashboard page

### Fix 2: Fix userId type error
- **Type:** ci_failure
- **Files:** src/api/stats.ts
- **Test Required:** existing
- **Action:** Add userId to request type or fix property access
- **Verify:** `npm run typecheck` passes
- **Done:** No type errors in stats.ts
```

#### Step 5: Offer Execution

```markdown
## Fix Plan Created

**Gaps:** {count}
**Fix tasks:** {task_count}
**Estimated:** Quick fixes, < 15 min total

**Next Steps:**
→ /opti-gsd:execute — Execute fix plan
→ Review fix-plan.json and edit if needed
→ /opti-gsd:verify {N} — Re-verify after fixes

Execute fixes now? [Y/n]
```

If user confirms (or yolo mode), run /opti-gsd:execute on fix plan.

#### Step 6: Commit Plan

```bash
git add .opti-gsd/plans/phase-{N}/fix-plan.json
git commit -m "docs(phase-{N}): create fix plan for {count} gaps"
```

### Fix Task Templates

#### Orphan Fix
```xml
<task id="FIX-01" type="orphan">
  <files>
    <file action="modify">{parent_file}</file>
  </files>
  <action>
    Import {orphan_file} and add usage where appropriate.
    Follow existing import patterns in the file.
  </action>
  <verify>
    <check type="import">Import statement exists</check>
    <check type="usage">Component/function is used</check>
  </verify>
  <done>{orphan} is imported and used in {parent}</done>
</task>
```

#### CI Failure Fix
```xml
<task id="FIX-02" type="ci_failure">
  <files>
    <file action="modify">{error_file}</file>
  </files>
  <action>
    Fix {error_type} error at line {line}:
    {error_message}

    Specific fix: {suggested_fix}
  </action>
  <verify>
    <check type="ci" cmd="{ci_command}">Passes without this error</check>
  </verify>
  <done>{ci_check} passes for {file}</done>
</task>
```

#### Broken Link Fix
```xml
<task id="FIX-03" type="broken_link">
  <files>
    <file action="modify">{caller_file}</file>
  </files>
  <action>
    Fix reference from {from} to {to}:
    Current: {broken_reference}
    Should be: {correct_reference}
  </action>
  <verify>
    <check type="link">Connection works</check>
  </verify>
  <done>{from} correctly references {to}</done>
</task>
```

### Context Budget

- Loading: ~5%
- Gap parsing: ~2%
- Plan generation: ~5%
- Total: ~12%

Fix plans are intentionally lightweight - quick wiring fixes, not new features.

---

# Subcommand: discuss

## discuss-phase [phase]

Capture implementation decisions and constraints for a phase.

Can be run:
- **Before planning** — to inform the initial plan
- **After planning** — to refine decisions, then re-run `plan-phase` to regenerate

### Arguments

- `phase` — Phase number to discuss (defaults to next pending phase)

### Behavior

#### Step 0: Validate Branch

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

   → Run /opti-gsd:milestone start [name] to create a milestone branch
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

#### Step 1: Identify Phase

If no phase specified:
- Find first phase with status PENDING
- If none, suggest adding a phase

```markdown
## No Pending Phases

All phases are complete or in progress.

Add a new phase: /opti-gsd:add-phase {title}
```

#### Step 2: Load Phase Context

Read from roadmap.md:
- Phase title and goal
- Requirements (REQ-IDs)
- Dependencies

#### Step 3: Facilitate Discussion

```markdown
## Discuss Phase {N}: {Title}

Before planning, let's capture key decisions and constraints.

### Goal
{goal from roadmap}

### Requirements
{REQ-IDs}

---

**Please share any of the following:**

1. **Technical Preferences**
   - Preferred libraries or tools?
   - Patterns to follow or avoid?
   - Performance requirements?

2. **Constraints**
   - Time constraints?
   - Must integrate with existing code?
   - Security/compliance requirements?

3. **Open Questions**
   - Anything unclear about requirements?
   - Decisions you're unsure about?

4. **Prior Art**
   - Similar implementations to reference?
   - Existing code to build on?

Type your thoughts, or say "skip" to proceed to planning.
```

#### Step 4: Capture Discussion

As user provides input, organize into structured notes:

```markdown
## Discussion Notes: Phase {N}

### Technical Decisions
- Use TanStack Query for data fetching (user preference)
- Follow existing auth patterns from Phase 2
- Target <100ms response times

### Constraints
- Must work with legacy API endpoints
- Cannot modify database schema
- Needs to support offline mode

### Open Questions
- [ ] How should we handle concurrent edits?
- [ ] What's the fallback for offline?

### References
- Similar to Dashboard component pattern
- See auth service for token handling
```

#### Step 5: Save to Phase Directory

Write to `.opti-gsd/plans/phase-{N}/discussion.md`:

```markdown
# Phase {N} Discussion

**Captured:** {timestamp}
**Participants:** User, Claude

## Summary
{brief summary of key points}

## Technical Decisions
{decisions}

## Constraints
{constraints}

## Open Questions
{questions}

## References
{references}

---

*This informs the planning phase. Run /opti-gsd:plan {N} when ready.*
```

#### Step 6: Update state.json

```json
{
  "phase": "{N}",
  "status": "discussed",
  "context": "Phase {N} discussed. Key decisions captured."
}
```

#### Step 7: Commit and Report

```bash
git add .opti-gsd/plans/phase-{N}/discussion.md .opti-gsd/state.json
git commit -m "doc: capture phase {N} discussion"
```

```markdown
## Discussion Captured

**Phase {N}:** {title}
**Decisions:** {count}
**Open Questions:** {count}

Saved to: `.opti-gsd/plans/phase-{N}/discussion.md`

```

**Next steps:**
→ /opti-gsd:plan {N}           — Generate/regenerate plan with these decisions
→ /opti-gsd:plan discuss {N}   — Add more notes (appends)
→ /opti-gsd:execute             — Start executing (if plan exists)

### Integration with Planning

When /opti-gsd:plan runs, it:
1. Loads discussion.md if exists
2. Incorporates decisions into plan
3. References constraints in task definitions
4. Flags open questions for research

### Context Budget

- Discussion facilitation: ~5%
- Note capture: ~3%
- Total: ~8%

---

# Subcommand: research

## research [scope]

Research best practices, patterns, and pitfalls for your project domain.

### Arguments

- `scope` — What to research (optional):
  - `project` — Full project domain research (default)
  - `phase N` — Research specific to phase N
  - `topic "query"` — Research a specific topic

### Behavior

#### Project Research (default)

Spawn 4 parallel `opti-gsd-project-researcher` agents:

| Agent | Focus | Investigates |
|-------|-------|--------------|
| 1 | **stack** | Technology recommendations, library choices, compatibility |
| 2 | **features** | Table stakes vs differentiators, what users expect |
| 3 | **architecture** | Patterns, structure, scalability approaches |
| 4 | **pitfalls** | Common mistakes, anti-patterns, things to avoid |

Each agent receives:
- `.opti-gsd/project.md` — project goals and type (if exists)
- `.opti-gsd/config.json` — detected stack and framework
- `.opti-gsd/stories/` — user stories to implement
- `.opti-gsd/codebase/summary.md` — existing codebase context (if exists)

Then spawn `opti-gsd-research-synthesizer` to consolidate into `.opti-gsd/research/summary.md`.

#### Phase Research

For /opti-gsd:plan research phase 2:

Spawn `opti-gsd-phase-researcher` with:
- Phase goals from roadmap.md
- Stories/issues to deliver in that phase
- Project research summary.md (if exists)
- Codebase conventions

Focus areas:
- Best libraries/patterns for these specific requirements
- How to implement within existing codebase conventions
- Common pitfalls for this type of feature
- Integration considerations with existing code

Output: `.opti-gsd/plans/phase-{N}/research.md`

#### Topic Research

For /opti-gsd:plan research topic "authentication with OAuth":

Spawn single `opti-gsd-project-researcher` with:
- Specific topic query
- Project context
- Current stack

Output: Displayed directly + optionally saved to `.opti-gsd/research/{topic-slug}.md`

### Output Format

#### Project Research Summary

```markdown
# Research Summary

**Project Type:** {app_type}
**Stack:** {framework, key dependencies}
**Researched:** {timestamp}

## Stack Recommendations

### Recommended
- {library} — {why it fits this project}
- {pattern} — {benefits for this use case}

### Avoid
- {anti-pattern} — {why it's problematic here}

## Feature Insights

### Table Stakes (Must Have)
- {feature} — users expect this
- {feature} — standard for this app type

### Differentiators (Nice to Have)
- {feature} — would set you apart

## Architecture Patterns

### Recommended Structure
- {pattern} — {when to use}
- {approach} — {benefits}

### Scalability Considerations
- {consideration}

## Common Pitfalls

### Critical to Avoid
- {pitfall} — {why and how to avoid}
- {mistake} — {what to do instead}

### Warnings
- {warning} — {context}

---

```

**Next steps:**
→ /opti-gsd:plan {N}   — Generate plan with these insights
→ /opti-gsd:roadmap     — Create roadmap (if not done)

State saved. Safe to /compact or start new session if needed.

### When to Use

| Situation | Command |
|-----------|---------|
| Starting existing project (after init) | /opti-gsd:plan research |
| Before planning a complex phase | /opti-gsd:plan research phase N |
| Unsure about a technical decision | /opti-gsd:plan research topic "..." |
| Want to validate approach | /opti-gsd:plan research |

### Integration with Planning

When /opti-gsd:plan runs:
1. Checks for `.opti-gsd/research/summary.md`
2. Checks for `.opti-gsd/plans/phase-{N}/research.md`
3. Incorporates findings into task planning
4. References pitfalls in verification steps

### Context Budget

- Project research: ~40% (spawned as 4 parallel subagents + synthesizer)
- Phase research: ~20% (spawned as subagent)
- Topic research: ~15% (single focused query)
