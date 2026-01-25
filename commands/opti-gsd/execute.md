---
description: Execute the current phase plan with wave-based parallelization, fresh context, and automatic retry on failures
---

# execute

Execute the current phase plan with wave-based parallelization and fresh context per task.

## Behavior

This is the core execution engine. It uses Claude Code's **Task tool** to spawn subagents for each task, with support for **background execution** and **TaskOutput** polling.

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

If no plan exists for current phase:
```
⚠️ Phase Not Planned
─────────────────────────────────────
No plan found for phase {N}.

→ Run /opti-gsd:plan-phase {N} to create a plan
```

### Step 2: Load State

Read (minimal context):
- `.opti-gsd/config.json` — mode, budgets, browser config
- `.opti-gsd/state.json` — current phase and task position

### Step 3: Load Current Plan

Read `.opti-gsd/plans/phase-{N}/plan.json`.

Parse:
- YAML frontmatter for metadata
- XML tasks for execution
- Wave structure for parallelization

### Step 3b: Determine Starting Point

If resuming (task > 0 in state.json):
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

### Step 4b: Create Pre-Execution Checkpoint

Before executing any tasks, create a Git checkpoint for rollback safety:

```bash
git tag -f "gsd/checkpoint/phase-{N}/pre" HEAD
```

This enables /opti-gsd:rollback {N} to revert to before the phase started.

### Step 5: Execute Waves with Background Tasks

```
FOR each wave:
  1. Identify tasks in this wave
  2. IF interactive mode AND wave > 1:
       Ask: "Wave {W-1} complete. Continue to Wave {W}?"

  3. FOR each task in wave:
     - Build subagent prompt (see below)
     - Build description from plan: "P{phase} T{id}: {task.action[:30]}"
     - Spawn via Task tool:
         Task(
           description="P{phase} T{id}: {short_title}",
           prompt="{subagent_prompt}",
           subagent_type="opti-gsd-executor",
           run_in_background=true
         )
     - Store returned task_id for each spawned task
     - Update state.json with background_tasks array
     - User sees tasks appear in Ctrl+T task list

  4. Poll for completion using TaskOutput:
     WHILE any tasks pending:
       FOR each task_id in background_tasks:
         result = TaskOutput(task_id, block=false)
         IF result.complete:
           - Parse result (COMPLETE | FAILED | CHECKPOINT)
           - Process result (see Step 7)
           - Remove from background_tasks
       IF still waiting:
         Brief status update to user: "Tasks running: {count}"

  5. All tasks in wave complete? → Next wave
```

**Why Background Tasks:**
- User sees real-time progress (Ctrl+T to toggle task list)
- Parallel execution is truly parallel
- Can continue working while tasks run (Ctrl+B)
- TaskOutput provides clean result retrieval
- Task state persists across session interruptions

### Step 6: Build Subagent Prompt

For each task, construct this prompt for opti-gsd-executor:

```xml
You are a focused implementation agent for opti-gsd. Complete ONLY this task.

<context>
  <project>{.opti-gsd/PROJECT.md#overview - if exists, otherwise skip}</project>
  <conventions>{.opti-gsd/codebase/CONVENTIONS.md - if exists}</conventions>
</context>

<task id="{id}" reqs="{reqs}">
  <files mode="write">
    {task.files - implementation files}
  </files>
  <test_required>{true | false | existing}</test_required>
  <test_files mode="dynamic">
    {task.test_files - starts as write, becomes read-only after RED phase}
  </test_files>
  <action>
    {task.action}
  </action>
  <libraries>{task.libraries}</libraries>
  <verify>
    {task.verify}
  </verify>
  <done>{task.done}</done>
</task>

<tdd_cycle enabled="{task.test_required == true}">
  <max_attempts>{config.loop.tdd_max_attempts || 5}</max_attempts>
  <test_command>{config.ci.test || "npm test" || "pytest"}</test_command>

  <phase name="RED">
    <allowed_files>{task.test_files}</allowed_files>
    <locked_files>{task.files}</locked_files>
    <goal>Write a failing test for: {task.done}</goal>
    <success_condition>Test FAILS (this is correct!)</success_condition>
    <on_complete>Lock test files, proceed to GREEN</on_complete>
  </phase>

  <phase name="GREEN">
    <allowed_files>{task.files}</allowed_files>
    <locked_files>{task.test_files}</locked_files>
    <goal>Write minimal code to make test pass</goal>
    <success_condition>Test PASSES</success_condition>
    <on_failure>Analyze error, fix implementation, retry (do NOT modify tests)</on_failure>
    <on_complete>Proceed to REFACTOR</on_complete>
  </phase>

  <phase name="REFACTOR">
    <allowed_files>{task.files}</allowed_files>
    <locked_files>{task.test_files}</locked_files>
    <goal>Clean up implementation while keeping tests green</goal>
    <success_condition>Test still PASSES</success_condition>
    <on_failure>Undo refactor changes, task still complete</on_failure>
  </phase>
</tdd_cycle>

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
  {List MCPs from .opti-gsd/config.json that are available}
  Example: filesystem, postgres, github, browser
  Use these MCP tools when they would help complete the task.
</mcps>

<browser enabled="{config.browser.enabled}" base_url="{config.base_url}" />

<rules>
  <rule>If test_required=true: Execute TDD Red-Green-Refactor cycle</rule>
  <rule>RED phase: Only modify test files, implementation files are LOCKED</rule>
  <rule>GREEN/REFACTOR phases: Only modify implementation files, test files are LOCKED</rule>
  <rule>NEVER modify test files to make them pass - fix the implementation instead</rule>
  <rule>Only modify files listed in files/test_files elements</rule>
  <rule>Follow skills exactly if provided</rule>
  <rule>If libraries listed and Context7 available, fetch current docs before implementing</rule>
  <rule>Complete ALL verification checks before reporting done</rule>
  <rule>Do not expand scope beyond this task</rule>
  <rule>Do not refactor unrelated code</rule>
</rules>

<output>
  Report exactly ONE of:
  - TASK COMPLETE (with files modified, test status, and commit message)
  - TASK FAILED: {reason} (with blocker details and attempts made)
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

Update state.json task counter.

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

### Step 7a: TDD Loop (Inside Subagent)

The TDD Red-Green-Refactor loop runs INSIDE each subagent, not at the orchestrator level.

**How It Works:**
- Subagent receives task with `test_required: true`
- Subagent executes TDD cycle internally (RED → GREEN → REFACTOR)
- Loop continues until tests pass OR `tdd_max_attempts` exhausted
- Subagent returns only when done (COMPLETE or FAILED)

**No Stop Hook Needed:**
- The loop is natural control flow inside the subagent
- Subagent doesn't "stop" until it returns a result
- Orchestrator simply waits for the Task tool to complete

**TDD Loop Settings (in config):**
```yaml
loop:
  tdd_max_attempts: 5       # Max GREEN phase retries per task
  execute_max_retries: 2    # Orchestrator retries if subagent fails entirely
```

### Step 7b: Orchestrator Retry (Task-Level Failures)

If a subagent reports TASK FAILED (after exhausting TDD attempts), the orchestrator can retry.

**When This Happens:**
- TDD loop exhausted all attempts but tests still fail
- Unexpected error (crash, missing dependency, etc.)
- Blocker that might be transient

**Retry Flow:**
```
IF task_retries[task_id] < execute_max_retries:
  1. Analyze failure from subagent output
  2. Update state.json:
     loop:
       task_retries:
         T{id}: {count + 1}
       last_error: {error_summary}
  3. Re-spawn subagent with error context:
     <previous_attempt>
       <error>{captured error}</error>
       <tdd_attempts>{attempts made}</tdd_attempts>
       <analysis>{root cause}</analysis>
       <suggested_fix>{specific fix}</suggested_fix>
     </previous_attempt>
  4. On success: continue to next task
  5. On failure: increment retry, loop back

IF task_retries[task_id] >= execute_max_retries:
  1. Update state.json:
     loop:
       paused: true
       pause_reason: "Task {N} failed after {max_retries} orchestrator retries"
  2. Report to user with full error context
  3. Stop execution
```

**Key Distinction:**
| Loop Level | Purpose | Max Attempts |
|------------|---------|--------------|
| TDD (inside subagent) | Make tests pass | tdd_max_attempts (5) |
| Orchestrator (outside) | Recover from task failure | execute_max_retries (2) |

### Step 8: Phase Complete

When all tasks in all waves complete:

**Create Post-Execution Checkpoint:**
```bash
git tag -f "gsd/checkpoint/phase-{N}/post" HEAD
```

This enables precise rollback: `pre` = before phase, `post` = after phase, `T{N}` = after each task.

1. Create summary:
```bash
# Write .opti-gsd/plans/phase-{N}/summary.md
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

