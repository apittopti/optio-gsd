# Setup CLAUDE.md

Add opti-gsd workflow instructions to the project's CLAUDE.md file.

## Step 1: Check Current State

Check if CLAUDE.md exists and if it already has opti-gsd section:

```bash
# Check if file exists
if [ -f "CLAUDE.md" ]; then
  # Check if opti-gsd section exists
  grep -q "opti-gsd Workflow" CLAUDE.md && echo "exists" || echo "missing"
else
  echo "no_file"
fi
```

## Step 2: Handle Each Case

### Case A: CLAUDE.md doesn't exist

Create it with full instructions:

```markdown
# Project Instructions

This project uses **opti-gsd** for spec-driven development workflow.

## Workflow Requirements

**IMPORTANT:** All development work must follow the opti-gsd workflow:

1. **Never commit directly to master/main** — These are protected branches
2. **Always use milestone branches** — Run `/opti-gsd:milestone start [name]` first
3. **Check status before starting** — Run `/opti-gsd:status` to understand current state
4. **Follow the phase workflow** — Plan -> Execute -> Verify

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/opti-gsd:status` | Check current state and next action |
| `/opti-gsd:milestone start [name]` | Start a new milestone branch |
| `/opti-gsd:roadmap` | View or create project roadmap |
| `/opti-gsd:plan [N]` | Plan a phase |
| `/opti-gsd:execute` | Execute current phase |
| `/opti-gsd:verify` | Verify phase completion |

## Protected Branches

**NEVER push or commit directly to:**
- `master`
- `main`
- `production`
- `prod`

All changes to these branches MUST go through a pull request.

## Before Any Code Changes

Ask yourself:
1. Is there an active milestone? (`/opti-gsd:status`)
2. Am I on a milestone branch? (not master/main)
3. Is there a plan for this work? (`/opti-gsd:plan`)

If any answer is "no", set up the workflow first.
```

### Case B: CLAUDE.md exists but missing opti-gsd section

Append to the file:

```markdown

---

## opti-gsd Workflow

This project uses **opti-gsd** for spec-driven development.

**Before any code changes:**
1. Check status: `/opti-gsd:status`
2. Ensure on milestone branch (never master/main)
3. Follow: Plan -> Execute -> Verify

**Protected branches:** master, main, production, prod — PR only!

**Key commands:** `/opti-gsd:status`, `/opti-gsd:milestone start`, `/opti-gsd:roadmap`, `/opti-gsd:plan`, `/opti-gsd:execute`, `/opti-gsd:verify`
```

### Case C: opti-gsd section already exists

```
CLAUDE.md already has opti-gsd workflow instructions.
No changes needed.
```

## Step 3: Commit

```bash
git add CLAUDE.md
git commit -m "docs: add opti-gsd workflow instructions to CLAUDE.md

Co-Authored-By: Claude <noreply@anthropic.com>"
```

## Step 4: Report

```
CLAUDE.md Updated
-------------------------------------------------------------
Added opti-gsd workflow instructions to CLAUDE.md.

Claude will now consider the opti-gsd workflow on every prompt.

Key rules added:
- Never commit to master/main directly
- Always use milestone branches
- Follow Plan -> Execute -> Verify workflow
```

## Context Budget

Minimal: ~5%
