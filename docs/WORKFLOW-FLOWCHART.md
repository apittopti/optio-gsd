# opti-gsd Workflow Flowchart

## The Complete Picture

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                                                                     │
│   ANYTIME COMMANDS (can run at any point in the workflow)                          │
│   ─────────────────────────────────────────────────────────────────────            │
│   /status           → See where you are + what to do next                          │
│   /track feature    → Capture feature for later                                    │
│   /track story      → Capture user request                                         │
│   /track issue      → View/add issues                                              │
│   /track decision   → Log architectural decisions                                  │
│   /debug            → Start debugging session                                      │
│   /session context  → Check context usage                                          │
│   /help             → Show commands                                                │
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
│ /init new       │  │ /init           │  │ /roadmap        │    │
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
                         │  /milestone complete     │
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
    VERIFY ──► gaps found ──►  /plan fix ──► EXECUTE ──► VERIFY

  • EXECUTE fails → choose recovery
    EXECUTE ──► failure ──┬──► /debug recover (diagnose + retry)
                          │
                          ├──► /session rollback (undo to checkpoint)
                          │
                          └──► revise PLAN (if fundamentally wrong)

  • VERIFY fundamentally broken → back to PLAN
    VERIFY ──► major issues ──► /session rollback ──► PLAN (rethink approach)


REPEAT PATHS (iterate):
────────────────────────────────────────────────────────────────

  • Phase complete → next phase
    VERIFY ──► pass ──► PLAN (next phase) ──► EXECUTE ──► ...

  • All phases done → complete milestone
    VERIFY (last) ──► pass ──► /milestone complete
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
          │  /plan discuss  │  ◄── Capture decisions first   │
          │  /plan research │  ◄── Research best practices   │
          └────────┬────────┘                                │
                   │                                         │
                   ▼                                         │
┌──────────────────────────────────────┐                     │
│               /plan N                │                     │
├──────────────────────────────────────┤                     │
│ • Reads project.md, roadmap.md       │                     │
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
        │         │ /debug recover    ← diagnose│              │
        │         │ /session rollback ← undo   │              │
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
        │         │    /plan fix N     │                     │
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
              │               │ /milestone complete │        │
              │               │ • Creates PR        │        │
              │               │ • Tags release      │        │
              │               │ • Archives phases   │        │
              │               └─────────────────────┘        │
              │                                              │
              └──────────────────────────────────────────────┘
                            (back to loop)
```

---

## Complete Skill Reference (15 skills)

### CORE WORKFLOW (6)
```
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ Skill                    │ Purpose                                          │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ /opti-gsd:status         │ WHERE AM I? WHAT DO I DO NEXT?                   │
│ /opti-gsd:roadmap        │ Define what you're building (phases)             │
│   roadmap add            │   Add new phase to end of roadmap                │
│   roadmap insert N       │   Insert phase at specific position              │
│   roadmap remove N       │   Remove a pending phase                         │
│ /opti-gsd:plan           │ Generate execution plan for phase N              │
│   plan fix               │   Generate fix plan for verification gaps        │
│   plan discuss N         │   Capture decisions before planning              │
│   plan research [topic]  │   Research best practices for a topic            │
│ /opti-gsd:execute        │ Run the plan (TDD, parallel, auto-commit)        │
│   execute task N         │   Execute single task (not whole phase)          │
│   execute quick [desc]   │   Fast-track ad-hoc tasks                        │
│ /opti-gsd:verify         │ Verify everything works                          │
│ /opti-gsd:push           │ Push to trigger preview deployment               │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

