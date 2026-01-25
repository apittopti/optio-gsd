# opti-gsd Workflow Flowchart

## The Complete Picture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│   ANYTIME COMMANDS (can run at any point in the workflow)                          │
│   ─────────────────────────────────────────────────────────────────────            │
│   /status      → See where you are + what to do next                               │
│   /add-feature    → Capture feature for later                                            │
│   /add-story   → Capture user request                                              │
│   /debug       → Start debugging session                                           │
│   /issues      → View/add issues                                                   │
│   /decisions   → Log architectural decisions                                       │
│   /context     → Check context usage                                               │
│   /help        → Show commands                                                     │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │   START HERE    │
                              └────────┬────────┘
                                       │
                                       ▼
                    ┌──────────────────────────────────────┐
                    │         Is project initialized?       │
                    │            (.opti-gsd/ exists?)            │
                    └──────────────────┬───────────────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     │ NO                                │ YES
                     ▼                                   ▼
        ┌────────────────────────┐         ┌────────────────────────┐
        │   New or Existing?     │         │    Has roadmap.md?     │
        └───────────┬────────────┘         └───────────┬────────────┘
                    │                                  │
         ┌──────────┴──────────┐            ┌─────────┴─────────┐
         │ NEW        EXISTING │            │ NO              YES│
         ▼                     ▼            ▼                    │
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│ /new-project    │  │ /init           │  │ /roadmap        │    │
│                 │  │                 │  │ Define phases   │    │
│ Guided setup    │  │ Initialize in   │  └────────┬────────┘    │
│ wizard          │  │ existing code   │           │             │
└────────┬────────┘  └────────┬────────┘           │             │
         │                    │                    │             │
         └────────────────────┴────────────────────┴─────────────┘
                                       │
                                       ▼
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                                   ┃
┃                   THE MAIN LOOP (repeat per phase) - NOT STRICTLY LINEAR          ┃
┃                                                                                   ┃
┃  ┌──────────┐     ┌──────────┐     ┌──────────────────────────┐     ┌──────────┐ ┃
┃  │          │     │          │     │                          │     │          │ ┃
┃  │  PLAN    │────►│ EXECUTE  │────►│  PUSH (optional)         │────►│  VERIFY  │ ┃
┃  │          │     │          │     │                          │     │          │ ┃
┃  └──────────┘     └─────┬────┘     └──────────────────────────┘     └────┬─────┘ ┃
┃       │                 │                    │                           │       ┃
┃       │                 │                    │ skip                      │       ┃
┃       │                 │                    ▼                           │       ┃
┃       │                 │          ┌──────────────────┐                  │       ┃
┃       │                 └─────────►│ VERIFY (local)   │◄─────────────────┘       ┃
┃       │                            └────────┬─────────┘                          ┃
┃       │                                     │                                    ┃
┃       │                           ┌─────────┴─────────┐                          ┃
┃       │                           │ PASS         GAPS │                          ┃
┃       │                           ▼                   ▼                          ┃
┃       │                    ┌────────────┐      ┌────────────┐                    ┃
┃       │                    │ NEXT PHASE │      │ FIX + REDO │──► back to EXECUTE ┃
┃       │                    └─────┬──────┘      └────────────┘                    ┃
┃       │                          │                                               ┃
┃       └──────────────────────────┘                                               ┃
┃                                                                                   ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
                                       │
                                       │ (all phases done)
                                       ▼
                         ┌──────────────────────────┐
                         │   /complete-milestone    │
                         │   Creates PR, tags       │
                         └──────────────────────────┘
```

---

---

## Non-Linear Paths

The workflow is **not strictly sequential**. Here are the branch points:

```
SKIP PATHS (optional steps):
────────────────────────────────────────────────────────────────

  • PUSH is optional
    EXECUTE ──┬──► PUSH ──► VERIFY (with preview)
              │
              └──► VERIFY (local, no deploy)

  • DISCUSS/RESEARCH before PLAN is optional
    ROADMAP ──┬──► DISCUSS ──► PLAN
              │
              └──► PLAN (skip discussion)


