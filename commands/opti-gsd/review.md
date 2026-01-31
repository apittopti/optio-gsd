---
description: Review phase results, provide feedback, and get targeted fixes — usable anytime after execution
---

# review [phase]

Review phase results and provide feedback for targeted refinements.

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

### Step 3: Collect and Categorize Feedback

Accept free-form user feedback. Categorize each item:

| Category | Description | Example |
|----------|-------------|---------|
| **wrong_behavior** | Works but does the wrong thing | "Error message just says 'Error'" |
| **missing** | Expected feature not present | "No forgot password link" |
| **visual** | Looks wrong | "Form should be centered" |
| **edge_case** | Scenario not handled | "What if user enters no email?" |
| **scope_change** | User changed requirements | "Actually I want OAuth, not email login" |
| **performance** | Too slow or resource-heavy | "Search takes 3 seconds" |

Present categorization:
```markdown
## Feedback Analysis

| # | Issue | Category | Affected |
|---|-------|----------|----------|
| 1 | Generic error messages | wrong_behavior | T02: Login page |
| 2 | No forgot password link | missing | T02: Login page |
| 3 | Form not centered | visual | T02: Login page |

Does this look right? Adjust or confirm.
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
