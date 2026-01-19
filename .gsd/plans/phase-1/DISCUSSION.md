# Phase 1 Discussion: Loop Mechanism

**Captured:** 2026-01-19
**Participants:** User, Claude

## Summary

Implement Ralph Wiggum-style self-referential loop mechanism natively in opti-gsd. The loop operates at two levels: task execution (retry on failure) and verification (fix gaps and re-verify).

## Technical Decisions

### Where to Implement
- **Execute loop**: Integrated into `/opti-gsd:execute` with `--loop` flag
- **Verify loop**: Integrated into `/opti-gsd:verify` with `--loop` flag
- **NOT a separate command**: Loops belong where the context exists

### State Tracking
- Extend `STATE.md` with `loop:` section
- Track: active, iteration, max_iterations, history
- Consistent with existing opti-gsd patterns

### Stop Hook
- New `hooks/stop-hook.sh` + `hooks/hooks.json`
- Intercepts session exit
- Checks if loop is active with incomplete work
- Returns `{"decision": "block"}` to re-inject prompt

### Completion Criteria
- **Execute loop**: Task returns COMPLETE (not FAILED)
- **Verify loop**: Verification passes (no gaps_found)
- More intelligent than arbitrary phrase matching

### Iteration Limits
- Execute: `--max-retries N` (default: 3 per task)
- Verify: `--max-iterations N` (default: 20 for full cycle)

### Auto-commit
- Yes, preserve existing behavior
- Each successful task/fix gets committed

### Failure Handling
- Pause loop on max iterations reached
- Surface detailed error to user
- Allow manual intervention
- Log iteration history for debugging

## Constraints

- Must work within existing opti-gsd workflow
- Must integrate with existing STATE.md structure
- Stop hook must be cross-platform (Windows + Unix)
- Cannot break existing execute/verify behavior (flags are opt-in)

## Architecture

### Execute Loop Flow
```
/opti-gsd:execute --loop [--max-retries 3]
     │
     ▼
  Execute task
     │
     ▼
  FAILED? ─── No ───► Next task
     │
    Yes
     │
     ▼
  Analyze error from output
     │
     ▼
  Generate fix task
     │
     ▼
  Execute fix
     │
     ▼
  Retry original task
     │
     ▼
  max_retries? ─── Yes ───► PAUSED (human needed)
```

### Verify Loop Flow
```
/opti-gsd:verify --loop [--max-iterations 20]
     │
     ▼
  Run all verification checks
     │
     ▼
  gaps_found? ─── No ───► PASSED ✓
     │
    Yes
     │
     ▼
  Parse <gaps> from VERIFICATION.md
     │
     ▼
  Generate fix tasks for each gap
     │
     ▼
  Execute fix tasks
     │
     ▼
  Re-verify (loop back)
     │
     ▼
  max_iterations? ─── Yes ───► PAUSED (human needed)
```

### Combined Flow
```
/opti-gsd:execute --loop --verify
     │
     ▼
  Execute all tasks with retry loop
     │
     ▼
  All complete? ─── No ───► Retry/Fix loop
     │
    Yes
     │
     ▼
  Run verify with loop
     │
     ▼
  Passed? ─── No ───► Fix/Re-verify loop
     │
    Yes
     │
     ▼
  PHASE COMPLETE ✓
```

### State Format
```yaml
loop:
  active: true
  type: verify  # or "execute"
  phase: 1
  iteration: 4
  max_iterations: 20
  task_retries: {T01: 1, T03: 2}
  started: 2026-01-19T10:30:00
  last_iteration: 2026-01-19T10:45:00
  history:
    - iteration: 1
      type: verify
      result: gaps_found
      gaps: ["orphan:StatsCard.tsx", "broken_link:Dashboard→StatsAPI"]
    - iteration: 2
      type: verify
      result: gaps_found
      gaps: ["broken_link:Dashboard→StatsAPI"]
```

## Components Needed

1. **hooks/hooks.json** - Hook configuration for Stop event
2. **hooks/stop-hook.sh** - Cross-platform stop hook script
3. **commands/execute.md** - Add --loop, --max-retries flags
4. **commands/verify.md** - Add --loop, --max-iterations flags
5. **Gap-to-task generator** - Logic to convert gaps into fix tasks
6. **Error analyzer** - Logic to analyze task failures and generate fixes

## References

- Ralph Wiggum plugin: https://github.com/anthropics/claude-code/tree/main/plugins/ralph-wiggum
- Uses Stop hook with `{"decision": "block"}` pattern
- State file `.claude/ralph-loop.local.md` for tracking

## Open Questions

- [x] Where should loop live? → In execute and verify (not separate)
- [x] How to define completion? → Verification passes (structured, not phrase)
- [x] Auto-commit? → Yes
- [x] Failure handling? → Pause, surface to user

---

*This informs the planning phase. Run `/opti-gsd:plan-phase 1` when ready.*
