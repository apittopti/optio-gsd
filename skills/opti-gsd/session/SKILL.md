---
name: session
description: Manage work sessions with checkpointing, state persistence, and context optimization. Subcommands: pause (save state for later), resume (restore session), rollback [phase-task] (undo to checkpoint), archive N (compress completed phase), context (show token usage), compact (reduce context size).
disable-model-invocation: true
argument-hint: pause|resume|rollback|archive|context|compact [args]
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

| Argument | Action | Detail File |
|----------|--------|-------------|
| `pause` | Save session state for later resumption | [actions/pause.md](actions/pause.md) |
| `resume` | Restore session from saved state | [actions/resume.md](actions/resume.md) |
| `rollback` | Undo work to a checkpoint | [actions/rollback.md](actions/rollback.md) |
| `archive` | Compress completed phase to save tokens | [actions/archive.md](actions/archive.md) |
| `context` | Show token usage and budget status | [actions/context.md](actions/context.md) |
| `compact` | Reduce context size across all files | [actions/compact.md](actions/compact.md) |
| *(none)* | Show the Usage table above and ask user to pick a subcommand | — |

---

## Subcommand: pause

Save current work state for later resumption. Captures position, user notes, and commits a WIP checkpoint.

**Context Budget:** ~5%

**Steps:** Capture state from state.json, ask user for context notes, update state.json with status "paused", commit, confirm.

Read the full procedure: [actions/pause.md](actions/pause.md)

---

## Subcommand: resume

Restore a paused session. Validates prerequisites, loads state and learnings, shows context, verifies git status, then continues execution.

**Context Budget:** ~5%

**Steps:** Validate `.opti-gsd/` and `state.json` exist, load state and learnings, display session context, check git status for issues, continue with `/opti-gsd:execute`.

Read the full procedure: [actions/resume.md](actions/resume.md)

---

## Subcommand: rollback

Undo work to a previous checkpoint. Supports rolling back to last checkpoint, a phase start, or a specific task.

**Context Budget:** ~7%

**Arguments:**
- `last` — Most recent checkpoint
- `{phase}` — Before phase N started (e.g., `2`)
- `{phase}-{task}` — Before specific task (e.g., `2-03`)

**Steps:** Find target checkpoint tag, show impact preview, create backup tag, execute `git reset --hard`, update state.json, report.

Read the full procedure: [actions/rollback.md](actions/rollback.md)

---

## Subcommand: archive

Archive a completed phase to save context tokens. Moves phase files to archive, creates compact summary.

**Context Budget:** ~5%

**Arguments:**
- `phase` — Phase number to archive (optional; archives all completed if omitted)

**Steps:** Validate prerequisites, identify phases, verify completion, create summary, move to archive, create compact summary, update state, commit, report.

Read the full procedure: [actions/archive.md](actions/archive.md)

---

## Subcommand: context

Show current context usage and budget status with optimization suggestions.

**Context Budget:** ~3%

**Steps:** Analyze usage from state.json and config.json, calculate metrics and breakdown, display report with recommendations.

Read the full procedure: [actions/context.md](actions/context.md)

---

## Subcommand: compact

Reduce context footprint of all project files. Archives completed phases, summarizes research, trims history.

**Context Budget:** ~15%

**Steps:** Analyze current state, archive completed phases, summarize research files, compact state.json, trim decisions.md, clean debug sessions, report savings, commit.

Read the full procedure: [actions/compact.md](actions/compact.md)
