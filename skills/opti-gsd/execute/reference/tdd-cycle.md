# TDD Red-Green-Refactor Cycle

The TDD cycle runs INSIDE each subagent as natural control flow, not at the orchestrator level.

## Overview

When a task has `test_required: true`, the subagent executes the full TDD cycle before returning a result.

**Flow:** RED → GREEN → REFACTOR → COMPLETE (or FAILED)

## RED Phase

**Goal:** Write a failing test that defines the expected behavior.

- **Allowed files:** `{task.test_files}` only
- **Locked files:** `{task.files}` (implementation files are NOT to be touched)
- **Success condition:** Test FAILS (this is correct - the test should fail before implementation exists)
- **On complete:** Lock test files, proceed to GREEN

```xml
<phase name="RED">
  <allowed_files>{task.test_files}</allowed_files>
  <locked_files>{task.files}</locked_files>
  <goal>Write a failing test for: {task.done}</goal>
  <success_condition>Test FAILS (this is correct!)</success_condition>
  <on_complete>Lock test files, proceed to GREEN</on_complete>
</phase>
```

## GREEN Phase

**Goal:** Write the minimal implementation code to make the test pass.

- **Allowed files:** `{task.files}` only
- **Locked files:** `{task.test_files}` (tests are NOT to be modified)
- **Success condition:** Test PASSES
- **On failure:** Analyze error, fix implementation, retry (do NOT modify tests)
- **On complete:** Proceed to REFACTOR

```xml
<phase name="GREEN">
  <allowed_files>{task.files}</allowed_files>
  <locked_files>{task.test_files}</locked_files>
  <goal>Write minimal code to make test pass</goal>
  <success_condition>Test PASSES</success_condition>
  <on_failure>Analyze error, fix implementation, retry (do NOT modify tests)</on_failure>
  <on_complete>Proceed to REFACTOR</on_complete>
</phase>
```

## REFACTOR Phase

**Goal:** Clean up the implementation while keeping tests green.

- **Allowed files:** `{task.files}` only
- **Locked files:** `{task.test_files}` (tests are NOT to be modified)
- **Success condition:** Test still PASSES after refactoring
- **On failure:** Undo refactor changes, task is still considered complete

```xml
<phase name="REFACTOR">
  <allowed_files>{task.files}</allowed_files>
  <locked_files>{task.test_files}</locked_files>
  <goal>Clean up implementation while keeping tests green</goal>
  <success_condition>Test still PASSES</success_condition>
  <on_failure>Undo refactor changes, task still complete</on_failure>
</phase>
```

## Critical Rules

1. **If test_required=true:** Execute TDD Red-Green-Refactor cycle
2. **RED phase:** Only modify test files, implementation files are LOCKED
3. **GREEN/REFACTOR phases:** Only modify implementation files, test files are LOCKED
4. **NEVER modify test files to make them pass** - fix the implementation instead
5. Only modify files listed in `files` / `test_files` elements

## Loop Behavior

- The loop is natural control flow inside the subagent
- Subagent doesn't "stop" until it returns a result
- Orchestrator simply waits for the Task tool to complete
- Loop continues until tests pass OR `tdd_max_attempts` exhausted

## Configuration

TDD loop settings in `config.json`:

```json
{
  "loop": {
    "tdd_max_attempts": 5,
    "execute_max_retries": 2
  }
}
```

| Setting | Purpose | Default |
|---------|---------|---------|
| `tdd_max_attempts` | Max RED/GREEN retries inside subagent | 5 |
| `execute_max_retries` | Max orchestrator-level retries for a failed task | 2 |

## Subagent Return Values

The subagent only returns when:
- **Tests pass** → TASK COMPLETE
- **TDD attempts exhausted** → TASK FAILED

No stop hook is needed. Following GSD principles, human judgment gates all decisions. Use `/opti-gsd:debug recover` if session is interrupted.
