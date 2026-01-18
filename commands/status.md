---
description: Show current project state and suggest next action.
---

Read the opti-gsd project state and display a status report with visual progress bars.

## Your Task

1. Check if `.gsd/` directory exists
2. If not, display "opti-gsd not initialized" and suggest `/opti-gsd:init`
3. If yes, read STATE.md and ROADMAP.md
4. Display status with progress bars as shown below

## Output Format

Display this format (adapt values from actual state):

```
╔══════════════════════════════════════════════════════════════╗
║                      opti-gsd Status                         ║
╠══════════════════════════════════════════════════════════════╣
║  Milestone: v1.0          Branch: gsd/v1.0                   ║
║  Phase: 2 of 4            Mode: interactive                  ║
╚══════════════════════════════════════════════════════════════╝

Phase Progress:
──────────────────────────────────────────────────────────────
Phase 1: Auth           [████████████████████] 100% ✓ complete
Phase 2: Core Features  [████████████▎░░░░░░░]  62% ← current
Phase 3: Settings       [░░░░░░░░░░░░░░░░░░░░]   0%   pending
Phase 4: Payments       [░░░░░░░░░░░░░░░░░░░░]   0%   pending
──────────────────────────────────────────────────────────────
Overall: [████████▏░░░░░░░░░░░] 41%

Current Phase Tasks:
──────────────────────────────────────────────────────────────
[✓] Task 1: Setup database schema
[✓] Task 2: Create API endpoints
[▸] Task 3: Implement business logic    ← in progress
[ ] Task 4: Add validation
[ ] Task 5: Write tests
──────────────────────────────────────────────────────────────

Context: ~80k tokens (40% of budget) [████████░░░░░░░░░░░░]

Open Issues: 2 (0 critical, 1 medium, 1 low)

Next steps:
→ /opti-gsd:execute        — Continue Task 3
→ /opti-gsd:discuss-phase  — Refine decisions (optional)
```

## Progress Bar Generation

Use Unicode eighth-block characters for smooth progress bars:

**Characters (8 levels of fill):**
```
█ = full    ▉ = 7/8    ▊ = 3/4    ▋ = 5/8
▌ = 1/2    ▍ = 3/8    ▎ = 1/4    ▏ = 1/8    ░ = empty
```

**Algorithm (bar width = 20):**
1. `total_eighths = (percentage / 100) * 20 * 8`
2. `whole_blocks = floor(total_eighths / 8)` → use █
3. `partial = total_eighths % 8` → pick from: `["", "▏", "▎", "▍", "▌", "▋", "▊", "▉"]`
4. `empty_blocks = 20 - whole_blocks - (partial > 0 ? 1 : 0)` → use ░

**Examples:**
```
37% → [███████▍░░░░░░░░░░░░]  (7 full + ▍ + 12 empty)
63% → [████████████▌░░░░░░░]  (12 full + ▌ + 7 empty)
100% → [████████████████████]  (20 full)
```

## State Detection

| Condition | Next Action |
|-----------|-------------|
| No .gsd/ folder | `/opti-gsd:init` or `/opti-gsd:new-project` |
| No ROADMAP.md | `/opti-gsd:roadmap` |
| Phase not planned | `/opti-gsd:discuss-phase {N}` (optional) then `/opti-gsd:plan-phase {N}` |
| Phase planned, no tasks started | `/opti-gsd:execute` or `/opti-gsd:discuss-phase` (to refine) |
| Tasks in progress | `/opti-gsd:execute` (resume) |
| Phase done, not verified | `/opti-gsd:verify {N}` |
| All phases complete | `/opti-gsd:complete-milestone` |
