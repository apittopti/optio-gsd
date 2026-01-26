# Changelog: v2.2.0 - Claude Code Task Integration

**Released:** 2026-01-25

## Summary

This release integrates opti-gsd with Claude Code's built-in task system (TaskCreate, TaskUpdate, TaskList, TaskGet) for real-time visual progress during execution.

## Features

### F002: Claude Code Task Integration
- Executor creates Claude Code tasks from plan.json at phase start
- Tasks show activeForm spinner during execution (visible in Ctrl+T)
- Task status updates in real-time: pending → in_progress → completed
- Two-layer architecture: plan.json (persistent) + Claude tasks (visual)
- Subagents can use TaskGet to read task context

## Bug Fixes

- **CLI Version Display:** Fixed `npx opti-gsd` showing "Version: unknown" by reading from package.json instead of removed plugin.json

## Architecture

```
plan.json (persistent)          Claude Code Tasks (ephemeral)
┌─────────────────────┐         ┌─────────────────────┐
│ T01: Setup schema   │ ──────► │ [✓] Setup schema    │
│ T02: Create API     │ ──────► │ [▸] Create API      │
│ T03: Add validation │ ──────► │ [ ] Add validation  │
└─────────────────────┘         └─────────────────────┘
     Source of Truth              Real-time Visual UI
```

## Files Modified

- `agents/opti-gsd/opti-gsd-executor.md` - Added TaskCreate/TaskUpdate instructions
- `commands/opti-gsd/execute.md` - Documented task integration feature
- `bin/cli.js` - Fixed version reading from package.json

## Upgrade Instructions

```bash
npx github:apittopti/opti-gsd init
```

No migration needed - new features are additive.
