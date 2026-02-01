---
description: Review phase results, provide feedback, and get targeted fixes — usable anytime after execution
---

# review [phase]

Review phase results and provide feedback for targeted refinements.

## Phase Directory Convention

**CRITICAL:** All `phase-{N}` references in this file mean zero-padded to 2 digits.
When state.json has `"phase": 1`, the directory is `.opti-gsd/plans/phase-01/` (NOT `phase-1`).
Always zero-pad: `String(N).padStart(2, '0')` → phase 1 = `phase-01`, phase 10 = `phase-10`.

## Arguments

- `phase` — Phase number to review (optional, defaults to last executed phase)

## When to Use

This command is the **standalone version** of the review checkpoints built into
`/opti-gsd:execute` (between waves) and `/opti-gsd:verify` (after results).

Use this when:
- You come back to a project after a break and want to review what was built
- You thought something was fine but now realize it needs changes
- You want another round of refinements on an already-executed phase
- You're showing the project to someone and they have feedback

You do NOT need to run this if you already provided feedback during execute or verify —
those have review built in. This is for **additional review rounds anytime**.

## Behavior

### Step 1: Load Phase Context

Read:
- `.opti-gsd/state.json` — current state
- `.opti-gsd/plans/phase-{N}/plan.json` — what was planned
- `.opti-gsd/plans/phase-{N}/summary.md` — what was executed
- `.opti-gsd/plans/phase-{N}/verification.md` — verification results (if exists)
- `.opti-gsd/plans/phase-{N}/review-fix-*.json` — previous review rounds (if any)

If phase hasn't been executed:
```
⚠️ Phase Not Executed
─────────────────────────────────────
Phase {N} has not been executed yet.

→ Run /opti-gsd:execute to execute the phase first
```

### Step 2: Present What Was Built

```markdown
## Phase {N} Review: {Title}

### What was built:
{For each task in plan.json, show user_observable}
1. {user_observable from T01}
2. {user_observable from T02}
3. {user_observable from T03}

### Execution history:
- **Tasks completed:** {count}/{total}
- **Tests added:** {test_count}
- **Commits:** {commit_count}
{If previous review rounds exist:}
- **Previous review rounds:** {round_count}
- **Fixes already applied:** {fix_count}

{If verification.md exists:}
### Last verification: {status}
{Brief summary of verification results}

{If browser MCP available:}
**I can screenshot pages or hit API endpoints to show you current state. Just ask.**

### What would you like to change?
Describe any issues, or type "looks good" if satisfied.
```

### Step 2b: Load Plan Context for Awareness

Before processing any feedback, load the full plan context so you can tell
the user when something isn't built yet because it's planned for later:

1. Read `.opti-gsd/roadmap.md` — get ALL phases and their descriptions/goals
2. Read `.opti-gsd/plans/phase-{N}/plan.json` — current phase tasks
3. Read remaining phase descriptions from roadmap for phases {N+1}, {N+2}, etc.
4. If `.opti-gsd/stories/` exists, load stories to understand acceptance criteria

Build a **context map** (in memory):

```
Phase {N} (CURRENT): {goal} — tasks: [{T01 title}, {T02 title}, ...]
Phase {N+1} (NEXT): {goal} — not yet planned
Phase {N+2} (FUTURE): {goal} — not yet planned
...
Stories: [US001: {title}, US003: {title}, ...]
Features (backlog): [F001: {title}, F003: {title}, ...]
```

This context map is used in Step 3 to detect when feedback is about future work or unplanned features.

### Step 3: Collect and Categorize Feedback (Plan-Aware)

Accept free-form user feedback. For EACH item, check against the context map:

**First: Is this about something in the CURRENT phase?**
- Check if the feedback relates to a task in plan.json for phase {N}
- If yes → categorize normally and create fix task

**Second: Is this about something in a FUTURE phase?**
- Check if the feedback relates to goals/descriptions of phases {N+1}, {N+2}, etc.
- If yes → tell the user it's coming later, don't create a fix task

**Third: Is this about something NOT planned anywhere?**
- Check roadmap, stories, and features backlog
- If not found → offer to add it as a feature or insert a phase

Categorize each item:

| Category | Description | Example |
|----------|-------------|---------|
| **wrong_behavior** | Works but does the wrong thing | "Error message just says 'Error'" |
| **missing_this_phase** | Expected in this phase but not present | "No forgot password link" |
| **visual** | Looks wrong | "Form should be centered" |
| **edge_case** | Scenario not handled | "What if user enters no email?" |
| **scope_change** | User changed requirements | "Actually I want OAuth, not email login" |
| **performance** | Too slow or resource-heavy | "Search takes 3 seconds" |
| **planned_later** | This is in a future phase | "Search doesn't work" (but search is Phase 4) |
| **not_planned** | This isn't in any phase or backlog | "I want dark mode" |

Present categorization with plan awareness:

