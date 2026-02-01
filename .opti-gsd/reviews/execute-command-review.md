# Execute Command Review

**Date:** 2026-02-01
**Reviewer:** Claude (automated review)
**Files Reviewed:**
- `commands/opti-gsd/execute.md` (857 lines) — orchestrator
- `agents/opti-gsd/opti-gsd-executor.md` (598 lines) — subagent
- `commands/opti-gsd/recover.md` — recovery flow
- `commands/opti-gsd/review.md` — review flow
- `hooks/hooks.json` — tool usage hook
- `scripts/log-tool-usage.js` — tool logging
- `.opti-gsd/state.json` and `config.json` — state/config

---

## Issues Found

### HIGH Severity

#### 1. References to non-existent tools: TaskCreate, TaskUpdate, TaskOutput, TaskList

Both `execute.md` and `opti-gsd-executor.md` reference `TaskCreate`, `TaskUpdate`, `TaskOutput`, and `TaskList` extensively. These are not standard Claude Code tools. The available tool for spawning work is `Task` (with `run_in_background`). The executor agent's tool list doesn't include any Task-related tools either.

**Impact:** Execution will fail when these tools are invoked.
**Fix:** Replace with actual Claude Code tool patterns — `Task` with `run_in_background=true`, `Read` on the output file path for polling.

#### 2. Recovery flow relies on non-existent TaskOutput

`recover.md` uses `TaskOutput(task_id, block=false)` to poll background tasks. Since `TaskOutput` doesn't exist, recovery won't work. Should use `Read` on the output file path returned by `Task(run_in_background=true)`.

#### 3. No error handling for parallel task git conflicts

When multiple tasks in a wave run in parallel (background), they may modify overlapping files. The commit step does sequential `git add + commit`, but if two background tasks modified the same file, the second commit will include the first task's changes or overwrite them.

**Fix:** Validate that tasks in the same wave don't share writable files, or serialize commits with conflict detection.

### MEDIUM Severity

#### 4. Step ordering mismatch — Step 8b appears after Step 9

Step 9 (Offer Push for Preview Deployment) at line 633 appears before Step 8b (Final User Review - MANDATORY) at line 660. The review should happen before the push offer.

#### 5. Executor agent references task management tools it doesn't have

The executor agent's startup sequence says to call `TaskCreate` and `TaskList`, but its declared tools don't include any Task tools. Since subagents run in isolation, this entire section is unreachable.

**Fix:** Remove task management from executor agent; the orchestrator owns this.

#### 6. Duplicate task tracking responsibility

Both orchestrator and executor claim to manage Claude Code task status updates. This creates confusion about ownership.

**Fix:** Orchestrator owns all task tracking. Remove from executor.

#### 7. Yolo mode "auto-continue after 3 seconds" is not implementable

Step 5b says: "auto-continue after 3 seconds unless user is typing." There's no mechanism for Claude to detect typing or implement timed auto-continue.

**Fix:** Replace with "display results and continue immediately without prompting."

### LOW Severity

#### 8. Missing `loop` config defaults in config.json

Execute references `config.loop.tdd_max_attempts` (default 5) and `config.loop.execute_max_retries` (default 2), but config.json has no `loop` section.

#### 9. Token/Duration reporting is impractical

Step 10 reports `Duration` and token usage estimates. Claude Code agents don't have access to their own token metrics or wall-clock timing.

#### 10. Co-Authored-By is hardcoded

The commit template includes `Co-Authored-By: Claude <noreply@anthropic.com>` — not configurable per user preference.

#### 11. Failed tasks shown as "completed" in task list

Executor marks failed tasks as completed ("task is done, just failed"). This misleads users reviewing the task list.

---

## Strengths

1. **Wave-based parallelism** — sound approach for managing task dependencies while enabling parallel execution within waves.
2. **Two-layer architecture** (persistent plan.json + ephemeral CLI tasks) — good separation of concerns.
3. **Protected branch enforcement** at both orchestrator and executor level — defense in depth.
4. **Review checkpoints between waves** with plan-awareness (detecting future-phase feedback) — thoughtful UX.
5. **TDD Red-Green-Refactor** enforcement with file permission locking — well-designed quality gate.
6. **Git checkpoint tags** (pre/post) for rollback safety.
7. **Error Learning System** — building institutional memory from failures.
8. **Atomic writes** in `log-tool-usage.js` — correct concurrent access pattern.
9. **Deviation handling matrix** — clear separation of auto-fixable vs architecture decisions.

---

## Recommendations (Priority Order)

1. **Fix tool references** — Replace TaskCreate/TaskUpdate/TaskOutput/TaskList with actual Claude Code patterns.
2. **Fix step ordering** — Renumber Step 8b before Step 9.
3. **Clarify task tracking ownership** — Orchestrator owns it; remove from executor.
4. **Fix yolo mode** — Remove timed auto-continue; use immediate continue.
5. **Add wave-level file conflict validation** — Verify no overlapping writable files in same wave.
6. **Add `loop` defaults to config.json** — Document the loop configuration section.
7. **Remove impractical reporting** — Drop token/duration estimates or replace with measurable metrics.
