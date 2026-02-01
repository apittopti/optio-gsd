# Execute Command Review

**Date:** 2026-02-01 (revised)
**Reviewer:** Claude (automated review)
**Revision:** 2 — re-validated all findings against full flow including cross-file references

**Files Reviewed:**
- `commands/opti-gsd/execute.md` (857 lines) — orchestrator
- `agents/opti-gsd/opti-gsd-executor.md` (598 lines) — subagent
- `commands/opti-gsd/recover.md` — recovery flow
- `commands/opti-gsd/review.md` — review flow
- `commands/opti-gsd/verify.md` — verification flow
- `commands/opti-gsd/rollback.md` — rollback flow
- `docs/WORKFLOW-FLOWCHART.md` — flowchart (cross-references)
- `hooks/hooks.json` — tool usage hook
- `scripts/log-tool-usage.js` — tool logging
- `.opti-gsd/state.json`, `config.json`, `roadmap.md`, `features/F002.md`

---

## Issues Found: 14 total (4 high, 5 medium, 5 low)

### HIGH Severity

#### 1. Non-existent tools: TaskCreate, TaskUpdate, TaskOutput, TaskList

Both `execute.md` and `opti-gsd-executor.md` reference `TaskCreate`, `TaskUpdate`, `TaskOutput`, and `TaskList` extensively. These are not standard Claude Code tools. The available tools for task-related work are `Task` (with `run_in_background`) and `TodoWrite`. The project deliberately integrated these in v2.2.0 (F002) and v2.5.0, but the tools they target do not exist in Claude Code's tool set.

The scope is broad — `TaskCreate`/`TaskUpdate` appear in:
- `execute.md` (Steps 4c, 5)
- `opti-gsd-executor.md` (startup sequence, per-task execution)
- `review.md` (Step 5)
- `features/F002.md`, `roadmap.md`, changelogs

**Impact:** The entire visual progress system is built on APIs that don't exist. Execution will silently skip these calls (no tool found) or error.
**Fix:** Replace with `TodoWrite` for visual progress tracking, and `Task(run_in_background=true)` + `Read(output_file)` for background task polling.

#### 2. Recovery flow relies on non-existent TaskOutput

`recover.md` Step 1 (line 23) uses `TaskOutput(task_id, block=false)` to poll background tasks. This tool doesn't exist. The actual pattern for checking background Task results is `Read` on the `output_file` path returned by `Task(run_in_background=true)`.

**Impact:** Recovery after session interruption will not work as designed.

#### 3. Per-task checkpoint tags referenced but never created

`rollback.md` (lines 22-24, 46, 60-61), `recover.md` (line 55), and `docs/WORKFLOW-FLOWCHART.md` (lines 517, 524) all reference per-task checkpoint tags like `gsd/checkpoint/phase-2/T01`. However, `execute.md` only creates two tags:
- `gsd/checkpoint/phase-{N}/pre` (Step 4b, line 150)
- `gsd/checkpoint/phase-{N}/post` (Step 8, line 579)

Neither the orchestrator nor the executor agent ever creates `gsd/checkpoint/phase-{N}/T{task}` tags. The executor agent has zero `git tag` commands.

**Impact:** Per-task rollback (`/opti-gsd:rollback 2-03`) will always fail with "Checkpoint Not Found." Only whole-phase rollback works.
**Fix:** Add `git tag -f "gsd/checkpoint/phase-{N}/T{task_id}" HEAD` after each task commit in either the executor agent or the orchestrator's result handler.

#### 4. No handling for parallel task git conflicts

When multiple tasks in a wave run in parallel (background), they may modify overlapping files. Each subagent commits independently into the same repo. If two parallel subagents modify the same file, the second `git add + commit` will silently include the first agent's version, or worse, the agents may overwrite each other's changes on disk before committing.

**Impact:** Data loss or incorrect commits in parallel waves with shared files.
**Fix:** Either validate at plan time that tasks in the same wave don't share writable files (planner responsibility), or have the orchestrator serialize commits after collecting results.

### MEDIUM Severity

#### 5. Double-commit: orchestrator and executor both commit task changes

The executor agent (line 113-115) commits after completing a task:
```
git add {files}
git commit with conventional message
```

The orchestrator's Step 7 (lines 460-466) ALSO commits after receiving TASK COMPLETE:
```
git add {files}
git commit -m "{type}({phase}-{task}): {description}..."
```

Since the executor already committed, the orchestrator's `git add` finds a clean working tree and `git commit` will fail with "nothing to commit."

**Impact:** The orchestrator's commit attempt will error. Not catastrophic (work is already committed by executor) but confusing and indicates unclear ownership.
**Fix:** Choose one: either the executor commits (current behavior) and the orchestrator just updates state, or the executor returns without committing and the orchestrator handles all commits.

#### 6. Step ordering mismatch — Step 8b appears after Step 9

Step 9 (Offer Push for Preview Deployment) at line 633 appears before Step 8b (Final User Review - MANDATORY) at line 660. Step 8b says "After all waves complete but BEFORE declaring the phase done." The ordering should be: Step 8 (Phase Complete metadata) -> Step 8b (Final Review) -> Step 9 (Push offer) -> Step 10 (Report).

