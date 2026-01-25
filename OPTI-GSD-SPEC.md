# opti-gsd Plugin Specification

## Overview

opti-gsd is a Claude Code plugin for spec-driven development with fresh context execution. It orchestrates workflows, manages state, and integrates with ecosystem skills and MCPs.

## Plugin Structure

```
~/.claude/plugins/opti-gsd/
├── plugin.json
├── README.md
├── commands/
│   └── opti-gsd/
│       ├── help.md
│       ├── init.md
│       ├── new-project.md
│       ├── roadmap.md
│       ├── plan-phase.md
│       ├── execute.md
│       ├── execute-task.md
│       ├── start-milestone.md
│       ├── complete-milestone.md
│       ├── status.md
│       ├── resume.md
│       ├── pause.md
│       ├── add-phase.md
│       ├── insert-phase.md
│       ├── decisions.md
│       ├── issues.md
│       ├── skills.md
│       └── mcps.md
└── docs/
    ├── recommended-skills.md
    └── stack-guides/
        ├── nextjs-supabase.md
        └── electron-sqlite.md
```

---

## plugin.json

```json
{
  "name": "opti-gsd",
  "version": "0.1.0",
  "description": "Spec-driven development with fresh context execution",
  "commands": "commands/"
}
```

---

## Project Files

When initialised, creates `.opti-gsd/` in project root:

```
.opti-gsd/
├── config.md           # Project configuration (YAML frontmatter)
├── PROJECT.md          # Vision, goals, constraints
├── REQUIREMENTS.md     # REQ-IDs with phase mapping
├── roadmap.md          # Phase progress tracking
├── STATE.md            # Compact session state
├── ISSUES.md           # Issue tracking
├── DECISIONS.md        # Architecture decisions
├── plans/
│   ├── phase-01/
│   │   ├── plan.md     # XML-structured tasks
│   │   ├── RESEARCH.md # Discovery findings
│   │   └── summary.md  # Execution summary
│   └── phase-02/
│       └── plan.md
├── archive/            # Completed phases (context saving)
│   └── phase-01/
├── summaries/          # Compact phase summaries (~100 tokens each)
│   └── phase-01.md
├── codebase/           # Brownfield analysis (from init)
│   ├── STACK.md
│   ├── ARCHITECTURE.md
│   ├── STRUCTURE.md
│   ├── CONVENTIONS.md
│   ├── TESTING.md
│   ├── INTEGRATIONS.md
│   └── CONCERNS.md
└── debug/              # Debug session state
    └── {issue-id}.md
```

### File Loading Strategy (Context Optimization)

