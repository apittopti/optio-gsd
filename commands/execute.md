# /opti-gsd:execute

Execute the current phase plan with wave-based parallelization and fresh context per task.

## Behavior

This is the core execution engine. It spawns subagents for each task to maintain fresh context.

### Step 1: Load State

Read (minimal context):
- `.gsd/config.md` — mode, budgets, browser config
- `.gsd/STATE.md` — current phase and task position

### Step 2: Load Current Plan

Read `.gsd/plans/phase-{N}/plan.md`.

Parse:
- YAML frontmatter for metadata
- XML tasks for execution
- Wave structure for parallelization

### Step 3: Determine Starting Point

If resuming (task > 0 in STATE.md):
- Verify prior commits exist
- Start from next incomplete task

If fresh start:
- Begin with Wave 1

### Step 4: Check Mode

Read `mode` from config:
- **interactive**: Confirm before starting wave
- **yolo**: Execute without confirmation

If interactive mode:
> "Ready to execute Phase {N}: {Title} ({task_count} tasks in {wave_count} waves). Proceed?"

### Step 5: Execute Waves

```
FOR each wave:
  1. Identify tasks in this wave
  2. IF interactive mode AND wave > 1:
       Ask: "Wave {W-1} complete. Continue to Wave {W}?"

  3. FOR each task in wave (spawn in parallel if multiple):
     - Build subagent prompt (see below)
     - Spawn opti-gsd-executor via Task tool
     - Await completion

  4. FOR each completed task:
     - Parse result (COMPLETE | FAILED | CHECKPOINT)
     - IF COMPLETE:
         - git add {task.files}
         - git commit -m "{type}({phase}-{task}): {description}"
         - Update STATE.md: task = {N+1}
     - IF FAILED:
         - Log failure to STATE.md
         - Stop execution
         - Report failure with suggested fix
     - IF CHECKPOINT:
         - Present checkpoint to user
         - Await decision
         - Resume or abort based on response
     - IF NEW ISSUE reported:
         - Append to .gsd/ISSUES.md

  5. All tasks in wave complete? → Next wave
```

### Step 6: Build Subagent Prompt

For each task, construct this prompt for opti-gsd-executor:

```xml
You are a focused implementation agent for opti-gsd. Complete ONLY this task.

<context>
  <project>{.gsd/PROJECT.md#overview - brief}</project>
  <conventions>{.gsd/codebase/CONVENTIONS.md - if exists}</conventions>
</context>

<task id="{id}" reqs="{reqs}">
  <files>
    {task.files}
  </files>
  <action>
    {task.action}
  </action>
  <verify>
    {task.verify}
  </verify>
  <done>{task.done}</done>
</task>

<skills>
  {For each skill in task.skills, include full skill instructions}
</skills>

<known_issues>
  {Open issues from ISSUES.md that might affect this task}
</known_issues>

<browser enabled="{config.browser.enabled}" base_url="{config.base_url}" />

<rules>
  <rule>Only modify files listed in files element</rule>
  <rule>Follow skills exactly if provided</rule>
  <rule>Complete ALL verification checks before reporting done</rule>
  <rule>Do not expand scope beyond this task</rule>
  <rule>Do not refactor unrelated code</rule>
</rules>

<output>
  Report exactly ONE of:
  - TASK COMPLETE (with files modified and commit message)
  - TASK FAILED: {reason} (with blocker details)
  - CHECKPOINT: {decision needed} (for architecture/manual steps)

  If unrelated issues found:
  - NEW ISSUE: [{severity}] {description}
</output>
```

### Step 7: Handle Results

**TASK COMPLETE:**
```bash
git add {files}
git commit -m "{type}({phase}-{task}): {description}

{brief details}

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Update STATE.md task counter.

**TASK FAILED:**
```markdown
## Task {N} Failed

**Reason:** {failure reason}

**Progress:**
- [x] {completed step}
- [ ] {failed step}

**Blocker:** {what's blocking}

**Suggested Fix:** {recommendation}

Execution paused. Fix the issue and run /opti-gsd:execute to resume.
```

**CHECKPOINT:**
```markdown
## Checkpoint: {reason}

**Completed:** Tasks 1-{N}

**Decision Needed:**
{description of decision required}

**Options:**
A) {option 1}
B) {option 2}

**Recommendation:** {suggested choice}

Reply with your choice to continue.
```

### Step 8: Phase Complete

When all tasks in all waves complete:

1. Create summary:
```bash
# Write .gsd/plans/phase-{N}/summary.md
```

```markdown
# Phase {N} Summary

## Completed
- Task 01: {title} (commit: {hash})
- Task 02: {title} (commit: {hash})
- Task 03: {title} (commit: {hash})

## Auto-Fixes Applied
- {AUTO-FIX descriptions if any}

## Issues Discovered
- {NEW ISSUE items if any}

## Token Usage
- Estimated: {estimated}k
- Actual: {actual}k
```

2. Update STATE.md:
```yaml
phases_complete: [..., {N}]
phases_in_progress: []
phases_pending: [{N+1}, ...]
```

3. Update ROADMAP.md:
```markdown
### Phase {N}: {Title}
- [x] Complete
```

4. Commit metadata:
```bash
git add .gsd/plans/phase-{N}/summary.md
git add .gsd/STATE.md
git add .gsd/ROADMAP.md
git commit -m "docs: complete phase {N}"
```

### Step 9: Report

```markdown
## Phase {N} Complete!

**Tasks:** {count}/{count} completed
**Commits:** {commit_list}
**Duration:** {approximate}

**Auto-Fixes:** {count if any}
**Issues Found:** {count if any}

### Next Steps
- Run `/opti-gsd:verify {N}` to verify phase completion
- Run `/opti-gsd:plan-phase {N+1}` to plan next phase
- Run `/opti-gsd:archive {N}` to free context
```

---

## Parallel Execution

Tasks in the same wave execute in parallel via multiple Task tool calls:

```
Wave 1: [Task 01, Task 02, Task 03]
         ↓         ↓         ↓
      [Agent 1] [Agent 2] [Agent 3]  ← Parallel spawns
         ↓         ↓         ↓
      [Result]  [Result]  [Result]   ← Await all
         ↓         ↓         ↓
      [Commit]  [Commit]  [Commit]   ← Sequential commits

Wave 2: [Task 04]
         ↓
      [Agent 4]
         ↓
      [Result]
         ↓
      [Commit]
```

Each agent gets fresh 100% context, preventing quality degradation.

---

## Context Budget

Orchestrator budget: 15%
- Loading: ~5%
- Coordination: ~5%
- Committing: ~5%

All heavy work delegated to subagents with fresh context.