BACKWARD PATHS (rework):
────────────────────────────────────────────────────────────────

  • VERIFY finds gaps → back to EXECUTE
    VERIFY ──► gaps found ──► /plan-fix ──► EXECUTE ──► VERIFY

  • EXECUTE fails → choose recovery
    EXECUTE ──► failure ──┬──► /recover (diagnose + retry)
                          │
                          ├──► /rollback (undo to checkpoint)
                          │
                          └──► revise PLAN (if fundamentally wrong)

  • VERIFY fundamentally broken → back to PLAN
    VERIFY ──► major issues ──► /rollback ──► PLAN (rethink approach)


REPEAT PATHS (iterate):
────────────────────────────────────────────────────────────────

  • Phase complete → next phase
    VERIFY ──► pass ──► PLAN (next phase) ──► EXECUTE ──► ...

  • All phases done → complete milestone
    VERIFY (last) ──► pass ──► /complete-milestone
```

---

## Detailed Phase Loop

```
                              ┌─────────────────────┐
                              │  Current Phase: N   │
                              └──────────┬──────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
                    ▼                                         │
          ┌─────────────────┐                                │
          │   OPTIONAL:     │                                │
          │  /discuss-phase │  ◄── Capture decisions first   │
          │  /research      │  ◄── Research best practices   │
          └────────┬────────┘                                │
                   │                                         │
                   ▼                                         │
┌──────────────────────────────────────┐                     │
│             /plan-phase N            │                     │
├──────────────────────────────────────┤                     │
│ • Reads PROJECT.md, roadmap.md       │                     │
│ • Auto-detects test requirements     │                     │
│ • Creates wave-based task plan       │                     │
│ • Assigns skills per task            │                     │
│                                      │                     │
│ Output: .opti-gsd/plans/phase-N/plan.json   │                     │
└──────────────────┬───────────────────┘                     │
                   │                                         │
                   ▼                                         │
┌──────────────────────────────────────┐                     │
│              /execute                │                     │
├──────────────────────────────────────┤                     │
│                                      │                     │
│  ┌────────────────────────────────┐  │                     │
│  │  FOR each wave (parallel):     │  │                     │
│  │    FOR each task:              │  │                     │
│  │      Spawn subagent            │  │                     │
│  │      ┌─────────────────────┐   │  │                     │
│  │      │ IF test_required:   │   │  │                     │
│  │      │   RED → GREEN →     │   │  │                     │
│  │      │   REFACTOR          │   │  │                     │
│  │      │ (TDD inside agent)  │   │  │                     │
│  │      └─────────────────────┘   │  │                     │
│  │      Auto-commit on complete   │  │                     │
│  │      Create checkpoint tag     │  │                     │
│  └────────────────────────────────┘  │                     │
│                                      │                     │
└──────────────────┬───────────────────┘                     │
                   │                                         │
         ┌─────────┴─────────┐                               │
         │                   │                               │
         ▼                   ▼                               │
   ┌──────────┐        ┌──────────────┐                      │
   │ SUCCESS  │        │    FAILED    │                      │
   └────┬─────┘        └──────┬───────┘                      │
        │                     │                              │
        │                     ▼                              │
        │         ┌────────────────────┐                     │
        │         │  RECOVERY OPTIONS  │                     │
        │         ├────────────────────┤                     │
        │         │ /recover  ← diagnose│                    │
        │         │ /rollback ← undo   │                     │
        │         └────────────────────┘                     │
        │                                                    │
        ▼                                                    │
┌──────────────────────────────────────┐                     │
│               /push                  │                     │
├──────────────────────────────────────┤                     │
│ • Pushes branch to remote            │                     │
│ • Triggers preview deployment        │                     │
│ • Stores preview URL in state.json     │                     │
└──────────────────┬───────────────────┘                     │
                   │                                         │
                   ▼                                         │
