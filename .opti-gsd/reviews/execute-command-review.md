# Execute Command Review — Full Flow Validation

**Date:** 2026-02-01
**Revision:** 4 — corrected finding #1 (TaskCreate/TaskUpdate/TaskOutput ARE real tools), retracted #9
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

**19 valid findings** (4 high, 8 medium, 7 low). 2 findings retracted from original 21.

**CORRECTION:** Finding #1 (TaskCreate/TaskUpdate/TaskOutput "don't exist") was **wrong**. These are real Claude Code tools introduced in v2.1 (January 2026). The original execute.md was correct to use them. Finding #9 (synchronous polling) is also retracted — TaskOutput handles this natively.

The most critical real issue: data integrity — Step 8 marks the phase complete and commits metadata *before* Step 8b's mandatory review. If the review produces fixes, the summary and state are stale.

ToolSearch remains non-existent. The executor agent still can't call TaskCreate/TaskUpdate (not in its tool list, runs in isolated subagent context). These findings stand.

---

## HIGH Severity (4)

### ~~1. Non-existent tools: TaskCreate, TaskUpdate, TaskOutput, TaskList~~ — RETRACTED

**This finding was wrong.** TaskCreate, TaskUpdate, TaskOutput, and TaskList are real Claude Code tools introduced in v2.1 (January 22, 2026). The original execute.md was correct to use them. The reviewer's session did not have access to these tools, leading to an incorrect conclusion.

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

### 4. recover.md is architecturally misplaced (session-scoped IDs don't survive restarts)

TaskOutput exists (finding #1 correction), but recover.md's core assumption is still flawed:

**Task IDs don't survive sessions.** The `loop.background_tasks` array in state.json stores task IDs from the `Task` tool. These IDs are session-scoped — they exist only within the Claude Code session that created them. When a session ends (the exact scenario recover is meant to handle), those IDs are meaningless. There's nothing to poll.

The *useful* part of recover — detecting mismatches between state.json and git reality — is standard git inspection. This belongs in the orchestrator's resume logic (execute.md Step 3b), not as a separate command.

**Recommendation:** Fold recover's git-inspection logic into execute.md Step 3b. Recovery should rely on git state, not session-scoped task IDs.

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

### ~~9. Synchronous polling loop incompatible with Claude Code's execution model~~ — RETRACTED

**This finding was wrong.** TaskOutput is a real Claude Code tool that handles polling natively. The synchronous loop described in execute.md using TaskOutput is the correct pattern.

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

**Current state:** `recover.md` was a 111-line command built around `TaskOutput` polling of `loop.background_tasks`. While TaskOutput is a real tool (correction from finding #1), the fundamental problem remains: task IDs are session-scoped and don't survive the session restarts that recovery is designed for.

**What it tried to do:**
1. Poll background task IDs from state.json → IDs don't survive sessions
2. Use TaskOutput to check results → tool exists but IDs are stale
3. Compare state.json to git reality → this part is useful
4. Auto-fix state mismatches → this part is useful

**Action taken:** Removed recover.md. Its git-inspection logic was folded into execute.md Step 3b, which now compares state.json against git reality on resume and handles mismatches.

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

1. **Fix step ordering and data integrity** — Move Step 8b before Step 8. Only write summary/update state AFTER user approves the final review.
2. **Fold recover into execute's resume logic** — Remove recover.md as a separate command. Add git-reality-check to execute.md Step 3b.
3. **Add per-task checkpoint tags** — `git tag -f "gsd/checkpoint/phase-{N}/T{id}" HEAD` after each task commit.
4. **Fix double-commit** — Remove orchestrator commit from Step 7; executor already commits.
5. **Replace ToolSearch references** — ToolSearch doesn't exist. MCP tools are auto-available; call them directly. Affects 6 files.
6. **Remove redundant wave gate** — Delete Step 5 point 2; Step 5b handles wave transitions.
7. **Fix config structure references** — Step 0 branching check, Step 6 browser/base_url fields.
8. **Single owner for task tracking** — Orchestrator owns TaskCreate/TaskUpdate. Remove task management from executor (runs in isolated subagent context, can't access orchestrator's tasks).
9. **Fix yolo mode** — Immediate continue, no timed wait.
10. **Fix duplicate step numbering** — Step 5b has two items numbered "3."
