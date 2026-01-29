---
name: recover
description: Diagnose and fix interrupted execution states
disable-model-invocation: true
---

# recover

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
B) Continue monitoring: /opti-gsd:recover again later
C) Abandon and restart: /opti-gsd:rollback {phase}

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
→ /opti-gsd:rollback 2-03 — Rollback to last known good
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
→ /opti-gsd:rollback 2-02 — Rollback to before failed task
→ Fix manually and commit
```
