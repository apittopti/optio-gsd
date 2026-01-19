---
phase: 1
title: Branch Enforcement
wave_count: 1
task_count: 3
estimated_tokens: 20k
---

# Phase 1: Branch Enforcement

## Must-Haves (Goal-Backward)

- [ ] User is warned when on base branch with milestone configured
- [ ] Interactive mode prompts for confirmation before continuing
- [ ] Yolo mode auto-switches to milestone branch
- [ ] Clear guidance when no milestone is active
- [ ] Existing command steps remain unchanged (no renumbering)

## Wave 1 (Parallel)

<task id="01" wave="1">
  <files>
    <file action="modify">commands/discuss-phase.md</file>
  </files>
  <action>
    Insert "Step 0: Validate Branch" section BEFORE "Step 1: Identify Phase".

    Find the line "### Step 1: Identify Phase" and insert the Step 0 section before it.

    Step 0 content:
    - Check if branching: milestone in config
    - Get current branch via git command
    - If on base branch:
      - No milestone set: show warning, direct to start-milestone
      - Milestone set: interactive prompts, yolo auto-switches
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="content">Contains "### Step 0: Validate Branch"</check>
    <check type="content">Step 0 appears before Step 1</check>
    <check type="content">Contains "branching: milestone"</check>
    <check type="content">Contains interactive and yolo mode behavior</check>
  </verify>
  <done>discuss-phase.md has Step 0 branch validation</done>
  <skills>none</skills>
</task>

<task id="02" wave="1">
  <files>
    <file action="modify">commands/plan-phase.md</file>
  </files>
  <action>
    Insert "Step 0: Validate Branch" section BEFORE "Step 1: Validate Prerequisites".

    Find the line "### Step 1: Validate Prerequisites" and insert the Step 0 section before it.

    Same Step 0 content as Task 01 (identical logic).
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="content">Contains "### Step 0: Validate Branch"</check>
    <check type="content">Step 0 appears before Step 1</check>
    <check type="content">Contains "branching: milestone"</check>
  </verify>
  <done>plan-phase.md has Step 0 branch validation</done>
  <skills>none</skills>
</task>

<task id="03" wave="1">
  <files>
    <file action="modify">commands/execute.md</file>
  </files>
  <action>
    Insert "Step 0: Validate Branch" section BEFORE "Step 1: Validate Prerequisites".

    Find the line "### Step 1: Validate Prerequisites" and insert the Step 0 section before it.

    Same Step 0 content as Task 01 (identical logic).
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="content">Contains "### Step 0: Validate Branch"</check>
    <check type="content">Step 0 appears before Step 1</check>
    <check type="content">Contains "branching: milestone"</check>
  </verify>
  <done>execute.md has Step 0 branch validation</done>
  <skills>none</skills>
</task>

---

## Step 0 Template

All three commands get the same Step 0:

```markdown
### Step 0: Validate Branch

If `branching: milestone` is configured in `.gsd/config.md`:

1. Get current branch:
   ```bash
   git branch --show-current
   ```

2. Get base branch from config (default: `master`)

3. If current branch == base branch:

   **If no milestone set in STATE.md:**
   ```
   ⚠️ No Milestone Active
   ─────────────────────────────────────
   You're on {base} with branching: milestone configured,
   but no milestone is active.

   → Run /opti-gsd:start-milestone [name] to create a milestone branch
   ```
   Stop execution here.

   **If milestone is set but on base branch:**

   - **interactive mode**:
     > "You're on {base} but milestone {milestone} exists. Switch to {prefix}{milestone}? [Y/n]"

     If yes: `git checkout {prefix}{milestone}`
     If no: "Continuing on {base}. Changes will be on base branch."

   - **yolo mode**:
     Auto-switch: `git checkout {prefix}{milestone}`
     If branch doesn't exist: `git checkout -b {prefix}{milestone}`
```

---

## Context Budget

- Wave 1: ~15% (three parallel command edits)
- Total: ~15%
