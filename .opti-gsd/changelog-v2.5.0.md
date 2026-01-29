# Changelog: v2.5.0

## Summary
Fix Claude Code Tasks visual progress during phase execution. TaskCreate/TaskUpdate calls were documented conceptually but never embedded as concrete steps in the orchestrator flow, causing users to see no visual task progress in the CLI.

## Fixes
- Embedded TaskCreate as mandatory Step 4c in execute.md (creates all tasks before wave execution)
- Added TaskUpdate(in_progress) to Step 5 wave loop before spawning each subagent
- Added TaskUpdate(completed) to Step 5 polling loop after task result handling
- Condensed conceptual Task Integration section to reference concrete steps

## Technical
- Version bumped to 2.5.0
