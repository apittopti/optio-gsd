---
description: Verify phase completion with goal-backward analysis and integration checking.
---

# verify [phase]

Verify phase completion with goal-backward analysis and integration checking.

## Arguments

- `phase` — Phase number to verify (optional, defaults to last completed phase)
- `--resume` — Resume from last checkpoint if VERIFICATION-PROGRESS.md exists

## Behavior

### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:new-project to start a new project
```

If `.gsd/STATE.md` missing:
```
⚠️ Project State Missing
─────────────────────────────────────
.gsd/STATE.md not found.

→ Run /opti-gsd:init to reinitialize
```

If phase summary doesn't exist:
```
⚠️ Phase Not Executed
─────────────────────────────────────
Phase {N} has not been executed yet.

→ Run /opti-gsd:execute to execute the phase first
```

### Step 2: Load Context

Read:
- `.gsd/config.md` — for CI commands and URLs
- `.gsd/STATE.md`
- `.gsd/ROADMAP.md` — for phase goals
- `.gsd/plans/phase-{N}/plan.md` — for task details
- `.gsd/plans/phase-{N}/summary.md` — for execution results

### Step 2.5: Check for Resume

Check if `--resume` flag is provided OR `.gsd/plans/phase-{N}/VERIFICATION-PROGRESS.md` exists:

**If resuming:**

1. Load `.gsd/plans/phase-{N}/VERIFICATION-PROGRESS.md`
2. Parse completed stages from progress file
3. Display resume banner:

```
Resuming Verification: Phase {N}
──────────────────────────────────────────────────────────────
Last checkpoint: {timestamp}

Completed stages:
  [✓] CI Checks
  [✓] Artifact Verification

Pending stages:
  [ ] Key Link Verification
  [ ] E2E Tests
  [ ] Report Generation

Continuing from: Key Link Verification
──────────────────────────────────────────────────────────────
```

4. Skip already-completed stages in subsequent steps

**If not resuming:**
- Continue to Step 3 normally
- Create fresh VERIFICATION-PROGRESS.md on first checkpoint

### Step 3: Run CI Commands

Read CI configuration from `.gsd/config.md` and run in order:

```
Running CI checks...
──────────────────────────────────────────────────────────────
[1/4] Lint:      {ci.lint}
[2/4] Typecheck: {ci.typecheck}
[3/4] Test:      {ci.test}
[4/4] Build:     {ci.build}
──────────────────────────────────────────────────────────────
```

**Execution order** (fail-fast):
1. **Lint** (`ci.lint`) — Quick style/syntax check
2. **Typecheck** (`ci.typecheck`) — Type safety
3. **Test** (`ci.test`) — Unit/integration tests
4. **Build** (`ci.build`) — Compilation/bundling

If any command fails, report and stop:

```
CI Check Failed: Lint
──────────────────────────────────────────────────────────────
Command: npm run lint
Exit code: 1

Output:
  src/components/Button.tsx:15:5
    error: 'unused' is defined but never used

──────────────────────────────────────────────────────────────
Fix the issues and run /opti-gsd:verify again.
```

If all pass:
```
CI Checks Passed!
──────────────────────────────────────────────────────────────
[✓] Lint:      passed (2.1s)
[✓] Typecheck: passed (4.3s)
[✓] Test:      passed (12.5s) — 47 tests, 0 failures
[✓] Build:     passed (8.2s)
──────────────────────────────────────────────────────────────
```

**Skip missing commands:** If a CI command is `null` in config, skip it.

**Checkpoint:** Write progress to `.gsd/plans/phase-{N}/VERIFICATION-PROGRESS.md` after CI checks complete:
```markdown
# Verification Progress: Phase {N}

## Last Updated
{timestamp}

## Completed Stages
- [x] CI Checks - {pass/fail} - {timestamp}

## Pending Stages
- [ ] E2E Tests
- [ ] Artifact Verification
- [ ] Key Link Verification
- [ ] Report Generation

## CI Results (cached)
{lint: pass, typecheck: pass, test: pass, build: pass}
```

### Step 3: Run E2E Tests (if configured)

If `ci.e2e` is configured AND browser MCP is available:

**Determine target URL:**
1. Check `STATE.md` for `preview_url` (set by `/push`)
2. If preview available, use it (tests against real deployment)
3. Otherwise, use `urls.local` (tests against local dev server)

```
E2E Test Target:
──────────────────────────────────────────────────────────────
{If preview_url exists:}
[✓] Preview deployment: https://myapp-gsd-v1-0.vercel.app
    Testing against LIVE preview deployment

{If no preview_url:}
[○] No preview deployment. Testing locally.
    Run /opti-gsd:push first to test against real deployment.
──────────────────────────────────────────────────────────────
```

**If using local:**
1. Start the dev server (if not running):
   ```bash
   {package_manager} run dev &
   ```
2. Wait for server to be ready (check `urls.local`)

**If using preview:**
1. Verify preview URL is accessible
2. No need to start local server

**Run E2E tests:**
```bash
# Set BASE_URL for test framework
BASE_URL={preview_url || urls.local} {ci.e2e}
```

**Browser MCP verification (optional):**
If browser MCP available, can also run visual verification:
- Navigate to preview/local URL
- Check key pages render correctly
- Verify critical user flows

**Checkpoint:** Write progress to VERIFICATION-PROGRESS.md after E2E tests complete (update Completed/Pending stages and cache E2E results).

### Step 4: Spawn Verifier

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

**Checkpoint:** Write progress to VERIFICATION-PROGRESS.md after artifact verification complete (update stages and cache artifact inventory results).

### Step 5: Integration Check

If gaps found, spawn opti-gsd-integration-checker to verify:
- Export/import mapping
- API coverage (all routes have callers)
- Auth protection on sensitive routes
- E2E flow tracing

**Checkpoint:** Write progress to VERIFICATION-PROGRESS.md after key link verification complete (update stages and cache integration check results).

### Step 6: Generate Report

Write `.gsd/plans/phase-{N}/VERIFICATION.md`:

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

**Cleanup:** After writing VERIFICATION.md, delete `.gsd/plans/phase-{N}/VERIFICATION-PROGRESS.md` (progress file is no longer needed once final report exists).

### Step 7: Handle Result

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

### Step 8: Commit

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