┌──────────────────────────────────────┐                     │
│             /verify N                │                     │
├──────────────────────────────────────┤                     │
│ • Spawns verifier agent              │                     │
│ • Three-level artifact check:        │                     │
│   L1: Exists                         │                     │
│   L2: Substantive (not stub)         │                     │
│   L3: Wired (imported & used)        │                     │
│ • Integration checks                 │                     │
│ • CI validation                      │                     │
│ • Browser verification (if web)      │                     │
│                                      │                     │
│ Output: verification.md              │                     │
└──────────────────┬───────────────────┘                     │
                   │                                         │
         ┌─────────┴─────────┐                               │
         │                   │                               │
         ▼                   ▼                               │
   ┌──────────┐        ┌──────────────┐                      │
   │ VERIFIED │        │  GAPS FOUND  │                      │
   └────┬─────┘        └──────┬───────┘                      │
        │                     │                              │
        │                     ▼                              │
        │         ┌────────────────────┐                     │
        │         │    /plan-fix N     │                     │
        │         │ Generate fix tasks │                     │
        │         └─────────┬──────────┘                     │
        │                   │                                │
        │                   ▼                                │
        │         ┌────────────────────┐                     │
        │         │     /execute       │                     │
        │         │   (run fix plan)   │                     │
        │         └─────────┬──────────┘                     │
        │                   │                                │
        │                   ▼                                │
        │         ┌────────────────────┐                     │
        │         │     /verify N      │ ◄── re-verify       │
        │         └─────────┬──────────┘                     │
        │                   │                                │
        └───────────────────┤                                │
                            │                                │
                            ▼                                │
                  ┌───────────────────┐                      │
                  │  More phases?     │                      │
                  └─────────┬─────────┘                      │
                            │                                │
              ┌─────────────┴─────────────┐                  │
              │ YES                    NO │                  │
              │                           │                  │
              │                           ▼                  │
              │               ┌─────────────────────┐        │
              │               │ /complete-milestone │        │
              │               │ • Creates PR        │        │
              │               │ • Tags release      │        │
              │               │ • Archives phases   │        │
              │               └─────────────────────┘        │
              │                                              │
              └──────────────────────────────────────────────┘
                            (back to loop)
