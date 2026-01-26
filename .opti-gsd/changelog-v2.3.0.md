# Changelog: v2.3.0 - Completeness Enforcement

## Summary

This milestone prevents half-baked solutions by enforcing end-to-end completeness at every stage of the workflow. No more "migrate later" notes, backend-only changes, or orphaned code. Every task must deliver observable user value.

## Features

### Phase 1: Planner Completeness Rules
- **Forbidden Deferral Patterns**: Planner rejects tasks with "migrate later", "ready for future use", or similar deferral language
- **user_observable Required Field**: Every task must specify what the user can see/do after completion
- **Consumer-Required Validation**: New abstractions (hooks, services, utilities) must have consumers in the same phase

### Phase 2: Verifier L4 User Value Check
- **Four-Level Artifact Verification**: L1 (Exists) → L2 (Substantive) → L3 (Wired) → L4 (User Value)
- **User Value Verification**: Browser/CLI/API verification required for user-facing changes
- **Orphan Detection**: Infrastructure without consumers fails verification

### Phase 3: Story Completeness Gate
- **AC-to-Evidence Mapping**: Every acceptance criterion must have verification evidence
- **Delivery Blocking**: Stories with unchecked ACs or deferral language cannot be marked "delivered"
- **Partial Delivery Prevention**: Status stays "in_progress" until 100% AC pass

### Phase 4: Debt Balance Tracking
- **Debt Balance Calculation**: Track debt items resolved vs created (Net = Created - Resolved)
- **Warning/Blocking Logic**: Warn on net positive, block untracked debt
- **Issue-Linked Justification**: New debt requires `TODO(ISS###):` pattern

### Phase 5: Debt Baseline Scanning
- **`/opti-gsd:map-codebase --debt`**: Scan all debt markers (TODO, FIXME, HACK, XXX, DEFER, etc.)
- **Baseline Tracking**: Save to `.opti-gsd/debt-baseline.json` with file, line, content, timestamps
- **Comparison Mode**: Re-scan shows resolved, remaining, and new debt
- **Debt-Free State**: Clear reporting when zero items remain

### Phase 6: Error Learning System
- **Error Logging**: All errors logged to `.opti-gsd/learnings.md` with context
- **Pattern Matching**: Detects similar errors and applies fixes automatically
- **Error Categories**: DEPRECATED, CI_FAILURE, FILE_NOT_FOUND, WORKFLOW_BUG
- **Agent Bug Detection**: FILE_NOT_FOUND errors flagged as potential agent bugs
- **Session Loading**: Learnings loaded via `/opti-gsd:resume` and shown in `/opti-gsd:status`

## Technical

### Files Modified

| File | Changes |
|------|---------|
| `agents/opti-gsd/opti-gsd-planner.md` | Forbidden patterns, user_observable requirement |
| `agents/opti-gsd/opti-gsd-plan-checker.md` | Consumer-required validation |
| `agents/opti-gsd/opti-gsd-verifier.md` | L4 verification, story gate, debt balance |
| `agents/opti-gsd/opti-gsd-executor.md` | Error learning system |
| `agents/opti-gsd/opti-gsd-codebase-mapper.md` | Debt focus mode, baseline schema |
| `commands/opti-gsd/map-codebase.md` | --debt flag, scan report format |
| `commands/opti-gsd/verify.md` | Debt balance check documentation |
| `commands/opti-gsd/status.md` | Learnings display |
| `commands/opti-gsd/resume.md` | Learnings loading |

### Architecture

```
BEFORE (allows half-baked):
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Planner   │ ──► │  Executor   │ ──► │  Verifier   │
│ "Note: can  │     │ Backend     │     │ Code exists │
│  migrate    │     │ only        │     │ ✓ PASS      │
│  later"     │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                        USER GETS NOTHING

AFTER (enforces completeness):
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Planner   │ ──► │  Executor   │ ──► │  Verifier   │
│ No deferral │     │ End-to-end  │     │ L4: User    │
│ Consumer    │     │ Full stack  │     │ can see it  │
│ required    │     │             │     │ working     │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              ▼
                                        USER SEES VALUE
```

## Requirements Completed

- [x] Plans cannot contain deferral language
- [x] Every task requires user-observable done criteria
- [x] New abstractions must have at least one consumer in same phase
- [x] Verification checks user value (L4), not just code existence
- [x] Stories cannot be marked delivered with incomplete acceptance criteria
- [x] Errors are logged and learned from so they never repeat
