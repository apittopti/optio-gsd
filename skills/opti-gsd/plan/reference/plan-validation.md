# Plan Validation Rules

Reference for the opti-gsd-plan-checker agent validation rules.

**Parent:** [../SKILL.md](../SKILL.md) > Reference Documents

## Validation Checks

The `opti-gsd-plan-checker` agent verifies plans against these criteria:

### 1. Requirement Coverage

Every REQ-ID from the roadmap phase must have at least one task addressing it.

- **Blocker** if any requirement has no corresponding task
- **Warning** if a requirement is only partially covered

### 2. Task Completeness

All required fields must be present in every task element:

- `id`, `wave`, `reqs` attributes
- `<files>`, `<action>`, `<libraries>`, `<verify>`, `<done>`, `<skills>` elements

- **Blocker** if any required field is missing
- **Info** if optional fields (like `depends`) are absent on wave 1 tasks

### 3. Dependency Correctness

- No circular dependencies between tasks
- `depends` references only valid task IDs
- Tasks in wave N only depend on tasks in waves < N

- **Blocker** if circular dependencies exist
- **Blocker** if depends references non-existent task
- **Warning** if depends references task in same or later wave

### 4. Key Links Planned

Artifacts created in one task must be wired/imported in another task or documented as standalone.

- **Warning** if created files are never referenced by other tasks
- **Info** if standalone files are intentional (e.g., config files)

### 5. Scope Sanity

Tasks should fit within the context budget:
- Total estimated tokens should not exceed configured budget
- Individual tasks should be 15-60 minutes of work

- **Warning** if estimated tokens exceed 80% of budget
- **Blocker** if any single task is oversized (> 60 min estimated)

### 6. Verification Derivation

Verification checks must be grounded in observable outcomes:
- Each `<verify>` must reference a concrete check (test command, URL, console output)
- Done criteria must be measurable, not subjective

- **Warning** if verification checks are vague
- **Info** if done criteria could be more specific

## Severity Levels

| Severity | Action | Description |
|----------|--------|-------------|
| **blocker** | Return to planner for revision | Plan cannot proceed as-is |
| **warning** | Show user, offer to proceed | Potential issue, user decides |
| **info** | Note and proceed | Minor observation, no action needed |

## Iteration Protocol

1. Plan checker reports all issues with severity
2. If any **blocker** issues: return to planner with specific feedback
3. Planner revises and resubmits
4. Re-validate
5. Maximum 3 iterations before escalating to user
6. If only **warning** and **info**: present to user with option to proceed

## Checker Output Format

```markdown
## Plan Check: Phase {N}

### Result: {PASS | FAIL | WARN}

### Issues

#### Blockers
- [REQ-COVERAGE] US003 has no corresponding task
- [DEPENDENCY] Task 04 depends on Task 05 (same wave)

#### Warnings
- [SCOPE] Task 02 estimated at 75 minutes (target: 15-60)
- [LINK] src/utils/helpers.ts created but not imported

#### Info
- [VERIFY] Task 03 done criteria could be more specific

### Recommendation
{Proceed / Revise / Escalate}
```
