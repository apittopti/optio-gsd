# Execute Command Review — Full Flow Validation

**Date:** 2026-02-01
**Revision:** 3 — complete end-to-end flow trace with cross-file validation
**Reviewer:** Claude (automated review)

**Files Reviewed:**
- `commands/opti-gsd/execute.md` (857 lines) — orchestrator
- `agents/opti-gsd/opti-gsd-executor.md` (598 lines) — subagent
- `commands/opti-gsd/recover.md` (111 lines) — recovery flow
- `commands/opti-gsd/review.md` (314 lines) — standalone review
- `commands/opti-gsd/verify.md` (722 lines) — verification flow
- `commands/opti-gsd/rollback.md` (204 lines) — rollback flow
- `hooks/hooks.json` — tool usage hook
- `scripts/log-tool-usage.js` — tool logging
- `.opti-gsd/state.json`, `config.json`, `roadmap.md`, `features/F002.md`

---

## Summary

14 findings confirmed from previous review. 7 new findings discovered during full flow trace, bringing the total to **21 findings** (5 high, 9 medium, 7 low).

The most critical systemic issue: the orchestrator is designed around tools that don't exist in Claude Code (`TaskCreate`, `TaskUpdate`, `TaskOutput`, `ToolSearch`). This affects execute, recover, review, verify, and the executor agent. Until these references are replaced with actual Claude Code patterns, the flow cannot work as documented.

The second systemic issue is data integrity: Step 8 marks the phase as complete and commits metadata *before* Step 8b's mandatory review. If the review produces fixes, the summary and state are stale.

---

## HIGH Severity (5)

### 1. Non-existent tools: TaskCreate, TaskUpdate, TaskOutput, TaskList

**Scope:** execute.md (Steps 4c, 5), opti-gsd-executor.md (startup, per-task), review.md (Step 5), recover.md (Steps 1-4), features/F002.md, roadmap.md

These tools are not in Claude Code's tool set. Available tools: `Task`, `Read`, `Write`, `Edit`, `Bash`, `Glob`, `Grep`, `TodoWrite`, `WebFetch`, `WebSearch`, `NotebookEdit`. The project invested two milestones (v2.2.0, v2.5.0) building around APIs that don't exist.

**Fix:** Replace `TaskCreate`/`TaskUpdate` with `TodoWrite` for visual progress. Replace `TaskOutput` polling with `Read` on the `output_file` path returned by `Task(run_in_background=true)`.

### 2. Step 8 marks phase complete BEFORE Step 8b mandatory review

Step 8 (line 573) runs when "all tasks in all waves complete" and:
- Writes `summary.md` with task list and commit hashes
- Updates `state.json` with phase in `complete` array
- Updates `roadmap.md` with `[x] Complete`
- Commits all metadata: `docs: complete phase {N}`

Step 8b (line 660) then says "BEFORE declaring the phase done, present the full picture and ask for feedback." But the phase is already declared done — state.json says complete, roadmap says complete, and it's committed.

If the user provides feedback in Step 8b and fixes are applied, the committed summary.md doesn't include those fix commits, state.json was already marked complete, and there's a "docs: complete phase" commit sitting before the fix commits.

**Impact:** Data integrity failure. Summary doesn't reflect reality. Git history shows phase "completed" before fixes.
**Fix:** Move Step 8b before Step 8. Only write summary/update state AFTER user approves.

### 3. Per-task checkpoint tags referenced but never created

`rollback.md` (lines 22-24, 46), `recover.md` (line 55), and the flowchart all reference `gsd/checkpoint/phase-{N}/T{task}` tags. Execute.md line 582 even says "T{N} = after each task."

But execute.md only creates:
- `gsd/checkpoint/phase-{N}/pre` (line 150)
- `gsd/checkpoint/phase-{N}/post` (line 579)

The executor agent has zero `git tag` commands. Per-task tags are never created anywhere.

**Impact:** `/opti-gsd:rollback 2-03` always fails. Only whole-phase rollback works.
**Fix:** Add per-task tag creation after each task commit — either in the executor or the orchestrator's result handler.

### 4. recover.md is non-functional and architecturally misplaced

Recover has two fundamental problems:

**a) Built on non-existent tools:** Every step uses `TaskOutput(task_id, block=false)` which doesn't exist.

**b) Task IDs don't survive sessions:** The `loop.background_tasks` array in state.json stores task IDs from the `Task` tool. These IDs are ephemeral — they exist only within the Claude Code session that created them. When a session ends (the exact scenario recover is meant to handle), those IDs are meaningless. There's nothing to poll.

