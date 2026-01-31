---
description: Verify phase completion with goal-backward analysis, integration checking, and automatic gap fixing
---

# verify [phase]

Verify phase completion with goal-backward analysis and integration checking.

## Arguments

- `phase` — Phase number to verify (optional, defaults to last completed phase)
- `--resume` — Resume from last checkpoint if verification-progress.md exists

## Checkpoint Stages Reference

Verification progress is tracked through 8 stages. Each stage writes to `.opti-gsd/plans/phase-{N}/verification-progress.md` on completion.

| Stage | Order | Trigger | What Gets Written |
|-------|-------|---------|-------------------|
| CI-lint | 1 | After lint completes | Lint result (pass/fail, time) |
| CI-typecheck | 2 | After typecheck completes | Typecheck result (pass/fail, time) |
| CI-test | 3 | After tests complete | Test result (pass/fail, time, count) |
| CI-build | 4 | After build completes | Build result (pass/fail, time) |
| Debt-Balance | 5 | After debt marker scan | Resolved/created/net, untracked items |
| Artifacts | 6 | After three-level verification | Artifact inventory (L1/L2/L3 status) |
| Key-Links | 7 | After connection tracing | Link status (OK/BROKEN) |
| E2E | 8 | After E2E tests complete | E2E result (pass/fail/skip, time) |

**Resume Point:** When resuming, verification continues from the first incomplete stage. Completed stages are not re-run.

## Behavior

### Step 0: Check Push Status

Before validating prerequisites, check if the branch should be pushed for deployment testing.

**1. Check deploy target configuration:**
Read `.opti-gsd/config.json` and look for `deploy.target` setting.

**2. If deploy is configured, check branch push status:**
```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null
```

**3. If no upstream (branch not pushed), show warning:**
```
Warning: Branch Not Pushed
---------------------------------------------
Deploy target is configured ({deploy.target}) but branch
{current_branch} has not been pushed yet.

Pushing now allows you to verify against a preview deployment.

-> Run /opti-gsd:push first (recommended)
-> Or continue with local-only verification
```

**4. Interactive mode behavior:**
Ask: "Push now? [Y/n]"
- If **yes**: Execute /opti-gsd:push logic, then continue to Step 1
- If **no**: Continue to Step 1 with local-only verification

**5. Yolo mode behavior:**
- Show the warning message
- Continue to Step 1 automatically (do not auto-push)

**6. If deploy is NOT configured:**
- Skip this step silently
- Continue to Step 1

**7. If branch IS already pushed:**
- Skip the warning
- Continue to Step 1

### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .opti-gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:new-project to start a new project
```

If `.opti-gsd/state.json` missing:
```
⚠️ Project State Missing
─────────────────────────────────────
.opti-gsd/state.json not found.

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
- `.opti-gsd/config.json` — for CI commands and URLs
- `.opti-gsd/state.json`
- `.opti-gsd/roadmap.md` — for phase goals
- `.opti-gsd/plans/phase-{N}/plan.json` — for task details
- `.opti-gsd/plans/phase-{N}/summary.md` — for execution results

### Step 2.5: Check for Resume

Check if `--resume` flag is provided OR `.opti-gsd/plans/phase-{N}/verification-progress.md` exists:

**If resuming:**

1. Load `.opti-gsd/plans/phase-{N}/verification-progress.md`
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
- Create fresh verification-progress.md on first checkpoint

### Step 3: Run CI Commands

Read CI configuration from `.opti-gsd/config.json` and run in order:

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

### Step 3b: Code Intelligence Diagnostics (Optional Enhancement)

Check `.opti-gsd/tools.json` for available code intelligence tools. If cclsp is available, check for real-time diagnostics on changed files:

```
Code Intelligence (from .opti-gsd/tools.json)
──────────────────────────────────────────────────────────────
Checking files modified in this phase...
```

**Check for cclsp availability:**
1. Read `.opti-gsd/tools.json`
2. Look for "cclsp" in the MCP Servers section
3. If available, use ToolSearch to load `mcp__cclsp__get_diagnostics`

**Check changed files:**
1. Get list of files modified in phase from summary.md
2. For each file, call `mcp__cclsp__get_diagnostics`
3. Report any errors or warnings

**If diagnostics found:**
```
Code Intelligence: Issues Found
──────────────────────────────────────────────────────────────
src/components/StatsCard.tsx:
  Line 15: Property 'data' does not exist on type 'Props'
  Line 23: Missing import: 'formatNumber'

src/api/stats.ts:
  Line 8: 'response' is declared but never used

──────────────────────────────────────────────────────────────
These are real-time type/import issues detected by cclsp.
Fix before continuing? [Y/n]
```

**If no diagnostics:**
```
[✓] Code Intelligence: No issues found
```

