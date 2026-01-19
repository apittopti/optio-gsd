---
phase: 1
title: Workflow Refinement
wave_count: 2
discovery_level: 0
reqs: [I003]
estimated_tokens: 20k
---

# Phase 1: Workflow Refinement

## Must-Haves (Goal-Backward)

- [ ] Verify command warns if branch not pushed (when deploy configured)
- [ ] Complete-milestone always creates PR (no auto-merge)
- [ ] Clear workflow documented: execute → push → verify → PR → manual merge

## Wave 1 (Parallel)

<task id="01" wave="1" reqs="I003">
  <files>
    <file action="modify">commands/verify.md</file>
  </files>
  <action>
    Add Step 0: Check Push Status (before Step 1)

    1. Check if deploy.target is configured in .gsd/config.md
    2. If deploy configured, check if current branch has been pushed:
       ```bash
       git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null
       ```
    3. If not pushed (no upstream), show warning:
       ```
       ⚠️ Branch Not Pushed
       ─────────────────────────────────────
       Deploy target is configured ({deploy.target}) but branch
       {branch} has not been pushed yet.

       Pushing now allows you to verify against a preview deployment.

       → Run /opti-gsd:push first (recommended)
       → Or continue with local-only verification
       ```
    4. In interactive mode: ask "Push now? [Y/n]"
       - If yes: run /opti-gsd:push logic, then continue
       - If no: continue with local verification
    5. In yolo mode: show warning but continue (don't auto-push)

    Place this BEFORE existing Step 1: Validate Prerequisites
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="console">Step 0: Check Push Status appears before Step 1</check>
    <check type="console">Warning message includes deploy.target context</check>
  </verify>
  <done>verify.md has Step 0 that warns when branch not pushed and deploy is configured</done>
  <skills>none</skills>
</task>

<task id="02" wave="1" reqs="I003">
  <files>
    <file action="modify">commands/complete-milestone.md</file>
  </files>
  <action>
    Modify Step 5: Merge or Create PR

    Remove the auto-merge path. Always create PR regardless of workflow setting.

    **Replace Step 5 with:**

    ### Step 5: Push Branch and Create PR

    1. Ensure branch is pushed:
       ```bash
       git push -u origin {branch}
       ```

    2. Create PR using gh CLI (if available):
       ```bash
       gh pr create \
         --title "Release: {milestone}" \
         --body "$(cat .gsd/CHANGELOG-{milestone}.md)"
       ```

    3. If gh not available, provide manual instructions:
       ```markdown
       ## Create Pull Request

       Please create a PR manually:
       - **From:** {branch}
       - **To:** {base}
       - **Title:** Release: {milestone}
       - **Body:** See .gsd/CHANGELOG-{milestone}.md

       After merging, run `/opti-gsd:complete-milestone --finalize` to tag and archive.
       ```

    4. Report PR URL and stop (don't merge automatically)

    **Remove:** The "workflow = solo" auto-merge path
    **Keep:** Tag creation AFTER user merges PR (via --finalize flag)
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="console">Step 5 title is "Push Branch and Create PR"</check>
    <check type="console">No "git merge" command in Step 5</check>
    <check type="console">--finalize flag documented for post-merge steps</check>
  </verify>
  <done>complete-milestone.md always creates PR, no auto-merge path exists</done>
  <skills>none</skills>
</task>

## Wave 2 (After Wave 1)

<task id="03" wave="2" depends="01,02" reqs="I003">
  <files>
    <file action="modify">commands/complete-milestone.md</file>
  </files>
  <action>
    Add --finalize flag handling for post-merge cleanup

    At the start of the command, add flag handling:

    ### Step 0: Check Finalize Flag

    If `--finalize` flag provided:
    1. Verify PR has been merged (check if branch exists on base)
    2. Skip to Step 6 (Tag Release)
    3. Continue through Step 8-10 (Archive, Reset, Report)

    Update the arguments section:
    ```markdown
    ## Arguments

    - `--finalize` — Run post-merge steps (tag, archive) after PR is merged
    - `--force` — Complete even if phases incomplete (existing)
    ```

    Update Step 10 report to show two-phase completion:

    **After PR created (first run):**
    ```markdown
    ## PR Created

    **PR:** {pr_url}
    **Branch:** {branch} → {base}

    Next:
    1. Review and merge the PR
    2. Run `/opti-gsd:complete-milestone --finalize` to tag and archive
    ```

    **After finalize (second run):**
    ```markdown
    ## Milestone Complete!

    **Tag:** {milestone}
    **Archive:** .gsd/milestones/{milestone}/

    Ready for next milestone.
    → /opti-gsd:start-milestone {next}
    ```
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="console">--finalize flag documented in Arguments section</check>
    <check type="console">Step 0 handles finalize flag</check>
    <check type="console">Two-phase completion flow documented</check>
  </verify>
  <done>complete-milestone supports --finalize flag for post-merge steps</done>
  <skills>none</skills>
</task>
