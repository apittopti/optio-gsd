# Changelog: v0.7.0

## Summary

Branch enforcement to prevent accidental commits to base branch when `branching: milestone` is configured.

## Features

### Branch Validation (Step 0)
- Added Step 0: Validate Branch to workflow commands
- Prevents accidental work directly on master/main
- Mode-controlled behavior:
  - **interactive**: Prompts user to switch branches
  - **yolo**: Auto-switches to milestone branch

### Commands Updated
- `commands/discuss-phase.md`
- `commands/plan-phase.md`
- `commands/execute.md`

## Behavior

When `branching: milestone` is configured and user is on base branch:

1. **No milestone active**: Warning directs to `/opti-gsd:start-milestone`
2. **Milestone exists**:
   - Interactive mode prompts to switch
   - Yolo mode auto-switches

## Issues Closed

- I002: Enforce milestone branching

## Phase Summary

| Phase | Title | Tasks | Status |
|-------|-------|-------|--------|
| 1 | Branch Enforcement | 3 | COMPLETE |