**If cclsp not available:**
```
[○] Code Intelligence: Skipped (cclsp not detected)
    Run /opti-gsd:tools detect to check available tools
```

**Note:** Code intelligence diagnostics are advisory. They often catch issues that CI would find later, but faster. This step never blocks verification - it just reports.

### Step 3c: Debt Balance Check

Scan modified files for debt marker changes to track technical debt trends:

```
Debt Balance Check
──────────────────────────────────────────────────────────────
Scanning {N} modified files for debt markers...

  Resolved: 5 markers
  Created:  2 markers
  Net:      -3 (GOOD)

New debt items:
  [✓] src/api/stats.ts:89 - TODO(ISS005): pagination
  [✗] src/components/Modal.tsx:15 - HACK: force rerender

⚠️ 1 untracked debt item found. Run /opti-gsd:add-issue to track.
──────────────────────────────────────────────────────────────
```

**Debt markers scanned:**
- `TODO`, `FIXME`, `HACK`, `XXX`, `BUG`, `DEBT`
- Markers with issue references (e.g., `TODO(ISS005)`) are considered tracked
- Markers without issue references are flagged as untracked

**How it works:**
1. Get list of files modified in this phase (from git diff against base branch)
2. For each file, compare debt markers in old version vs new version
3. Calculate resolved (removed), created (added), and net change
4. Identify tracked vs untracked new debt items

**Debt balance status indicators:**
- `GOOD` — Net debt decreased or stayed the same
- `WARN` — Net debt increased but all items are tracked
- `ALERT` — Net debt increased with untracked items

**Impact on verification:**
- Debt balance is informational and does not block verification
- Untracked debt items are flagged for awareness
- High debt accumulation across phases may warrant a cleanup phase

**Checkpoint:** Write progress to `.opti-gsd/plans/phase-{N}/verification-progress.md` after CI checks complete:
```markdown
# Verification Progress: Phase {N}

## Last Updated
{timestamp}

## Completed Stages
- [x] CI Checks - {pass/fail} - {timestamp}

## Pending Stages
- [ ] Debt Balance Check
- [ ] E2E Tests
- [ ] Artifact Verification
- [ ] Key Link Verification
- [ ] Report Generation

## CI Results (cached)
{lint: pass, typecheck: pass, test: pass, build: pass}

## Debt Balance (cached)
{resolved: 5, created: 2, net: -3, status: GOOD}
```

### Step 3: Run E2E Tests (if configured)

If `ci.e2e` is configured AND browser MCP is available:

**Determine target URL:**
1. Check `state.json` for `preview_url` (set by `/push`)
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

**Checkpoint:** Write progress to verification-progress.md after E2E tests complete (update Completed/Pending stages and cache E2E results).

### Step 4: Spawn Verifier

Spawn opti-gsd-verifier agent with:
- Phase goals from roadmap.md
- Must-haves from plan.json
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

**Checkpoint:** Write progress to verification-progress.md after artifact verification complete (update stages and cache artifact inventory results).

### Step 5: Integration Check

If gaps found, spawn opti-gsd-integration-checker to verify:
- Export/import mapping
- API coverage (all routes have callers)
- Auth protection on sensitive routes
- E2E flow tracing

**Checkpoint:** Write progress to verification-progress.md after key link verification complete (update stages and cache integration check results).

### Step 5b: Story Acceptance Criteria Check

If phase delivers user stories (has `Delivers: US*` in roadmap.md):

1. Load story files from `.opti-gsd/stories/`
2. Extract acceptance criteria from each story
3. Verify each criterion is satisfied

```markdown
## Story Acceptance Verification

### US001: Export to Excel
| Criterion | Status | Evidence |
|-----------|--------|----------|
| Export button visible on dashboard | PASS | Button exists in DashboardHeader |
| Downloads as .xlsx format | PASS | ExportService uses xlsx library |
| Includes all visible columns | PASS | columnConfig passed to export |

### US003: Faster search
| Criterion | Status | Evidence |
|-----------|--------|----------|
| Search returns in < 500ms | PASS | Index added, avg 120ms |
| Results highlight search term | PASS | Highlighter component added |
```

**Verification methods:**
- Code inspection (component exists, API called)
- Test results (if covered by tests)
- Browser verification (if browser MCP available)
- Manual check required (flag for human verification)

### Step 6: Generate Report

Write `.opti-gsd/plans/phase-{N}/verification.md`:

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

**Cleanup:** After writing verification.md, delete `.opti-gsd/plans/phase-{N}/verification-progress.md` (progress file is no longer needed once final report exists).

### Step 7: Handle Result + User Review

All three outcomes (passed, gaps_found, human_needed) now flow into a unified user review step. The automated results are presented FIRST, then the user is always asked for their input.

#### 7a: Present Automated Results

