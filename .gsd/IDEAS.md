# Ideas Backlog

Quick capture for ideas to explore later.

---

## Pending

### I001: Integrate Ralph Wiggum loop pattern into opti-gsd

- **Added:** 2026-01-19
- **Category:** feature
- **Priority:** low
- **Status:** in_progress (Phase 1)

Add a self-referential loop mechanism (like the ralph-wiggum plugin) that could complement the executor agent. Uses a Stop hook to intercept session exit and resubmit the original prompt until completion criteria are met. Key components: state file tracking iterations/completion promise, stop hook returning {"decision": "block"} to continue, and max-iterations safety limit. Could be useful for tasks requiring iterative refinement where each pass builds on previous work visible via git history.

---
