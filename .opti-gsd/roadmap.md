# Roadmap: v2.3.0 - Completeness Enforcement

**Milestone:** v2.3.0
**Goal:** Prevent half-baked solutions by enforcing end-to-end completeness at every stage

## Problem Statement

Current workflow allows:
- Plans with "migrate later" notes that defer work indefinitely
- Backend-only changes marked as "complete"
- New abstractions without consumers (orphaned code)
- Partial story delivery with incomplete acceptance criteria
- Errors repeat because there's no learning from failures

This creates hidden technical debt and delivers zero user value.

## Success Criteria

- [x] Plans cannot contain deferral language ("can be migrated later", "ready for future use")
- [x] Every task requires user-observable done criteria
- [x] New abstractions must have at least one consumer in same phase
- [x] Verification checks user value (L4), not just code existence
- [x] Stories cannot be marked delivered with incomplete acceptance criteria
- [x] Errors are logged and learned from so they never repeat

---

## Phase 1: Planner Completeness Rules [COMPLETE]

**Goal:** Prevent plans from deferring work or creating orphaned code

**Delivers:** Core enforcement rules in planner agent

**Success Criteria:**
- [x] Planner rejects tasks with deferral language in notes/actions
- [x] Every task has `user_observable` field showing what user sees
- [x] Plan-checker validates "consumer required" rule for new abstractions
- [x] Forbidden patterns documented and enforced

**Implementation Notes:**
- Add FORBIDDEN_PATTERNS list to planner
- Add `<user-observable>` as required field in task XML
- Plan-checker validates no orphaned abstractions

---

## Phase 2: Verifier L4 User Value Check [COMPLETE]

**Goal:** Verification must prove user value, not just code existence

**Delivers:** Level 4 verification in verifier agent

**Success Criteria:**
- [x] Verifier checks L4: User can observe the change
- [x] Browser/CLI/API verification required for user-facing changes
- [x] "Infrastructure ready" without consumer fails verification
- [x] Verification report shows L4 status for each task

**Implementation Notes:**
- Add L4 column to artifact inventory
- L4 check uses browser MCP or CLI test where applicable
- Orphan detection: new exports without importers fail L4

---

## Phase 3: Story Completeness Gate [COMPLETE]

**Goal:** Stories cannot be partially delivered

**Delivers:** Story completion enforcement in verification

**Success Criteria:**
- [x] All acceptance criteria must pass for story to be "delivered"
- [x] Partial delivery keeps story as "in_progress"
- [x] Verification maps each AC to evidence
- [x] "Pending migration" notes in stories block delivery

**Implementation Notes:**
- Verifier loads story files and checks each AC
- Status stays "in_progress" until 100% AC pass
- Flag any deferred work language in story context

---

## Phase 4: Debt Balance Tracking [COMPLETE]

**Goal:** Fixing debt should not create more debt

**Delivers:** Debt balance check in verification

**Success Criteria:**
- [x] Track debt items resolved vs created
- [x] Warn if fix creates more debt than it resolves
- [x] Require explicit issue creation for any new debt
- [x] Verification report shows debt balance

**Implementation Notes:**
- Scan for TODO/FIXME/migration-needed language
- Compare before/after debt count
- Block completion if net debt increases without justification

---

## Phase 5: Debt Baseline Scanning [COMPLETE]

**Goal:** Establish, track, and verify complete elimination of technical debt

**Delivers:** Debt scanning capability in map-codebase with baseline tracking

**Success Criteria:**
- [x] `/opti-gsd:map-codebase --debt` scans for all debt markers (TODO, FIXME, HACK, etc.)
- [x] Baseline saved to `.opti-gsd/debt-baseline.json` with file, line, content
- [x] Re-scan compares against baseline showing resolved vs remaining
- [x] Verification blocks if debt increased without explicit issue creation
- [x] "Debt-free" state clearly reportable

