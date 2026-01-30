---
name: debug
description: Systematic bug investigation and recovery from interrupted states. Use when the user reports a bug, error, or unexpected behavior.
---

# debug

Systematic bug investigation and recovery from interrupted execution states.

## Usage
- `/opti-gsd:debug` — Start new debugging session
- `/opti-gsd:debug [issue-id]` — Resume existing debug session
- `/opti-gsd:debug recover` — Diagnose and fix interrupted execution state

## Routing

| Input | Action |
|-------|--------|
| `(no args)` | Start new debug session |
| `[issue-id]` | Resume existing debug session |
| `recover` | Diagnose and fix interrupted execution state |

---

# debug [issue-id]

Start or resume a systematic debugging session.

## Arguments

- `issue-id` — Optional. Resume existing debug session (e.g., ISS-001)

## Behavior

### Step 1: Check for Existing Session

If `issue-id` provided:
- Load `.opti-gsd/debug/{issue-id}.md`
- Resume from last state

If no `issue-id`:
- Create new debug session

### Step 2: Gather Symptoms (New Session)

Ask user for symptoms:

> "What's the issue? Please describe:"
> 1. What happened? (actual behavior)
> 2. What should happen? (expected behavior)
> 3. When did it start? (recent changes?)
> 4. Can you reproduce it? (steps)
> 5. Any error messages?

### Step 3: Create Debug Session File

Write `.opti-gsd/debug/{issue-id}.md`:

```markdown
# Debug Session: {issue-id}

## Symptoms (IMMUTABLE)
- **Actual:** {what happens}
- **Expected:** {what should happen}
- **Reproducible:** {yes/no/intermittent}
- **Error:** {error message if any}

## Hypotheses
- [ ] H1: {hypothesis} — UNTESTED
- [ ] H2: {hypothesis} — UNTESTED
- [ ] H3: {hypothesis} — UNTESTED

## Evidence Log (APPEND-ONLY)
### {timestamp}
- **Tested:** {what}
- **Result:** {finding}
- **Eliminates:** {hypothesis if any}

## Current Focus
{what we're investigating now}

## Root Cause
(not yet identified)

## Fix Applied
(none yet)
```

### Step 4: Spawn Debugger

Spawn opti-gsd-debugger agent with:
- Symptoms from session file
- Relevant codebase files
- Previous investigation state (if resuming)

Agent modes:
- `find_and_fix` — diagnose and repair (default)
- `find_root_cause_only` — diagnose only, return to orchestrator

### Step 5: Handle Result

**ROOT CAUSE IDENTIFIED:**
```markdown
## Root Cause Found

**Issue:** {description}
**Cause:** {technical explanation}
**Location:** {file:line}
**Evidence:** {what proved this}

**Fix Applied:**
{description of fix}

**Prevention:**
{how to prevent similar issues}
```

Update `.opti-gsd/issues/ISS{NNN}.md` if this was a tracked issue.

**INVESTIGATION BLOCKED:**
```markdown
## Investigation Blocked

**Symptoms Verified:** {list}
**Eliminated:** {hypotheses ruled out}
**Remaining:** {hypotheses still possible}

**Blocker:** {what's preventing progress}
**Needs:** {what's required to continue}
```

### Step 6: Update Issue Tracking

If issue was from `.opti-gsd/issues/`:

```markdown
### ISS-{id}
- **Severity:** {severity}
- **Found:** Phase {N}, Task {M}
- **Resolved:** Phase {X}, Debug session
- **Description:** {original description}
- **Root Cause:** {cause}
- **Fix:** {fix description}
```

### Step 7: Commit

```bash
git add .opti-gsd/debug/{issue-id}.md
git add .opti-gsd/issues/  # if updated
git commit -m "fix: resolve {issue-id}

Root cause: {brief cause}
Fix: {brief fix}"
```

---

## Context Survival

Debug sessions persist in `.opti-gsd/debug/` so they can survive context resets.

When resuming:
1. Load session file
2. Skip eliminated hypotheses
3. Continue from current focus
4. Append new evidence

---

## Context Budget

- Session management: ~5%
- Debugger agent: spawned with fresh context

---

# debug recover

Diagnose and fix interrupted or failed execution states.

## Behavior

1. **Check background tasks** — Use TaskOutput to poll any running tasks
2. **Scan Git state** — Check for uncommitted work, last checkpoint
3. **Compare to state.json** — Find inconsistencies
4. **Auto-fix what's safe** — Update state.json to match reality
5. **Report and suggest** — Show status and next action

## Step 1: Check Background Tasks

If state.json has `loop.background_tasks`:

```python
FOR each task in loop.background_tasks:
  result = TaskOutput(task_id=task.task_id, block=false)
  IF result.complete:
    - Parse result (COMPLETE | FAILED | CHECKPOINT)
    - Update state.json with result
    - Remove from background_tasks
  ELSE:
    - Task still running, report to user
```

**Output if tasks still running:**
```markdown
## Background Tasks Found

**Still Running:**
- Task 2 (task_id: abc123) — started 5 mins ago

**Options:**
A) Wait for completion: TaskOutput(task_id="abc123", block=true)
B) Continue monitoring: /opti-gsd:debug recover again later
C) Abandon and restart: /opti-gsd:session rollback {phase}

User can also press Ctrl+T to view task progress.
```

## Step 2: Standard Recovery

```markdown
## Recovery Scan

**Background Tasks:** {count} found, {completed} complete, {running} still running

**Git:**
- Last checkpoint: gsd/checkpoint/phase-2/T02
- Uncommitted changes: {yes/no}

**state.json:**
- Says: Phase 2, Task 3
- Reality: Tasks 1-2 committed, Task 3 incomplete

**Action taken:**
- Updated state.json to Phase 2, Task 3 (ready to continue)

**Next:**
→ /opti-gsd:execute — Continue from Task 3
```

## When state.json Ahead of Reality

If state.json claims more progress than commits show:

```markdown
**Warning:** state.json ahead of commits

state.json says Task 4 complete, but no commit found.

**Options:**
→ /opti-gsd:session rollback 2-03 — Rollback to last known good
→ Continue anyway (work may be lost)
```

## When Uncommitted Work Exists

```markdown
**Uncommitted changes found:**
- src/components/StatsCard.tsx

**Options:**
A) Commit as WIP: `git add . && git commit -m "wip: partial task"`
B) Discard: `git checkout .`
C) Stash: `git stash`

Then run /opti-gsd:execute to continue.
```

## When Background Task Failed

If TaskOutput returns a failed task:

```markdown
**Background Task Failed:**
- Task 3 (task_id: xyz789) — FAILED
- Error: Type error in auth.ts

**Options:**
→ /opti-gsd:execute — Retry task with error context
→ /opti-gsd:session rollback 2-02 — Rollback to before failed task
→ Fix manually and commit
```
