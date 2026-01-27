---
description: Show current project state and suggest next action.
---

Read the opti-gsd project state and display a comprehensive status report with visual progress bars.

## Your Task

### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .opti-gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:new-project to start a new project
```

If `.opti-gsd/state.json` missing:
```
⚠️ Project State Missing
─────────────────────────────────────
.opti-gsd/state.json not found.

→ Run /opti-gsd:init to reinitialize
```

### Step 2: Load State

1. Read state.json, roadmap.md, and check for phase plans/verification files
2. Also read `.opti-gsd/learnings.md` if exists to count and display learnings
3. Display status with progress bars and workflow stages as shown below

### Step 2a: Check CLAUDE.md Integration

Check if CLAUDE.md has the opti-gsd workflow section:

```bash
# Check if CLAUDE.md exists and contains opti-gsd section
grep -q "opti-gsd" CLAUDE.md 2>/dev/null
```

**If CLAUDE.md is missing opti-gsd section:**

Display warning in status output:

```
⚠️ CLAUDE.md Missing Workflow Instructions
─────────────────────────────────────────────────────────────
Your CLAUDE.md doesn't include opti-gsd workflow instructions.
This means Claude may not follow the workflow on every prompt.

→ Run /opti-gsd:setup-claude-md to add workflow instructions
```

**Create `/opti-gsd:setup-claude-md` behavior inline:**

When user runs this (or says "yes" to adding it), append to CLAUDE.md:

```markdown

---

## opti-gsd Workflow

This project uses **opti-gsd** for spec-driven development.

**Before any code changes:**
1. Check status: `/opti-gsd:status`
2. Ensure on milestone branch (never master/main)
3. Follow: Plan → Execute → Verify

**Protected branches:** master, main, production, prod — PR only!

**Key commands:** `/opti-gsd:status`, `/opti-gsd:start-milestone`, `/opti-gsd:roadmap`, `/opti-gsd:plan-phase`, `/opti-gsd:execute`, `/opti-gsd:verify`
```

Then commit:
```bash
git add CLAUDE.md
git commit -m "docs: add opti-gsd workflow instructions to CLAUDE.md"
```

## Output Format

Display this format (adapt values from actual state):

```
╔══════════════════════════════════════════════════════════════╗
║                      opti-gsd Status                         ║
╠══════════════════════════════════════════════════════════════╣
║  Milestone: v1.0          Branch: gsd/v1.0                   ║
║  Phase: 2 of 4            Mode: interactive                  ║
╚══════════════════════════════════════════════════════════════╝

Where You Are:
──────────────────────────────────────────────────────────────

  ROADMAP ──► PLAN ──► EXECUTE ──┬──► PUSH ──► VERIFY
     ✓         ✓       ▶ HERE    │              │
                                 │   (optional) │
                                 └──► VERIFY ◄──┘
                                      (local)
──────────────────────────────────────────────────────────────

Phase 2 Progress: [████████████▎░░░░░░░] 62%
──────────────────────────────────────────────────────────────
[✓] Task 1: Setup database schema
[✓] Task 2: Create API endpoints
[▸] Task 3: Implement business logic    ← in progress
[ ] Task 4: Add validation
[ ] Task 5: Write tests
──────────────────────────────────────────────────────────────

┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      DO THIS NOW                             ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                              ┃
┃   /opti-gsd:execute                                          ┃
┃                                                              ┃
┃   Continue executing Task 3: Implement business logic        ┃
┃                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

Also relevant:
  → /opti-gsd:add-feature — Capture something for later
  → /opti-gsd:help     — See all commands
```

### Workflow Position Indicator

The workflow is NOT strictly linear. Show the user's position with available paths:

```
STANDARD FORWARD FLOW:

  At ROADMAP (need to define phases):
  ──────────────────────────────────────────────────────────
  ▶ ROADMAP ──► PLAN ──► EXECUTE ──► PUSH ──► VERIFY
      HERE

  At PLAN (need to plan current phase):
  ──────────────────────────────────────────────────────────
    ROADMAP ──► ▶ PLAN ──► EXECUTE ──► PUSH ──► VERIFY
       ✓          HERE

  At EXECUTE (running tasks):
  ──────────────────────────────────────────────────────────
    ROADMAP ──► PLAN ──► ▶ EXECUTE ──┬──► PUSH ──► VERIFY
       ✓         ✓          HERE     │
                                     └──► VERIFY (local)

  At VERIFY choice (execution done):
  ──────────────────────────────────────────────────────────
    ROADMAP ──► PLAN ──► EXECUTE ──┬──► ▶ PUSH ──► VERIFY
       ✓         ✓          ✓      │      HERE
                                   └──► ▶ VERIFY (local)
                                          HERE

