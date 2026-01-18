---
description: Verify phase completion with goal-backward analysis and integration checking.
---

# verify [phase]

Verify phase completion with goal-backward analysis and integration checking.

## Arguments

- `phase` — Phase number to verify (optional, defaults to last completed phase)

## Behavior

### Step 1: Load Context

Read:
- `.gsd/config.md`
- `.gsd/STATE.md`
- `.gsd/ROADMAP.md` — for phase goals
- `.gsd/plans/phase-{N}/plan.md` — for task details
- `.gsd/plans/phase-{N}/summary.md` — for execution results

### Step 2: Spawn Verifier

Spawn opti-gsd-verifier agent with:
- Phase goals from ROADMAP.md
- Must-haves from plan.md
- Execution summary

The verifier performs three-level artifact verification:

**Level 1: Existence**
- Do all specified files exist?

**Level 2: Substantive**
- Are files real implementations or stubs?
- Check for: TODO, FIXME, placeholder returns, < 10 lines

**Level 3: Wired**
- Are artifacts connected to the system?
- Are they imported and used?
- Do key links work? (Component → API → Database)

### Step 3: Integration Check

If gaps found, spawn opti-gsd-integration-checker to verify:
- Export/import mapping
- API coverage (all routes have callers)
- Auth protection on sensitive routes
- E2E flow tracing

### Step 4: Generate Report

Write `.gsd/plans/phase-{N}/VERIFICATION.md`:

```markdown
# Verification Report: Phase {N}

## Status: {passed | gaps_found | human_needed}

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

### Step 5: Handle Result

**passed:**
```markdown
## Phase {N} Verified!

All checks passed:
- [x] {observable truth 1}
- [x] {observable truth 2}
- [x] All artifacts substantive and wired

Phase {N} is ready for milestone completion.

Next steps:
→ /opti-gsd:plan-phase {N+1}      — Plan next phase
→ /opti-gsd:complete-milestone    — If all phases done
→ /opti-gsd:archive {N}           — Archive to free context

💾 State saved. Safe to /compact or start new session if needed.
```

Mark phase as verified in STATE.md.

**gaps_found:**
```markdown
## Phase {N} Verification: Gaps Found

**Issues:**
1. {gap 1 description}
2. {gap 2 description}

**Options:**
A) Run `/opti-gsd:plan-phase {N} --gaps` to create gap closure plan
B) Fix manually and re-verify

Recommended: Option A for systematic closure
```

**human_needed:**
```markdown
## Phase {N} Verification: Human Check Required

Code verification passed, but these need human verification:
- [ ] Visual: {description}
- [ ] Behavior: {description}
- [ ] External: {description}

Please verify manually and confirm:
> "Verified" or "Issues found: {description}"
```

### Step 6: Commit

```bash
git add .gsd/plans/phase-{N}/VERIFICATION.md
git commit -m "docs: verify phase {N} - {status}"
```

---

## Context Budget

- Loading: ~10%
- Verifier agent: spawned with fresh context
- Integration checker: spawned with fresh context
- Report writing: ~5%

Orchestrator stays under 15%.
