---
phase: 2
title: Error Handling Standardization
wave_count: 2
discovery_level: 0
reqs: []
estimated_tokens: 20000
---

# Phase 2: Error Handling Standardization

## Must-Haves (Goal-Backward)

- [ ] Standard error format documented and reusable
- [ ] All commands check prerequisites consistently
- [ ] Errors always suggest next steps
- [ ] Graceful handling when .gsd/ missing

## Wave 1 (Parallel)

<task id="01" wave="1" reqs="">
  <files>
    <file action="create">docs/ERROR-HANDLING.md</file>
  </files>
  <action>
    Create error handling standard document that all commands should follow:

    ## Standard Error Format
    ```
    ⚠️ {Error Title}
    ─────────────────────────────────────
    {Brief explanation of what went wrong}

    Required: {what's missing}

    → {Next step command or action}
    ```

    ## Common Prerequisites
    - .gsd/ directory exists
    - STATE.md exists (for execution commands)
    - ROADMAP.md exists (for phase commands)
    - config.md exists (for CI/verification)

    ## Error Categories
    1. NOT_INITIALIZED - no .gsd/
    2. MISSING_PREREQUISITE - specific file missing
    3. INVALID_STATE - wrong phase/task state
    4. EXECUTION_FAILED - task/command failed

    ## Next-Step Patterns
    - NOT_INITIALIZED → /opti-gsd:init or /opti-gsd:new-project
    - No roadmap → /opti-gsd:roadmap
    - No plan → /opti-gsd:plan-phase N
    - Failed task → fix and retry or /opti-gsd:debug
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="file">docs/ERROR-HANDLING.md exists</check>
    <check type="content">Contains standard format section</check>
  </verify>
  <done>Error handling standard documented</done>
  <skills>none</skills>
</task>

<task id="02" wave="1" reqs="">
  <files>
    <file action="modify">commands/status.md</file>
    <file action="modify">commands/execute.md</file>
    <file action="modify">commands/verify.md</file>
    <file action="modify">commands/plan-phase.md</file>
  </files>
  <action>
    Update high-traffic commands with standardized prerequisite checks:

    Add to each command's Step 1 (or create if missing):
    ```markdown
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

    If `STATE.md` missing (for execution commands):
    ```
    ⚠️ Project State Missing
    ─────────────────────────────────────
    .gsd/STATE.md not found.

    → Run /opti-gsd:init to reinitialize
    ```
    ```

    Ensure each command ends error messages with a suggested next step.
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="grep" cmd="grep -l 'Validate Prerequisites' commands/status.md">Has prerequisite check</check>
    <check type="grep" cmd="grep -l 'Validate Prerequisites' commands/execute.md">Has prerequisite check</check>
    <check type="grep" cmd="grep 'opti-gsd Not Initialized' commands/status.md">Uses standard error</check>
  </verify>
  <done>4 high-traffic commands have standardized error handling</done>
  <skills>none</skills>
</task>

## Wave 2 (After Wave 1)

<task id="03" wave="2" depends="01,02" reqs="">
  <files>
    <file action="modify">commands/roadmap.md</file>
    <file action="modify">commands/archive.md</file>
    <file action="modify">commands/resume.md</file>
    <file action="modify">commands/ci.md</file>
  </files>
  <action>
    Update secondary commands with standardized error handling:

    Apply same pattern from Task 02:
    - Add "Validate Prerequisites" step if missing
    - Use standardized error format
    - Always include next-step suggestions

    For ci.md specifically, update the existing error at line 15 to use standard format.
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="grep" cmd="grep 'opti-gsd Not Initialized' commands/roadmap.md">Uses standard error</check>
    <check type="grep" cmd="grep 'opti-gsd Not Initialized' commands/ci.md">Uses standard error</check>
  </verify>
  <done>4 secondary commands have standardized error handling</done>
  <skills>none</skills>
</task>

<task id="04" wave="2" depends="01,02" reqs="">
  <files>
    <file action="modify">commands/help.md</file>
  </files>
  <action>
    Update help.md to reference error handling docs:

    Add section at the end:
    ```markdown
    ## Error Handling

    All commands follow standardized error handling. See `docs/ERROR-HANDLING.md` for details.

    Common issues:
    - "opti-gsd Not Initialized" → Run /opti-gsd:init
    - "Project State Missing" → Reinitialize with /opti-gsd:init
    - "No Roadmap Found" → Run /opti-gsd:roadmap
    ```
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="grep" cmd="grep 'Error Handling' commands/help.md">Has error handling section</check>
  </verify>
  <done>Help command references error handling docs</done>
  <skills>none</skills>
</task>