BACKWARD FLOWS (rework needed):

  After VERIFY with gaps → back to EXECUTE:
  ──────────────────────────────────────────────────────────
    ROADMAP ──► PLAN ──► ▶ EXECUTE ◄── gaps ── VERIFY
       ✓         ✓          HERE                  ✗

  After EXECUTE failure → options:
  ──────────────────────────────────────────────────────────
    ROADMAP ──► PLAN ──► ▶ EXECUTE
       ✓         ✓          HERE
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
            /recover              /rollback (undo)
            (diagnose)
```

### DO THIS NOW Detection

Show the primary action, with alternatives when choices exist:

| State | DO THIS NOW | Alternatives |
|-------|-------------|--------------|
| No .opti-gsd/ | /opti-gsd:new-project | or /opti-gsd:init (existing code) |
| No roadmap | /opti-gsd:roadmap | — |
| No plan for phase | /opti-gsd:plan-phase {N} | /opti-gsd:discuss-phase first |
| Plan exists, not executed | /opti-gsd:execute | — |
| Execution in progress | /opti-gsd:execute (continue) | /opti-gsd:recover if stuck |
| **Phase executed** | /opti-gsd:push | or /opti-gsd:verify (local) |
| Pushed, not verified | /opti-gsd:verify {N} | — |
| **Gaps found** | /opti-gsd:plan-fix | or /opti-gsd:rollback |
| Verified, more phases | /opti-gsd:plan-phase {N+1} | /opti-gsd:archive {N} |
| All phases done | /opti-gsd:complete-milestone | — |

**When there are choices, show both:**

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                      CHOOSE NEXT STEP                        ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃                                                              ┃
┃   A) /opti-gsd:push     ← Push for preview deployment        ┃
┃   B) /opti-gsd:verify   ← Verify locally (no deploy)         ┃
┃                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

### Phase Overview (Collapsed by Default)

Only show full phase list if there are 3+ phases:

```
All Phases:
──────────────────────────────────────────────────────────────
Phase 1: Auth           ✓ verified
Phase 2: Core Features  ▶ current (62%)
Phase 3: Settings       ○ pending
Phase 4: Payments       ○ pending
──────────────────────────────────────────────────────────────
Overall: [████████▏░░░░░░░░░░░] 41%
```

### Active Learnings Section

If `.opti-gsd/learnings.md` exists and has content, show:

```
Active Learnings:
──────────────────────────────────────────────────────────────
{count} learnings | Recent: {most recent learning summary}

Latest learning ({date}):
  {CATEGORY}: {brief description}
  Fix: {what to do}
──────────────────────────────────────────────────────────────
```

**Learnings Display Rules:**
- Only show learnings section if `.opti-gsd/learnings.md` exists and has content
- Show "No learnings yet" if file is empty or doesn't exist
- Count learnings by parsing `## {CATEGORY}:` headers in the file
- Get most recent learning (last entry) for the Latest section

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

Determine which stage the user is at by checking:

| Stage | Check |
|-------|-------|
| **ROADMAP** | `.opti-gsd/roadmap.md` exists? |
| **PLAN** | `.opti-gsd/plans/phase-{current}/plan.json` exists? |
| **EXECUTE** | All tasks in current phase plan completed? |
| **PUSH** | Current branch pushed to remote? |
| **VERIFY** | `.opti-gsd/plans/phase-{current}/verification.md` exists? |

**Stage Symbols:**
- `✓` = completed
- `▶ HERE` = current stage (where user needs to act)
- `○` = not yet reached

## Recovery States

If loop state indicates a problem, show recovery info:

```
⚠️ Execution Interrupted
──────────────────────────────────────────────────────────────
Task 3 failed after 2 retries.

DO THIS NOW:
  /opti-gsd:recover     — Diagnose and fix the issue

Or:
  /opti-gsd:rollback 2-02  — Rollback to before Task 3
```