#### 7. Duplicate task tracking responsibility between orchestrator and executor

Both `execute.md` (Steps 4c, 5) and `opti-gsd-executor.md` (startup sequence lines 68-75, per-task lines 99-120) claim ownership of Claude Code task management. The executor creates tasks in its startup and updates status per-task. The orchestrator also creates tasks in Step 4c and updates them in Step 5. Since subagents run in isolation, the executor's task management operates in a separate context from the orchestrator's.

**Fix:** Single owner. Since the orchestrator spawns subagents and collects results, it should own all task tracking. Remove TaskCreate/TaskUpdate from executor.

#### 8. ToolSearch referenced across agents but doesn't exist

`ToolSearch` is referenced in:
- `opti-gsd-executor.md` (lines 82, 87)
- `opti-gsd-verifier.md` (line 33)
- `opti-gsd-debugger.md` (line 32)
- `opti-gsd-integration-checker.md` (line 29)
- `commands/opti-gsd/verify.md` (line 218)
- `commands/opti-gsd/tools.md` (lines 71, 87)

`ToolSearch` is not a standard Claude Code tool. MCP tools are available directly if the MCP server is configured — no discovery/loading step is needed.

**Impact:** Agents will fail when trying to call ToolSearch. They should instead call MCP tools directly (e.g., `mcp__cclsp__get_diagnostics`) since configured MCPs are automatically available.

#### 9. Yolo mode "auto-continue after 3 seconds" is not implementable

Step 5b (line 342) says: "auto-continue after 3 seconds unless user is typing." Claude Code has no mechanism for timed waits or detecting user typing state.

**Fix:** Replace with "display results and continue immediately without prompting."

### LOW Severity

#### 10. Missing `loop` config defaults in config.json

Execute references `config.loop.tdd_max_attempts` (default 5) and `config.loop.execute_max_retries` (default 2) in Step 7a/7b, but the actual `config.json` has no `loop` section. The defaults are documented inline but the config structure is undocumented.

#### 11. Token/Duration reporting is impractical

Step 10 (line 719) reports `Duration: {approximate}` and the summary template includes token usage. Claude Code agents don't have access to their own token consumption or wall-clock timing APIs.

#### 12. Co-Authored-By is hardcoded

Step 7 (line 465) includes `Co-Authored-By: Claude <noreply@anthropic.com>` in the commit template. This is not configurable per user preference.

#### 13. Failed tasks shown as "completed" in task list

Executor line 119 marks failed tasks with `status="completed"` with note "Mark completed even on failure (task is done, just failed)." This is semantically misleading — users see a failed task as completed in the task list.

#### 14. Executor tool list has conditional comment for Browser

The executor agent's tool list (line 11) includes `Browser` with comment `# Only when config.testing.browser: true`. Claude Code agent tool lists aren't conditional — tools are either available or not. This comment suggests runtime conditional tool access which doesn't exist.

---

## Findings Removed from Original Review

None. All 11 original findings were re-confirmed. Three new findings were added (#3 per-task tags, #5 double-commit, #8 ToolSearch, #14 conditional tools).

---

## Strengths

1. **Wave-based parallelism** — sound approach for managing task dependencies while enabling parallel execution within waves.
2. **Two-layer architecture** (persistent plan.json + ephemeral CLI tasks) — good separation of concerns as a design principle.
3. **Protected branch enforcement** at both orchestrator and executor level — defense in depth.
4. **Review checkpoints between waves** with plan-awareness (detecting future-phase feedback) — thoughtful UX design.
5. **TDD Red-Green-Refactor** enforcement with file permission locking — well-designed quality gate.
6. **Git checkpoint tags** (pre/post) for rollback safety — good concept, just needs per-task tags added.
7. **Error Learning System** — building institutional memory from failures is a strong pattern.
8. **Atomic writes** in `log-tool-usage.js` — correct concurrent access pattern.
9. **Deviation handling matrix** — clear separation of auto-fixable vs architecture decisions requiring human input.

---

## Recommendations (Priority Order)

1. **Replace non-existent tool references** — Audit all files for `TaskCreate`, `TaskUpdate`, `TaskOutput`, `TaskList`, `ToolSearch`, and replace with actual Claude Code tools (`TodoWrite`, `Task(run_in_background)`, `Read(output_file)`, direct MCP calls).
2. **Add per-task checkpoint tags** — Add `git tag -f "gsd/checkpoint/phase-{N}/T{id}" HEAD` after each task commit so rollback works at task granularity.
3. **Fix double-commit ownership** — Decide whether executor or orchestrator commits. Remove the duplicate.
4. **Fix step ordering** — Move Step 8b (Final Review) before Step 9 (Push offer).
5. **Single owner for task tracking** — Orchestrator owns all visual progress. Remove from executor.
6. **Fix yolo mode** — Replace "3 second auto-continue" with immediate continue.
7. **Add wave-level file conflict validation** — Verify no overlapping writable files in same wave before parallel execution.
8. **Remove ToolSearch pattern** — Replace with direct MCP tool calls since configured MCPs are auto-available.
9. **Add `loop` defaults to config.json** — Document the loop configuration section.
10. **Remove impractical reporting** — Drop token/duration estimates or replace with measurable metrics (commit count, file count).
