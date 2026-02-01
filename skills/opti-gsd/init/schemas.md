# opti-gsd v3 File Schemas

Reference for all orchestration files used by opti-gsd skills.

---

## config.json

Location: `.opti-gsd/config.json`
Created by: `/opti-gsd:init`
Updated by: user (manual edits)

```json
{
  "version": "3.0",
  "project": {
    "name": "my-app",
    "type": "nextjs",
    "framework": "next",
    "language": "typescript"
  },
  "branching": {
    "enabled": true,
    "pattern": "gsd/v{milestone}",
    "protected": ["master", "main", "production", "prod"]
  },
  "ci": {
    "lint": "npm run lint",
    "typecheck": "npm run typecheck",
    "test": "npm test",
    "build": "npm run build",
    "e2e": null
  },
  "deployment": {
    "platform": null,
    "preview_url": null
  },
  "testing": {
    "always_test": [],
    "never_test": ["*.md", "*.json"]
  },
  "mode": "interactive"
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Schema version, always `"3.0"` |
| `project.name` | string | Project name (from package.json or user input) |
| `project.type` | string | Project type: `nextjs`, `react`, `node`, `python`, `rust`, `go`, `claude-code-plugin` |
| `project.framework` | string\|null | Framework if applicable: `next`, `vite`, `express`, `django`, `flask` |
| `project.language` | string | Primary language: `typescript`, `javascript`, `python`, `rust`, `go` |
| `branching.enabled` | boolean | Whether branch enforcement is active |
| `branching.pattern` | string | Branch naming pattern. `{milestone}` is replaced with milestone name |
| `branching.protected` | string[] | Branches that block direct work (must use PRs) |
| `ci.lint` | string\|null | Lint command |
| `ci.typecheck` | string\|null | Type check command |
| `ci.test` | string\|null | Test command |
| `ci.build` | string\|null | Build command |
| `ci.e2e` | string\|null | E2E test command |
| `deployment.platform` | string\|null | Deployment platform: `vercel`, `netlify`, `cloudflare`, `aws` |
| `deployment.preview_url` | string\|null | URL template for preview deployments |
| `testing.always_test` | string[] | Glob patterns for files that always need test runs |
| `testing.never_test` | string[] | Glob patterns for files that never need test runs |
| `mode` | string | Execution mode: `"interactive"` (confirm each wave) or `"autonomous"` (run all waves) |

---

## state.json

Location: `.opti-gsd/state.json`
Created by: `/opti-gsd:init`
Updated by: `/opti-gsd:roadmap`, `/opti-gsd:execute`, `/opti-gsd:review`, `/opti-gsd:verify`, `/opti-gsd:complete`, `/opti-gsd:rollback`

```json
{
  "version": "3.0",
  "milestone": "v1.0",
  "branch": "gsd/v1.0",
  "phase": 2,
  "status": "executing",
  "phases": {
    "total": 4,
    "complete": [1],
    "current": 2,
    "pending": [3, 4]
  },
  "execution": {
    "wave": 1,
    "tasks_done": ["01", "02"],
    "tasks_failed": [],
    "tasks_pending": ["03", "04"]
  },
  "last_active": "2026-02-01T12:00:00Z"
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Schema version, always `"3.0"` |
| `milestone` | string\|null | Current milestone name |
| `branch` | string | Current git branch |
| `phase` | integer\|null | Current phase number (1-based). Used in path: phase 1 → `phase-01` |
| `status` | string | Current workflow status (see below) |
| `phases.total` | integer | Total phases in roadmap |
| `phases.complete` | integer[] | Phase numbers that are verified complete |
| `phases.current` | integer\|null | Phase currently being worked on |
| `phases.pending` | integer[] | Phase numbers not yet started |
| `execution` | object\|null | Current execution state (null when not executing) |
| `execution.wave` | integer | Current wave number (1-based) |
| `execution.tasks_done` | string[] | Task IDs completed in current phase |
| `execution.tasks_failed` | string[] | Task IDs that failed |
| `execution.tasks_pending` | string[] | Task IDs not yet started |
| `last_active` | string | ISO 8601 timestamp of last activity |

### Status Values

| Status | Meaning | Next Step |
|--------|---------|-----------|
| `initialized` | Just created, no roadmap yet | `/opti-gsd:roadmap` |
| `roadmap_created` | Roadmap exists, no plan yet | `/opti-gsd:plan` |
| `planned` | Phase plan created | `/opti-gsd:execute` |
| `executing` | Execution in progress | Continue or `/opti-gsd:execute` |
| `executed` | All tasks done, needs review | `/opti-gsd:review` |
| `reviewed` | Review approved | `/opti-gsd:verify` |
| `verified` | Phase verified, ready for next | `/opti-gsd:plan` (next phase) or `/opti-gsd:complete` |
| `milestone_complete` | All phases done | Start new milestone |

---

## plan.json

Location: `.opti-gsd/plans/phase-{NN}/plan.json`
Created by: `/opti-gsd:plan` (via planner agent)
Read by: `/opti-gsd:execute`, `/opti-gsd:review`, `/opti-gsd:verify`

```json
{
  "version": "3.0",
  "phase": 2,
  "title": "API Implementation",
  "goal": "Implement REST API endpoints for user management",
  "created": "2026-02-01T10:00:00Z",
  "waves": [
    {
      "wave": 1,
      "description": "Data models and database schema",
      "tasks": [
        {
          "id": "01",
          "title": "Create User model",
          "files": ["src/models/user.ts", "src/db/migrations/001_users.ts"],
          "action": "Create User model with fields: id, email, name, created_at. Create migration.",
          "verify": "Run migration, check table exists",
          "done": "User model file exists and migration runs without errors"
        },
        {
          "id": "02",
          "title": "Create Session model",
          "files": ["src/models/session.ts", "src/db/migrations/002_sessions.ts"],
          "action": "Create Session model linked to User. Create migration.",
          "verify": "Run migration, check foreign key",
          "done": "Session model exists with user FK"
        }
      ]
    },
    {
      "wave": 2,
      "description": "API endpoints (depends on models from wave 1)",
      "tasks": [
        {
          "id": "03",
          "title": "User CRUD endpoints",
          "files": ["src/routes/users.ts", "src/routes/users.test.ts"],
          "action": "Implement GET/POST/PUT/DELETE for users with validation",
          "verify": "All tests pass",
          "done": "4 endpoints working with tests"
        }
      ]
    }
  ],
  "total_tasks": 3,
  "total_waves": 2
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Schema version |
| `phase` | integer | Phase number |
| `title` | string | Phase title from roadmap |
| `goal` | string | What this phase delivers |
| `created` | string | ISO 8601 timestamp |
| `waves` | array | Ordered list of execution waves |
| `waves[].wave` | integer | Wave number (1-based) |
| `waves[].description` | string | What this wave accomplishes |
| `waves[].tasks` | array | Tasks in this wave (can run in parallel) |
| `waves[].tasks[].id` | string | Task ID, zero-padded: `"01"`, `"02"`, etc. |
| `waves[].tasks[].title` | string | Short task description |
| `waves[].tasks[].files` | string[] | Files to create or modify |
| `waves[].tasks[].action` | string | What to do (instructions for executor) |
| `waves[].tasks[].verify` | string | How to verify it worked |
| `waves[].tasks[].done` | string | Definition of done |
| `total_tasks` | integer | Total task count across all waves |
| `total_waves` | integer | Total wave count |

### Wave Rules

- Tasks within a wave have **no dependencies on each other** and can run in parallel
- Wave N+1 depends on wave N completing first
- Each task produces an atomic commit
- Executor reports commit hash for checkpoint tagging

---

## summary.md

Location: `.opti-gsd/plans/phase-{NN}/summary.md`
Created by: `/opti-gsd:execute` (after all waves complete)
Read by: `/opti-gsd:review`, `/opti-gsd:verify`

```markdown
# Phase {N} Execution Summary

Date: {date}
Duration: {waves executed}

## Results

| Task | Title | Status | Commit |
|------|-------|--------|--------|
| T01 | Create User model | ✓ pass | abc1234 |
| T02 | Create Session model | ✓ pass | def5678 |
| T03 | User CRUD endpoints | ✗ fail | — |

## Wave Details

### Wave 1: Data models
- T01: ✓ Created User model and migration
- T02: ✓ Created Session model and migration

### Wave 2: API endpoints
- T03: ✗ Failed — type error in validation middleware

## Issues

- T03: `TypeError: Cannot read property 'validate' of undefined` in src/routes/users.ts:42

## Files Changed

{list of all files created/modified/deleted}
```

---

## verification.json

Location: `.opti-gsd/plans/phase-{NN}/verification.json`
Created by: `/opti-gsd:verify` (via verifier agent)
Read by: `/opti-gsd:status`, `/opti-gsd:complete`

```json
{
  "version": "3.0",
  "phase": 2,
  "verified_at": "2026-02-01T14:00:00Z",
  "result": "pass",
  "checks": {
    "lint": { "status": "pass", "output": "" },
    "typecheck": { "status": "pass", "output": "" },
    "test": { "status": "pass", "output": "42 tests passed" },
    "build": { "status": "pass", "output": "" },
    "e2e": { "status": "skip", "reason": "not configured" }
  },
  "plan_compliance": {
    "total_tasks": 3,
    "verified": 3,
    "failed": 0,
    "details": [
      { "id": "01", "status": "pass", "note": "" },
      { "id": "02", "status": "pass", "note": "" },
      { "id": "03", "status": "pass", "note": "Fixed after review round 1" }
    ]
  },
  "issues": []
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `result` | string | Overall result: `"pass"`, `"fail"`, `"partial"` |
| `checks` | object | CI check results |
| `checks.{name}.status` | string | `"pass"`, `"fail"`, `"skip"` |
| `plan_compliance.total_tasks` | integer | Tasks in plan |
| `plan_compliance.verified` | integer | Tasks that pass verification |
| `plan_compliance.details` | array | Per-task verification results |
| `issues` | array | Unresolved issues found during verification |

---

## codebase-analysis.md

Location: `.opti-gsd/codebase-analysis.md`
Created by: `/opti-gsd:init` (brownfield projects only)
Read by: `/opti-gsd:plan` (planner agent uses it for context)

See init skill for template.

---

## roadmap.md

Location: `.opti-gsd/roadmap.md`
Created by: `/opti-gsd:roadmap`
Read by: `/opti-gsd:plan`, `/opti-gsd:status`, `/opti-gsd:complete`

Free-form markdown with phase sections. See roadmap skill for template.

---

## Checkpoint Tags

Format: `gsd/checkpoint/phase-{NN}/T{id}`
Example: `gsd/checkpoint/phase-02/T03`

Created by: `/opti-gsd:execute` after each task completes.
Points to: the specific commit hash from the executor output (not HEAD).
Used by: `/opti-gsd:rollback` to restore to a known-good state.

Pre-phase tag: `gsd/checkpoint/phase-{NN}/pre` — created before execution starts.

---

## Directory Layout

```
.opti-gsd/
├── config.json                          # Project config (created by init)
├── state.json                           # Workflow state (updated by skills)
├── roadmap.md                           # Delivery roadmap (created by roadmap)
├── codebase-analysis.md                 # Brownfield analysis (created by init)
├── stories/                             # User stories
│   ├── US001.md
│   └── US002.md
├── issues/                              # Bug tracking
│   └── ISS001.md
├── features/                            # Feature ideas
│   └── F001.md
├── plans/                               # Phase plans and results
│   ├── phase-01/
│   │   ├── plan.json                    # Execution plan
│   │   ├── summary.md                   # Execution results
│   │   └── verification.json            # Verification results
│   └── phase-02/
│       └── plan.json
└── research/                            # Research outputs
    └── {topic}.md
```
