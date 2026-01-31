# opti-gsd v3.0 Integration Plan — Specific File Changes

## Current State Assessment

### What We Already Have That's Strong

**Already better than Superpowers:**
- Goal-backward planning in `opti-gsd-planner.md` (they don't have this)
- Wave-based parallel execution in `execute.md` (they do sequential or manual parallel)
- Claude Code Task integration (TaskCreate/TaskUpdate visual progress)
- Issue/Story/Feature tracking system (they have nothing like this)
- Plan-checker validation before execution (their plans go straight to execution)
- Integration-checker for cross-component wiring (unique to us)
- 4-level artifact verification L1-L4 (they only have basic verification)
- Debt tracking with balance reporting (unique to us)
- Story completeness gate with deferral pattern detection (unique to us)
- Recovery/rollback with checkpoint system (they have nothing)

**Already have TDD — but needs enforcement teeth:**
- `opti-gsd-executor.md` already has RED-GREEN-REFACTOR loop
- Already has file permission enforcement (test files locked during GREEN)
- Already has max 5 attempts
- **Gap:** No "delete code written before tests" enforcement
- **Gap:** No explicit "watch it fail for the RIGHT reason" step
- **Gap:** No red-flag detection ("I'll test after implementation")

**Already have verification — but not evidence-based:**
- `opti-gsd-verifier.md` has 10-stage verification
- Has CI checks, artifact levels, story completeness, debt balance
- **Gap:** Doesn't require FRESH test runs as evidence
- **Gap:** Allows claims without proof ("should work")
- **Gap:** No banned-phrases enforcement

---

## Phase 1: Core Quality Revolution (v3.0.0)

### Change 1: Two-Stage Code Review in Executor

**Files to modify:**
- `agents/opti-gsd/opti-gsd-executor.md` — Add post-task review dispatch

**Current behavior:** Executor runs task → commits → moves to next task.

**New behavior:** Executor runs task → dispatches spec-compliance reviewer → dispatches code-quality reviewer → commits → moves to next.

**Specific changes to `opti-gsd-executor.md`:**

Add after the current "Per-Task Execution" section:

```markdown
## Post-Task Two-Stage Review

After each task completes but BEFORE committing:

### Stage 1: Spec Compliance Review
Dispatch a FRESH subagent as reviewer with this prompt:

"You are a SKEPTICAL spec compliance reviewer. Your job is to verify the
implementation matches the plan EXACTLY. Not more, not less.

TASK SPEC:
{paste full task from plan.json}

CHANGES MADE:
{git diff of uncommitted changes}

Review checklist:
1. Does every file listed in 'files' exist with correct changes?
2. Does the implementation match 'action' instructions precisely?
3. Is 'user_observable' actually achievable with these changes?
4. Was anything ADDED that wasn't in the spec? (over-building)
5. Was anything OMITTED that was in the spec? (under-building)

READ THE ACTUAL CODE. Do not trust the implementer's summary.

Output: PASS or FAIL with specific line-by-line findings."

If FAIL: Fix issues, re-run Stage 1 (max 2 iterations).

### Stage 2: Code Quality Review (only after Stage 1 PASS)
Dispatch a FRESH subagent as reviewer with this prompt:

"You are a code quality reviewer. Spec compliance already passed.
Focus ONLY on implementation quality.

CHANGES:
{git diff}

Review:
1. Clean code: naming, structure, readability
2. No duplication (DRY)
3. Test coverage adequate (if test_required)
4. No security issues (injection, XSS, auth bypass)
5. Error handling appropriate
6. No dead code or unused imports

Output: PASS or FAIL with specific findings."

If FAIL: Fix issues, re-run Stage 2 (max 2 iterations).

### Review Configuration
- In config.json: `"reviews": { "spec_compliance": true, "code_quality": true }`
- Quick mode: Both reviews run but single-pass (no iteration)
- Budget mode: Skip code_quality review
```

**Files to modify:**
- `commands/opti-gsd/execute.md` — Update orchestrator to expect review steps
- `.opti-gsd/config.json` — Add `reviews` configuration section

---

### Change 2: Strengthen TDD Enforcement

**Files to modify:**
- `agents/opti-gsd/opti-gsd-executor.md` — Enhance TDD section

**Current TDD section already has RED-GREEN-REFACTOR.** Add these specific enhancements:

```markdown
## TDD Red Flag Detection

Before proceeding past RED phase, check for these violations:

IMMEDIATE RESTART TRIGGERS:
- Production code exists before any test was written
- Test passes immediately without implementation (test doesn't test anything)
- Test was modified during GREEN phase (cheating)
- Phrases detected in agent output:
  - "I'll test after implementation"
  - "This is too simple to test"
  - "Let me write the code first, then add tests"
  - "Keep this as reference while writing tests"

If ANY trigger detected: DELETE the production code and restart from RED.

## Verify Failure Reason (RED Phase Enhancement)

After writing test and watching it fail, VERIFY:
1. The test FAILED (not errored — errors mean test is broken)
2. The failure message describes MISSING FUNCTIONALITY (not syntax error)
3. The test would PASS if the feature were correctly implemented

If test ERRORED instead of FAILED: Fix the test first. Errors ≠ Failures.

## GREEN Phase Lock

During GREEN phase:
- Test files are READ-ONLY (already enforced)
- Write MINIMAL code to pass — not the "complete" implementation
- YAGNI: If the test doesn't require it, don't build it
- Run ALL tests after implementation, not just the new one
```

---

### Change 3: Verification-Before-Completion Gate

**Files to modify:**
- `agents/opti-gsd/opti-gsd-executor.md` — Add completion gate
- `agents/opti-gsd/opti-gsd-verifier.md` — Add evidence requirements

**Add to executor, before marking task complete:**

```markdown
## Verification-Before-Completion Gate

BEFORE marking any task as "completed" or committing:

1. IDENTIFY the command that proves this task is done
   - Tests pass? → Run test command
   - Build works? → Run build command
   - Feature visible? → Check browser/API
   - File created? → Verify exists with content

2. RUN the command FRESH (not from cache or memory)

3. READ the FULL output — exit code, all lines, error count

4. CONFIRM output matches claim:
   - "Tests pass" → output shows "0 failures", exit code 0
   - "Build succeeds" → output shows "exit 0", no errors
   - "Bug fixed" → original symptom no longer occurs

5. ONLY THEN mark task complete and commit

BANNED PHRASES in completion claims:
- "should work" / "should be working"
- "probably passes"
- "seems to be fixed"
- "likely resolved"
- "works as expected" (without evidence)

If you cannot run verification: Mark task as NEEDS_VERIFICATION
and flag for human checkpoint.
```

**Add to verifier's artifact verification:**

```markdown
## Evidence-Based Verification

For EACH verification check, the output MUST include:

| Check | Command Run | Exit Code | Key Output | Claim Supported |
|-------|------------|-----------|------------|-----------------|
| Tests | npm test | 0 | "42 passing, 0 failing" | YES |
| Build | npm build | 0 | "Build complete" | YES |
| Lint  | npm lint  | 1 | "3 errors" | NO |

Checks without fresh command evidence are marked UNVERIFIED, not PASSED.
```

---

### Change 4: Quick Command

**New files to create:**
- `commands/opti-gsd/quick.md` — New command
- No new agent needed — uses existing executor with lightweight config

**`commands/opti-gsd/quick.md`:**

```markdown
---
name: opti-gsd:quick
description: Execute a quick task without full phase ceremony
---

# Quick Task Execution

Lightweight execution for small tasks, bug fixes, and one-off changes.
Skips research, planning, and verification ceremony but KEEPS quality gates
(TDD, two-stage review, verification-before-completion).

## Usage
/opti-gsd:quick [task description]

## Workflow

### Step 1: Understand the Task
Read the user's task description. If unclear, ask ONE clarifying question.
Do not ask multiple questions or start a design session.

### Step 2: Create Quick Plan
Create a minimal plan in memory (not persisted to plan.json):
- What files to modify
- What tests to write/update
- What the user should observe when done

### Step 3: Execute with Quality Gates
Spawn a SINGLE fresh-context subagent (opti-gsd-executor) with:
- The task description and plan
- TDD enforcement ON (if code change)
- Two-stage review ON (spec compliance + code quality)
- Verification-before-completion ON

### Step 4: Commit and Report
- Atomic commit with descriptive message
- Update state.json: log quick task in "quick_tasks" array
- Report: what changed, tests added, review results

### Step 5: Update Claude Code Tasks
- TaskCreate for the quick task
- TaskUpdate as complete when done

## What Quick Mode SKIPS
- Research phase
- Plan-checker validation
- Phase structure (no wave grouping)
- Roadmap integration
- Formal verification pass

## What Quick Mode KEEPS
- TDD (RED-GREEN-REFACTOR)
- Two-stage code review
- Verification-before-completion
- Atomic commits
- State tracking
- Claude Code Task progress

## Error Handling
If task is too complex for quick mode (touches 5+ files, requires
architecture changes, needs research), suggest:
"This task may benefit from full planning. Run /opti-gsd:plan-phase instead."

## State Tracking
Add to state.json:
```json
{
  "quick_tasks": [
    {
      "id": "Q001",
      "description": "Fix login button alignment",
      "date": "2026-01-31",
      "commit": "abc123",
      "files_changed": 2
    }
  ]
}
```

## Context Budget
Target: ~10% of main context (task delegated to subagent).
```

---

### Change 5: Config.json Schema Updates

**File to modify:** `.opti-gsd/config.json`

Add new sections:

```json
{
  "reviews": {
    "spec_compliance": true,
    "code_quality": true,
    "max_iterations": 2
  },
  "tdd": {
    "enforcement": "strict",
    "red_flag_detection": true,
    "delete_on_violation": true
  },
  "verification": {
    "evidence_required": true,
    "banned_phrases": true
  },
  "profiles": {
    "active": "balanced",
    "options": {
      "quality": {
        "reviews": { "spec_compliance": true, "code_quality": true, "max_iterations": 3 },
        "tdd": { "enforcement": "strict" },
        "model_hints": { "planning": "opus", "execution": "opus", "review": "opus" }
      },
      "balanced": {
        "reviews": { "spec_compliance": true, "code_quality": true, "max_iterations": 2 },
        "tdd": { "enforcement": "strict" },
        "model_hints": { "planning": "opus", "execution": "sonnet", "review": "sonnet" }
      },
      "budget": {
        "reviews": { "spec_compliance": true, "code_quality": false, "max_iterations": 1 },
        "tdd": { "enforcement": "standard" },
        "model_hints": { "planning": "sonnet", "execution": "haiku", "review": "haiku" }
      }
    }
  }
}
```

---

## Phase 2: Workflow Flexibility (v3.1.0)

### Change 6: Enhanced Brainstorming in discuss-phase

**Files to modify:**
- `commands/opti-gsd/discuss-phase.md` — Rewrite with Socratic method

**Current behavior:** Open-ended discussion, captures decisions.

**New behavior:** Structured one-question-at-a-time Socratic approach:

```markdown
## Socratic Discussion Protocol

1. Ask ONE question at a time (never dump a list of questions)
2. Use MULTIPLE CHOICE when possible (easier for user to respond)
3. After understanding intent, present 2-3 approaches with trade-offs
4. RECOMMEND one approach with reasoning
5. Present design in 200-300 word sections, check after each
6. Capture decisions in discussion.md

Question Flow:
1. "What's the main outcome you want from this phase?" (open)
2. "Which of these approaches fits best?" (multiple choice with trade-offs)
3. "Here's the recommended architecture. Does this look right?" (validation)
4. "Any constraints I should know about?" (open, final)
```

### Change 7: Auto-Triggering Skill Detection

**Files to modify:**
- `agents/opti-gsd/opti-gsd-executor.md` — Add skill activation rules

```markdown
## Automatic Skill Activation

Before executing each task, check for relevant skills:

| Context Detected | Skill Activated | What Happens |
|-----------------|-----------------|--------------|
| Task has test_required: true | TDD Enforcement | RED-GREEN-REFACTOR mandatory |
| Task modifies security-related files | Security Review | OWASP top 10 check |
| Task creates new component | Consumer-Required | Verify component is imported/used |
| Multiple independent failures | Parallel Dispatch | Split into parallel subagents |
| Task touches API endpoints | Integration Check | Verify callers exist |

Skills are MANDATORY, not suggestions. The executor MUST activate
relevant skills regardless of whether the user requested them.
```

### Change 8: Model Profile Command

**New file:** `commands/opti-gsd/set-profile.md`

```markdown
---
name: opti-gsd:set-profile
description: Set quality/cost profile for execution
---

# Set Execution Profile

## Usage
/opti-gsd:set-profile [quality|balanced|budget]

## Profiles

### quality
- Two-stage review with 3 iterations max
- Strict TDD enforcement
- All verification gates
- Model hints: opus for everything
- Best for: production releases, critical code

### balanced (default)
- Two-stage review with 2 iterations max
- Strict TDD enforcement
- All verification gates
- Model hints: opus for planning, sonnet for execution/review
- Best for: normal development

### budget
- Spec-compliance review only (skip code quality)
- Standard TDD (no delete-on-violation)
- Evidence-based verification
- Model hints: sonnet for planning, haiku for execution
- Best for: prototyping, exploration, non-critical changes

## Implementation
Update config.json profiles.active field.
Display confirmation with what changed.
```

### Change 9: Workflow Agent Toggles

**Files to modify:**
- `commands/opti-gsd/plan-phase.md` — Add skip flags

```markdown
## Optional Flags

- `--skip-research` — Skip phase researcher, plan from existing context
- `--skip-check` — Skip plan-checker validation
- `--quick-plan` — Both of the above (fastest planning)

Flags are applied via user instruction in the command invocation.
The orchestrator checks for these keywords and skips corresponding agents.
```

- `commands/opti-gsd/execute.md` — Add skip flags

```markdown
## Optional Flags

- `--skip-review` — Skip two-stage code review (not recommended)
- `--skip-tdd` — Skip TDD enforcement (not recommended)

These flags require explicit user confirmation:
"Are you sure? Skipping {feature} reduces output quality. Type 'confirm' to proceed."
```

---

## Phase 3: Git & Isolation (v3.2.0)

### Change 10: Git Worktree Support

**New files:**
- `commands/opti-gsd/worktree.md` — Worktree management command

```markdown
---
name: opti-gsd:worktree
description: Manage git worktrees for isolated development
---

# Git Worktree Management

## Subcommands

### /opti-gsd:worktree create [name]
Create isolated worktree for a feature/task:
1. git worktree add .worktrees/[name] -b gsd/[name]
2. Verify .worktrees/ is in .gitignore
3. Install dependencies (auto-detect: npm/pip/cargo/go)
4. Run baseline tests
5. Report location and test results

### /opti-gsd:worktree list
Show all active worktrees with branch and status.

### /opti-gsd:worktree finish [name]
Present four options:
1. Merge locally — merge to base, verify tests, delete worktree
2. Create PR — push branch, open PR with summary
3. Keep — preserve for later
4. Discard — require typed "discard" confirmation

Tests MUST pass before options 1 or 2 are available.

### /opti-gsd:worktree clean
Remove finished worktrees (merged or discarded branches).
```

### Change 11: Branch Finishing in complete-milestone

**Files to modify:**
- `commands/opti-gsd/complete-milestone.md` — Add structured finish options

```markdown
## Branch Finishing (after milestone verification passes)

Present options:
1. **Create PR** (recommended) — Push branch, create PR with:
   - Summary of all phases and tasks completed
   - Test plan with verification evidence
   - Changelog included

2. **Merge locally** — Merge to main, verify all tests, tag release

3. **Keep branch** — Preserve for further work

4. **Discard milestone** — Require typed "discard" confirmation

Gate: ALL tests and verification MUST pass before options 1 or 2.
```

### Change 12: Note Manual Changes

**New file:** `commands/opti-gsd/note-change.md`

```markdown
---
name: opti-gsd:note-change
description: Document manual changes so agents don't overwrite them
---

# Note Manual Change

Capture manual edits you've made so future agents respect them.

## Usage
/opti-gsd:note-change [description]

## What It Does
1. Detect uncommitted changes (git diff)
2. Ask user to describe what changed and why
3. Create entry in `.opti-gsd/manual-changes.md`:
   ```
   ## [Date] — [Description]
   Files: [list from git diff]
   Reason: [user's explanation]
   Constraint: [what agents must NOT do with these files]
   ```
4. Commit the note
5. Future executor agents MUST read manual-changes.md before execution

## Integration
The executor agent's pre-execution checklist adds:
"Read .opti-gsd/manual-changes.md. Respect all constraints listed."
```

---

## Phase 4: State & Maintenance (v3.3.0)

### Change 13: State Health Check

**New file:** `commands/opti-gsd/health.md`

```markdown
---
name: opti-gsd:health
description: Validate .opti-gsd directory integrity
---

# Health Check

## Checks Performed

### State Consistency
- state.json milestone matches current branch
- state.json phase matches plan files that exist
- state.json status is valid for current file state

### Roadmap Integrity
- All phases in roadmap.md have corresponding plan directories
- Phase numbering is sequential (no gaps)
- Phase numbering uses consistent format (zero-padded)

### Plan Integrity
- plan.json is valid JSON
- All task files referenced in plan exist
- No orphaned plan files (plans without roadmap entries)

### Cross-Reference Validation
- Features referenced in plans exist in features/
- Issues referenced in plans exist in issues/
- Stories referenced in roadmap exist in stories/

### Stale Detection
- Debug sessions older than 7 days flagged
- Quick tasks without commits flagged
- In-progress states with no recent activity flagged

### Phase Number Normalization
- Detect mixed formats (phase-1 vs phase-01)
- Offer to normalize to zero-padded format

## Output
Report with:
- ✅ Checks passed
- ⚠️ Warnings (non-blocking)
- ❌ Errors (need fixing)
- 🔧 Auto-fix available (offer to fix)
```

### Change 14: Audit Milestone

**New file:** `commands/opti-gsd/audit-milestone.md`

```markdown
---
name: opti-gsd:audit-milestone
description: Comprehensive definition-of-done check for milestone
---

# Audit Milestone

Run after all phases complete, before final delivery.

## Audit Steps

1. **All Phases Verified** — Every phase has verification.md with PASSED status
2. **All Stories Delivered** — Every story assigned to milestone is "delivered"
3. **All Issues Resolved** — Every issue assigned to milestone is "resolved"
4. **No Open Debt** — Debt balance is GOOD (net ≤ 0)
5. **CI Passes** — Full CI suite passes on milestone branch
6. **No Orphaned Code** — Integration checker finds no orphans
7. **Manual Changes Respected** — All manual-changes.md constraints honored
8. **Changelog Complete** — CHANGELOG exists with all phase summaries

## Output
Audit report with pass/fail per check and overall recommendation:
- READY FOR RELEASE
- NEEDS ATTENTION (warnings)
- NOT READY (blockers)

If NOT READY, suggest: /opti-gsd:plan-fix to create remediation tasks.
```

---

## Summary: What Changes per Existing File

| File | Changes |
|------|---------|
| `agents/opti-gsd/opti-gsd-executor.md` | Add two-stage review, strengthen TDD, add verification gate, add skill auto-activation, read manual-changes.md |
| `agents/opti-gsd/opti-gsd-verifier.md` | Add evidence-based verification, fresh command runs required |
| `commands/opti-gsd/execute.md` | Update to expect review steps, add --skip flags |
| `commands/opti-gsd/discuss-phase.md` | Rewrite with Socratic brainstorming protocol |
| `commands/opti-gsd/plan-phase.md` | Add --skip-research, --skip-check flags |
| `commands/opti-gsd/complete-milestone.md` | Add branch finishing workflow (merge/PR/keep/discard) |
| `commands/opti-gsd/help.md` | Add new commands to help output |

## New Files to Create

| File | Purpose |
|------|---------|
| `commands/opti-gsd/quick.md` | Quick task execution |
| `commands/opti-gsd/set-profile.md` | Quality/cost profile selection |
| `commands/opti-gsd/worktree.md` | Git worktree management |
| `commands/opti-gsd/note-change.md` | Document manual changes |
| `commands/opti-gsd/health.md` | State integrity validation |
| `commands/opti-gsd/audit-milestone.md` | Definition-of-done audit |

## Files NOT Changed (Already Good)

| File | Why No Changes |
|------|---------------|
| `opti-gsd-planner.md` | Goal-backward methodology already superior |
| `opti-gsd-plan-checker.md` | Consumer-required rule already strong |
| `opti-gsd-integration-checker.md` | Unique strength, keep as-is |
| `opti-gsd-roadmapper.md` | Anti-enterprise, user-focused — keep |
| `opti-gsd-debugger.md` | Scientific methodology already solid |
| `opti-gsd-codebase-mapper.md` | Comprehensive with debt scanning — keep |
| `opti-gsd-research-synthesizer.md` | Does its job well — keep |
| All tracking commands | Issue/story/feature system is a differentiator |
| Recovery commands | Checkpoint/rollback system is unique strength |

---

## Implementation Order (within Phase 1)

1. **Modify `opti-gsd-executor.md`** — This is the highest-impact single file change.
   Add: two-stage review, TDD strengthening, verification gate, banned phrases.

2. **Create `quick.md`** — New command, no dependencies on other changes.

3. **Modify `opti-gsd-verifier.md`** — Add evidence-based verification.

4. **Update `config.json` schema** — Add reviews, tdd, verification, profiles sections.

5. **Update `execute.md`** — Orchestrator awareness of new review steps.

6. **Update `help.md`** — Add quick command and new features.

These 6 changes constitute the v3.0.0 "Core Quality Revolution" and can be executed as a single milestone.
