# XML Task Structure

Reference for the XML task format used in phase plans.

**Parent:** [../SKILL.md](../SKILL.md) > Reference Documents

## Task Element

Each task is defined as an XML element within a wave section of the plan:

```xml
<task id="01" wave="1" reqs="{REQ-ID}">
  <files>
    <file action="create">{path}</file>
    <file action="modify">{path}</file>
  </files>
  <action>
    {Specific implementation instructions}
    - {Detail 1}
    - {Detail 2}
    - Reference: {relevant file or doc}
  </action>
  <libraries>{libraries needing current docs, e.g., "tanstack-query, zod" or "none"}</libraries>
  <verify>
    <check type="test" cmd="{command}">{description}</check>
    <check type="browser" url="{url}">{description}</check>
    <check type="console">{description}</check>
  </verify>
  <done>{Measurable completion criteria}</done>
  <skills>{comma-separated skills or "none"}</skills>
</task>
```

## Field Definitions

### Task Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `id` | Yes | Unique task identifier (zero-padded: "01", "02") |
| `wave` | Yes | Wave number for parallelization (tasks in same wave run in parallel) |
| `reqs` | Yes | Comma-separated requirement IDs this task addresses |
| `depends` | No | Comma-separated task IDs this task depends on (for wave 2+) |

### Child Elements

| Element | Required | Description |
|---------|----------|-------------|
| `<files>` | Yes | List of files to create or modify |
| `<action>` | Yes | Specific implementation instructions |
| `<libraries>` | Yes | Libraries needing current docs lookup, or "none" |
| `<verify>` | Yes | Verification checks to confirm task completion |
| `<done>` | Yes | Measurable completion criteria (single statement) |
| `<skills>` | Yes | Applicable opti-gsd skills, or "none" |

### File Actions

| Action | Meaning |
|--------|---------|
| `create` | New file to be created |
| `modify` | Existing file to be modified |

### Verify Check Types

| Type | Attributes | Use For |
|------|------------|---------|
| `test` | `cmd="{command}"` | Running test commands |
| `browser` | `url="{url}"` | Visual browser verification |
| `console` | — | Console/terminal output checks |
| `import` | — | Import statement verification |
| `usage` | — | Component/function usage verification |
| `ci` | `cmd="{ci_command}"` | CI pipeline check |
| `link` | — | Connection/reference verification |

## Example: Multi-Wave Plan

```xml
## Wave 1 (Parallel)

<task id="01" wave="1" reqs="US001">
  <files>
    <file action="create">src/components/UserProfile.tsx</file>
    <file action="create">src/components/UserProfile.test.tsx</file>
  </files>
  <action>
    Create UserProfile component with avatar, name, and bio fields.
    - Use existing Card component as wrapper
    - Follow patterns from ExistingComponent.tsx
    - Include loading skeleton state
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="test" cmd="npm test -- UserProfile">All tests pass</check>
    <check type="browser" url="/profile">Profile renders correctly</check>
  </verify>
  <done>UserProfile component renders with all fields and passes tests</done>
  <skills>none</skills>
</task>

<task id="02" wave="1" reqs="US002">
  <files>
    <file action="create">src/api/user.ts</file>
    <file action="create">src/api/user.test.ts</file>
  </files>
  <action>
    Create user API service with CRUD operations.
    - GET /api/users/:id
    - PUT /api/users/:id
    - Use existing apiClient from src/lib/api.ts
  </action>
  <libraries>tanstack-query</libraries>
  <verify>
    <check type="test" cmd="npm test -- user.test">API tests pass</check>
  </verify>
  <done>User API service handles CRUD with error handling and tests</done>
  <skills>none</skills>
</task>

## Wave 2 (After Wave 1)

<task id="03" wave="2" depends="01,02" reqs="US001,US002">
  <files>
    <file action="modify">src/app/profile/page.tsx</file>
  </files>
  <action>
    Wire UserProfile component to user API.
    - Import UserProfile from task 01
    - Use user API hooks from task 02
    - Handle loading and error states
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="browser" url="/profile">Full profile page works end-to-end</check>
    <check type="console">No console errors</check>
  </verify>
  <done>Profile page displays live user data with loading and error states</done>
  <skills>none</skills>
</task>
```

## Sizing Guidelines

- Each task should be sized for 15-60 minutes of work
- Tasks should be atomic (completable independently within their wave)
- Aim for 2-4 tasks per phase
- Wave 1 tasks should have no inter-dependencies
- Wave 2+ tasks declare explicit `depends` attributes
