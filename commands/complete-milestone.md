# /opti-gsd:complete-milestone

Complete the current milestone and prepare for release.

## Behavior

### Step 1: Verify All Phases Complete

Check ROADMAP.md:
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

### Step 2: Run Final Verification

Spawn opti-gsd-verifier for overall milestone check:
- All requirements covered
- All success criteria met
- No critical open issues

Spawn opti-gsd-integration-checker for cross-phase integration:
- Phase outputs properly connected
- No orphaned code
- E2E flows working

### Step 3: Generate Changelog

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

Write to `.gsd/CHANGELOG-{milestone}.md`.

### Step 4: Update ROADMAP.md

```markdown
## Milestone: {name} [COMPLETE]

### Phase 1: {Title} [COMPLETE]
...

### Phase 2: {Title} [COMPLETE]
...
```

### Step 5: Push Branch

```bash
git push -u origin {branch}
```

### Step 6: Create Pull Request (if gh available)

```bash
gh pr create \
  --title "Release: {milestone}" \
  --body "$(cat .gsd/CHANGELOG-{milestone}.md)"
```

If gh not available:
```markdown
## Create Pull Request

Please create a PR manually:
- **From:** {branch}
- **To:** {base}
- **Title:** Release: {milestone}
- **Body:** See .gsd/CHANGELOG-{milestone}.md
```

### Step 7: Tag Release

After PR is merged (or if no PR workflow):

```bash
git tag -a {milestone} -m "Release {milestone}"
git push origin {milestone}
```

### Step 8: Archive Milestone

```bash
mkdir -p .gsd/milestones/{milestone}
mv .gsd/plans/* .gsd/milestones/{milestone}/
mv .gsd/archive/* .gsd/milestones/{milestone}/
mv .gsd/summaries/* .gsd/milestones/{milestone}/
mv .gsd/research/* .gsd/milestones/{milestone}/ 2>/dev/null || true
```

### Step 9: Reset for Next Milestone

Update STATE.md:
```yaml
---
milestone: null
phase: null
task: null
branch: {base_branch}

last_active: {timestamp}
session_tokens: 0

phases_complete: []
phases_in_progress: []
phases_pending: []

open_issues: []
---

## Session Context
Milestone {name} complete. Ready for next milestone.
```

### Step 10: Commit and Report

```bash
git add .gsd/
git commit -m "chore: complete milestone {name}"
```

```markdown
## Milestone Complete! 🎉

**Milestone:** {name}
**Phases:** {count} completed
**Requirements:** {count} delivered

**Artifacts:**
- Branch: {branch}
- PR: {pr_url if created}
- Tag: {milestone}
- Changelog: .gsd/CHANGELOG-{milestone}.md
- Archive: .gsd/milestones/{milestone}/

**Next:**
- Merge the PR
- Start next milestone: `/opti-gsd:start-milestone {next}`
```

---

## Context Budget

- Verification: spawned agents
- Changelog generation: ~10%
- Git operations: ~5%
- Total orchestrator: ~15%
