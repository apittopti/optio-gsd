---
name: verify
description: Verify phase completion using goal-backward analysis, integration checking, test validation, and technical debt scanning. Generates verification report with pass/fail per checkpoint and auto-fixes gaps.
disable-model-invocation: true
argument-hint: [phase-number]
---

# verify [phase]

Verify phase completion with goal-backward analysis and integration checking.

## Arguments

- `phase` — Phase number to verify (optional, defaults to last completed phase)
- `--resume` — Resume from last checkpoint if verification-progress.md exists

## Verification Overview

Verification runs 8 checkpoints in order. Each checkpoint writes progress to `.opti-gsd/plans/phase-{N}/verification-progress.md` so verification can be resumed if interrupted.

| # | Checkpoint | What It Checks |
|---|------------|----------------|
| 1 | CI-lint | Style/syntax via lint command |
| 2 | CI-typecheck | Type safety |
| 3 | CI-test | Unit/integration tests |
| 4 | CI-build | Compilation/bundling |
| 5 | Debt-Balance | Technical debt marker trends |
| 6 | Artifacts | Three-level file verification (Exist/Substantive/Wired) |
| 7 | Key-Links | Component connection tracing |
| 8 | E2E | End-to-end tests against preview or local |

**Resume:** When `--resume` is used (or progress file exists), verification continues from the first incomplete checkpoint. Completed checkpoints are not re-run.

For the detailed procedure of each checkpoint, see [reference/checkpoints.md](reference/checkpoints.md).

## Behavior (High-Level Flow)

### Step 0: Check Push Status

Before verification, check if the branch should be pushed for deployment testing.

- Read `.opti-gsd/config.json` for `deploy.target`
- If deploy is configured but branch not pushed, warn and offer to push first
- If deploy not configured or branch already pushed, skip silently
- Yolo mode: show warning but continue automatically (do not auto-push)

### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

- `.opti-gsd/` directory must exist (suggest `/opti-gsd:init` if missing)
- `.opti-gsd/state.json` must exist (suggest `/opti-gsd:init` if missing)
- Phase summary must exist (suggest `/opti-gsd:execute` if missing)

### Step 2: Load Context

Read these files to understand what was planned and executed:
- `.opti-gsd/config.json` — CI commands and URLs
- `.opti-gsd/state.json`
- `.opti-gsd/roadmap.md` — Phase goals
- `.opti-gsd/plans/phase-{N}/plan.json` — Task details
- `.opti-gsd/plans/phase-{N}/summary.md` — Execution results

### Step 2.5: Check for Resume

If `--resume` flag or `verification-progress.md` exists, load completed stages, display resume banner, and skip completed checkpoints. Otherwise start fresh.

### Step 3: Run Checkpoints 1-8

Execute each checkpoint in order. See [reference/checkpoints.md](reference/checkpoints.md) for full procedures.

**Summary of checkpoint flow:**

1. **CI Checks (Checkpoints 1-4):** Run lint, typecheck, test, build in fail-fast order. Skip commands that are `null` in config.
2. **Code Intelligence (Optional):** If cclsp available in `.opti-gsd/tools.json`, check diagnostics on changed files. Advisory only, never blocks.
3. **Debt Balance (Checkpoint 5):** Scan modified files for debt markers (TODO, FIXME, HACK, XXX, BUG, DEBT). Calculate resolved/created/net. Flag untracked items.
4. **E2E Tests (Checkpoint 8):** If `ci.e2e` configured, run against preview URL or local dev server. Uses browser MCP if available.
5. **Artifact Verification (Checkpoint 6):** Spawn opti-gsd-verifier agent for three-level check: L1 Existence, L2 Substantive (not stubs), L3 Wired (imported/used).
6. **Integration Check (Checkpoint 7):** If gaps found, spawn opti-gsd-integration-checker for export/import mapping, API coverage, auth protection, E2E flow tracing.
7. **Story Acceptance (within Checkpoint 6/7):** If phase delivers user stories, verify each acceptance criterion with evidence.

### Step 6: Generate Report

Write `.opti-gsd/plans/phase-{N}/verification.md` with full results. Delete `verification-progress.md` after report is written.

See [reference/report-format.md](reference/report-format.md) for the complete report template.

### Step 7: Handle Result

Three possible outcomes:

**passed:** All checks pass. Mark phase as verified in state.json. Show next steps:
- `/opti-gsd:plan {N+1}` — Plan next phase
- `/opti-gsd:push` — Push branch for preview deployment
- `/opti-gsd:milestone complete` — If all phases done
- `/opti-gsd:session archive {N}` — Archive to free context

**gaps_found:** Report gaps to user and suggest next action. No automatic fix loops — human judgment gates continuation. See [reference/gap-types.md](reference/gap-types.md) for gap type reference.

Next steps for gaps:
- `/opti-gsd:plan fix {N}` — Generate fix plan
- Fix manually and re-run `/opti-gsd:verify`
- `/opti-gsd:session rollback {N}` — Revert if fundamentally broken

**human_needed:** Code verification passed but visual/behavioral/external checks need human confirmation. List items for manual verification.

### Step 8: Commit

```bash
git add .opti-gsd/plans/phase-{N}/verification.md
git commit -m "docs: verify phase {N} - {status}"
```

## Detail References

| File | Contents |
|------|----------|
| [reference/checkpoints.md](reference/checkpoints.md) | Full 8-checkpoint verification procedures with output formats |
| [reference/gap-types.md](reference/gap-types.md) | Gap detection rules, categories, and typical fixes |
| [reference/report-format.md](reference/report-format.md) | Complete verification report template |

---

## Context Budget

- Loading: ~10%
- Verifier agent: spawned with fresh context
- Integration checker: spawned with fresh context
- Report writing: ~5%

Orchestrator stays under 15%.
