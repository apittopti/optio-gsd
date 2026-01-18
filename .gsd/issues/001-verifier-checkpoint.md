# Issue 001: Verifier Agent Lacks Checkpoint Protocol

**Severity:** medium
**Status:** open
**Created:** 2026-01-18

## Problem

The verifier agent runs through its entire verification protocol (CI checks → artifact verification → key link verification → E2E) but only writes `VERIFICATION.md` at the end. If context runs out mid-verification, all progress is lost.

## Current Behavior

- Verifier runs all checks sequentially
- Results only written to `VERIFICATION.md` after completion
- No intermediate state saved
- Context exhaustion = start over

## Expected Behavior

- Write partial results after each major verification step
- Support `--resume` flag to continue from last checkpoint
- Match the checkpoint pattern used by executor agent

## Affected Files

- `agents/opti-gsd-verifier.md` - needs checkpoint protocol
- `commands/verify.md` - needs `--resume` option

## Comparison

| Agent | Has Checkpoints | Incremental Save |
|-------|-----------------|------------------|
| executor | Yes | Per-task commits |
| debugger | Yes | Append-only evidence log |
| verifier | **No** | End-only |

## Suggested Solution

Add checkpoint protocol to verifier similar to debugger's persistent state:

```markdown
# Verification Progress: Phase {N}

## Completed Checks
- [x] CI: lint (PASS)
- [x] CI: typecheck (PASS)
- [ ] CI: test
- [ ] Artifacts
- [ ] Key Links

## Partial Results
{results so far}

## Resume Point
CI step 3 of 5
```

## Notes

Discovered during v0.3.0 milestone when user reported context exhaustion during verification in another project.
