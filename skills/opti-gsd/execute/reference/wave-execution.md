# Wave-Based Parallel Execution

Tasks in the same wave execute in parallel using `run_in_background=true`.

## Execution Pattern

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

## Key Benefits

- Each agent gets fresh 100% context
- User sees real-time progress in Claude Code's task list (Ctrl+T)
- Truly parallel execution, not sequential spawns
- Tasks persist if session interrupted (use /opti-gsd:debug recover)
- TaskOutput provides clean result retrieval without context bloat

## Task Tool Calls

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

## What User Sees in Ctrl+T

```
Claude Code Tasks
─────────────────────────────────────
[▸] P1 T01: Setup authentication     (running)
[▸] P1 T02: Create API endpoints     (running)
[✓] P1 T03: Add validation          (complete)
```

## Background Task Tracking

State is tracked in `state.json`:

```json
{
  "loop": {
    "background_tasks": [
      {"task_id": "abc123", "task_num": 1, "status": "running"},
      {"task_id": "def456", "task_num": 2, "status": "running"}
    ]
  }
}
```

- `background_tasks` array tracks all spawned Task tool instances
- Each entry has `task_id` (for TaskOutput), `task_num`, and `status`
- On session interrupt, `/opti-gsd:debug recover` uses these IDs to check TaskOutput
- Tasks persist in Claude Code's task system across sessions

## Why Background Tasks

- User sees real-time progress (Ctrl+T to toggle task list)
- Parallel execution is truly parallel
- Can continue working while tasks run (Ctrl+B)
- TaskOutput provides clean result retrieval
- Task state persists across session interruptions
