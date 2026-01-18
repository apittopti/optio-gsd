# /opti-gsd:debug [issue-id]

Start or resume a systematic debugging session.

## Arguments

- `issue-id` — Optional. Resume existing debug session (e.g., ISS-001)

## Behavior

### Step 1: Check for Existing Session

If `issue-id` provided:
- Load `.gsd/debug/{issue-id}.md`
- Resume from last state

If no `issue-id`:
- Create new debug session

### Step 2: Gather Symptoms (New Session)

Ask user for symptoms:

> "What's the issue? Please describe:"
> 1. What happened? (actual behavior)
> 2. What should happen? (expected behavior)
> 3. When did it start? (recent changes?)
> 4. Can you reproduce it? (steps)
> 5. Any error messages?

### Step 3: Create Debug Session File

Write `.gsd/debug/{issue-id}.md`:

```markdown
# Debug Session: {issue-id}

## Symptoms (IMMUTABLE)
- **Actual:** {what happens}
- **Expected:** {what should happen}
- **Reproducible:** {yes/no/intermittent}
- **Error:** {error message if any}

## Hypotheses
- [ ] H1: {hypothesis} — UNTESTED
- [ ] H2: {hypothesis} — UNTESTED
- [ ] H3: {hypothesis} — UNTESTED

## Evidence Log (APPEND-ONLY)
### {timestamp}
- **Tested:** {what}
- **Result:** {finding}
- **Eliminates:** {hypothesis if any}

## Current Focus
{what we're investigating now}

## Root Cause
(not yet identified)

## Fix Applied
(none yet)
```

### Step 4: Spawn Debugger

Spawn opti-gsd-debugger agent with:
- Symptoms from session file
- Relevant codebase files
- Previous investigation state (if resuming)

Agent modes:
- `find_and_fix` — diagnose and repair (default)
- `find_root_cause_only` — diagnose only, return to orchestrator

### Step 5: Handle Result

**ROOT CAUSE IDENTIFIED:**
```markdown
## Root Cause Found

**Issue:** {description}
**Cause:** {technical explanation}
**Location:** {file:line}
**Evidence:** {what proved this}

**Fix Applied:**
{description of fix}

**Prevention:**
{how to prevent similar issues}
```

Update ISSUES.md if this was a tracked issue.

**INVESTIGATION BLOCKED:**
```markdown
## Investigation Blocked

**Symptoms Verified:** {list}
**Eliminated:** {hypotheses ruled out}
**Remaining:** {hypotheses still possible}

**Blocker:** {what's preventing progress}
**Needs:** {what's required to continue}
```

### Step 6: Update Issue Tracking

If issue was from ISSUES.md:

```markdown
### ISS-{id}
- **Severity:** {severity}
- **Found:** Phase {N}, Task {M}
- **Resolved:** Phase {X}, Debug session
- **Description:** {original description}
- **Root Cause:** {cause}
- **Fix:** {fix description}
```

### Step 7: Commit

```bash
git add .gsd/debug/{issue-id}.md
git add .gsd/ISSUES.md  # if updated
git commit -m "fix: resolve {issue-id}

Root cause: {brief cause}
Fix: {brief fix}"
```

---

## Context Survival

Debug sessions persist in `.gsd/debug/` so they can survive context resets.

When resuming:
1. Load session file
2. Skip eliminated hypotheses
3. Continue from current focus
4. Append new evidence

---

## Context Budget

- Session management: ~5%
- Debugger agent: spawned with fresh context