```

---

## Complete Command Reference (40 commands)

### CORE WORKFLOW (5) - The essentials
```
┌────────────────┬─────────────────────────────────────────────────┐
│ Command        │ Purpose                                         │
├────────────────┼─────────────────────────────────────────────────┤
│ /roadmap       │ Define what you're building (phases)            │
│ /plan-phase    │ Generate execution plan for phase N             │
│ /execute       │ Run the plan (TDD, parallel, auto-commit)       │
│ /push          │ Push to trigger preview deployment              │
│ /verify        │ Verify everything works                         │
└────────────────┴─────────────────────────────────────────────────┘
```

### PROJECT SETUP (5)
```
┌────────────────┬─────────────────────────────────────────────────┐
│ Command        │ Purpose                                         │
├────────────────┼─────────────────────────────────────────────────┤
│ /init          │ Initialize opti-gsd in existing project         │
│ /new-project   │ Create new project with guided setup            │
│ /map-codebase  │ Analyze existing codebase structure             │
│ /ci            │ View or configure CI/CD toolchain               │
│ /migrate       │ Migrate from older opti-gsd version             │
└────────────────┴─────────────────────────────────────────────────┘
```

### PLANNING - Advanced (5)
```
┌────────────────┬─────────────────────────────────────────────────┐
│ Command        │ Purpose                                         │
├────────────────┼─────────────────────────────────────────────────┤
│ /discuss-phase │ Capture decisions before planning               │
│ /research      │ Research best practices for a topic             │
│ /add-phase     │ Add new phase to end of roadmap                 │
│ /insert-phase  │ Insert phase at specific position               │
│ /remove-phase  │ Remove a pending phase                          │
└────────────────┴─────────────────────────────────────────────────┘
```

### EXECUTION - Advanced (1)
```
┌────────────────┬─────────────────────────────────────────────────┐
│ Command        │ Purpose                                         │
├────────────────┼─────────────────────────────────────────────────┤
│ /execute-task  │ Execute single task (not whole phase)           │
└────────────────┴─────────────────────────────────────────────────┘
```

### RECOVERY (3) - When things go wrong
```
┌────────────────┬─────────────────────────────────────────────────┐
│ Command        │ Purpose                                         │
├────────────────┼─────────────────────────────────────────────────┤
│ /recover       │ Diagnose and fix interrupted execution          │
│ /rollback      │ Undo to a previous checkpoint                   │
│ /plan-fix      │ Generate fix plan for verification gaps         │
└────────────────┴─────────────────────────────────────────────────┘
```

### MILESTONES (2)
```
┌────────────────────┬─────────────────────────────────────────────┐
│ Command            │ Purpose                                     │
├────────────────────┼─────────────────────────────────────────────┤
│ /start-milestone   │ Create milestone branch (before work)       │
│ /complete-milestone│ Create PR, tag release (after all phases)   │
└────────────────────┴─────────────────────────────────────────────┘
```

### SESSION MANAGEMENT (4)
```
┌────────────────┬─────────────────────────────────────────────────┐
│ Command        │ Purpose                                         │
├────────────────┼─────────────────────────────────────────────────┤
│ /status        │ WHERE AM I? WHAT DO I DO NEXT?                  │
│ /pause         │ Pause work with context save                    │
│ /resume        │ Resume from last session                        │
│ /help          │ Show commands                                   │
└────────────────┴─────────────────────────────────────────────────┘
```

### CONTEXT MANAGEMENT (3)
```
┌────────────────┬─────────────────────────────────────────────────┐
│ Command        │ Purpose                                         │
├────────────────┼─────────────────────────────────────────────────┤
│ /context       │ Check context usage and budget                  │
│ /archive       │ Archive completed phase to save context         │
│ /compact       │ Reduce context footprint                        │
└────────────────┴─────────────────────────────────────────────────┘
```

### CAPTURE & TRACKING (7) - Anytime commands
```
┌────────────────┬─────────────────────────────────────────────────┐
│ Command        │ Purpose                                         │
├────────────────┼─────────────────────────────────────────────────┤
│ /add-feature │ Capture feature idea without interrupting       │
│ /add-story   │ Capture user request                            │
│ /features    │ View captured feature ideas                     │
│ /stories       │ View captured user stories                      │
│ /issues        │ Track and manage issues                         │
│ /decisions     │ Log architectural decisions                     │
│ /debug         │ Systematic bug investigation                    │
└────────────────┴─────────────────────────────────────────────────┘
```

### CONFIGURATION (6)
```
┌──────────────────┬───────────────────────────────────────────────┐
│ Command          │ Purpose                                       │
├──────────────────┼───────────────────────────────────────────────┤
│ /mode            │ Switch between interactive/yolo modes         │
│ /skills          │ Discover and configure Claude skills          │
│ /mcps            │ Discover and configure MCP servers            │
│ /detect-tools    │ Detect available MCP servers and plugins      │
│ /whats-new       │ Check for updates and changelog               │
│ /statusline-setup│ Configure terminal status line                │
└──────────────────┴───────────────────────────────────────────────┘
```

---

## TDD Loop (Inside Execute)

```
                    ┌─────────────────────────────────────┐
                    │   Task with test_required: true     │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
                    ┌─────────────────────────────────────┐
                    │            RED PHASE                │
                    │  ────────────────────────────────── │
                    │  • Test files: WRITE                │
                    │  • Impl files: LOCKED               │
                    │  • Goal: Write FAILING test         │
                    │  • Success: Test FAILS              │
                    └──────────────────┬──────────────────┘
                                       │
                                       ▼
                    ┌─────────────────────────────────────┐
                    │           GREEN PHASE               │
                    │  ────────────────────────────────── │
                    │  • Test files: LOCKED               │
                    │  • Impl files: WRITE                │
                    │  • Goal: Make test pass             │
                    │  • Success: Test PASSES             │
                    └──────────────────┬──────────────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         │ PASS                 FAIL │
                         ▼                           │
          ┌──────────────────────────┐               │
          │      REFACTOR PHASE      │               │
          │  ──────────────────────  │               │
          │  • Clean up code         │               │
          │  • Keep tests green      │               │
          └────────────┬─────────────┘               │
                       │                             │
                       ▼                             │
               ┌──────────────┐                      │
               │ TASK COMPLETE│                      │
               └──────────────┘                      │
                                                     │
                                    ┌────────────────┘
                                    │ (retry up to 5x)
                                    ▼
                         ┌────────────────────┐
                         │  Analyze failure   │
                         │  Fix impl, retry   │
                         └────────────────────┘
```

---

## Recovery Flows

### When Execution Fails
```
        ┌───────────────────┐
        │  /execute FAILED  │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │     /recover      │───────► Diagnose issue
        └─────────┬─────────┘         Shows:
                  │                   • Git state
                  │                   • state.json vs reality
                  │                   • Suggested fix
                  │
                  ▼
    ┌─────────────┴─────────────┐
    │                           │
    ▼                           ▼
