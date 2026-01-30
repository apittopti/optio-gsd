# Rollback to Checkpoint

Undo work to a previous execution checkpoint.

## Arguments

- `target` — What to rollback to:
  - `last` — Most recent checkpoint (before last execution)
  - `{phase}` — Before phase N started (e.g., `2`)
  - `{phase}-{task}` — Before specific task (e.g., `2-03`)

## How Checkpoints Work

Execute automatically creates Git tags before and after execution:

```
gsd/checkpoint/phase-2/pre    <- Before phase 2 started
gsd/checkpoint/phase-2/T01    <- After task 01
gsd/checkpoint/phase-2/T02    <- After task 02
gsd/checkpoint/phase-2/post   <- After phase 2 completed
```

These enable precise rollback to any point.

## Procedure

### Step 1: Find Target Checkpoint

**For `last`:**
```bash
git tag -l "gsd/checkpoint/*" --sort=-creatordate | head -1
```

**For phase number:**
```bash
git tag -l "gsd/checkpoint/phase-{N}/pre"
```

**For phase-task:**
```bash
# Rollback to state BEFORE this task
git tag -l "gsd/checkpoint/phase-{N}/T{task-1}"
# Or pre if task is 01
git tag -l "gsd/checkpoint/phase-{N}/pre"
```

If checkpoint not found:
```
Warning: Checkpoint Not Found
-------------------------------------
No checkpoint found for: {target}

Available checkpoints:
  gsd/checkpoint/phase-1/post
  gsd/checkpoint/phase-2/pre
  gsd/checkpoint/phase-2/T01
  gsd/checkpoint/phase-2/T02

> Use /opti-gsd:session rollback {checkpoint}
```

### Step 2: Show Impact

```markdown
## Rollback Preview

**Target:** {checkpoint_tag}
**Created:** {timestamp}

**Will revert:**
- {count} commits
- {files_changed} files changed

**Commits to undo:**
1. feat(2-03): implement stats API
2. feat(2-02): create useStats hook
3. feat(2-01): create StatsCard component

**Warning:** This cannot be easily undone.

Proceed with rollback? [y/N]
```

### Step 3: Create Backup Tag

Before rollback, create backup of current state:

```bash
git tag "gsd/backup/$(date +%Y%m%d-%H%M%S)" HEAD
```

This allows recovering from accidental rollback.

### Step 4: Execute Rollback

```bash
# Hard reset to checkpoint
git reset --hard {checkpoint_tag}

# Update state.json to match rolled-back state
# (Parse from checkpoint or reset to pre-phase state)
```

### Step 5: Update State

Reset state.json to reflect rolled-back position:

```json
{
  "phase": "{N}",
  "task": 0,
  "status": "rolled_back",
  "phases": {
    "complete": ["..."]
  }
}
```

### Step 6: Report

```markdown
## Rollback Complete

**Rolled back to:** {checkpoint_tag}
**Commits undone:** {count}
**Backup created:** gsd/backup/{timestamp}

**Current state:**
- Phase: {N}
- Task: {task}

```

**Next steps:**
> /opti-gsd:status — Check current state
> /opti-gsd:execute — Re-execute from this point
> /opti-gsd:session rollback — Restore from backup if needed

## Examples

### Rollback Last Execution
```
/opti-gsd:session rollback last

Rolls back to the most recent checkpoint.
Useful when execution just failed.
```

### Rollback Entire Phase
```
/opti-gsd:session rollback 2

Rolls back to before phase 2 started.
Useful when phase approach was fundamentally wrong.
```

### Rollback Specific Task
```
/opti-gsd:session rollback 2-03

Rolls back to after task 02, before task 03.
Useful when one task broke things.
```

## Rollback Undo

If you rollback by mistake:

```bash
# List backup tags
git tag -l "gsd/backup/*"

# Restore from backup
git reset --hard gsd/backup/{timestamp}
```

Or use /opti-gsd:debug recover to diagnose and fix state.

## Safety

- **Always creates backup** before rollback
- **Requires confirmation** in interactive mode
- **Shows full impact** before proceeding
- **Preserves untracked files** (only affects git history)

## Context Budget

- Checkpoint lookup: ~2%
- Impact analysis: ~3%
- State update: ~2%
- Total: ~7%