2. Update state.json:
```yaml
phases_complete: [..., {N}]
phases_in_progress: []
phases_pending: [{N+1}, ...]
```

3. Update roadmap.md:
```markdown
### Phase {N}: {Title}
- [x] Complete
```

4. Commit metadata:
```bash
git add .opti-gsd/plans/phase-{N}/summary.md
git add .opti-gsd/state.json
git add .opti-gsd/roadmap.md
git commit -m "docs: complete phase {N}"
```

### Step 9: Offer Push for Preview Deployment

Check if deployment platform is configured in `.opti-gsd/config.json`:

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
1. Run /opti-gsd:push logic
2. Wait for preview URL
3. Store preview URL in state.json

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

## Parallel Execution with Background Tasks

Tasks in the same wave execute in parallel using `run_in_background=true`:

```
Wave 1: [Task 01, Task 02, Task 03]
         ↓         ↓         ↓
      Task(       Task(       Task(
        run_in_background=true
      )          )           )        ← Parallel background spawns
         ↓         ↓         ↓
      task_id_1  task_id_2  task_id_3  ← Store IDs
         ↓         ↓         ↓
      [User sees progress via Ctrl+T]
         ↓         ↓         ↓
      TaskOutput  TaskOutput  TaskOutput  ← Poll for completion
         ↓         ↓         ↓
      [Commit]  [Commit]  [Commit]   ← Sequential commits

Wave 2: [Task 04]
         ↓
      Task(run_in_background=true)
         ↓
      TaskOutput(task_id_4, block=true)  ← Can block if single task
         ↓
      [Commit]
```

**Key Benefits:**
- Each agent gets fresh 100% context
- User sees real-time progress in Claude Code's task list (Ctrl+T)
- Truly parallel execution, not sequential spawns
- Tasks persist if session interrupted (use /opti-gsd:recover)
- TaskOutput provides clean result retrieval without context bloat

**Task Tool Calls:**
```python
# Spawn background task - description appears in Claude's task list (Ctrl+T)
Task(
  description="P{phase} T{task_num}: {task_title}",  # e.g., "P1 T02: Create API endpoints"
  prompt="{subagent_prompt}",
  subagent_type="opti-gsd-executor",
  run_in_background=True
)
# Returns: task_id (e.g., "abc123") - store this for TaskOutput

# Poll for result
TaskOutput(
  task_id="{returned_task_id}",
  block=False  # Non-blocking check, or True to wait
)
```

**What user sees in Ctrl+T:**
```
Claude Code Tasks
─────────────────────────────────────
[▸] P1 T01: Setup authentication     (running)
[▸] P1 T02: Create API endpoints     (running)
[✓] P1 T03: Add validation          (complete)
```

---

## Context Budget

Orchestrator budget: 15%
- Loading: ~5%
- Coordination: ~5%
- Committing: ~5%

All heavy work delegated to subagents with fresh context.

---

## Loop State Reference

Execute tracks state in state.json:

```yaml
loop:
  active: true              # Execution currently running
  type: execute             # "execute" or "verify"
  phase: 1                  # Current phase
  wave: 2                   # Current wave
  background_tasks:         # Active background task IDs
    - task_id: "abc123"
      task_num: 1
      status: "running"
    - task_id: "def456"
      task_num: 2
      status: "running"
  task_retries:             # Per-task orchestrator retry counts
    T01: 0
    T02: 1
  last_error: "Type error in auth.ts"
  started: 2026-01-19T10:30:00
```

**Background Task Tracking:**
- `background_tasks` array tracks all spawned Task tool instances
- Each entry has `task_id` (for TaskOutput), `task_num`, and `status`
- On session interrupt, /opti-gsd:recover uses these IDs to check TaskOutput
- Tasks persist in Claude Code's task system across sessions

**Note on TDD Loop:**
The TDD Red-Green-Refactor loop runs INSIDE subagents as natural control flow. The subagent only returns when:
- Tests pass (TASK COMPLETE)
- TDD attempts exhausted (TASK FAILED)

**Philosophy:** Following GSD principles, there's no stop hook forcing loop continuation.
Human judgment gates all decisions. Use /opti-gsd:recover if session interrupted.
