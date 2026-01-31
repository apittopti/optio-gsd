---
description: Execute a quick ad-hoc task without full phase ceremony — for small fixes, tweaks, and one-off changes.
---

# quick [description]

Execute a quick ad-hoc task without requiring a roadmap, phase plan, or milestone.

## Arguments

- `description` — What to do (required). Can be a natural language description of the task.

## When to Use

- Small bug fixes that don't warrant a full phase
- Quick tweaks, config changes, or copy edits
- One-off tasks like "add a loading spinner to the submit button"
- Exploratory changes you want to try before committing to a plan
- Anything that feels like overkill for the full PLAN → EXECUTE → VERIFY cycle

## When NOT to Use

- Multi-file features → use the full workflow (/opti-gsd:roadmap → /opti-gsd:plan-phase → /opti-gsd:execute)
- Anything requiring architectural decisions → use /opti-gsd:discuss-phase first
- Bug investigation → use /opti-gsd:debug instead

## Behavior

### Step 0: Protected Branch Check

```bash
current_branch=$(git branch --show-current)
```

If on protected branch (master, main, production, prod):
```
Cannot run quick tasks on protected branches.
→ Create a milestone branch first: /opti-gsd:start-milestone [name]
```
**STOP here.**

### Step 1: Parse the Task

Read the user's description and determine:
- **What** needs to change
- **Where** in the codebase (files/components)
- **Scope check** — If this looks like it touches more than 3 files or requires architectural decisions, warn:

```
This looks bigger than a quick task ({reason}).

Options:
  1. Proceed anyway (at your own risk)
  2. /opti-gsd:add-feature — Capture it for proper planning
  3. /opti-gsd:plan-phase — Plan it properly

What would you like to do?
```

### Step 2: Load Context

Read relevant files to understand current state:
- The file(s) that need changing
- Related test files (if they exist)
- `.opti-gsd/config.json` (if exists, for project context)

### Step 3: Execute with TDD (if tests exist)

**If test files exist for the affected code:**

1. **RED** — Write or update test for the expected change
2. **GREEN** — Make the change to pass the test
3. **REFACTOR** — Clean up if needed

**If no tests exist for this area:**

Just make the change directly. Don't create test infrastructure for a quick fix.

### Step 4: Commit

```bash
git add {changed_files}
git commit -m "fix: {description}"
```

Use conventional commit prefixes:
- `fix:` for bug fixes
- `feat:` for small additions
- `chore:` for config/maintenance
- `style:` for formatting/copy changes
- `refactor:` for restructuring

### Step 5: Report

```
Quick task complete!
──────────────────────────────────────────────────
  {description}

  Files changed:
    - {file1} ({what changed})
    - {file2} ({what changed})

  Commit: {hash} {message}
──────────────────────────────────────────────────

→ /opti-gsd:status    — Check project state
→ /opti-gsd:push      — Push changes to remote
```

If the task created something that should be tracked:
```
Tip: This looks like it could be part of a bigger feature.
→ /opti-gsd:add-feature {suggested description}
```

---

## Context Budget

Minimal: ~5%