### PROJECT MANAGEMENT (4)
```
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ Skill                    │ Purpose                                          │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ /opti-gsd:init           │ Initialize opti-gsd in existing project          │
│   init new               │   Create new project with guided setup           │
│   init claude-md         │   Add opti-gsd instructions to CLAUDE.md        │
│   init migrate           │   Migrate from older opti-gsd version            │
│ /opti-gsd:milestone      │ Manage milestone lifecycle                       │
│   milestone start [name] │   Create milestone branch (before work)          │
│   milestone complete     │   Create PR, tag release (after all phases)      │
│ /opti-gsd:track *        │ Capture and manage project artifacts             │
│   track feature          │   Capture feature idea                           │
│   track story            │   Capture user request                           │
│   track issue            │   Log a bug or problem                           │
│   track decision         │   Log architectural decision                     │
│   track list             │   View all tracked items                         │
│   track view [ID]        │   View specific item details                     │
│   track resolve [ID]     │   Resolve an open item                           │
│ /opti-gsd:debug *        │ Systematic bug investigation                     │
│   debug recover          │   Diagnose & fix interrupted execution           │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

### SESSION & CONFIGURATION (5)
```
┌──────────────────────────┬──────────────────────────────────────────────────┐
│ Skill                    │ Purpose                                          │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ /opti-gsd:session        │ Session lifecycle management                     │
│   session pause          │   Pause work with context save                   │
│   session resume         │   Resume from last session                       │
│   session rollback       │   Undo to a previous checkpoint                  │
│   session archive        │   Archive completed phase to save context        │
│   session context        │   Check context usage and budget                 │
│   session compact        │   Reduce context footprint                       │
│ /opti-gsd:tools          │ Tool and CI/CD discovery & configuration         │
│   tools detect           │   Detect available MCP servers and plugins       │
│   tools configure        │   Configure a specific tool                      │
│   tools usage            │   View tool usage statistics                     │
│   tools ci               │   View or configure CI/CD toolchain              │
│ /opti-gsd:codebase       │ Analyze existing codebase structure              │
│ /opti-gsd:help *         │ Show commands and help                           │
│   help advanced          │   Advanced usage guide                           │
│   help whats-new         │   Check for updates and changelog                │
│   help mode              │   Switch between interactive/yolo modes          │
│ /opti-gsd:config         │ Terminal configuration                           │
│   config statusline      │   Configure terminal status line                 │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

*Skills marked with \* support auto-invocation by Claude.*

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
        │  /debug recover   │───────► Diagnose issue
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
│ Fix manually │        │ /session      │
│ then /execute│        │  rollback     │
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
        │    /plan fix N    │───────► Generate fix tasks
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
    │  /session rollback 2-03  ───► Resets to T02 checkpoint     │
    │  /session rollback 2     ───► Resets to pre checkpoint    │
    │  /session rollback last  ───► Resets to most recent       │
    │                                                           │
    │  gsd/checkpoint/phase-2/post  (after all tasks)           │
    │                                                           │
    └───────────────────────────────────────────────────────────┘
```

---

---

## When Can Each Skill Be Used?

```
SETUP (before workflow starts):
────────────────────────────────────────────────────────────────
  /init, /init new, /codebase, /tools ci, /init migrate


ANYTIME (run at any point):
────────────────────────────────────────────────────────────────
  /status              ← WHERE AM I?
  /help                ← Show commands
  /track feature       ← Capture feature
  /track story         ← Capture request
  /track list          ← View all tracked items
  /track issue         ← Track issues
  /track decision      ← Log decisions
  /debug               ← Bug investigation
  /session context     ← Check context usage
  /help mode           ← Switch modes
  /session pause       ← Save and pause
  /session resume      ← Continue session


WORKFLOW-SPECIFIC (at certain stages):
────────────────────────────────────────────────────────────────

  At START:
    /milestone start    ← Create milestone branch

  Before PLAN:
    /plan discuss       ← Optional: capture decisions first
    /plan research      ← Optional: research best practices

  At PLAN:
    /plan               ← Generate plan
    /roadmap add        ← Add to roadmap
    /roadmap insert     ← Insert in roadmap
    /roadmap remove     ← Remove from roadmap

  At EXECUTE:
    /execute            ← Run whole phase
    /execute task       ← Run single task
    /execute quick      ← Fast-track ad-hoc task

  After EXECUTE:
    /push               ← Push for preview deploy
    /verify             ← Verify (with or without push)

  After VERIFY:
    /session archive    ← Archive completed phase
    /session compact    ← Reduce context

  At END:
    /milestone complete ← Create PR, finalize


RECOVERY (when things break):
────────────────────────────────────────────────────────────────
  /debug recover       ← After execution failure
  /session rollback    ← Undo to checkpoint
  /plan fix            ← After verification gaps
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
│  THE CORE WORKFLOW:                                             │
│  ───────────────────────                                        │
│                                                                 │
│      /roadmap → /plan → /execute ─┬─► /push → /verify           │
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
│      /debug recover      ← Diagnose and fix                     │
│      /session rollback   ← Undo to checkpoint                   │
│      /plan fix           ← Fix verification gaps                │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ANYTIME:  /status /help /track feature /debug /track issue        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```
