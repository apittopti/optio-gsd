# Roadmap: v2.5.0 - Fix Claude Code Tasks Visual Progress

**Milestone:** v2.5.0
**Goal:** Make Claude Code Tasks (TaskCreate/TaskUpdate) actually appear during execution

## Problem Statement

- execute.md documents TaskCreate/TaskUpdate integration conceptually (lines 14-42)
- But the actual Step-by-step execution flow (Steps 3-8) never explicitly calls TaskCreate or TaskUpdate
- The orchestrator follows numbered steps and skips the conceptual section
- Result: Users don't see visual task progress in CLI during execution

## Success Criteria

- [x] TaskCreate calls explicitly embedded in execution Step flow
- [x] TaskUpdate calls for in_progress/completed at correct points
- [x] Orchestrator cannot skip task creation (it's part of a numbered step)
- [x] Visual progress appears in Claude Code CLI during execution

---

## Phase 1: Embed TaskCreate/TaskUpdate in Execution Steps [COMPLETE]

**Goal:** Make TaskCreate/TaskUpdate mandatory numbered steps in execute.md

**Delivers:** Visual task progress during phase execution

**Success Criteria:**
- [ ] New Step between loading plan and executing waves that calls TaskCreate for each task
- [ ] TaskUpdate(in_progress) call added to wave execution before spawning subagent
- [ ] TaskUpdate(completed) call added to result handling after task completes
- [ ] Conceptual section updated to reference the actual steps

**Implementation Notes:**
- Add Step 4c: "Create Claude Code Tasks" between checkpoint and wave execution
- Modify Step 5 wave loop to include TaskUpdate calls at task start/end
- Make instructions imperative and concrete, not conceptual
- Bump package.json version to 2.5.0

---