The *useful* part of recover — detecting mismatches between state.json and git reality (Steps 2-4) — is just standard git inspection. This belongs in the orchestrator's resume logic (execute.md Step 3b), not as a separate command.

**Recommendation:** Fold recover's git-inspection logic into execute.md Step 3b. Remove the TaskOutput polling entirely. The execute command's resume flow (task > 0 in state.json) should handle all recovery scenarios.

### 5. No handling for parallel task git conflicts

Parallel subagents in the same wave each commit independently to the same repo. If two agents modify overlapping files — or if one agent's commit includes unstaged changes from another agent's work-in-progress — commits will be incorrect.

**Fix:** Validate at plan time that tasks in the same wave don't share writable files (planner responsibility). Or have subagents return results without committing, and let the orchestrator serialize all commits.

---

## MEDIUM Severity (9)

### 6. Double-commit: orchestrator and executor both commit task changes

Executor agent (line 113): `git add {files} → git commit`
Orchestrator Step 7 (line 460): `git add {files} → git commit`

The executor commits first. The orchestrator's commit will fail with "nothing to commit, working tree clean."

**Fix:** Single owner for commits. Since the executor already commits with the correct format, remove the commit from Step 7 and have the orchestrator only update state.json.

### 7. Step 0 config structure mismatch

Step 0 (line 58) checks for `branching: milestone` in config.json. The actual config structure is:
```json
"branching": {
    "enabled": true,
    "pattern": "gsd/v{milestone}"
}
```

There's no `milestone` value — it's a nested object with `enabled` and `pattern` fields. The check should be `branching.enabled === true`, not `branching: milestone`.

### 8. Step 5 has redundant between-wave gates

Step 5, point 2 (line 196): `IF interactive mode AND wave > 1: Ask "Wave {W-1} complete. Continue to Wave {W}?"`
Step 5, point 5 (line 232): `All tasks in wave complete? → Step 5b (User Review Checkpoint)`

Both trigger between waves. Step 5b is a full review checkpoint with feedback collection. Point 2 is a simple continue prompt. In interactive mode, the user gets prompted twice between waves — first the review, then the continue question.

**Fix:** Remove point 2. Step 5b already gates wave transitions and includes a "Continue to Wave {W+1}" option.

### 9. Synchronous polling loop incompatible with Claude Code's execution model

Step 5, point 4 (lines 216-230) describes a `WHILE` loop that polls `TaskOutput` repeatedly. Claude Code is turn-based — it can't busy-wait in a synchronous loop. Even with the correct `Read(output_file)` pattern, you can't write `WHILE any tasks pending: poll()` as a single continuous operation.

The actual pattern would be: spawn all background tasks → for each, `Read` the output file → if not done, use `Bash(sleep N)` then `Read` again. But this consumes API turns and is fundamentally different from the synchronous loop described.

**Fix:** Rewrite the polling section to reflect Claude Code's turn-based reality. For single-task waves, use `Task(run_in_background=false)` (blocking). For multi-task waves, spawn all with `run_in_background=true`, then sequentially `Read` each output file (they'll block until done).

### 10. Step 6 subagent prompt references non-existent config fields

Line 430: `<browser enabled="{config.browser.enabled}" base_url="{config.base_url}" />`

Config.json has no `browser` section and no `base_url` field. The actual config has a `deployment` section with `platform` and `preview_url`.

### 11. Duplicate task tracking ownership between orchestrator and executor

Both claim to manage Claude Code task status. The orchestrator creates tasks (Step 4c) and updates them (Step 5). The executor also creates tasks (startup line 68-75) and updates them (lines 99-120). Since subagents run in isolated contexts, the executor's task management has no effect on the orchestrator's task list.

**Fix:** Orchestrator owns all task tracking. Remove from executor.

### 12. ToolSearch referenced across 6 files but doesn't exist

Referenced in: opti-gsd-executor.md (lines 82, 87), opti-gsd-verifier.md, opti-gsd-debugger.md, opti-gsd-integration-checker.md, verify.md (line 218), tools.md. Not a Claude Code tool. MCP tools are auto-available — no discovery/loading step needed.

### 13. Yolo mode "auto-continue after 3 seconds" is not implementable

Step 5b (line 342): "auto-continue after 3 seconds unless user is typing." Claude Code can't detect typing or implement timed waits that auto-continue.

**Fix:** In yolo mode, display results and continue immediately without prompting.

### 14. Step 5b has duplicate step numbering

Lines 296-304: step "3. Present categorization for confirmation"
Lines 307-310: step "3. Generate and execute inline fix tasks"