┌──────────────┐        ┌───────────────┐
│ Fix manually │        │   /rollback   │
│ then /execute│        │   to checkpoint│
└──────────────┘        └───────────────┘
```

### When Verification Finds Gaps
```
        ┌───────────────────┐
        │  /verify → GAPS   │
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │    /plan-fix N    │───────► Generate fix tasks
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │     /execute      │───────► Run fix plan
        └─────────┬─────────┘
                  │
                  ▼
        ┌───────────────────┐
        │    /verify N      │───────► Re-verify
        └───────────────────┘
```

---

## Checkpoint System

```
Timeline of a phase execution:

    ┌───────────────────────────────────────────────────────────┐
    │                                                           │
    │  gsd/checkpoint/phase-2/pre                               │
    │           │                                               │
    │           ▼                                               │
    │      ┌─────────┐                                          │
    │      │ Task 01 │                                          │
    │      └────┬────┘                                          │
    │           │                                               │
    │  gsd/checkpoint/phase-2/T01                               │
    │           │                                               │
    │           ▼                                               │
    │      ┌─────────┐                                          │
    │      │ Task 02 │                                          │
    │      └────┬────┘                                          │
    │           │                                               │
    │  gsd/checkpoint/phase-2/T02                               │
    │           │                                               │
    │           ▼                                               │
    │      ┌─────────┐                                          │
    │      │ Task 03 │  ◄── Something breaks here               │
    │      └────┬────┘                                          │
    │           │                                               │
    │           ▼                                               │
    │  /rollback 2-03  ───► Resets to T02 checkpoint            │
    │  /rollback 2     ───► Resets to pre checkpoint            │
    │  /rollback last  ───► Resets to most recent checkpoint    │
    │                                                           │
    │  gsd/checkpoint/phase-2/post  (after all tasks)           │
    │                                                           │
    └───────────────────────────────────────────────────────────┘
```

---

---

## When Can Each Command Be Used?

```
SETUP (before workflow starts):
────────────────────────────────────────────────────────────────
  /init, /new-project, /map-codebase, /ci, /migrate


ANYTIME (run at any point):
────────────────────────────────────────────────────────────────
  /status         ← WHERE AM I?
  /help           ← Show commands
  /add-feature       ← Capture feature
  /add-story      ← Capture request
  /features          ← View features
  /stories        ← View stories
  /issues         ← Track issues
  /decisions      ← Log decisions
  /debug          ← Bug investigation
  /context        ← Check context usage
  /mode           ← Switch modes
  /pause          ← Save and pause
  /resume         ← Continue session


WORKFLOW-SPECIFIC (at certain stages):
────────────────────────────────────────────────────────────────

  At START:
    /start-milestone    ← Create milestone branch

  Before PLAN:
    /discuss-phase      ← Optional: capture decisions first
    /research           ← Optional: research best practices

  At PLAN:
    /plan-phase         ← Generate plan
    /add-phase          ← Add to roadmap
    /insert-phase       ← Insert in roadmap
    /remove-phase       ← Remove from roadmap

  At EXECUTE:
    /execute            ← Run whole phase
    /execute-task       ← Run single task

  After EXECUTE:
    /push               ← Push for preview deploy
    /verify             ← Verify (with or without push)

  After VERIFY:
    /archive            ← Archive completed phase
    /compact            ← Reduce context

  At END:
    /complete-milestone ← Create PR, finalize


RECOVERY (when things break):
────────────────────────────────────────────────────────────────
  /recover    ← After execution failure
  /rollback   ← Undo to checkpoint
  /plan-fix   ← After verification gaps
```

---

## Quick Reference

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  LOST? START HERE:                                              │
│  ─────────────────                                              │
│                                                                 │
│      /status                                                    │
│                                                                 │
│  Shows exactly where you are and what to do next.               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  THE 5-COMMAND WORKFLOW:                                        │
│  ───────────────────────                                        │
│                                                                 │
│      /roadmap → /plan-phase → /execute ─┬─► /push → /verify     │
│                      │                  │                       │
│                      │                  └─► /verify (local)     │
│                      │                           │              │
│                      └────── repeat ◄────────────┘              │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SOMETHING WENT WRONG?                                          │
│  ─────────────────────                                          │
│                                                                 │
│      /recover   ← Diagnose and fix                              │
│      /rollback  ← Undo to checkpoint                            │
│      /plan-fix  ← Fix verification gaps                         │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ANYTIME:  /status /help /add-feature /debug /issues /context      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
