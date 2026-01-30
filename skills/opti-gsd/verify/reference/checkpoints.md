# Checkpoint Procedures

Detailed procedures for each of the 8 verification checkpoints. Progress is tracked in `.opti-gsd/plans/phase-{N}/verification-progress.md`.

---

## Checkpoint Stages Reference

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

---

## Step 0: Check Push Status

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

---

## Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .opti-gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:init new to start a new project
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

---

## Step 2: Load Context

Read:
- `.opti-gsd/config.json` — for CI commands and URLs
- `.opti-gsd/state.json`
- `.opti-gsd/roadmap.md` — for phase goals
- `.opti-gsd/plans/phase-{N}/plan.json` — for task details
- `.opti-gsd/plans/phase-{N}/summary.md` — for execution results

---

## Step 2.5: Check for Resume

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

---

## Step 3: CI Checks (Checkpoints 1-4)

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

---

## Step 3b: Code Intelligence Diagnostics (Optional Enhancement)

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

---

## Step 3c: Debt Balance Check (Checkpoint 5)

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

⚠️ 1 untracked debt item found. Run /opti-gsd:track issue to track.
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

---

## Step 3d: E2E Tests (Checkpoint 8)

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

---

## Step 4: Artifact Verification (Checkpoint 6)

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
- Do key links work? (Component -> API -> Database)

**Checkpoint:** Write progress to verification-progress.md after artifact verification complete (update stages and cache artifact inventory results).

---

## Step 5: Integration Check (Checkpoint 7)

If gaps found, spawn opti-gsd-integration-checker to verify:
- Export/import mapping
- API coverage (all routes have callers)
- Auth protection on sensitive routes
- E2E flow tracing

**Checkpoint:** Write progress to verification-progress.md after key link verification complete (update stages and cache integration check results).

---

## Step 5b: Story Acceptance Criteria Check

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

---

## Step 7: Handle Result

**passed:**
```markdown
## Phase {N} Verified!

All checks passed:
- [x] {observable truth 1}
- [x] {observable truth 2}
- [x] All artifacts substantive and wired

**Stories Delivered:**
- [x] US001: Export to Excel (all acceptance criteria met)
- [x] US003: Faster search (all acceptance criteria met)

**Debt Balance:** Net -3 (5 resolved, 2 created) - GOOD

Phase {N} is ready for milestone completion.

```

**Next steps:**
-> /opti-gsd:plan {N+1}      — Plan next phase
-> /opti-gsd:push                  — Push branch for preview deployment
-> /opti-gsd:milestone complete    — If all phases done (pushes and creates PR)
-> /opti-gsd:session archive {N}           — Archive to free context

State saved. Safe to /compact or start new session if needed.

Mark phase as verified in state.json.

**gaps_found:**
```markdown
## Phase {N} Verification: Gaps Found

**Issues:**
1. {gap 1 description}
2. {gap 2 description}

**Options:**
A) Run /opti-gsd:plan {N} --gaps to create gap closure plan
B) Fix manually and re-verify

Recommended: Option A for systematic closure

**With Loop Enabled (default):**
Proceed to Step 7a for automatic gap fixing.
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

---

## Step 7a: Report Gaps (No Auto-Loop)

When verification reports `gaps_found`, report to user and suggest next action.

**Philosophy:** Human judgment gates continuation. No automatic fix loops.

**Gap Report:**
```markdown
## Verification: Gaps Found

**Phase {N} verification identified {count} gaps:**

| # | Type | File | Issue |
|---|------|------|-------|
| 1 | orphan | components/StatsCard.tsx | Not imported anywhere |
| 2 | broken_link | Dashboard → API | Incorrect endpoint path |

**Next Steps:**
-> /opti-gsd:plan fix {N} — Generate fix plan for these gaps
-> Fix manually and re-run /opti-gsd:verify
-> /opti-gsd:session rollback {N} — Revert phase if fundamentally broken
```

---

## Step 8: Commit

```bash
git add .opti-gsd/plans/phase-{N}/verification.md
git commit -m "docs: verify phase {N} - {status}"
```
