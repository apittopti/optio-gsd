# Changelog: v0.8.0

## Summary

Improved workflow: push before verify for preview deployments, always create PR before merge.

## Features

### Push Before Verify
- `commands/verify.md` now has Step 0: Check Push Status
- Warns if branch not pushed when `deploy.target` is configured
- Interactive mode offers to push; yolo mode warns but continues
- Enables testing against preview deployments during verification

### PR-Based Milestone Completion
- `commands/complete-milestone.md` Step 5 now "Push Branch and Create PR"
- Removed auto-merge path - all workflows create PRs
- Added `--finalize` flag for post-merge steps (tag, archive)
- Two-phase completion: PR first, then finalize after merge

## Workflow Change

**Before (v0.7.0):**
```
execute → verify → complete-milestone (auto-merge)
```

**After (v0.8.0):**
```
execute → push → verify → complete-milestone (PR) → merge → --finalize
```

## Issues Closed

- I003: Push before verify, PR before merge

## Phase Summary

| Phase | Title | Tasks | Status |
|-------|-------|-------|--------|
| 1 | Workflow Refinement | 3 | COMPLETE |