| File | When Loaded | Tokens |
|------|-------------|--------|
| config.md | Always | ~200 |
| STATE.md | Always | ~150 |
| PROJECT.md | new-project, roadmap | ~300 |
| REQUIREMENTS.md | plan-phase, verify | ~400 |
| roadmap.md | plan-phase, execute, status | ~300 |
| Current plan.md | execute only | ~500 |
| summaries/*.md | context reference | ~100 each |
| RESEARCH.md | planning only | ~800 |
| codebase/*.md | init, first plan | ~300 each |

**Rule**: Never load all files simultaneously. Lazy load based on operation.

---

## File Formats

### config.md

```yaml
---
# Project Configuration
app_type: web
framework: nextjs
base_url: http://localhost:3000

# Git Workflow
branching: milestone
prefix: gsd/
base: main
commits: conventional

# Execution Mode
mode: interactive      # interactive | yolo
depth: standard        # quick | standard | comprehensive

# Context Management (critical for quality)
budgets:
  orchestrator: 15     # Keep lean, spawn subagents
  executor: 50         # Quality degrades above this
  planner: 60          # Can use more for complex phases
  researcher: 70       # Deep research needs more

# Discovery Defaults
discovery:
  default_level: 1     # 0=skip, 1=quick, 2=standard, 3=deep
  force_research: false

# Browser Testing
browser:
  enabled: true
  headless: false
  viewport: [1280, 720]

# Skills (auto-applied based on task type)
skills:
  - test-driven-development
  - systematic-debugging
  - verification-before-completion

# MCP Integrations
mcps:
  - supabase
  - stripe
---
```

#### Workflow Modes

| Mode | Behavior |
|------|----------|
| `interactive` | Confirm before phases, show plans for approval, pause at checkpoints |
| `yolo` | Execute without confirmation, only stop on errors/checkpoints, maximum velocity |

#### Discovery Levels

| Level | Name | When to Use | Duration |
|-------|------|-------------|----------|
| 0 | Skip | Internal code, established patterns | 0 |
| 1 | Quick | Known library, verify version | 2 min |
| 2 | Standard | New integration, best practices | 15 min |
| 3 | Deep | Architecture decision, unknowns | 1+ hour |

### PROJECT.md

```markdown
# Project

## Overview

[One paragraph description]

## Goals

- Goal 1
- Goal 2

## Non-Goals

- What this project is NOT

## Tech Stack

- Framework: Next.js 14
- Database: Supabase
- Payments: Stripe

## Constraints

- Must work offline
- Must support IE11
```

### roadmap.md

```markdown
# Roadmap

## Milestone: v1.0

### Phase 1: Foundation

- [x] Complete
- Setup project structure, auth, database schema

### Phase 2: Core Features

- [ ] In progress
- User dashboard, settings, profile

### Phase 3: Payments

- [ ] Not started
- Stripe integration, subscription management
```

### REQUIREMENTS.md

```markdown
# Requirements

## v1 (Must Ship)

### AUTH-01: User Registration
- **Phase:** 1
- **Status:** complete
- **Verification:** User can create account with email/password

### AUTH-02: User Login
- **Phase:** 1
- **Status:** complete
- **Verification:** User can authenticate and see dashboard

### DASH-01: Dashboard Layout
- **Phase:** 2
- **Status:** in_progress
- **Verification:** User sees personalized dashboard after login

### DASH-02: Stats Display
- **Phase:** 2
- **Status:** pending
- **Verification:** Dashboard shows user metrics with real-time updates

## v2 (Future)

### NOTIF-01: Push Notifications
- **Phase:** TBD
- **Verification:** User receives push notifications for events

## Out of Scope

- Mobile native apps
- Multi-tenancy
- White-labeling
```

### STATE.md (Compact Format)

```yaml
---
# Current Position
milestone: v1.0
phase: 2
task: 3/5
branch: gsd/v1.0

# Session Tracking
last_active: 2026-01-18T14:30:00Z
session_tokens: 80000

# Progress
phases_complete: [1]
phases_in_progress: [2]
phases_pending: [3, 4]

# Active Issues
open_issues: [ISS-001, ISS-002]
---

## Session Context
Dashboard layout complete. Starting stats component next.

## Recent Decisions
- 2026-01-16: Supabase RLS > custom middleware (simpler, built-in)
- 2026-01-15: jose > jsonwebtoken (ESM compatible)

## Token Usage
| Phase | Tokens | Status |
|-------|--------|--------|
| 1 | 45k | complete |
| 2 | 80k | in_progress |
```

**Note**: STATE.md uses YAML frontmatter for machine-readable state + Markdown for human context. Target: <200 tokens.

### plans/phase-XX/plan.md (XML-Structured Tasks)

**Why XML?** Claude was specifically trained on XML and parses it more accurately than Markdown lists. XML provides unambiguous delimiters for multi-line content.

```markdown
---
phase: 2
title: Core Features
wave_count: 2
discovery_level: 1
reqs: [DASH-01, DASH-02, DASH-03]
estimated_tokens: 45000
---

# Phase 2: Core Features

## Must-Haves (Goal-Backward)

- [ ] User sees personalized dashboard after login
- [ ] Stats cards display current metrics
- [ ] Data refreshes on page load

## Wave 1 (Parallel)

<task id="01" wave="1" reqs="DASH-01">
  <files>
    <file action="create">src/components/StatsCard.tsx</file>
    <file action="create">src/components/StatsCard.test.tsx</file>
  </files>
  <action>
    Create StatsCard component with:
    - Props: label (string), value (number), trend (up|down|neutral)
    - Tailwind styling per .opti-gsd/codebase/CONVENTIONS.md
    - Loading skeleton state
    - Error display state
  </action>
  <verify>
    <check type="test" cmd="npm test StatsCard">Tests pass</check>
    <check type="lint" cmd="npm run lint">No lint errors</check>
  </verify>
  <done>Component renders all variants correctly</done>
  <skills>test-driven-development</skills>
</task>

<task id="02" wave="1" reqs="DASH-02">
  <files>
    <file action="create">src/hooks/useStats.ts</file>
    <file action="create">src/hooks/useStats.test.ts</file>
  </files>
  <action>
    Create useStats hook:
    - Fetch from /api/stats using TanStack Query
    - Return { data, isLoading, error, refetch }
    - Stale time: 30 seconds
    - Auto-refetch on window focus
  </action>
  <verify>
    <check type="test" cmd="npm test useStats">Tests pass</check>
  </verify>
  <done>Hook fetches and caches stats correctly</done>
  <skills>test-driven-development</skills>
</task>

<task id="03" wave="1" reqs="DASH-02">
  <files>
    <file action="create">src/app/api/stats/route.ts</file>
    <file action="create">src/app/api/stats/route.test.ts</file>
  </files>
  <action>
    Create stats API endpoint:
    - GET /api/stats returns user statistics
    - Query Supabase for user metrics
    - Include proper error handling
    - Add auth check via middleware
  </action>
  <verify>
    <check type="test" cmd="npm test route">Tests pass</check>
    <check type="mcp" service="supabase">Query executes</check>
  </verify>
  <done>API returns correct stats for authenticated user</done>
  <skills>test-driven-development</skills>
</task>

## Wave 2 (After Wave 1)

<task id="04" wave="2" depends="01,02,03" reqs="DASH-03">
  <files>
    <file action="modify">src/app/dashboard/page.tsx</file>
  </files>
  <action>
    Integrate stats into Dashboard:
    - Import StatsCard and useStats
    - Display 4 stat cards in responsive grid
    - Handle loading state with skeletons
    - Handle error state with retry button
  </action>
  <verify>
    <check type="browser" url="/dashboard">Stats cards display</check>
    <check type="browser" viewport="mobile">Responsive layout</check>
    <check type="console">No errors</check>
  </verify>
  <done>Dashboard shows live stats with proper loading states</done>
</task>
```

#### XML Task Element Reference

| Element | Required | Description |
|---------|----------|-------------|
| `<task id="" wave="" reqs="">` | Yes | Task container with ID, wave number, requirement IDs |
| `<files>` | Yes | List of files to create/modify |
| `<file action="">` | Yes | File path with action (create\|modify\|delete) |
| `<action>` | Yes | Specific implementation instructions |
| `<verify>` | Yes | Verification steps |
| `<check type="" cmd="">` | Yes | Individual check (test\|lint\|browser\|console\|mcp) |
| `<done>` | Yes | Measurable completion criteria |
| `<skills>` | No | Skills to apply (comma-separated) |
| `depends=""` | No | Task IDs this depends on |

### ISSUES.md

```markdown
# Issues

## Open

### ISS-001

- **Severity:** medium
- **Found:** Phase 2, Task 2
- **Description:** Auth redirect doesn't preserve return URL
- **Context:** User lands on /login instead of intended page after auth

### ISS-002

- **Severity:** low
- **Found:** Phase 2, Task 3
- **Description:** API missing pagination headers
- **Context:** GET /api/users returns data but no total count

## Resolved

### ISS-003

- **Severity:** high
- **Found:** Phase 1, Task 3
- **Resolved:** Phase 1.1
- **Description:** JWT expiry too short
- **Fix:** Changed from 1h to 24h
```

---

## Context Management

Context management is critical for maintaining quality throughout long development sessions. Claude's performance degrades as context fills.

### Budget Allocation

| Agent Type | Max Context | Rationale |
|------------|-------------|-----------|
| Orchestrator | 15% | Stays lean, spawns subagents for heavy work |
| Executor | 50% | Quality degrades significantly above this |
| Planner | 60% | Needs more for complex dependency analysis |
| Researcher | 70% | Deep research requires more context |

### Enforcement Rules

1. **Track tokens** in STATE.md after each operation
2. **Split tasks** if executor approaches 50% budget
3. **Spawn sub-agents** rather than bloating orchestrator
4. **Archive phases** immediately after completion
5. **Load summaries** instead of full plans for reference

### Context Rotation Pattern

```
Main Session (Orchestrator ~15%)
  │
  ├──► Spawn Executor (fresh 100% context)
  │      └── Complete task, return result
  │
  ├──► Spawn Executor (fresh 100% context)
  │      └── Complete task, return result
  │
  └──► Update STATE.md, continue
```

Each executor gets fresh context, preventing quality degradation from accumulated context.

### Phase Archival Protocol

After phase completion:
```
1. Move .opti-gsd/plans/phase-XX/ → .opti-gsd/archive/phase-XX/
2. Generate compact summary:
   .opti-gsd/summaries/phase-XX.md (~100 tokens)
3. Update STATE.md
4. Commit: "chore: archive phase X"
```

Summaries are loaded for context reference; full archives only when debugging.

### Selective Loading Matrix

| Command | Always Load | Conditionally Load | Never Load |
|---------|-------------|-------------------|------------|
| status | config, STATE | ROADMAP | plans, research |
| plan-phase | config, STATE, ROADMAP | RESEARCH, codebase | other phases |
| execute | config, STATE, current plan | ISSUES | research, other phases |
| verify | config, STATE, ROADMAP | summaries | research |
| debug | config, STATE | debug session | everything else |

---

## Commands

### /opti-gsd:help

Display all available commands with descriptions.

### /opti-gsd:init

Initialise opti-gsd in existing project.

**Behaviour:**

1. Detect git repo, default branch
2. Check package.json for framework detection
3. Infer app_type from framework
4. Scan ~/.claude/skills/ and ~/.claude/plugins/ for installed skills
5. Ask user about MCPs/services
6. Confirm or ask app_type if ambiguous
7. Create .opti-gsd/ directory structure
8. Create config.md with detected settings
9. Git commit: "chore: initialise opti-gsd"

### /opti-gsd:new-project

Create new project with guided setup.

**Behaviour:**

1. Ask: What are you building? (web/desktop/mobile/api/cli/library)
2. Ask: What framework?
3. Ask: What services/MCPs?
4. Ask project questions until fully understood:
   - What is this project?
   - What are the main goals?
   - What are the constraints?
   - What is explicitly out of scope?
5. Create .opti-gsd/ directory
6. Create config.md
7. Create PROJECT.md
8. Git commit: "chore: initialise opti-gsd project"

### /opti-gsd:roadmap

Create or view roadmap.

**Behaviour (create):**

1. Read PROJECT.md
2. Ask: What milestones do you see?
3. For v1.0: What phases needed?
4. Create roadmap.md with phases
5. Create phase directories in .opti-gsd/plans/
6. Create STATE.md
7. Git commit: "docs: create roadmap"

**Behaviour (view):**

1. Display roadmap.md with status indicators

### /opti-gsd:plan-phase [N]

Generate execution plan for phase.

**Behaviour:**

1. Read PROJECT.md, roadmap.md, STATE.md
2. Read ISSUES.md (known issues to avoid)
3. Read config.md (available skills, MCPs, app_type)
4. Analyse phase requirements
5. Break into 2-4 atomic tasks
6. For each task, determine:
   - Files to modify
   - Action to take
   - Relevant skills (only if applicable)
   - Verification steps:
     - Code verification (tests, lint)
     - Browser verification (if web/desktop and UI task)
     - MCP verification (if data/payment task)
   - Done condition
7. Create .opti-gsd/plans/phase-XX/plan.md
8. Git commit: "docs: plan phase X"

### /opti-gsd:execute

Execute current phase plan.

**Behaviour:**

1. Read config.md, STATE.md
2. Find current phase from STATE.md
3. Read .opti-gsd/plans/phase-XX/plan.md
4. For each task:
   a. Build subagent prompt (see Subagent Prompt Template)
   b. Spawn subagent via Task tool
   c. Wait for completion
   d. Parse result:
   - If TASK COMPLETE:
     - git add [files]
     - git commit -m "{type}({phase}-{task}): {description}"
     - Update STATE.md
   - If TASK FAILED:
     - Log to STATE.md
     - Stop execution
     - Report failure
   - If NEW ISSUE reported:
     - Append to ISSUES.md
5. After all tasks:
   - Create summary.md
   - Update STATE.md: phase complete
   - Update roadmap.md: mark phase complete

### /opti-gsd:execute-task [N]

Execute single task from current phase.

**Behaviour:**
Same as execute but for single task only.

### /opti-gsd:start-milestone [name]

Start new milestone branch.

**Behaviour:**

1. Check for uncommitted changes (abort if any)
2. Create branch: {prefix}{milestone-name}
3. Update STATE.md with branch name
4. Git commit: "chore: start milestone {name}"

### /opti-gsd:complete-milestone

Complete current milestone.

**Behaviour:**

1. Verify all phases complete
2. Generate changelog entry from summaries
3. Push branch
4. Create PR (if gh cli available) or instruct user
5. Tag release
6. Update STATE.md
7. Archive milestone to .opti-gsd/milestones/

### /opti-gsd:status

Show current state and next action.

**Behaviour:**

1. Read STATE.md, roadmap.md, config.md
2. Display:
   - Current milestone, phase, task
   - Current branch
   - Progress (X/Y phases, X/Y tasks)
   - Active skills
   - Active MCPs
   - Open issues (count by severity)
   - Last session info
3. Suggest next action

### /opti-gsd:resume

Resume from last session.

**Behaviour:**

1. Read STATE.md
2. Show where we left off
3. Offer to continue execution

### /opti-gsd:pause

Pause work with context save.

**Behaviour:**

1. Update STATE.md with:
   - Current timestamp
   - Current position
   - Any notes about in-progress work
2. Git commit: "wip: pause at phase X task Y"

### /opti-gsd:add-phase

Add phase to end of current milestone.

**Behaviour:**

1. Ask: What does this phase accomplish?
2. Append to roadmap.md
3. Create phase directory
4. Git commit: "docs: add phase X"

### /opti-gsd:insert-phase [N]

Insert urgent phase after phase N.

**Behaviour:**

1. Ask: What urgent work?
2. Insert as phase N.1 in roadmap.md
3. Create phase directory
4. Git commit: "docs: insert phase X.1"

### /opti-gsd:decisions

Log architectural decision.

**Behaviour:**

1. Ask: What decision?
2. Ask: Why this choice?
3. Append to DECISIONS.md
4. Append summary to STATE.md decisions section
5. Git commit: "docs: decision - {summary}"

### /opti-gsd:issues

Review and manage issues.

**Behaviour:**

1. Read ISSUES.md
2. Analyse against current codebase
3. Report:
   - Which appear resolved? → Offer to close
   - Which are urgent? → Offer to insert fix phase
   - Which fit upcoming phases? → Note for planning
4. Execute chosen actions

### /opti-gsd:skills

Show detected skills.

**Behaviour:**

1. Scan ~/.claude/skills/ and plugins
2. Show installed skills
3. Show which are active in config
4. Suggest relevant skills not installed

### /opti-gsd:mcps

Show configured MCPs.

**Behaviour:**

1. Read config.md
2. Show active MCPs
3. Offer to add/remove

### /opti-gsd:debug [issue-id]

Start or resume systematic debugging session.

**Behaviour:**

1. If issue-id provided, load `.opti-gsd/debug/{issue-id}.md`
2. If no issue-id, ask for symptoms
3. Spawn opti-gsd-debugger agent
4. Agent maintains state in `.opti-gsd/debug/`
5. Return ROOT CAUSE IDENTIFIED or INVESTIGATION BLOCKED

### /opti-gsd:verify [phase]

Verify phase completion with goal-backward analysis.

**Behaviour:**

1. Read roadmap.md for phase goals
2. Spawn opti-gsd-verifier agent
3. Three-level artifact verification (Existence → Substantive → Wired)
4. Spawn opti-gsd-integration-checker if gaps found
5. Generate verification.md
6. If passed: mark phase verified
7. If gaps: return gap analysis for gap-closure planning

### /opti-gsd:context

Show current context usage and budget status.

**Behaviour:**

1. Read STATE.md for session tokens
2. Calculate percentage of budget used per agent type
3. Show breakdown:
   - Total session tokens
   - Per-phase token usage
   - Estimated remaining capacity
4. Warn if approaching limits
5. Suggest optimizations:
   - Archive completed phases
   - Compact state files
   - Split large tasks

### /opti-gsd:archive [phase]

Archive completed phase to save context.

**Behaviour:**

1. Verify phase is complete
2. Move `.opti-gsd/plans/phase-XX/` → `.opti-gsd/archive/phase-XX/`
3. Generate compact summary (`.opti-gsd/summaries/phase-XX.md`):
   - Tasks completed
   - Key outcomes
   - Decisions made
   - ~100 tokens max
4. Update STATE.md
5. Git commit: "chore: archive phase X"

### /opti-gsd:compact

Reduce context footprint of project files.

**Behaviour:**

1. Archive all completed phases
2. Summarize research files (keep key findings, remove details)
3. Compact STATE.md (remove old session notes)
4. Remove redundant content from DECISIONS.md
5. Report tokens saved
6. Git commit: "chore: compact project files"

### /opti-gsd:mode [interactive|yolo]

Switch workflow mode.

**Behaviour:**

1. Update config.md mode setting
2. Confirm new mode
3. Git commit: "chore: switch to {mode} mode"

**Modes:**
- `interactive`: Confirm before phases, show plans, pause at checkpoints
- `yolo`: Execute without confirmation, maximum velocity

---

## Subagent Prompt Template

When /opti-gsd:execute spawns a subagent for a task, inject this prompt:

```markdown
You are a focused implementation agent for opti-gsd. Complete ONLY this task.

<context>
  <project>{.opti-gsd/PROJECT.md#overview}</project>
  <conventions>{.opti-gsd/codebase/CONVENTIONS.md}</conventions>
</context>

<task id="{task.id}" reqs="{task.reqs}">
  <files>
    {for file in task.files}
    <file action="{file.action}">{file.path}</file>
    {/for}
  </files>

  <action>
    {task.action}
  </action>

  <verify>
    {for check in task.verify}
    <check type="{check.type}" cmd="{check.cmd}">{check.description}</check>
    {/for}
  </verify>

  <done>{task.done}</done>
</task>

{if task.skills}
<skills>
  {for skill in task.skills}
  <skill name="{skill.name}">
    {skill.instructions}
  </skill>
  {/for}
</skills>
{/if}

{if issues.open}
<known_issues>
  {for issue in issues.open}
  <issue id="{issue.id}" severity="{issue.severity}">{issue.description}</issue>
  {/for}
</known_issues>
{/if}

<rules>
  <rule>Only modify files listed in &lt;files&gt;</rule>
  <rule>Follow skills exactly if provided</rule>
  <rule>Complete ALL verification checks</rule>
  <rule>Do not expand scope</rule>
  <rule>Do not refactor unrelated code</rule>
</rules>

<output_format>
  On success: TASK COMPLETE
  On failure: TASK FAILED: {reason}
  On blocker: CHECKPOINT: {decision_needed}

  If unrelated issues found:
  NEW ISSUE: [{severity}] {description}
</output_format>

{if config.browser.enabled}
<browser>
  <base_url>{config.base_url}</base_url>
  <instruction>Use browser for UI verification. Check console for errors.</instruction>
</browser>
{/if}
```

**Key Improvements over Original GSD:**
- XML structure for precise parsing
- Minimal context injection (references, not full content)
- Explicit rules block
- Structured output format
- Issue discovery protocol

# Verification

Complete ALL verification steps before reporting done:

{for step in task.verify}

- {step}
  {/for}

# Done Condition

{task.done}

# Rules

1. Only modify listed files
2. Follow active skills exactly (if any)
3. Complete all verification steps
4. Do not expand scope
5. When complete, report exactly one of:
   - TASK COMPLETE
   - TASK FAILED: {reason}
6. If you discover issues unrelated to this task, report at end:
   - NEW ISSUE: [{severity}] {description}

{if config.browser.enabled}

# Browser Testing

Base URL: {config.base_url}
Use browser to verify UI changes. Check console for errors.
{/if}

{if task.mcps}

# Available MCPs

{for mcp in task.mcps}

- **{mcp}**: Use for verification
  {/for}
  {/if}

{if issues.open}

# Known Issues

These issues exist. Don't make them worse. Don't block on them.
{for issue in issues.open}

- {issue.id}: {issue.description} ({issue.severity})
  {/for}
  {/if}
```

---

## App Type Detection

### From package.json

| Dependency      | Framework    | app_type |
| --------------- | ------------ | -------- |
| next            | Next.js      | web      |
| vite            | Vite         | web      |
| remix           | Remix        | web      |
| nuxt            | Nuxt         | web      |
| @sveltejs/kit   | SvelteKit    | web      |
| electron        | Electron     | desktop  |
| @tauri-apps/api | Tauri        | desktop  |
| react-native    | React Native | mobile   |
| expo            | Expo         | mobile   |
| express         | Express      | api      |
| fastify         | Fastify      | api      |
| hono            | Hono         | api      |
| @nestjs/core    | NestJS       | api      |
| commander       | Commander    | cli      |
| yargs           | Yargs        | cli      |

### Default base_url by app_type

| app_type | base_url                |
| -------- | ----------------------- |
| web      | http://localhost:3000   |
| desktop  | (launch command)        |
| api      | http://localhost:3000   |
| mobile   | (none - manual testing) |
| cli      | (none)                  |
| library  | (none)                  |

---

## Skill/MCP Relevance Rules

### When to apply skills

| Task type              | Relevant skills                               |
| ---------------------- | --------------------------------------------- |
| New feature with tests | test-driven-development                       |
| Bug fix                | systematic-debugging, test-driven-development |
| Refactoring            | verification-before-completion                |
| Config change          | none                                          |
| Documentation          | none                                          |
| Pure UI (no logic)     | none                                          |

### When to apply browser verification

| Condition                              | Browser verification |
| -------------------------------------- | -------------------- |
| app_type: web AND files include UI     | Yes                  |
| app_type: desktop AND files include UI | Yes                  |
| app_type: api                          | No                   |
| Files are only .ts/.js (no .tsx/.jsx)  | No                   |
| Files are only config                  | No                   |

### When to apply MCP verification

| Task involves       | MCP         |
| ------------------- | ----------- |
| Database read/write | supabase    |
| User auth/sessions  | supabase    |
| Payment processing  | stripe      |
| Email sending       | resend      |
| File storage        | supabase/s3 |
| Pure frontend       | none        |
| Pure logic          | none        |

---

## Git Conventions

### Commit messages

Format: `{type}({phase}-{task}): {description}`

Types:

- feat: New feature
- fix: Bug fix
- docs: Documentation
- chore: Maintenance
- refactor: Code refactoring
- test: Tests only
- style: Formatting only

Examples:

- `feat(02-01): create dashboard layout`
- `fix(02.1-01): preserve auth redirect URL`
- `docs(03-02): add API documentation`

### Branch naming

Format: `{prefix}{milestone-name}`

Examples:

- `gsd/v1.0`
- `gsd/v1.1-hotfix`
- `gsd/v2.0-redesign`

---

## Error Handling

### Task failure

1. Log failure to STATE.md
2. Do not commit partial work
3. Stop execution
4. Report to user with:
   - Which task failed
   - Failure reason
   - Suggested fix

### Verification failure

1. Treat as task failure
2. Include which verification step failed
3. Include actual vs expected result

### Git conflicts

1. Detect before starting task
2. Abort execution
3. Instruct user to resolve manually

---

## Build Order

Phase 1: Scaffold

- plugin.json
- help.md command

Phase 2: Initialisation

- init.md
- new-project.md
- File creation logic

Phase 3: Planning

- roadmap.md
- plan-phase.md

Phase 4: Execution

- execute.md
- execute-task.md
- Subagent prompt generation
- State updates
- Git commits

Phase 5: Git workflow

- start-milestone.md
- complete-milestone.md

Phase 6: Session management

- status.md
- resume.md
- pause.md

Phase 7: Utilities

- add-phase.md
- insert-phase.md
- decisions.md
- issues.md
- skills.md
- mcps.md

Phase 8: Documentation

- README.md
- Stack guides

---

## Agents

Defined in plugin's agents/ directory. These are specialized subagents spawned by commands. All agents use the `opti-gsd-` prefix.

```
~/.claude/plugins/opti-gsd/
├── plugin.json
├── commands/
├── agents/
│   ├── opti-gsd-executor.md
│   ├── opti-gsd-planner.md
│   ├── opti-gsd-debugger.md
│   ├── opti-gsd-verifier.md
│   ├── opti-gsd-project-researcher.md
│   ├── opti-gsd-phase-researcher.md
│   ├── opti-gsd-plan-checker.md
│   ├── opti-gsd-research-synthesizer.md
│   ├── opti-gsd-roadmapper.md
│   ├── opti-gsd-codebase-mapper.md
│   └── opti-gsd-integration-checker.md
└── docs/
```

### Agent Summary

| Agent | Purpose | Spawned By |
|-------|---------|------------|
| opti-gsd-executor | Executes tasks with atomic commits, deviation handling, checkpoints | /opti-gsd:execute |
| opti-gsd-planner | Creates executable phase plans with goal-backward methodology | /opti-gsd:plan-phase |
| opti-gsd-debugger | Systematic bug investigation using scientific methodology | /opti-gsd:debug |
| opti-gsd-verifier | Goal-backward verification of phase completion | /opti-gsd:verify |
| opti-gsd-project-researcher | Investigates domain ecosystems before roadmap | /opti-gsd:new-project |
| opti-gsd-phase-researcher | Researches technical domains before phase planning | /opti-gsd:plan-phase --research |
| opti-gsd-plan-checker | Validates plans achieve goals before execution | /opti-gsd:plan-phase (auto) |
| opti-gsd-research-synthesizer | Consolidates parallel research into SUMMARY.md | /opti-gsd:new-project (auto) |
| opti-gsd-roadmapper | Transforms requirements into phase-based delivery plans | /opti-gsd:new-project |
| opti-gsd-codebase-mapper | Analyzes existing codebases for brownfield projects | /opti-gsd:init |
| opti-gsd-integration-checker | Verifies components work as interconnected system | /opti-gsd:verify |

### Agent Details

Full agent prompts are in the `agents/` directory. Key capabilities:

#### opti-gsd-executor
- Automatic deviation handling (auto-fixes bugs, blockers)
- Checkpoint protocol for architecture decisions
- TDD execution (RED-GREEN-REFACTOR commits)
- Per-task atomic commits with conventional messages

#### opti-gsd-planner
- Goal-backward methodology (observable outcomes, not tasks)
- Wave-based parallelism for independent tasks
- Must-haves derivation from phase goals
- Task sizing: 15-60 minute windows

#### opti-gsd-debugger
- Scientific hypothesis-driven investigation
- Persistent state in `.opti-gsd/debug/` for context survival
- Binary search and minimal reproduction techniques
- Verification standards: understand WHY fix works

#### opti-gsd-verifier
- Three-level artifact verification (Existence → Substantive → Wired)
- Key link tracing (Component → API → Database)
- Gap analysis for planner consumption
- Human verification flagging for visual/behavioral checks

#### opti-gsd-project-researcher
- Ecosystem survey before roadmap creation
- Outputs: STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md
- Confidence levels (HIGH/MEDIUM/LOW) with sources

#### opti-gsd-phase-researcher
- Narrow technical focus for specific phases
- Single RESEARCH.md output for planner consumption
- Prescriptive guidance, not exploratory options

#### opti-gsd-plan-checker
- Static analysis of plans before execution
- Six verification dimensions: coverage, completeness, dependencies, links, scope, derivation
- Issue severity: blocker, warning, info

#### opti-gsd-research-synthesizer
- Consolidates 4 parallel researcher outputs
- Derives roadmap implications from combined research
- Commits all research files together

#### opti-gsd-roadmapper
- Requirements-driven phase structure (not templates)
- 100% requirement coverage validation
- Success criteria as observable user outcomes

#### opti-gsd-codebase-mapper
- Focus modes: tech, arch, quality, concerns
- Writes directly to `.opti-gsd/codebase/`
- Documents: STACK, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, INTEGRATIONS, CONCERNS

#### opti-gsd-integration-checker
- Export/import mapping and usage verification
- API coverage and auth protection checks
- E2E flow tracing with break point identification

---

## Agent Invocation

### From /opti-gsd:execute

```markdown
For each task in plan:

1. Load opti-gsd-executor agent
2. Inject:
   - Task details
   - Active skills (full content)
   - Available MCPs
   - Known issues
   - Browser config (if applicable)
3. Spawn via Task tool
4. Await completion
5. Parse result (TASK COMPLETE | TASK FAILED | CHECKPOINT)
6. Update STATE.md
7. Commit if successful
```

### From /opti-gsd:plan-phase

```markdown
1. Load opti-gsd-phase-researcher agent (if --research flag)
2. Receive RESEARCH.md
3. Load opti-gsd-planner agent
4. Inject:
   - PROJECT.md
   - roadmap.md (current phase)
   - config.md
   - ISSUES.md
   - RESEARCH.md (if exists)
   - Codebase docs (if exist)
5. Spawn via Task tool
6. Receive plan.md
7. Load opti-gsd-plan-checker agent
8. Validate plan
9. If PASS: Save to .opti-gsd/plans/phase-XX/
10. If FAIL: Return to planner with issues
```

### From /opti-gsd:new-project

```markdown
1. Gather project information from user
2. Spawn 4 parallel opti-gsd-project-researcher agents:
   - Focus: stack
   - Focus: features
   - Focus: architecture
   - Focus: pitfalls
3. Load opti-gsd-research-synthesizer agent
4. Consolidate into SUMMARY.md
5. Load opti-gsd-roadmapper agent
6. Create roadmap.md and STATE.md
7. Present for user approval
```

### From /opti-gsd:init (brownfield)

```markdown
1. Load opti-gsd-codebase-mapper agent with focus modes
2. Spawn in parallel:
   - focus: tech → STACK.md, INTEGRATIONS.md
   - focus: arch → ARCHITECTURE.md, STRUCTURE.md
   - focus: quality → CONVENTIONS.md, TESTING.md
   - focus: concerns → CONCERNS.md
3. All documents written to .opti-gsd/codebase/
```

### From /opti-gsd:verify

```markdown
1. Load opti-gsd-verifier agent
2. Inject:
   - roadmap.md (phase goals)
   - Phase summaries
   - Current codebase access
3. Spawn via Task tool
4. Receive verification.md
5. If gaps_found:
   - Load opti-gsd-integration-checker agent
   - Verify component connections
   - Return combined gap analysis
6. If passed: Mark phase verified
```

### From /opti-gsd:debug

```markdown
1. Load opti-gsd-debugger agent
2. Inject:
   - Issue description
   - Relevant files
   - Previous debug state (if resuming)
3. Spawn via Task tool
4. Agent maintains state in .opti-gsd/debug/
5. Returns: ROOT CAUSE IDENTIFIED or INVESTIGATION BLOCKED
```

### From /opti-gsd:complete-milestone

```markdown
1. Load opti-gsd-verifier agent
2. Verify all phases complete
3. Load opti-gsd-integration-checker agent
4. Verify cross-phase integration
5. If all pass:
   - Generate changelog
   - Create PR
   - Tag release
6. If fail: Report issues, abort completion
```

---

## Parallel Execution

For independent tasks, spawn multiple task-executor agents simultaneously.

### Detection

Tasks are independent if:

- No shared files
- No import dependencies between output files
- No sequential data requirements

### Implementation

```markdown
Phase plan marks parallel groups:

## Parallel Group A

- Task 1: Stats card component (files: src/components/StatsCard.tsx)
- Task 2: Activity feed component (files: src/components/ActivityFeed.tsx)
- Task 3: Chart wrapper (files: src/components/Chart.tsx)

## Sequential (after Group A)

- Task 4: Dashboard layout (files: src/app/dashboard/page.tsx)
  - Imports from tasks 1, 2, 3
```

Orchestrator:

1. Spawn tasks 1, 2, 3 simultaneously
2. Await all complete
3. Spawn task 4
4. Await complete

---

## Opti-GSD vs Original GSD: Key Improvements

### Architecture Improvements

| Aspect | Original GSD | Opti-GSD | Improvement |
|--------|--------------|----------|-------------|
| Installation | npx command | Native Claude plugin | No external dependencies, instant loading |
| Directory | `.planning/` | `.opti-gsd/` | Shorter, cleaner |
| Config | `config.json` | `config.md` (YAML) | Unified markdown format, human-readable |
| Task Format | XML in markdown | XML with explicit schema | Structured verification, REQ traceability |

### Context Efficiency Improvements

| Aspect | Original GSD | Opti-GSD | Savings |
|--------|--------------|----------|---------|
| STATE.md | ~500 tokens | ~150 tokens (YAML frontmatter) | 70% reduction |
| Phase archives | None | Automatic archival + summaries | ~80% per phase |
| Selective loading | Implicit | Explicit loading matrix | Prevents accidental bloat |
| Budget tracking | Mentioned | Enforced with warnings | Proactive quality preservation |

### Developer Experience Improvements

| Feature | Original GSD | Opti-GSD |
|---------|--------------|----------|
| Workflow modes | None | YOLO + Interactive |
| Discovery levels | Implicit | Explicit 0-3 scale |
| REQ traceability | REQ-IDs | REQ-IDs with phase mapping |
| Context command | None | /opti-gsd:context shows usage |
| Archive command | None | /opti-gsd:archive frees context |
| Compact command | None | /opti-gsd:compact bulk optimization |

### Agent Improvements

| Agent | Original GSD | Opti-GSD Enhancement |
|-------|--------------|----------------------|
| Executor | Basic deviation handling | Structured auto-fix rules, checkpoint protocol |
| Planner | Goal-backward | + Wave-based parallelism, explicit task sizing |
| Verifier | Three-level verification | + Integration checking, gap XML output |
| Debugger | Scientific methodology | + Persistent state files, mode selection |
| Researchers | Parallel research | + Focus modes, confidence levels |

### Format Improvements

| Format | Original GSD | Opti-GSD | Benefit |
|--------|--------------|----------|---------|
| Tasks | XML blobs | XML with schema reference | Self-documenting |
| Verification | Prose | `<check type="" cmd="">` | Automatable |
| Dependencies | Comments | `depends=""` attribute | Explicit graph |
| Requirements | REQ-IDs | REQ-IDs in task attributes | Full traceability |

### Summary: Why Opti-GSD is Better

1. **60-70% Context Savings** — Through lazy loading, archival, and compact formats
2. **Native Plugin** — No npx, instant availability, better integration
3. **Explicit Budgets** — Proactive quality preservation, not reactive degradation
4. **Full Traceability** — REQ → Phase → Task → Commit → Verification
5. **Workflow Flexibility** — YOLO for speed, Interactive for control
6. **Better Agents** — Enhanced prompts with structured protocols
7. **Self-Managing Context** — Archive, compact, and context commands

### Token Comparison (Typical Project)

| Phase | Original GSD | Opti-GSD | Savings |
|-------|--------------|----------|---------|
| Init | ~2,000 tokens | ~800 tokens | 60% |
| Per-phase state | ~500 tokens | ~150 tokens | 70% |
| Archived phase | Full (~1,500) | Summary (~100) | 93% |
| 5-phase project | ~10,000 tokens | ~3,500 tokens | 65% |

**Result**: Opti-GSD can handle larger projects within the same context window while maintaining higher quality output.

---

## Implementation Priority

### Phase 1: Core (High Impact)
1. plugin.json and help.md
2. init.md and new-project.md
3. roadmap.md with REQUIREMENTS.md support
4. plan-phase.md with XML task format

### Phase 2: Execution
5. execute.md with wave-based parallelism
6. execute-task.md with deviation handling
7. verify.md with three-level verification
8. debug.md with persistent state

### Phase 3: Context Optimization
9. context.md command
10. archive.md command
11. compact.md command
12. Lazy loading in all commands

### Phase 4: Workflow
13. status.md and resume.md
14. start-milestone.md and complete-milestone.md
15. mode.md for YOLO/Interactive switching
16. pause.md with context save

### Phase 5: Utilities
17. add-phase.md and insert-phase.md
18. decisions.md and issues.md
19. skills.md and mcps.md
20. Stack guides in docs/

---

## Research Sources

Format decisions based on:
- [XML vs Markdown Performance Insights](https://medium.com/@isaiahdupree33/optimal-prompt-formats-for-llms-xml-vs-markdown-performance-insights-cef650b856db) — Claude specifically trained on XML
- [arXiv: Prompt Format Impact Study](https://arxiv.org/html/2411.10541v1) — Up to 40% performance variance by format
- [Markdown vs XML Comparative Analysis](https://www.robertodiasduarte.com.br/en/markdown-vs-xml-em-prompts-para-llms-uma-analise-comparativa/) — Hybrid approach recommendation