**Implementation Notes:**
- Scan patterns: TODO, FIXME, HACK, XXX, DEFER, "migrate later", "tech debt"
- Store baseline with timestamps for tracking velocity
- Diff view shows what's resolved since last scan
- Integration with Phase 4 debt balance tracking

**Debt Markers to Scan:**
```
TODO:       Planned work not yet done
FIXME:      Known bug or problem
HACK:       Workaround that should be replaced
XXX:        Needs attention
DEFER:      Explicitly deferred work
@debt:      Tagged technical debt
"later"     Deferral language in comments
"migrate"   Migration debt
"temporary" Temporary solutions
"workaround" Known workarounds
```

**Example Output:**
```
Debt Scan Results
──────────────────────────────────────────────────────────────
Baseline: 2026-01-20 (15 items)
Current:  2026-01-25 (8 items)

Resolved: 9 items ✓
  - src/api/auth.ts:45 (TODO: rate limiting) → Implemented
  - src/utils/date.ts:12 (FIXME: timezone) → Fixed
  ...

Remaining: 8 items
  - src/hooks/useQuery.ts:23 (TODO: caching)
  ...

New debt: 2 items ⚠️
  - src/components/Modal.tsx:15 (HACK: force rerender)
  - src/api/stats.ts:89 (TODO: pagination)

Net change: -7 (good!)
```

---

## Phase 6: Error Learning System [COMPLETE]

**Goal:** Log errors and build institutional memory so mistakes never repeat

**Delivers:** Self-learning error handling across all agents

**Success Criteria:**
- [x] All errors logged to `.opti-gsd/learnings.md` with context
- [x] Learnings loaded at session start (via CLAUDE.md or resume)
- [x] Pattern matching detects similar errors and applies fixes
- [x] File-not-found errors flagged as potential agent/command bugs
- [x] Deprecated command detection with automatic alternatives

**Implementation Notes:**
- Create `.opti-gsd/learnings.md` for persistent error memory
- Error categories: CI_FAILURE, FILE_NOT_FOUND, DEPRECATED, WORKFLOW_BUG
- Each learning includes: error pattern, root cause, fix applied, prevention
- Executor checks learnings before running commands
- Status command shows recent learnings

**Example Learnings:**

```markdown
## DEPRECATED: next lint

**First seen:** 2026-01-25
**Error:** `next lint` is deprecated and will be removed in Next.js 16
**Fix:** Use `npx @next/codemod@canary next-lint-to-eslint-cli .` to migrate
**Prevention:** Check project for Next.js 15+, use ESLint CLI directly

## FILE_NOT_FOUND: plugin.json

**First seen:** 2026-01-24
**Error:** Cannot read plugin.json - file does not exist
**Root cause:** Agent referenced removed file
**Fix:** Updated to read from package.json instead
**Prevention:** Agent opti-gsd-executor.md updated
```

---

## Architecture

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

---

## Files to Modify

| Phase | File | Change |
|-------|------|--------|
| 1 | `agents/opti-gsd/opti-gsd-planner.md` | Add forbidden patterns, user-observable requirement |
| 1 | `agents/opti-gsd/opti-gsd-plan-checker.md` | Add consumer-required validation |
| 2 | `agents/opti-gsd/opti-gsd-verifier.md` | Add L4 user value checks |
| 3 | `agents/opti-gsd/opti-gsd-verifier.md` | Add story AC completeness gate |
| 4 | `agents/opti-gsd/opti-gsd-verifier.md` | Add debt balance tracking |
| 4 | `commands/opti-gsd/verify.md` | Document debt balance in output |
| 5 | `commands/opti-gsd/map-codebase.md` | Add --debt flag and baseline scanning |
| 5 | `agents/opti-gsd/opti-gsd-codebase-mapper.md` | Add debt marker detection |
| 6 | `agents/opti-gsd/opti-gsd-executor.md` | Add error logging and learning checks |
| 6 | `commands/opti-gsd/status.md` | Show recent learnings |
| 6 | `commands/opti-gsd/resume.md` | Load learnings at session start |

---
