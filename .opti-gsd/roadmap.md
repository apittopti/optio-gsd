# Roadmap: v2.2.0 - Claude Code Task Integration

**Milestone:** v2.2.0
**Goal:** Integrate opti-gsd's plan.json with Claude Code's built-in task system for real-time visual progress

## Success Criteria

- [ ] Tasks from plan.json appear in Claude Code's task UI during execution
- [ ] Task status updates in real-time (pending → in_progress → completed)
- [ ] Subagents spawned by executor can read task context
- [ ] plan.json remains source of truth; Claude tasks are visual layer

---

## Phase 1: Task System Integration [PENDING]

**Goal:** Wire opti-gsd executor to Claude Code's TaskCreate/TaskUpdate/TaskList/TaskGet tools

**Delivers:** F002

**Success Criteria:**
- [ ] Executor creates Claude tasks on phase start
- [ ] Tasks show activeForm spinner during execution
- [ ] Task status updates on completion/failure
- [ ] Existing plan.json workflow unchanged

**Implementation Notes:**
- TaskCreate called with: subject, description, activeForm
- TaskUpdate called with: taskId, status (pending/in_progress/completed)
- TaskList used to show progress overview
- TaskGet used by subagents to read task details

---

## Architecture

```
plan.json (persistent)          Claude Code Tasks (ephemeral)
┌─────────────────────┐         ┌─────────────────────┐
│ T01: Setup schema   │ ──────► │ [✓] Setup schema    │
│ T02: Create API     │ ──────► │ [▸] Create API      │
│ T03: Add validation │ ──────► │ [ ] Add validation  │
└─────────────────────┘         └─────────────────────┘
     Source of Truth              Real-time Visual UI
```

---

## Files to Modify

| File | Change |
|------|--------|
| `agents/opti-gsd/opti-gsd-executor.md` | Add TaskCreate/TaskUpdate calls |
| `commands/opti-gsd/execute.md` | Document task integration |

---
