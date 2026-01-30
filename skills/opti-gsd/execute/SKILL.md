---
name: execute
description: Execute phase plans with wave-based parallel task execution, TDD cycles, and atomic commits. Subcommands: (default) execute full phase plan, task N (single task), quick [description] (fast-track ad-hoc tasks without full planning).
disable-model-invocation: true
argument-hint: [task N | quick description]
---

# execute

Execute phase plans, individual tasks, or quick ad-hoc tasks.

## Usage

- `/opti-gsd:execute` — Execute current phase plan (wave-based parallelization)
- `/opti-gsd:execute task [N]` — Execute single task N from current plan
- `/opti-gsd:execute quick [description]` — Fast-track ad-hoc task (skips research/checker/verifier)

## Routing

| Input | Subcommand | Description |
|-------|-----------|-------------|
| `(no args)` | Full phase execute | Execute current phase plan with waves |
| `task [N]` | Single task | Execute single task N from current plan |
| `quick [description]` | Quick task | Ad-hoc task with GSD guarantees |

Parse the first argument:
- If first argument is `task` → route to **Subcommand: task** (pass remaining args as N)
- If first argument is `quick` → route to **Subcommand: quick** (pass remaining args as description)
- If no arguments → route to **Subcommand: (full phase)**

---

# Subcommand: (full phase)

Execute the current phase plan with wave-based parallelization and fresh context per task.

**Full procedure:** [actions/full-phase.md](actions/full-phase.md)

## Overview

This is the core execution engine. It uses Claude Code's **Task tool** to spawn subagents for each task, with support for **background execution** and **TaskOutput** polling.

### Two-Layer Architecture

- **plan.json** — Persistent source of truth, workflow history, survives sessions
- **Claude Code Tasks** — Ephemeral visual progress in CLI (Ctrl+T to view)

### Execution Flow

1. **Step 0:** Validate branch (block protected branches like main/master/production)
2. **Step 1:** Validate prerequisites (.opti-gsd/, state.json, plan exists)
3. **Step 2:** Load state (config.json, state.json)
4. **Step 3:** Load current plan (plan.json), determine starting point
5. **Step 4:** Check mode (interactive vs yolo), create pre-execution checkpoint
6. **Step 4c:** Create Claude Code Tasks (MANDATORY - TaskCreate for every task)
7. **Step 5:** Execute waves with background tasks (parallel via Task tool)
8. **Step 6:** Build subagent prompts for opti-gsd-executor
9. **Step 7:** Handle results (COMPLETE / FAILED / CHECKPOINT)
10. **Step 8:** Phase complete - create summary, update state, update roadmap
11. **Step 9:** Offer push for preview deployment (if configured)
12. **Step 10:** Report final summary

### Key Details

- **TDD cycle** runs inside subagents (RED/GREEN/REFACTOR). See [reference/tdd-cycle.md](reference/tdd-cycle.md)
- **Wave execution** spawns parallel background tasks per wave. See [reference/wave-execution.md](reference/wave-execution.md)
- **Orchestrator retry** (execute_max_retries) is separate from TDD retry (tdd_max_attempts)

### Context Budget (Full Phase)

Orchestrator budget: 15%
- Loading: ~5%
- Coordination: ~5%
- Committing: ~5%

All heavy work delegated to subagents with fresh context.

### Loop State Reference

Execute tracks state in state.json:

```json
{
  "loop": {
    "active": true,
    "type": "execute",
    "phase": 1,
    "wave": 2,
    "background_tasks": [
      {"task_id": "abc123", "task_num": 1, "status": "running"},
      {"task_id": "def456", "task_num": 2, "status": "running"}
    ],
    "task_retries": {"T01": 0, "T02": 1},
    "last_error": "Type error in auth.ts",
    "started": "2026-01-19T10:30:00"
  }
}
```

- `background_tasks` array tracks all spawned Task tool instances
- Each entry has `task_id` (for TaskOutput), `task_num`, and `status`
- On session interrupt, /opti-gsd:debug recover uses these IDs to check TaskOutput
- Tasks persist in Claude Code's task system across sessions

**TDD loop** runs INSIDE subagents as natural control flow. The subagent only returns when tests pass (COMPLETE) or TDD attempts exhausted (FAILED). No stop hook needed. Use /opti-gsd:debug recover if session interrupted.

---

# Subcommand: task

Execute a single task from the current phase plan.

**Full procedure:** [actions/single-task.md](actions/single-task.md)

## Arguments

- `N` — Task number to execute (required)

## Overview

Same as full phase execute but for a single task only. Useful for:
- Re-running a failed task after fixing issues
- Testing a specific task in isolation
- Debugging task execution

### Execution Flow

1. Load context (config.json, state.json, plan.json)
2. Find task N in plan.json (error if not found)
3. Check dependencies (warn if dependent tasks incomplete)
4. Execute task (build subagent prompt, spawn opti-gsd-executor)
5. Handle result (COMPLETE: commit; FAILED: report; CHECKPOINT: await decision)
6. Report result

### Use Cases

1. **Retry failed task:** `/opti-gsd:execute task 3`
2. **Test in isolation:** `/opti-gsd:execute task 1`
3. **Skip ahead (with caution):** `/opti-gsd:execute task 4` (will warn about dependencies)

---

# Subcommand: quick

Execute small, ad-hoc tasks with opti-gsd guarantees (atomic commits, state tracking) while skipping optional agents (research, plan-checker, verifier).

**Full procedure:** [actions/quick.md](actions/quick.md)

Quick tasks are stored in `.opti-gsd/quick/` separate from planned phases.

## Arguments

- `description` — Brief description of the task (optional, will prompt if missing)

## When to Use

- Bug fixes
- Small features
- Config changes
- One-off tasks
- Anything that doesn't warrant full phase planning

### Execution Flow

1. **Step 0:** Pre-flight validation (.opti-gsd/ exists, roadmap.md exists)
2. **Step 1:** Get task description (from arg or prompt user), generate slug
3. **Step 2:** Calculate next quick task number (three-digit sequential)
4. **Step 3:** Create quick task directory `.opti-gsd/quick/{NNN}-{slug}/`
5. **Step 4:** Spawn planner in quick mode (1-3 focused tasks)
6. **Step 5:** Spawn executor (complete all tasks, atomic commits)
7. **Step 6:** Update state.json with quick_tasks entry
8. **Step 7:** Final commit of artifacts
9. **Step 8:** Report completion

### Context Budget (Quick)

Orchestrator: ~10%
- Validation: ~2%
- Planner spawn: ~3%
- Executor spawn: ~3%
- State update + commit: ~2%

All heavy work delegated to subagents with fresh context.

---

## Key Differences: Full Execute vs Quick

| Aspect | Full Execute | Quick |
|--------|-------------|-------|
| Planning | Full phase plan with waves | 1-3 focused tasks |
| Research | Optional research phase | Skipped |
| Plan Check | Plan-checker agent validates | Skipped |
| Verification | Verifier agent checks | Skipped |
| Storage | `.opti-gsd/plans/phase-{N}/` | `.opti-gsd/quick/{NNN}-{slug}/` |
| Roadmap | Updated on completion | NOT updated |
| State | Full phase tracking | `quick_tasks` array only |
| Context budget | ~15% orchestrator | ~10% orchestrator |
