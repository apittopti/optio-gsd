---
name: mode
description: Switch workflow execution mode.
disable-model-invocation: true
---

# mode [interactive|yolo]

Switch workflow execution mode.

## Arguments

- `interactive` — Confirm before phases, show plans, pause at checkpoints
- `yolo` — Execute without confirmation, maximum velocity

## Behavior

### Step 1: Validate Argument

If no argument:
```markdown
## Current Mode: {current_mode}

**interactive:** Confirm before phases, show plans for approval, pause at checkpoints.
Best for: Learning the system, complex projects, careful work.

**yolo:** Execute without confirmation, only stop on errors/checkpoints.
Best for: Familiar patterns, rapid iteration, trusted workflows.

To switch: /opti-gsd:mode interactive or /opti-gsd:mode yolo
```

### Step 2: Update Config

Edit `.opti-gsd/config.json`:

```json
{
  "mode": "{new_mode}"
}
```

### Step 3: Commit

```bash
git add .opti-gsd/config.json
git commit -m "chore: switch to {mode} mode"
```

### Step 4: Confirm

```markdown
## Mode Changed

**Previous:** {old_mode}
**Current:** {new_mode}

{If yolo}
⚡ YOLO mode active. Commands will execute without confirmation.
   Use Ctrl+C to interrupt if needed.

{If interactive}
🎯 Interactive mode active. You'll be asked to confirm before each phase.
```

---

## Mode Behaviors

### Interactive Mode

| Action | Behavior |
|--------|----------|
| Phase start | Confirm before beginning |
| Plan display | Show plan and ask for approval |
| Wave transition | Confirm before each wave |
| Checkpoint | Always pause and ask |
| Completion | Show summary and next steps |

### YOLO Mode

| Action | Behavior |
|--------|----------|
| Phase start | Begin immediately |
| Plan display | Brief summary only |
| Wave transition | Continue automatically |
| Checkpoint | Still pause (safety) |
| Completion | Brief confirmation |

---

## Context Budget

Minimal: ~2%
