---
name: session
description: Manage work sessions - pause, resume, rollback, archive, and context optimization. Subcommands: pause, resume, rollback, archive, context, compact.
disable-model-invocation: true
---

# session

Manage work sessions - pause, resume, rollback, archive, and context optimization.

## Usage

- `/opti-gsd:session pause` — Pause work with context save
- `/opti-gsd:session resume` — Resume from last session
- `/opti-gsd:session rollback` — Rollback to previous checkpoint
- `/opti-gsd:session archive [phase]` — Archive completed phase to save context
- `/opti-gsd:session context` — Show context usage and budget
- `/opti-gsd:session compact` — Reduce context footprint

## Routing

Parse the first argument after `session` to determine the subcommand:

| Argument | Action |
|----------|--------|
| `pause` | Jump to [Subcommand: pause](#subcommand-pause) |
| `resume` | Jump to [Subcommand: resume](#subcommand-resume) |
| `rollback` | Jump to [Subcommand: rollback](#subcommand-rollback) |
| `archive` | Jump to [Subcommand: archive](#subcommand-archive) |
| `context` | Jump to [Subcommand: context](#subcommand-context) |
| `compact` | Jump to [Subcommand: compact](#subcommand-compact) |
| *(none)* | Show the Usage table above and ask user to pick a subcommand |

---

## Subcommand: pause

Pause work with context save for later resumption.

### Behavior

#### Step 1: Capture State

Read current position from state.json.

#### Step 2: Ask for Context

> "Any notes about where you left off? This helps when resuming."

#### Step 3: Update state.json

```json
{
  "milestone": "v1.0",
  "phase": 2,
  "task": 3,
  "status": "paused",
  "branch": "gsd/v1.0",
  "last_active": "{current_timestamp}",
  "phases": {
    "complete": [1],
    "in_progress": [2],
    "pending": [3, 4]
  },
  "context": "{User's notes about current state}. {What was in progress}. {Any blockers or considerations}"
}

## Recent Decisions
- {existing decisions}
```

#### Step 4: Commit

```bash
git add .opti-gsd/state.json
git commit -m "wip: pause at phase {N} task {M}

{Brief context note}"
```

#### Step 5: Confirm

```markdown
## Session Paused

Saved at: Phase {N}, Task {M}
Context: {notes summary}

To resume: Run /opti-gsd:session resume
```

### Context Budget

Minimal: ~5%

---

## Subcommand: resume

Resume work from last session.

### Behavior

#### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
Warning: opti-gsd Not Initialized
-------------------------------------
No .opti-gsd/ directory found in this project.

> Run /opti-gsd:init to initialize an existing project
> Run /opti-gsd:init new to start a new project
```

If `.opti-gsd/state.json` missing:
```
Warning: Project State Missing
-------------------------------------
.opti-gsd/state.json not found. No session to resume.

> Run /opti-gsd:init to start fresh
```

#### Step 2: Load State

Read `.opti-gsd/state.json` for:
- Current milestone, phase, task
- Last active timestamp
- Session context notes

#### Step 2a: Load Learnings

If `.opti-gsd/learnings.md` exists:

1. Read learnings file
2. Count entries by category
3. Display recent learnings summary:

```markdown
## Active Learnings

{count} learnings loaded:
- {count} DEPRECATED warnings
- {count} CI_FAILURE fixes
- {count} FILE_NOT_FOUND resolutions
- {count} WORKFLOW_BUG patches

Recent:
- DEPRECATED: `next lint` > Use ESLint CLI directly
- FILE_NOT_FOUND: plugin.json > Read from package.json
```

4. These learnings are now active for this session
5. Executor will check them before running commands

#### Step 3: Show Context

```markdown
# Resume Session

## Last Session
- **Date:** {last_active}
- **Position:** Phase {N}, Task {M}
- **Notes:** {session context from state.json}

## What Was Happening
{Extracted from session context}

## Pending Work
- Task {M}: {task title from plan.json}
- {Remaining tasks in phase}

## Continue?
Ready to continue from Task {M}?
```

#### Step 4: Verify State

Check git status:
- Any uncommitted changes?
- Any conflicts?

If issues:
```markdown
## Warning: Uncommitted Changes

There are uncommitted changes in the working directory:
{git status output}

Options:
A) Commit changes and continue
B) Stash changes and continue
C) Abort and resolve manually
```

#### Step 5: Continue

If user confirms, run /opti-gsd:execute to continue execution.

### Context Budget

Minimal: ~5%

---

## Subcommand: rollback

Rollback to a previous execution checkpoint.

### Arguments

- `target` — What to rollback to:
  - `last` — Most recent checkpoint (before last execution)
  - `{phase}` — Before phase N started (e.g., `2`)
  - `{phase}-{task}` — Before specific task (e.g., `2-03`)

### How Checkpoints Work

Execute automatically creates Git tags before and after execution:

```
gsd/checkpoint/phase-2/pre    <- Before phase 2 started
gsd/checkpoint/phase-2/T01    <- After task 01
gsd/checkpoint/phase-2/T02    <- After task 02
gsd/checkpoint/phase-2/post   <- After phase 2 completed
```

These enable precise rollback to any point.

### Behavior

#### Step 1: Find Target Checkpoint

**For `last`:**
```bash
git tag -l "gsd/checkpoint/*" --sort=-creatordate | head -1
```

**For phase number:**
```bash
git tag -l "gsd/checkpoint/phase-{N}/pre"
```

**For phase-task:**
```bash
# Rollback to state BEFORE this task
git tag -l "gsd/checkpoint/phase-{N}/T{task-1}"
# Or pre if task is 01
git tag -l "gsd/checkpoint/phase-{N}/pre"
```

If checkpoint not found:
```
Warning: Checkpoint Not Found
-------------------------------------
No checkpoint found for: {target}

Available checkpoints:
  gsd/checkpoint/phase-1/post
  gsd/checkpoint/phase-2/pre
  gsd/checkpoint/phase-2/T01
  gsd/checkpoint/phase-2/T02

> Use /opti-gsd:session rollback {checkpoint}
```

#### Step 2: Show Impact

```markdown
## Rollback Preview

**Target:** {checkpoint_tag}
**Created:** {timestamp}

**Will revert:**
- {count} commits
- {files_changed} files changed

**Commits to undo:**
1. feat(2-03): implement stats API
2. feat(2-02): create useStats hook
3. feat(2-01): create StatsCard component

**Warning:** This cannot be easily undone.

Proceed with rollback? [y/N]
```

#### Step 3: Create Backup Tag

Before rollback, create backup of current state:

```bash
git tag "gsd/backup/$(date +%Y%m%d-%H%M%S)" HEAD
```

This allows recovering from accidental rollback.

#### Step 4: Execute Rollback

```bash
# Hard reset to checkpoint
git reset --hard {checkpoint_tag}

# Update state.json to match rolled-back state
# (Parse from checkpoint or reset to pre-phase state)
```

#### Step 5: Update State

Reset state.json to reflect rolled-back position:

```json
{
  "phase": "{N}",
  "task": 0,
  "status": "rolled_back",
  "phases": {
    "complete": ["..."]
  }
}
```

#### Step 6: Report

```markdown
## Rollback Complete

**Rolled back to:** {checkpoint_tag}
**Commits undone:** {count}
**Backup created:** gsd/backup/{timestamp}

**Current state:**
- Phase: {N}
- Task: {task}

```

**Next steps:**
> /opti-gsd:status — Check current state
> /opti-gsd:execute — Re-execute from this point
> /opti-gsd:session rollback — Restore from backup if needed

### Examples

#### Rollback Last Execution
```
/opti-gsd:session rollback last

Rolls back to the most recent checkpoint.
Useful when execution just failed.
```

#### Rollback Entire Phase
```
/opti-gsd:session rollback 2

Rolls back to before phase 2 started.
Useful when phase approach was fundamentally wrong.
```

#### Rollback Specific Task
```
/opti-gsd:session rollback 2-03

Rolls back to after task 02, before task 03.
Useful when one task broke things.
```

### Rollback Undo

If you rollback by mistake:

```bash
# List backup tags
git tag -l "gsd/backup/*"

# Restore from backup
git reset --hard gsd/backup/{timestamp}
```

Or use /opti-gsd:debug recover to diagnose and fix state.

### Safety

- **Always creates backup** before rollback
- **Requires confirmation** in interactive mode
- **Shows full impact** before proceeding
- **Preserves untracked files** (only affects git history)

### Context Budget

- Checkpoint lookup: ~2%
- Impact analysis: ~3%
- State update: ~2%
- Total: ~7%

---

## Subcommand: archive

Archive a completed phase to save context.

### Arguments

- `phase` — Phase number to archive (optional, archives all completed if omitted)

### Behavior

#### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
Warning: opti-gsd Not Initialized
-------------------------------------
No .opti-gsd/ directory found in this project.

> Run /opti-gsd:init to initialize an existing project
> Run /opti-gsd:init new to start a new project
```

If `.opti-gsd/state.json` missing:
```
Warning: Project State Missing
-------------------------------------
.opti-gsd/state.json not found.

> Run /opti-gsd:init to reinitialize
```

#### Step 2: Identify Phases to Archive

If phase specified:
- Verify phase is complete (check roadmap.md)
- Archive that phase

If no phase:
- Find all completed, non-archived phases
- Archive all of them

#### Step 3: Verify Phase Complete

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

#### Step 4: Create Summary

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

#### Step 5: Move to Archive

```bash
# Create archive directory
mkdir -p .opti-gsd/archive/phase-{N}

# Move phase files
mv .opti-gsd/plans/phase-{N}/* .opti-gsd/archive/phase-{N}/

# Remove empty directory
rmdir .opti-gsd/plans/phase-{N}
```

#### Step 6: Create Compact Summary

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

#### Step 7: Update state.json

Note archived phases in session context.

#### Step 8: Commit

```bash
git add .opti-gsd/archive/phase-{N}/
git add .opti-gsd/summaries/phase-{N}.md
git rm -r .opti-gsd/plans/phase-{N}/
git commit -m "chore: archive phase {N}

Saved ~{tokens}k tokens"
```

#### Step 9: Report

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

### Context Budget

Minimal: ~5%

---

## Subcommand: context

Show current context usage and budget status with optimization suggestions.

### Behavior

#### Step 1: Analyze Usage

Read:
- `.opti-gsd/state.json` for session_tokens
- `.opti-gsd/config.json` for budgets
- Count files in `.opti-gsd/plans/` vs `.opti-gsd/archive/`
- Estimate file sizes

#### Step 2: Calculate Metrics

```
Total session tokens: {from state.json}
Budget used: {percentage}%

File breakdown:
- config.json: ~200 tokens
- state.json: ~150 tokens
- Current plan: ~{X} tokens
- Active research: ~{Y} tokens
- Unarchived phases: ~{Z} tokens
```

#### Step 3: Display Report

```markdown
# Context Usage Report

## Current Session
- **Tokens used:** ~80,000
- **Budget:** 200,000 (40% used)
- **Quality zone:** GOOD (< 50%)

## Breakdown
| Category | Tokens | % |
|----------|--------|---|
| Config + State | 350 | 0.2% |
| Current phase plan | 1,200 | 0.6% |
| Research (active) | 2,400 | 1.2% |
| Codebase analysis | 3,500 | 1.8% |
| Execution context | 72,550 | 36.3% |

## Archived vs Active
- **Archived phases:** 1 (saved ~1,500 tokens)
- **Active phases:** 1
- **Pending phases:** 2

## Budget by Agent Type
| Agent | Budget | Typical Use | Status |
|-------|--------|-------------|--------|
| Orchestrator | 15% | ~10% | OK |
| Executor | 50% | ~45% | OK |
| Planner | 60% | ~55% | OK |
| Researcher | 70% | ~65% | OK |

## Recommendations

{If > 50% used}
Context usage is high. Consider:
1. Run /opti-gsd:session archive {completed_phases} to archive completed phases
2. Run /opti-gsd:session compact to reduce file sizes
3. Prioritize completing current phase before starting research

{If unarchived completed phases}
You have {N} completed phases not yet archived.
   Run /opti-gsd:session archive to save ~{X}k tokens.

{If research files from old phases}
Old research files can be summarized.
   Run /opti-gsd:session compact to condense.

{If all good}
Context usage is healthy. No action needed.
```

### Context Budget

Minimal: ~3% (analysis only)

---

## Subcommand: compact

Reduce context footprint of all project files.

### Behavior

#### Step 1: Analyze Current State

Scan `.opti-gsd/` directory and calculate token estimates for all files.

#### Step 2: Archive Completed Phases

For each completed phase not yet archived:
- Run archive process (same as /opti-gsd:session archive)

#### Step 3: Summarize Research Files

For each `.opti-gsd/plans/phase-{N}/research.md`:
- If phase is complete, condense to key findings only
- Remove verbose examples and exploration

Before:
```markdown
# Research: Phase 2

## Investigation
I explored several options...
{500 lines of exploration}

## Findings
- Use TanStack Query v5
- Avoid lodash, use native methods
- Pattern: feature-based folders
```

After:
```markdown
# Research Summary: Phase 2

- TanStack Query v5 for data fetching
- Native methods over lodash
- Feature-based folder structure
```

#### Step 4: Compact state.json

Remove old session notes, keep only recent:

Before:
```markdown
## Session Context
{Old context from 5 sessions ago}
{Old context from 4 sessions ago}
{Old context from 3 sessions ago}
{Current context}
```

After:
```markdown
## Session Context
{Current context only}
```

#### Step 5: Trim decisions.md

Keep decisions, remove verbose rationale:

Before:
```markdown
### Decision: Use jose over jsonwebtoken

**Date:** 2026-01-15
**Context:** We needed a JWT library...
{50 lines of context}
**Decision:** Use jose
**Rationale:** {30 lines of rationale}
**Consequences:** {20 lines}
```

After:
```markdown
### 2026-01-15: jose > jsonwebtoken
ESM compatible, smaller bundle, better TypeScript support.
```

#### Step 6: Clean Debug Sessions

For resolved issues:
- Move to `.opti-gsd/archive/debug/`
- Keep only summary in main debug folder

#### Step 7: Report Savings

```markdown
## Compaction Complete

### Actions Taken
- Archived {N} completed phases
- Condensed {M} research files
- Trimmed state.json history
- Compacted decisions.md
- Archived {K} resolved debug sessions

### Token Savings
| Category | Before | After | Saved |
|----------|--------|-------|-------|
| Phase archives | 4,500 | 300 | 4,200 |
| Research files | 2,400 | 600 | 1,800 |
| state.json | 500 | 150 | 350 |
| decisions.md | 800 | 200 | 600 |
| Debug sessions | 1,200 | 100 | 1,100 |
| **Total** | **9,400** | **1,350** | **8,050** |

**Reduction:** 85%
```

#### Step 8: Commit

```bash
git add .opti-gsd/
git commit -m "chore: compact project files

Saved ~{total}k tokens ({percentage}% reduction)"
```

### Context Budget

- Analysis: ~5%
- Compaction: ~10%
- Total: ~15% (at orchestrator limit)
