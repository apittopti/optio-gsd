---
name: execute-task
description: Execute a single task from the current phase plan.
disable-model-invocation: true
---

# execute-task [N]

Execute a single task from the current phase plan.

## Arguments

- `N` — Task number to execute (required)

## Behavior

Same as /opti-gsd:execute but for a single task only. Useful for:
- Re-running a failed task after fixing issues
- Testing a specific task in isolation
- Debugging task execution

### Step 1: Load Context

Read:
- `.opti-gsd/config.json`
- `.opti-gsd/state.json`
- `.opti-gsd/plans/phase-{current}/plan.json`

### Step 2: Find Task

Parse plan.json and find `<task id="{N}">`.

If task not found, report error.

### Step 3: Check Dependencies

If task has `depends=""` attribute:
- Verify dependent tasks are complete (check git log for commits)
- If not complete, warn user

### Step 4: Execute Task

Build subagent prompt (same as /opti-gsd:execute) and spawn opti-gsd-executor.

### Step 5: Handle Result

**TASK COMPLETE:**
```bash
git add {files}
git commit -m "{type}({phase}-{task}): {description}"
```

Update state.json if this advances task counter.

**TASK FAILED:**
Report failure with details. Do not update state.

**CHECKPOINT:**
Present checkpoint, await decision.

### Step 6: Report

```markdown
## Task {N} Result

**Status:** {COMPLETE | FAILED | CHECKPOINT}
**Files:** {list}
**Commit:** {hash if complete}

{Details based on status}
```

---

## Use Cases

1. **Retry failed task:**
   ```
   /opti-gsd:execute-task 3
   ```

2. **Test in isolation:**
   ```
   /opti-gsd:execute-task 1
   ```

3. **Skip ahead (with caution):**
   ```
   /opti-gsd:execute-task 4  # Will warn about dependencies
   ```
