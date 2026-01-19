# Issue 002: Enhance Complete-Milestone PR Creation

**Severity:** low
**Status:** open
**Created:** 2026-01-19

## Problem

The `/complete-milestone` command creates a basic PR but doesn't leverage available context to create rich PR documentation.

## Current Behavior

- Creates PR with changelog as body
- No comments added
- No verification results included
- No linked issues

## Expected Behavior

Enhanced PR creation that:
1. Auto-generates detailed PR description from phase summaries
2. Posts verification results as a PR comment
3. Links resolved issues in the PR body
4. Includes commit summary with conventional commit categorization
5. Optionally requests reviewers (if configured)

## Suggested Implementation

### PR Body Template
```markdown
## Summary
{Brief description from milestone goal}

## Phases Completed
- Phase 1: {title} - {task count} tasks
- Phase 2: {title} - {task count} tasks

## Changes
### Features
- {feat commits}

### Fixes
- {fix commits}

## Issues Resolved
- Closes #{issue1}
- Closes #{issue2}

## Verification
All phases verified. See comments for detailed results.
```

### PR Comment (Verification Results)
```markdown
## Verification Report

### Phase 1: {title}
| Check | Status |
|-------|--------|
| CI | PASS |
| Artifacts | PASS |
| Integration | PASS |

### Phase 2: {title}
...
```

## Affected Files

- `commands/complete-milestone.md` - enhance Step 6

## Notes

Would make PRs self-documenting and reduce manual description writing.
