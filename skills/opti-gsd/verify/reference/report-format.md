# Verification Report Format

Complete template for the verification report written to `.opti-gsd/plans/phase-{N}/verification.md`.

---

## Report Template

```markdown
# Verification Report: Phase {N}

## Status: {passed | gaps_found | human_needed}

## CI Checks
| Check | Status | Time | Notes |
|-------|--------|------|-------|
| Lint | PASS | 2.1s | - |
| Typecheck | PASS | 4.3s | - |
| Test | PASS | 12.5s | 47 tests, 0 failures |
| Build | PASS | 8.2s | - |
| E2E | SKIP | - | Not configured |

## Stories Delivered
| Story | Title | Acceptance | Status |
|-------|-------|------------|--------|
| US001 | Export to Excel | 3/3 criteria | PASS |
| US003 | Faster search | 2/2 criteria | PASS |

## Observable Truths
| Truth | Status | Evidence |
|-------|--------|----------|
| User can log in | PASS | Auth flow works |
| Dashboard shows stats | FAIL | Stats API returns 404 |

## Artifact Inventory
| File | L1 | L2 | L3 | Notes |
|------|----|----|----| ------|
| auth/login/page.tsx | YES | REAL | WIRED | OK |
| components/StatsCard.tsx | YES | REAL | ORPHAN | Not imported |

## Key Links
| Link | Status | Break Point |
|------|--------|-------------|
| Login → Dashboard | OK | - |
| Dashboard → StatsCard | BROKEN | Import missing |

## Debt Balance
| Metric | Value |
|--------|-------|
| Resolved | 5 |
| Created | 2 |
| Net | -3 (GOOD) |

**Untracked debt items:**
- src/components/Modal.tsx:15 - HACK: force rerender

## Gaps
<gaps>
  <gap type="orphan" file="components/StatsCard.tsx">
    Component exists but not imported in Dashboard
  </gap>
  <gap type="broken_link" from="Dashboard" to="StatsAPI">
    Fetch URL incorrect: /api/stat vs /api/stats
  </gap>
</gaps>

## Human Verification Required
- [ ] Visual: Dashboard layout matches design
- [ ] Behavior: Auth redirect works correctly
```

---

## Report Sections

### Status
One of three values:
- **passed** — All checkpoints pass, no gaps found
- **gaps_found** — One or more gaps detected that need fixing
- **human_needed** — Code checks pass but manual/visual verification is required

### CI Checks
Results from the four CI commands plus E2E. Each row shows:
- **Check**: Name of the CI step
- **Status**: PASS, FAIL, or SKIP (if command is null in config)
- **Time**: Wall-clock duration
- **Notes**: Test count, error summary, or dash if clean

### Stories Delivered
Only present if the phase delivers user stories (has `Delivers: US*` in roadmap.md). Shows acceptance criteria pass rate per story.

### Observable Truths
High-level behavioral assertions derived from phase goals. Each truth is verified by evidence from code inspection, test results, or manual check.

### Artifact Inventory
Three-level verification results for each file produced or modified by the phase:
- **L1 (Existence)**: YES if file exists on disk
- **L2 (Substantive)**: REAL if not a stub/placeholder, STUB if placeholder
- **L3 (Wired)**: WIRED if imported/used, ORPHAN if not connected

### Key Links
Connection traces between components. Shows whether the link between two artifacts is OK or BROKEN, and where the break occurs.

### Debt Balance
Technical debt marker summary:
- **Resolved**: Markers removed during the phase
- **Created**: Markers added during the phase
- **Net**: Difference (negative is good)
- **Status indicator**: GOOD (net <= 0), WARN (net > 0, all tracked), ALERT (net > 0, untracked items)

Lists any untracked debt items (markers without issue references like `TODO(ISS005)`).

### Gaps
XML-formatted gap entries. See [gap-types.md](gap-types.md) for the full gap type reference and detection rules.

### Human Verification Required
Checklist of items that require manual human verification. These are things that cannot be verified by code inspection or automated tests alone (visual design, complex behavior, external integrations).

---

## Post-Report Cleanup

After writing `verification.md`, delete `.opti-gsd/plans/phase-{N}/verification-progress.md`. The progress file is no longer needed once the final report exists.
