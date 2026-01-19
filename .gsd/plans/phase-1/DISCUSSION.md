# Phase 1 Discussion: Branch Enforcement

**Captured:** 2026-01-19
**Participants:** User, Claude

## Summary

Add branch validation to workflow commands to prevent accidental commits to base branch when milestone branching is configured.

## Technical Decisions

### Commands to Check
- `discuss-phase` — before capturing discussions
- `plan-phase` — before creating plans
- `execute` — before running tasks

These are the main workflow commands that modify files and commit.

### Behavior When on Base Branch
**Mode-controlled:**
- **interactive mode**: Warn and ask for confirmation
  > "You're on master but branching: milestone is configured. Continue anyway? [y/N]"
  > Or: "Create branch gsd/{milestone}? [Y/n]"
- **yolo mode**: Auto-create the milestone branch and switch

### Implementation Approach
- Add "Step 0: Validate Branch" section to each command
- Check: `config.branching == "milestone" AND current_branch == config.base`
- If true: trigger warning/auto-branch based on mode

### Config
- Use existing `branching: milestone` setting
- No new config needed — if `branching: milestone`, enforce it

## Constraints

- Must not break existing workflows
- Must work when no milestone is set (suggest starting one)
- Cross-platform (Git commands work same on Windows/Unix)

## Open Questions

- [x] Which commands? → discuss-phase, plan-phase, execute
- [x] Behavior? → Mode-controlled (interactive warns, yolo auto-branches)
- [x] Where to add? → Step 0 in each command
- [x] Config? → Use existing branching setting

## References

- Config file: `.gsd/config.md` has `branching: milestone` and `base: master`
- STATE.md has `branch:` field tracking current branch

---

*This informs the planning phase. Run `/opti-gsd:plan-phase 1` when ready.*
