# Roadmap: opti-gsd v0.6.0

## Milestone Goal
Add self-referential loop mechanism for resilient execution and verification.

---

## Phase 1: Loop Mechanism
**Status:** DISCUSSED
**Goal:** Implement Ralph Wiggum-style loops in execute and verify commands

### Delivers
- Execute loop: retry failed tasks automatically
- Verify loop: fix gaps and re-verify until passed
- Stop hook: intercept exit and re-inject when loop incomplete
- Combined flow: `--loop --verify` for full cycle automation

### Tasks (High-Level)
1. Create Stop hook infrastructure (hooks.json, stop-hook.sh)
2. Add loop state tracking to STATE.md schema
3. Extend execute.md with --loop, --max-retries flags
4. Extend verify.md with --loop, --max-iterations flags
5. Implement gap-to-task generator (parse gaps, create fix tasks)
6. Implement error analyzer (parse failures, create fix attempts)
7. Test full loop cycle

### Dependencies
- None (foundational feature)

---
