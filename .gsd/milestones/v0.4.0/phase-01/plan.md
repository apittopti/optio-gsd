---
phase: 01
title: Add Checkpoint Protocol to Verifier
wave_count: 2
discovery_level: 0
reqs: [001-verifier-checkpoint]
estimated_tokens: 15000
---

# Phase 01: Add Checkpoint Protocol to Verifier

## Must-Haves (Goal-Backward)

- [ ] Progress survives context exhaustion (VERIFICATION-PROGRESS.md written after each step)
- [ ] User can resume from last checkpoint (--resume flag reads progress and skips completed)
- [ ] Checkpoint pattern matches executor/debugger agents (consistent protocol)
- [ ] Incremental state is trackable (structured progress format with checklist)

## Wave 1 (Parallel)

<task id="01" wave="1" reqs="001-verifier-checkpoint">
  <files>
    <file action="modify">agents/opti-gsd-verifier.md</file>
  </files>
  <action>
    Add "Checkpoint Protocol" section after "Verification Protocol" (~line 208).

    The section must define:
    1. Progress file location: `.gsd/plans/phase-{N}/VERIFICATION-PROGRESS.md`
    2. Seven checkpoint stages: CI-lint, CI-typecheck, CI-test, CI-build, Artifacts, Key-Links, E2E
    3. Write timing: After EACH stage completes (not batched at end)
    4. Resume semantics: Read progress file, skip completed stages, continue from resume point

    Include subsections:
    - "### Progress File" - location and write timing
    - "### Progress Format" - template structure
    - "### Resume Protocol" - steps to resume mid-verification

    Reference the debugger's "Context Survival" pattern for consistency.
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="console">grep "Checkpoint Protocol" agents/opti-gsd-verifier.md</check>
    <check type="console">grep "VERIFICATION-PROGRESS.md" agents/opti-gsd-verifier.md</check>
    <check type="console">grep "Resume Protocol" agents/opti-gsd-verifier.md</check>
  </verify>
  <done>Verifier agent contains complete Checkpoint Protocol section with progress file format and resume semantics</done>
  <skills>verification-before-completion</skills>
</task>

<task id="02" wave="1" reqs="001-verifier-checkpoint">
  <files>
    <file action="modify">commands/verify.md</file>
  </files>
  <action>
    Update verify command to support resumption:

    1. Add `--resume` to Arguments section:
       - `--resume` — Resume from last checkpoint if VERIFICATION-PROGRESS.md exists

    2. Add "Step 2.5: Check for Resume" between Load Context and Run CI Commands:
       - Check if --resume flag OR VERIFICATION-PROGRESS.md exists
       - If resuming: load progress file, display status, skip completed stages
       - Show resume banner with completed/pending stages

    3. Update Steps 3-6 to write progress file after each major step:
       - After each CI check completes
       - After artifact verification
       - After key link verification
       - After E2E tests

    4. Add cleanup note: delete progress file after final VERIFICATION.md written
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="console">grep "\-\-resume" commands/verify.md</check>
    <check type="console">grep "VERIFICATION-PROGRESS" commands/verify.md</check>
    <check type="console">grep -i "resume" commands/verify.md | wc -l</check>
  </verify>
  <done>verify.md documents --resume flag with Step 2.5 and checkpoint writes after each verification stage</done>
  <skills>verification-before-completion</skills>
</task>

## Wave 2 (After Wave 1)

<task id="03" wave="2" depends="01,02" reqs="001-verifier-checkpoint">
  <files>
    <file action="modify">agents/opti-gsd-verifier.md</file>
    <file action="modify">commands/verify.md</file>
  </files>
  <action>
    Ensure full integration between verifier and verify command:

    1. Add complete VERIFICATION-PROGRESS.md template to verifier agent:
       ```markdown
       # Verification Progress: Phase {N}

       ## Status: in_progress

       ## Completed Checks
       - [x] CI: lint (PASS)
       - [x] CI: typecheck (PASS)
       - [ ] CI: test
       - [ ] CI: build
       - [ ] Artifacts
       - [ ] Key Links
       - [ ] E2E

       ## Partial Results
       ### CI Checks
       | Check | Status | Time | Notes |
       |-------|--------|------|-------|
       | Lint | PASS | 2.1s | - |
       | Typecheck | PASS | 4.3s | - |

       ## Resume Point
       CI: test (step 3 of 7)

       ## Session Info
       Started: {timestamp}
       Last Updated: {timestamp}
       ```

    2. Add "Checkpoint Stages" reference table to verify command showing all 7 stages

    3. Verify both files use identical file path and format references

    4. Add atomic write note: write to temp file, then rename (prevents corruption)
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="console">grep "Completed Checks" agents/opti-gsd-verifier.md</check>
    <check type="console">grep "Resume Point" agents/opti-gsd-verifier.md</check>
    <check type="console">grep "Resume Point" commands/verify.md</check>
  </verify>
  <done>Both files have consistent checkpoint format, complete template, and integration is documented</done>
  <skills>verification-before-completion</skills>
</task>

## Key Links

| From | To | Connection |
|------|-----|------------|
| verify.md | opti-gsd-verifier.md | spawns agent |
| verify.md | VERIFICATION-PROGRESS.md | reads/writes |
| opti-gsd-verifier.md | VERIFICATION-PROGRESS.md | reads/writes |
| Pattern reference | opti-gsd-executor.md | STATE.md updates |
| Pattern reference | opti-gsd-debugger.md | debug session files |

## Commit Plan

- Task 01: `feat(01-01): add checkpoint protocol to verifier agent`
- Task 02: `feat(01-02): add --resume flag to verify command`
- Task 03: `feat(01-03): integrate progress file template`
- Summary: `docs(01): phase execution summary`
