---
description: Show current project state and suggest next action.
---

Read the opti-gsd project state and display a comprehensive status report with visual progress bars.

## Your Task

### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:new-project to start a new project
```

If `.gsd/STATE.md` missing:
```
⚠️ Project State Missing
─────────────────────────────────────
.gsd/STATE.md not found.

→ Run /opti-gsd:init to reinitialize
```

### Step 2: Load State

1. Read STATE.md, ROADMAP.md, and check for phase plans/verification files
2. Display status with progress bars and workflow stages as shown below

## Output Format

Display this format (adapt values from actual state):

```
╔══════════════════════════════════════════════════════════════╗
║                      opti-gsd Status                         ║
╠══════════════════════════════════════════════════════════════╣
║  Milestone: v1.0          Branch: gsd/v1.0                   ║
║  Phase: 2 of 4            Mode: interactive                  ║
╚══════════════════════════════════════════════════════════════╝

Workflow Stages:
──────────────────────────────────────────────────────────────
[✓] Init        → Project initialized
[✓] Roadmap     → 4 phases defined
[✓] Research    → Phase 2 researched (optional)
[▸] Planning    → Phase 2 planned, Phase 3-4 pending
[▸] Execution   → Phase 2 in progress (62%)
[ ] Verification → Phase 1 verified, Phase 2 pending
[ ] Release     → Awaiting milestone completion
──────────────────────────────────────────────────────────────

Phase Progress:
──────────────────────────────────────────────────────────────
Phase 1: Auth           [████████████████████] 100% ✓ verified
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

┌──────────────────────────────────────────────────────────────┐
│ Next Steps                                                   │
├──────────────────────────────────────────────────────────────┤
│ → /opti-gsd:execute        — Continue Task 3                 │
│ → /opti-gsd:verify 1       — Verify completed phase          │
│ → /opti-gsd:discuss-phase  — Refine decisions (optional)     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ Safe Actions (can run anytime)                               │
├──────────────────────────────────────────────────────────────┤
│ → /opti-gsd:status         — Refresh this status view        │
│ → /opti-gsd:context        — Check context usage details     │
│ → /opti-gsd:ci             — View CI/CD configuration        │
│ → /opti-gsd:add-todo       — Capture idea for later          │
│ → /opti-gsd:todos          — View/manage captured todos      │
│ → /opti-gsd:decisions      — Log or view decisions           │
│ → /opti-gsd:issues         — Track issues                    │
│ → /opti-gsd:help           — Show all commands               │
└──────────────────────────────────────────────────────────────┘
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

## Workflow Stage Detection

Determine each stage's status by checking:

| Stage | Check | Status Indicators |
|-------|-------|-------------------|
| **Init** | `.gsd/` exists | ✓ if exists, ✗ if not |
| **Roadmap** | `ROADMAP.md` exists | ✓ = defined, show phase count |
| **Research** | `.gsd/research/` or phase RESEARCH.md | ✓ = done, ○ = skipped, ▸ = in progress |
| **Planning** | `.gsd/plans/phase-N/plan.md` | Show planned/pending counts |
| **Execution** | Tasks completed in current phase | ▸ = in progress, ✓ = phase done |
| **Verification** | `VERIFICATION.md` exists per phase | Show verified/pending counts |
| **Release** | All phases verified | ✓ = ready, [ ] = awaiting |

## Next Steps Detection

Based on current state, show the most relevant actions:

| Condition | Primary Action | Secondary Actions |
|-----------|---------------|-------------------|
| No .gsd/ folder | `/opti-gsd:init` or `/opti-gsd:new-project` | — |
| No ROADMAP.md | `/opti-gsd:roadmap` | — |
| Phase not planned | `/opti-gsd:plan-phase {N}` | `/opti-gsd:discuss-phase {N}` (optional) |
| Phase planned, not started | `/opti-gsd:execute` | `/opti-gsd:discuss-phase` (refine) |
| Tasks in progress | `/opti-gsd:execute` (resume) | `/opti-gsd:execute-task {N}` (specific) |
| Phase complete, not pushed | `/opti-gsd:push` | `/opti-gsd:verify {N}` (local only) |
| Phase complete, pushed, not verified | `/opti-gsd:verify {N}` | Test preview URL manually first |
| Phase verified, more phases | `/opti-gsd:plan-phase {N+1}` | `/opti-gsd:archive {N}` |
| All phases complete & verified | `/opti-gsd:complete-milestone` | — |

## Safe Actions

Always show the "Safe Actions" section with commands that:
- **Don't modify project state destructively**
- **Can be run at any point in the workflow**
- **Help with information gathering or note-taking**

These include: `status`, `context`, `ci`, `add-todo`, `todos`, `decisions`, `issues`, `help`
