# /opti-gsd:status

Show current project state and suggest next action.

## Behavior

### Step 1: Load State

Read (minimal context):
- `.gsd/config.md`
- `.gsd/STATE.md`
- `.gsd/ROADMAP.md`
- `.gsd/ISSUES.md`

### Step 2: Display Status

```markdown
# opti-gsd Status

## Current Position
- **Milestone:** v1.0
- **Phase:** 2 of 4 (Core Features)
- **Task:** 3 of 5
- **Branch:** gsd/v1.0

## Progress
```
Phase 1: Authentication    [████████████] 100% ✓
Phase 2: Core Features     [████████░░░░]  60% ←
Phase 3: Settings          [░░░░░░░░░░░░]   0%
Phase 4: Payments          [░░░░░░░░░░░░]   0%
```

## Session
- **Last active:** 2 hours ago
- **Context used:** ~80k tokens (40% of budget)

## Open Issues
- ISS-001 (medium): Auth redirect doesn't preserve URL
- ISS-002 (low): API missing pagination headers

## Mode
- **Workflow:** interactive
- **Discovery:** level 1 (quick)

## Next Action
→ Run `/opti-gsd:execute` to continue Phase 2, Task 3
```

### Step 3: Suggest Next Action

Based on state, suggest the most appropriate next command:

| State | Suggestion |
|-------|------------|
| No project | `/opti-gsd:new-project` |
| No roadmap | `/opti-gsd:roadmap` |
| Phase not planned | `/opti-gsd:plan-phase {N}` |
| Tasks pending | `/opti-gsd:execute` |
| Phase complete, not verified | `/opti-gsd:verify {N}` |
| Verified, more phases | `/opti-gsd:plan-phase {N+1}` |
| All phases complete | `/opti-gsd:complete-milestone` |
| High context usage | `/opti-gsd:archive` or `/opti-gsd:compact` |
| Open critical issues | `/opti-gsd:issues` |

---

## Context Budget

Minimal: ~5% (read-only operation)