**If passed:**
```markdown
## Phase {N} Verification Results

### Automated Checks: ALL PASSED ✓
- [x] {observable truth 1}
- [x] {observable truth 2}
- [x] All artifacts substantive and wired

### Stories Delivered:
- [x] US001: Export to Excel (all acceptance criteria met)
- [x] US003: Faster search (all acceptance criteria met)

### Debt Balance: Net -3 (5 resolved, 2 created) - GOOD
```

**If gaps_found:**
```markdown
## Phase {N} Verification Results

### Automated Checks: GAPS FOUND

**Passing:**
- [x] {passing checks}

**Gaps identified ({count}):**
| # | Type | File | Issue |
|---|------|------|-------|
| 1 | orphan | components/StatsCard.tsx | Not imported anywhere |
| 2 | broken_link | Dashboard → API | Incorrect endpoint path |
```

**If human_needed:**
```markdown
## Phase {N} Verification Results

### Automated Checks: PASSED (human verification needed)

**Code checks passed**, but these need your eyes:
- [ ] Visual: {description}
- [ ] Behavior: {description}
- [ ] External: {description}
```

#### 7b: User Review (ALWAYS — regardless of automated result)

After presenting automated results, ALWAYS ask the user for their assessment:

```markdown
### Your Review

The automated checks are above. Now it's your turn.

**Please check the actual behavior** — does it match what you expected?
{Compile user_observable from plan.json tasks:}
1. {user_observable from T01}
2. {user_observable from T02}
3. {user_observable from T03}

{If browser MCP available:}
Tip: I can screenshot pages for you — just ask.

{If API endpoints exist:}
Tip: Want me to hit the API endpoints and show responses?

**What do you think?**
→ "looks good" — Mark phase as verified, move on
→ Describe issues — I'll fix them (automated gaps + your feedback together)
→ "show me [page/endpoint/component]" — I'll check it for you
```

#### 7c: Process Combined Feedback

If the user provides feedback OR automated gaps were found, combine them into a single fix round:

1. **Merge all issues** — automated gaps + user feedback:
   ```markdown
   ## Issues to Fix

   ### From automated verification:
   | # | Type | Issue |
   |---|------|-------|
   | A1 | orphan | StatsCard not imported |
   | A2 | broken_link | Dashboard → API path wrong |

   ### From your review:
   | # | Category | Issue |
   |---|----------|-------|
   | U1 | wrong_behavior | Error messages too generic |
   | U2 | missing | No forgot password link |

   **Fix all {count} issues now?** [Y/n]
   ```

2. **Generate combined fix plan** — `review-fix-plan.json`:
   - Automated gaps get fix tasks (same as plan-fix logic)
   - User feedback gets categorized fix tasks (same as review logic)
   - All tasks get quality gates (TDD if applicable, verification-before-completion)

3. **Execute fixes** — spawn executor subagents for each fix task

4. **Re-verify** — after fixes complete, re-run automated checks (CI, artifacts, links)

5. **Re-present to user:**
   ```markdown
   ## Fixes Applied + Re-Verification

   ### Fixes completed:
   - [x] A1: Imported StatsCard in Dashboard (commit abc123)
   - [x] A2: Fixed API endpoint path (commit def456)
   - [x] U1: Added specific error messages (commit ghi789)
   - [x] U2: Added forgot password link (commit jkl012)

   ### Re-verification: ALL PASSED ✓
   - [x] CI checks pass
   - [x] All artifacts wired
   - [x] No orphans

   **How does this look now?**
   → "looks good" — Phase verified, move on
   → More feedback — Another fix round
   ```

6. **Loop** until user says "looks good"

#### 7d: Phase Verified

When user approves:

```markdown
## Phase {N} Verified! ✓

**Automated checks:** All passed
**User review:** Approved
**Fix rounds:** {count} (if any)
**Total fixes applied:** {count} (if any)

Phase {N} is ready for milestone completion.
```

**Next steps:**
→ /opti-gsd:plan-phase {N+1}      — Plan next phase
→ /opti-gsd:push                  — Push branch for preview deployment
→ /opti-gsd:complete-milestone    — If all phases done (pushes and creates PR)
→ /opti-gsd:archive {N}           — Archive to free context

💾 State saved. Safe to /compact or start new session if needed.

Mark phase as verified in state.json with review metadata:
```json
{
  "phases": {
    "{N}": {
      "status": "verified",
      "review": {
        "rounds": 2,
        "automated_fixes": 2,
        "user_fixes": 3,
        "approved_at": "2026-01-31T10:30:00Z"
      }
    }
  }
}
```

### Step 8: Commit

```bash
git add .opti-gsd/plans/phase-{N}/verification.md
git commit -m "docs: verify phase {N} - {status}"
```

---

## Context Budget

- Loading: ~10%
- Verifier agent: spawned with fresh context
- Integration checker: spawned with fresh context
- Report writing: ~5%

Orchestrator stays under 15%.

