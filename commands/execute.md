---
description: Execute the current phase plan with wave-based parallelization, fresh context, and automatic retry on failures
---

# execute

Execute the current phase plan with wave-based parallelization and fresh context per task.

## Behavior

This is the core execution engine. It spawns subagents for each task to maintain fresh context.

### Step 0: Validate Branch

If `branching: milestone` is configured in `.gsd/config.md`:

1. Get current branch:
   ```bash
   git branch --show-current
   ```

2. Get base branch from config (default: `master`)

3. If current branch == base branch:

   **If no milestone set in STATE.md:**
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

If no plan exists for current phase:
```
⚠️ Phase Not Planned
─────────────────────────────────────
No plan found for phase {N}.

→ Run /opti-gsd:plan-phase {N} to create a plan
```

### Step 2: Load State

Read (minimal context):
- `.gsd/config.md` — mode, budgets, browser config
- `.gsd/STATE.md` — current phase and task position

### Step 3: Load Current Plan

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
  <project>{.gsd/PROJECT.md#overview - if exists, otherwise skip}</project>
  <conventions>{.gsd/codebase/CONVENTIONS.md - if exists}</conventions>
</context>

<task id="{id}" reqs="{reqs}">
  <files>
    {task.files}
  </files>
  <action>
    {task.action}
  </action>
  <libraries>{task.libraries}</libraries>
  <verify>
    {task.verify}
  </verify>
  <done>{task.done}</done>
</task>

<skills>
  {For each skill in task.skills, include full skill instructions}
</skills>

<context7>
  {If Context7 MCP is available AND task.libraries is not "none":}
  Before implementing, use Context7 to fetch current documentation for: {task.libraries}
  This ensures you use up-to-date APIs and avoid deprecated patterns.

  {If Context7 MCP not available:}
  Context7 not configured. Proceed with built-in knowledge.
</context7>

<known_issues>
  {Open issues from ISSUES.md that might affect this task}
</known_issues>

<mcps>
  {List MCPs from .gsd/config.md that are available}
  Example: filesystem, postgres, github, browser
  Use these MCP tools when they would help complete the task.
</mcps>

<browser enabled="{config.browser.enabled}" base_url="{config.base_url}" />

<rules>
  <rule>Only modify files listed in files element</rule>
  <rule>Follow skills exactly if provided</rule>
  <rule>If libraries listed and Context7 available, fetch current docs before implementing</rule>
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

### Step 7a: Execute Loop - Retry Failed Tasks

When a task reports TASK FAILED, the execute loop automatically attempts recovery.

**Check Loop Settings:**
- Read `loop.auto_loop` from config (default: true)
- Read `loop.execute_max_retries` from config (default: 3)
- Check current retry count for this task in STATE.md `loop.task_retries`

**Mode-Based Behavior:**
- **interactive mode**: Ask user before retry
  > "Task {N} failed. Retry? ({retries}/{max_retries} attempts used) [Y/n]"
- **yolo mode**: Auto-retry without prompting

**Retry Flow:**
```
IF task_retries[task_id] < max_retries:
  1. Analyze failure from task output
  2. Generate error analysis (parse error, identify root cause)
  3. Update STATE.md loop state:
     loop:
       active: true
       type: execute
       phase: {N}
       iteration: {current + 1}
       task_retries:
         T{id}: {count + 1}
       last_error: {error_summary}
  4. Re-execute task with error context in prompt
  5. On success: continue to next task
  6. On failure: increment retry, loop back

IF task_retries[task_id] >= max_retries:
  1. Update STATE.md:
     loop:
       active: false
       paused: true
       pause_reason: "Task {N} failed after {max_retries} retries"
  2. Report to user with full error context
  3. Stop execution
```

**Error Context for Retry:**
Include in retry subagent prompt:
```xml
<previous_attempt>
  <error>{captured error output}</error>
  <analysis>{root cause analysis}</analysis>
  <suggested_fix>{specific fix to try}</suggested_fix>
  <attempt>{N} of {max_retries}</attempt>
</previous_attempt>
```

### Step 8: Phase Complete

When all tasks in all waves complete:

**Clear Loop State:**
If loop was active during execution, clear it:
```yaml
loop:
  active: false
  completed: true
  final_iteration: {N}
```

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

### Step 9: Offer Push for Preview Deployment

Check if deployment platform is configured in `.gsd/config.md`:

If `deploy.target` is set (vercel, netlify, etc.):

```markdown
## Phase {N} Complete!

**Tasks:** {count}/{count} completed
**Commits:** {commit_list}

### Push for Preview Deployment?

Your project is configured to deploy to {deploy.target}.
Pushing now will create a preview deployment you can verify against.

> Push to trigger preview deployment? (y/n)
```

If user confirms:
1. Run `/opti-gsd:push` logic
2. Wait for preview URL
3. Store preview URL in STATE.md

If no deployment configured, skip this step.

### Step 10: Report

```markdown
## Phase {N} Complete!

**Tasks:** {count}/{count} completed
**Commits:** {commit_list}
**Duration:** {approximate}

**Auto-Fixes:** {count if any}
**Issues Found:** {count if any}

{If pushed and preview deployed:}
**Preview:** {preview_url}

Next steps:
→ /opti-gsd:verify {N}       — Verify phase completion {against preview if pushed}
→ /opti-gsd:push             — Push to trigger preview deployment {if not pushed yet}
→ /opti-gsd:plan-phase {N+1} — Plan next phase
→ /opti-gsd:archive {N}      — Archive phase to free context

💾 State saved. Safe to /compact or start new session if needed.
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

---

## Loop State Reference

Execute loop tracks state in STATE.md:

```yaml
loop:
  active: true              # Loop currently running
  type: execute             # "execute" or "verify"
  phase: 1                  # Current phase
  iteration: 3              # Current loop iteration
  max_iterations: 15        # Total allowed (tasks * retries)
  task_retries:             # Per-task retry counts
    T01: 0
    T02: 2
    T03: 1
  last_error: "Type error in auth.ts"
  started: 2026-01-19T10:30:00
  last_iteration: 2026-01-19T10:45:00
```

The stop hook (`hooks/stop-hook.sh`) reads this state to decide whether to block session exit and re-inject the execute prompt.