```markdown
## Feedback Analysis

### Fixable now (Phase {N}):
| # | Issue | Category | Affected Task |
|---|-------|----------|---------------|
| 1 | Generic error messages | wrong_behavior | T02: Login page |
| 2 | Form not centered | visual | T02: Login page |

### Planned for later:
| # | Issue | Planned In | Phase Goal |
|---|-------|-----------|------------|
| 3 | "Search doesn't work" | Phase 4: Search & Discovery | Full-text search with filters |
| 4 | "No user profiles" | Phase 3: User Management | Profile pages with settings |

💡 These are coming in future phases. Want to:
→ Keep as planned — No action needed
→ Prioritize — Move to current phase (/opti-gsd:insert-phase or update plan)
→ Adjust scope — Modify the future phase description

### Not currently planned:
| # | Issue | Suggestion |
|---|-------|-----------|
| 5 | "I want dark mode" | Not in any phase or backlog |

💡 Options:
→ /opti-gsd:add-feature "Dark mode theme support" — Capture for future
→ /opti-gsd:add-phase — Add as a new phase at end of roadmap
→ /opti-gsd:insert-phase {N+1} — Insert as the next phase (urgent)

Does this look right? Adjust categories or confirm to proceed with fixes.
```

**Scope change handling:**
If any item is categorized as `scope_change`:
```markdown
⚠️ Scope Change Detected

Item {N} changes the original requirements. This may affect other phases.

Options:
A) Apply as a refinement to this phase only
B) Update requirements and re-plan affected phases
C) Capture as a new feature for a future phase (/opti-gsd:add-feature)

Which approach?
```

### Step 4: Generate Review Fix Plan

Create `.opti-gsd/plans/phase-{N}/review-fix-{round}.json`:

```json
{
  "type": "review",
  "phase": "{N}",
  "round": "{round_number}",
  "source": "user_review",
  "feedback_items": "{count}",
  "waves": [
    {
      "wave": 1,
      "parallel": true,
      "tasks": [
        {
          "id": "R{round}-01",
          "title": "{fix description}",
          "source": "user_feedback #{item_number}",
          "category": "{category}",
          "files": ["{affected files}"],
          "test_required": "{true if behavior change, false if visual only}",
          "action": "{specific fix instructions}",
          "user_observable": "{what user will see after fix}",
          "verify": "{how to verify}",
          "done": "{completion criteria}"
        }
      ]
    }
  ]
}
```

### Step 5: Execute Review Fixes

```markdown
## Review Plan Ready

**Feedback items:** {count}
**Fix tasks:** {task_count}

Execute refinements now? [Y/n]
```

If confirmed, execute with SAME quality gates as normal execution:
- TDD for behavior changes (test_required: true)
- Verification-before-completion on every fix
- Atomic commit per fix: `fix({phase}-R{round}): {description}`
- Claude Code Task integration (TaskCreate/TaskUpdate for progress)

### Step 6: Present Results and Loop

```markdown
## Review Round {round} Complete

### Fixes applied:
- [x] R{round}-01: {description} (commit {hash})
- [x] R{round}-02: {description} (commit {hash})

### Updated observables:
{Re-list user_observable with fixes noted}

**How does this look?**
→ "looks good" — Done with review
→ More feedback — Another round
→ "verify" — Run full verification
```

Loop until user is satisfied.

### Step 7: Update State

After user approves, update state.json:

```json
{
  "phases": {
    "{N}": {
      "review": {
        "rounds": "{total_rounds}",
        "total_fixes": "{total_fix_count}",
        "last_reviewed": "{timestamp}"
      }
    }
  }
}
```

Commit review artifacts:
```bash
git add .opti-gsd/plans/phase-{N}/review-fix-*.json
git commit -m "docs({phase}): user review round {round} - {fix_count} refinements"
```

### Step 8: Suggest Next Action

```markdown
**Next steps:**
→ /opti-gsd:review {N}           — Review again anytime
→ /opti-gsd:verify {N}           — Run automated verification
→ /opti-gsd:plan-phase {N+1}     — Move to next phase
→ /opti-gsd:push                 — Push for preview deployment
```

---

## Context Budget

- Loading: ~5%
- Categorization: ~3%
- Fix plan generation: ~2%
- Fix execution: delegated to subagents (fresh context)
- Total orchestrator: ~10%

Review is intentionally lightweight. Fixes are delegated to fresh subagents.

---

## Review vs Other Commands

| | review | plan-fix | quick |
|---|--------|---------|-------|
| **Input** | User's words | Automated verification gaps | User's words |
| **Context** | Full phase (plan, summary, tasks) | Verification.md only | None (standalone) |
| **Tracking** | Part of phase lifecycle | Part of phase lifecycle | Separate quick_tasks |
| **Quality gates** | TDD + verification | TDD + verification | TDD + verification |
| **Iterations** | Multiple rounds | Single pass | One-shot |
| **When** | Anytime after execute | After verify finds gaps | Anytime, any scope |
