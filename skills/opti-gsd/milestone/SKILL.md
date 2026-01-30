---
name: milestone
description: Manage milestone lifecycle - start new milestones or complete current ones. Subcommands: start, complete.
disable-model-invocation: true
---

# milestone

Manage milestone lifecycle - start new milestones or complete current ones.

## Usage

- `/opti-gsd:milestone start [name]` — Start new milestone branch
- `/opti-gsd:milestone complete` — Complete current milestone and create PR

## Routing

Parse the first argument after `milestone`:

- `start [name]` → Jump to [Subcommand: start](#subcommand-start)
- `complete` → Jump to [Subcommand: complete](#subcommand-complete)

If no subcommand provided, display the Usage section above and stop.

---

## Subcommand: start

Start a new milestone branch.

### Arguments

- `name` — Milestone name (e.g., "v1.0", "v1.1-hotfix")

### Behavior

#### Step 1: Check Prerequisites

```bash
# Check for uncommitted changes
git status --porcelain
```

If uncommitted changes:
```markdown
## Cannot Start Milestone

Uncommitted changes detected:
{list of files}

Please commit or stash changes first:
- `git add . && git commit -m "wip: current state"`
- Or: `git stash`
```

#### Step 2: Validate Name

Check name format:
- Should match pattern: `v{major}.{minor}` or `v{major}.{minor}-{suffix}`
- Examples: `v1.0`, `v1.1`, `v2.0-redesign`, `v1.0.1-hotfix`

#### Step 3: Create Branch

```bash
# Get prefix from config
prefix=$(grep 'prefix:' .opti-gsd/config.json | awk '{print $2}')

# Create and checkout branch
git checkout -b "${prefix}${name}"
```

#### Step 4: Update state.json

```json
{
  "milestone": "{name}",
  "phase": null,
  "task": null,
  "status": "milestone_started",
  "branch": "{prefix}{name}",
  "last_active": "{timestamp}",
  "phases": {
    "complete": [],
    "in_progress": [],
    "pending": []
  },
  "context": "Started milestone {name}. Ready to create roadmap."
}
```

#### Step 5: Update roadmap.md

If roadmap.md exists, add new milestone section:

```markdown
## Milestone: {name}

(Phases to be defined)
```

#### Step 6: Commit

```bash
git add .opti-gsd/state.json .opti-gsd/roadmap.md
git commit -m "chore: start milestone {name}"
```

#### Step 7: Report

```markdown
## Milestone Started

**Name:** {name}
**Branch:** {prefix}{name}

```

**Next steps:**
> /opti-gsd:roadmap      — Define roadmap
> /opti-gsd:plan 1 — Or start planning if roadmap exists

### Context Budget

Minimal: ~3%

---

## Subcommand: complete

Complete the current milestone and prepare for release.

### Arguments

- `--finalize` — Run post-merge steps (tag, archive) after PR is merged
- `--force` — Complete even if phases incomplete

### Behavior

#### Step 0: Check Finalize Flag

If `--finalize` flag provided:
1. Verify PR has been merged (check if milestone branch still exists or has been deleted, or check if base branch contains the commits)
2. Skip directly to Step 6 (Tag Release)
3. Continue through remaining steps (Archive, Reset, Report)

If no flag, continue to Step 1 normally.

#### Step 1: Verify All Phases Complete

Check roadmap.md:
- All phases marked complete
- All phases verified

If incomplete:
```markdown
## Cannot Complete Milestone

Incomplete phases:
- Phase {N}: {status}
- Phase {M}: {status}

Complete all phases first, or use `--force` to proceed anyway.
```

#### Step 2: Run Final Verification

Spawn opti-gsd-verifier for overall milestone check:
- All requirements covered
- All success criteria met
- No critical open issues

Spawn opti-gsd-integration-checker for cross-phase integration:
- Phase outputs properly connected
- No orphaned code
- E2E flows working

#### Step 3: Generate Changelog

Compile from phase summaries:

```markdown
# Changelog: {milestone}

## Summary
{Brief description of what this milestone delivers}

## Features
- {Feature from Phase 1}
- {Feature from Phase 2}
- {Feature from Phase N}

## Fixes
- {Fix from debug sessions}
- {Fix from auto-fixes}

## Technical
- {Architecture decisions}
- {Dependencies added}

## Requirements Completed
- AUTH-01: User Registration ✓
- AUTH-02: User Login ✓
- DASH-01: Dashboard Layout ✓
{...all requirements}
```

Write to `.opti-gsd/changelog-{milestone}.md`.

#### Step 4: Update roadmap.md

```markdown
## Milestone: {name} [COMPLETE]

### Phase 1: {Title} [COMPLETE]
...

### Phase 2: {Title} [COMPLETE]
...
```

#### Step 5: Push Branch and Create PR

1. Ensure branch is pushed:
   ```bash
   git push -u origin {branch}
   ```

2. Create PR using gh CLI (if available):
   ```bash
   gh pr create \
     --title "Release: {milestone}" \
     --body "$(cat .opti-gsd/changelog-{milestone}.md)"
   ```

3. If gh not available, provide manual instructions:
   ```markdown
   ## Create Pull Request

   Please create a PR manually:
   - **From:** {branch}
   - **To:** {base}
   - **Title:** Release: {milestone}
   - **Body:** See .opti-gsd/changelog-{milestone}.md

   After merging, run /opti-gsd:milestone complete --finalize to tag and archive.
   ```

4. Report PR URL and stop (don't merge automatically)

#### Step 6: Tag Release

```bash
git tag -a {milestone} -m "Release {milestone}"
git push origin {milestone}
```

#### Step 8: Archive Milestone

```bash
mkdir -p .opti-gsd/milestones/{milestone}
mv .opti-gsd/plans/* .opti-gsd/milestones/{milestone}/
mv .opti-gsd/archive/* .opti-gsd/milestones/{milestone}/
mv .opti-gsd/summaries/* .opti-gsd/milestones/{milestone}/
mv .opti-gsd/research/* .opti-gsd/milestones/{milestone}/ 2>/dev/null || true
```

#### Step 9: Reset for Next Milestone

Update state.json:
```json
{
  "milestone": null,
  "phase": null,
  "task": null,
  "status": "milestone_complete",
  "branch": "{base_branch}",
  "last_active": "{timestamp}",
  "phases": {
    "complete": [],
    "in_progress": [],
    "pending": []
  },
  "context": "Milestone complete. Ready for next milestone."
}

## Session Context
Milestone {name} complete. Ready for next milestone.
```

#### Step 10: Commit and Report

```bash
git add .opti-gsd/
git commit -m "chore: complete milestone {name}"
```

**After PR created (first run):**

```markdown
## PR Created

**Milestone:** {name}
**PR:** {pr_url}
**Branch:** {branch} → {base}

Next:
1. Review and merge the PR
2. Run /opti-gsd:milestone complete --finalize to tag and archive
```

**After finalize (second run):**

```markdown
## Milestone Finalized!

**Tag:** {milestone}
**Archive:** .opti-gsd/milestones/{milestone}/

Ready for next milestone.
> /opti-gsd:milestone start {next}
```

### Context Budget

- Verification: spawned agents
- Changelog generation: ~10%
- Git operations: ~5%
- Total orchestrator: ~15%