Two items numbered "3." — the second should be "4." This shifts all subsequent numbering.

---

## LOW Severity (7)

### 15. Step 3b resume logic doesn't describe wave mapping

Step 3b says "Start from next incomplete task" but doesn't describe how to determine which wave a task belongs to. The plan structures tasks within waves — resuming requires mapping the task number to its wave to know which wave to start from.

### 16. Missing `loop` config defaults in config.json

Execute references `config.loop.tdd_max_attempts` (default 5) and `config.loop.execute_max_retries` (default 2) but config.json has no `loop` section.

### 17. Token/Duration reporting is impractical

Step 10 (line 718) reports `Duration: {approximate}` and summary template includes token usage. Claude Code agents can't access their own token consumption or wall-clock timing.

### 18. Co-Authored-By hardcoded in orchestrator but absent from executor

Step 7 (line 465) includes `Co-Authored-By: Claude <noreply@anthropic.com>`. The executor's commit convention (lines 267-276) doesn't include it. Inconsistent commit formats between the two.

### 19. Failed tasks marked as "completed" in task list

Executor line 119: `TaskUpdate(status="completed")` for failed tasks with note "task is done, just failed." Semantically misleading in the task list.

### 20. Executor tool list has conditional comment for Browser

Line 11: `Browser  # Only when config.testing.browser: true`. Tool lists aren't conditional in Claude Code — tools are either available or not.

### 21. Context budget percentages are unenforceable

Lines 811-818 specify "Orchestrator budget: 15%" with breakdowns. These are aspirational — there's no mechanism to enforce context budget limits. They serve as guidelines but read as hard constraints.

---

## Recover Command Assessment

**Current state:** `recover.md` is a 111-line command entirely built around `TaskOutput` polling of `loop.background_tasks`. Both the tool and the persistence model are non-functional.

**What it tries to do:**
1. Poll background task IDs from state.json → IDs don't survive sessions
2. Use TaskOutput to check results → tool doesn't exist
3. Compare state.json to git reality → this part is useful
4. Auto-fix state mismatches → this part is useful

**Recommendation:** Recover should not exist as a separate command. Its useful functionality (git reality check, state.json repair) belongs in the orchestrator's resume logic (execute.md Step 3b). When `execute` runs and finds `task > 0` in state.json, it should:

1. Compare state.json claims against actual git commits
2. If state is ahead of reality → warn user and offer rollback
3. If uncommitted work exists → offer to commit, discard, or stash
4. Resume from the correct position

This is simpler, more reliable, and doesn't depend on ephemeral task IDs or non-existent tools.

---

## Strengths (unchanged from previous review)

1. **Wave-based parallelism** — sound dependency management with intra-wave parallelism
2. **Two-layer architecture** — persistent plan.json + ephemeral visual progress is a good concept
3. **Protected branch enforcement** — defense in depth at orchestrator and executor level
4. **Review checkpoints** — plan-aware feedback that detects future-phase requests
5. **TDD Red-Green-Refactor** — well-designed with file permission locking
6. **Git checkpoint tags** — pre/post for rollback safety (just needs per-task)
7. **Error Learning System** — institutional memory from failures
8. **Atomic writes** in log-tool-usage.js — correct concurrent access
9. **Deviation handling matrix** — clear auto-fix vs human-decision separation

---

## Recommendations (Priority Order)

1. **Replace all non-existent tool references** — `TaskCreate`/`TaskUpdate` → `TodoWrite`; `TaskOutput` → `Read(output_file)`; `ToolSearch` → direct MCP calls. This is blocking — nothing works until this is done.
2. **Fix step ordering and data integrity** — Move Step 8b before Step 8. Only write summary/update state AFTER user approves the final review.
3. **Fold recover into execute's resume logic** — Remove recover.md as a separate command. Add git-reality-check to execute.md Step 3b.
4. **Add per-task checkpoint tags** — `git tag -f "gsd/checkpoint/phase-{N}/T{id}" HEAD` after each task commit.
5. **Fix double-commit** — Remove orchestrator commit from Step 7; executor already commits.
6. **Remove redundant wave gate** — Delete Step 5 point 2; Step 5b handles wave transitions.
7. **Fix config structure references** — Step 0 branching check, Step 6 browser/base_url fields.
8. **Rewrite polling model** — Replace synchronous WHILE loop with turn-based pattern using Read on output files.
9. **Single owner for task tracking** — Orchestrator only. Remove from executor.
10. **Fix yolo mode** — Immediate continue, no timed wait.
