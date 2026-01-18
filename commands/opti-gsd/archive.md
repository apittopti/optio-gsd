# /opti-gsd:archive [phase]

Archive a completed phase to save context.

## Arguments

- `phase` — Phase number to archive (optional, archives all completed if omitted)

## Behavior

### Step 1: Identify Phases to Archive

If phase specified:
- Verify phase is complete (check ROADMAP.md)
- Archive that phase

If no phase:
- Find all completed, non-archived phases
- Archive all of them

### Step 2: Verify Phase Complete

Check:
- Phase marked complete in ROADMAP.md
- Summary exists in `.gsd/plans/phase-{N}/summary.md`
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
mkdir -p .gsd/archive/phase-{N}

# Move phase files
mv .gsd/plans/phase-{N}/* .gsd/archive/phase-{N}/

# Remove empty directory
rmdir .gsd/plans/phase-{N}
```

### Step 5: Create Compact Summary

Write `.gsd/summaries/phase-{N}.md`:

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

### Step 6: Update STATE.md

Note archived phases in session context.

### Step 7: Commit

```bash
git add .gsd/archive/phase-{N}/
git add .gsd/summaries/phase-{N}.md
git rm -r .gsd/plans/phase-{N}/
git commit -m "chore: archive phase {N}

Saved ~{tokens}k tokens"
```

### Step 8: Report

```markdown
## Phase {N} Archived

**Moved to:** .gsd/archive/phase-{N}/
**Summary:** .gsd/summaries/phase-{N}.md

**Tokens saved:** ~{count}k
**Before:** {before}k active
**After:** {after}k active

The compact summary will be used for context reference.
Full archive preserved for debugging if needed.
```

---

## Context Budget

Minimal: ~5%
