# Roadmap: v2.3.0 - Completeness Enforcement

**Milestone:** v2.3.0
**Goal:** Prevent half-baked solutions by enforcing end-to-end completeness at every stage

## Problem Statement

Current workflow allows:
- Plans with "migrate later" notes that defer work indefinitely
- Backend-only changes marked as "complete"
- New abstractions without consumers (orphaned code)
- Partial story delivery with incomplete acceptance criteria

This creates hidden technical debt and delivers zero user value.

## Success Criteria

- [ ] Plans cannot contain deferral language ("can be migrated later", "ready for future use")
- [ ] Every task requires user-observable done criteria
- [ ] New abstractions must have at least one consumer in same phase
- [ ] Verification checks user value (L4), not just code existence
- [ ] Stories cannot be marked delivered with incomplete acceptance criteria

---

## Phase 1: Planner Completeness Rules

**Goal:** Prevent plans from deferring work or creating orphaned code

**Delivers:** Core enforcement rules in planner agent

**Success Criteria:**
- [ ] Planner rejects tasks with deferral language in notes/actions
- [ ] Every task has `<user-observable>` element showing what user sees
- [ ] Plan-checker validates "consumer required" rule for new abstractions
- [ ] Forbidden patterns documented and enforced

**Implementation Notes:**
- Add FORBIDDEN_PATTERNS list to planner
- Add `<user-observable>` as required field in task XML
- Plan-checker validates no orphaned abstractions

---

## Phase 2: Verifier L4 User Value Check

**Goal:** Verification must prove user value, not just code existence

**Delivers:** Level 4 verification in verifier agent

**Success Criteria:**
- [ ] Verifier checks L4: User can observe the change
- [ ] Browser/CLI/API verification required for user-facing changes
- [ ] "Infrastructure ready" without consumer fails verification
- [ ] Verification report shows L4 status for each task

**Implementation Notes:**
- Add L4 column to artifact inventory
- L4 check uses browser MCP or CLI test where applicable
- Orphan detection: new exports without importers fail L4

---

## Phase 3: Story Completeness Gate

**Goal:** Stories cannot be partially delivered

**Delivers:** Story completion enforcement in verification

**Success Criteria:**
- [ ] All acceptance criteria must pass for story to be "delivered"
- [ ] Partial delivery keeps story as "in_progress"
- [ ] Verification maps each AC to evidence
- [ ] "Pending migration" notes in stories block delivery

**Implementation Notes:**
- Verifier loads story files and checks each AC
- Status stays "in_progress" until 100% AC pass
- Flag any deferred work language in story context

---

## Phase 4: Debt Balance Tracking

**Goal:** Fixing debt should not create more debt

**Delivers:** Debt balance check in verification

**Success Criteria:**
- [ ] Track debt items resolved vs created
- [ ] Warn if fix creates more debt than it resolves
- [ ] Require explicit issue creation for any new debt
- [ ] Verification report shows debt balance

**Implementation Notes:**
- Scan for TODO/FIXME/migration-needed language
- Compare before/after debt count
- Block completion if net debt increases without justification

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

---
