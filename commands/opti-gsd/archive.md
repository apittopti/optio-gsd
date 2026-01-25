---
description: Archive a completed phase to save context.
---

# archive [phase]

Archive a completed phase to save context.

## Arguments

- `phase` — Phase number to archive (optional, archives all completed if omitted)

## Behavior

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

### Step 2: Identify Phases to Archive

If phase specified:
- Verify phase is complete (check roadmap.md)
- Archive that phase

If no phase:
- Find all completed, non-archived phases
- Archive all of them

### Step 3: Verify Phase Complete

Check:
- Phase marked complete in roadmap.md
- Summary exists in `.opti-gsd/plans/phase-{N}/summary.md`
- All tasks committed

If not complete:
```markdown
## Cannot Archive Phase {N}

Phase {N} is not yet complete:
- Status: {current status}
- Tasks: {completed}/{total}

Complete the phase first, or use `--force` to archive anyway.
```

### Step 3: Create Summary

If summary doesn't exist, generate one:

```markdown
# Phase {N} Summary

## Overview
- **Title:** {title}
- **Status:** Complete
- **Tasks:** {count} completed
- **Duration:** {start} to {end}

## Key Outcomes
- {outcome 1}
- {outcome 2}
- {outcome 3}

## Files Created/Modified
- {file 1}
- {file 2}

## Decisions Made
- {decision 1}
- {decision 2}

## Issues Found
- {issue if any}
```

Target: ~100 tokens max.

### Step 4: Move to Archive

```bash
# Create archive directory
mkdir -p .opti-gsd/archive/phase-{N}

# Move phase files
mv .opti-gsd/plans/phase-{N}/* .opti-gsd/archive/phase-{N}/

# Remove empty directory
rmdir .opti-gsd/plans/phase-{N}
```

### Step 5: Create Compact Summary

Write `.opti-gsd/summaries/phase-{N}.md`:

```markdown
# Phase {N}: {Title}

Completed: {date}
Tasks: {count}
Key files: {list}

Outcomes:
- {outcome 1}
- {outcome 2}
```

This compact version is loaded for context reference instead of full archive.

### Step 6: Update state.json

Note archived phases in session context.

### Step 7: Commit

```bash
git add .opti-gsd/archive/phase-{N}/
git add .opti-gsd/summaries/phase-{N}.md
git rm -r .opti-gsd/plans/phase-{N}/
git commit -m "chore: archive phase {N}

Saved ~{tokens}k tokens"
```

### Step 8: Report

```markdown
## Phase {N} Archived

**Moved to:** .opti-gsd/archive/phase-{N}/
**Summary:** .opti-gsd/summaries/phase-{N}.md

**Tokens saved:** ~{count}k
**Before:** {before}k active
**After:** {after}k active

The compact summary will be used for context reference.
Full archive preserved for debugging if needed.
```

---

## Context Budget

Minimal: ~5%
