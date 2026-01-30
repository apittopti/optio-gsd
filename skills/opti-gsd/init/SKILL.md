---
name: init
description: Initialize opti-gsd in an existing or new project. Subcommands: init (brownfield), new (greenfield), claude-md (setup instructions), migrate (convert old formats).
disable-model-invocation: true
---

# init $ARGUMENTS

Initialize opti-gsd in a project, create a new project with guided setup, configure CLAUDE.md, or migrate from old formats.

## Usage
- `/opti-gsd:init` — Initialize in existing project
- `/opti-gsd:init new` — New project with guided setup
- `/opti-gsd:init claude-md` — Add opti-gsd instructions to CLAUDE.md
- `/opti-gsd:init migrate [type]` — Migrate from old workflow formats

## Subcommand Routing

Parse `$ARGUMENTS` and route to the appropriate action:

| Arguments | Action | Description |
|-----------|--------|-------------|
| (none) or `existing` | Init Existing Project | Initialize opti-gsd in an existing project (brownfield) |
| `new` | New Project | Create a new project with guided setup, research, and roadmap generation |
| `claude-md` | Setup CLAUDE.md | Add opti-gsd workflow instructions to project CLAUDE.md |
| `migrate [type]` | Migrate | Migrate from old workflow formats to current structure |

If arguments don't match any subcommand, show the Usage section above as help.

---

## Action: Init Existing Project

Initialize opti-gsd in an existing project (brownfield).

### Step 1: Validate Environment

```bash
# Check for git repo
git rev-parse --is-inside-work-tree

# Get default branch
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main"
```

If not a git repo, inform user and offer to initialize one.

### Step 2: Detect Framework

Read `package.json` (or equivalent) and detect:

| Dependency | Framework | app_type |
|------------|-----------|----------|
| next | Next.js | web |
| vite | Vite | web |
| remix | Remix | web |
| nuxt | Nuxt | web |
| @sveltejs/kit | SvelteKit | web |
| electron | Electron | desktop |
| @tauri-apps/api | Tauri | desktop |
| react-native | React Native | mobile |
| expo | Expo | mobile |
| express | Express | api |
| fastify | Fastify | api |
| hono | Hono | api |
| @nestjs/core | NestJS | api |
| commander | Commander | cli |
| yargs | Yargs | cli |

**Also detect non-npm project types:**
| Indicator | Framework | app_type |
|-----------|-----------|----------|
| .claude-plugin/ | Claude Code Plugin | claude-code-plugin |
| Cargo.toml | Rust | cli or lib |
| go.mod | Go | cli or lib |
| pyproject.toml | Python | cli or lib |

If no match or ambiguous, ask user to confirm app_type.

### Step 2b: Detect Deployment Platform

**Check for deployment config files:**
```bash
# Vercel
if [ -d ".vercel" ] || [ -f "vercel.json" ]; then
  echo "vercel"
  # Query CLI if available
  vercel --version 2>/dev/null && vercel inspect --json
fi

# Netlify
if [ -d ".netlify" ] || [ -f "netlify.toml" ]; then
  echo "netlify"
  netlify --version 2>/dev/null && netlify status --json
fi

# Railway
if [ -f "railway.json" ] || [ -d ".railway" ]; then
  echo "railway"
  railway --version 2>/dev/null && railway status
fi

# Fly.io
if [ -f "fly.toml" ]; then
  echo "flyio"
  fly version 2>/dev/null && fly status --json
fi

# Render
if [ -f "render.yaml" ]; then
  echo "render"
fi

# Docker/Container
if [ -f "Dockerfile" ] || [ -f "docker-compose.yml" ]; then
  echo "docker"
fi

# PM2/VPS
if [ -f "ecosystem.config.js" ] || [ -f "pm2.json" ]; then
  echo "pm2"
fi
```

**If no config files found, parse documentation:**
- Read README.md for "deployment", "production", "hosting" sections
- Extract URLs matching: `https?://[^\s]+\.(vercel\.app|netlify\.app|railway\.app|fly\.dev|onrender\.com)`
- Look for domain names and environment references

**Store detected deployment in config:**
```json
{
  "deploy": {
    "target": "{detected_platform}",
    "detected_from": "{config_file | cli | documentation | unknown}",
    "production_url": "{if detected}",
    "preview_pattern": "{if detected}"
  }
}
```

### Step 2c: Detect CI/CD Toolchain

**Detect package manager:**
```bash
if [ -f "pnpm-lock.yaml" ]; then echo "pnpm"
elif [ -f "yarn.lock" ]; then echo "yarn"
elif [ -f "bun.lockb" ]; then echo "bun"
elif [ -f "package-lock.json" ]; then echo "npm"
elif [ -f "Cargo.toml" ]; then echo "cargo"
elif [ -f "go.mod" ]; then echo "go"
elif [ -f "pyproject.toml" ]; then echo "poetry"
elif [ -f "requirements.txt" ]; then echo "pip"
elif [ -f "*.csproj" ]; then echo "dotnet"
fi
```

**Detect scripts from package.json:**

Read `scripts` object and map to CI commands:
| Script Name | CI Config Key |
|-------------|---------------|
| `build` | ci.build |
| `test` | ci.test |
| `lint` | ci.lint |
| `typecheck`, `type-check`, `tsc` | ci.typecheck |
| `test:e2e`, `e2e`, `cypress` | ci.e2e |

**For non-Node.js projects:**

| Project Type | Default Commands |
|--------------|------------------|
| Cargo.toml | build: `cargo build`, test: `cargo test`, lint: `cargo clippy` |
| go.mod | build: `go build ./...`, test: `go test ./...`, lint: `golangci-lint run` |
| pyproject.toml | test: `pytest`, lint: `ruff check .` |
| *.csproj | build: `dotnet build`, test: `dotnet test` |

**Detect default URLs:**

Based on framework, set default local URL:
| Framework | Default URL |
|-----------|-------------|
| Next.js, Nuxt, SvelteKit | http://localhost:3000 |
| Vite | http://localhost:5173 |
| Create React App | http://localhost:3000 |
| Angular | http://localhost:4200 |
| Express/Fastify/Hono | http://localhost:3000 |
| ASP.NET | http://localhost:5000 |

### Step 4: Detect Available Tools

Auto-detect available MCP servers and plugins by running `/opti-gsd:tools detect` logic:

1. Probe MCP servers (cclsp, GitHub, Chrome, Context7, etc.)
2. Scan for installed plugins
3. Write capability manifest to `.opti-gsd/tools.json`

This ensures agents can dynamically use available tools from the start.

### Step 5: Ask User About Services

Ask which external services/MCPs the project uses:
- Database (Supabase, Firebase, Prisma, etc.)
- Payments (Stripe, etc.)
- Auth (Supabase Auth, Auth0, Clerk, etc.)
- Email (Resend, SendGrid, etc.)
- Storage (S3, Supabase Storage, etc.)

### Step 6: Analyze Codebase (Optional)

If the codebase has significant existing code, offer to run codebase mapping:

> "This project has existing code. Would you like me to analyze it? This will help with planning but uses more context."

If yes, spawn opti-gsd-codebase-mapper agents in parallel:
- focus: tech
- focus: arch
- focus: quality
- focus: concerns

### Step 7: Create Directory Structure

```bash
mkdir -p .opti-gsd/plans
mkdir -p .opti-gsd/archive
mkdir -p .opti-gsd/summaries
mkdir -p .opti-gsd/codebase
mkdir -p .opti-gsd/stories
mkdir -p .opti-gsd/issues
mkdir -p .opti-gsd/features
mkdir -p .opti-gsd/debug
```

### Step 8: Create config.json

Write `.opti-gsd/config.json`:

```json
{
  "project": {
    "app_type": "{detected_app_type}",
    "framework": "{detected_framework}"
  },
  "git": {
    "branching": "milestone",
    "prefix": "gsd/",
    "base": "{detected_base_branch}",
    "commits": "conventional",
    "workflow": "solo"
  },
  "mode": "interactive",
  "budgets": {
    "orchestrator": 15,
    "executor": 50,
    "planner": 60,
    "researcher": 70
  },
  "ci": {
    "package_manager": "{detected}",
    "build": "{detected}",
    "test": "{detected}",
    "lint": "{detected}",
    "typecheck": "{detected}",
    "e2e": null
  },
  "urls": {
    "local": "{detected}",
    "api": null,
    "staging": null,
    "production": null
  },
  "testing": {
    "type": "browser|terminal",
    "headless": false,
    "viewport": [1280, 720]
  },
  "mcps": [],
  "skills": [],
  "verification": {
    "type": "browser|terminal",
    "github": null
  }
}
```

### Step 9: Create Initial state.json

Write `.opti-gsd/state.json`:

```json
{
  "milestone": null,
  "phase": null,
  "task": null,
  "status": "initialized",
  "branch": null,
  "last_active": "{ISO_timestamp}",
  "phases": {
    "complete": [],
    "in_progress": [],
    "pending": []
  },
  "context": "Project initialized. Ready for /opti-gsd:roadmap to plan work."
}
```

### Step 10: Update Project CLAUDE.md

Create or update the project's `CLAUDE.md` to ensure opti-gsd workflow is always considered:

**If CLAUDE.md doesn't exist, create it:**

```markdown
# Project Instructions

This project uses **opti-gsd** for spec-driven development workflow.

## Workflow Requirements

**IMPORTANT:** All development work must follow the opti-gsd workflow:

1. **Never commit directly to master/main** — These are protected branches
2. **Always use milestone branches** — Run `/opti-gsd:milestone start [name]` first
3. **Check status before starting** — Run `/opti-gsd:status` to understand current state
4. **Follow the phase workflow** — Plan → Execute → Verify

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/opti-gsd:status` | Check current state and next action |
| `/opti-gsd:milestone start [name]` | Start a new milestone branch |
| `/opti-gsd:roadmap` | View or create project roadmap |
| `/opti-gsd:plan [N]` | Plan a phase |
| `/opti-gsd:execute` | Execute current phase |
| `/opti-gsd:verify` | Verify phase completion |

## Protected Branches

**NEVER push or commit directly to:**
- `master`
- `main`
- `production`
- `prod`

All changes to these branches MUST go through a pull request.

## Before Any Code Changes

Ask yourself:
1. Is there an active milestone? (`/opti-gsd:status`)
2. Am I on a milestone branch? (not master/main)
3. Is there a plan for this work? (`/opti-gsd:plan`)

If any answer is "no", set up the workflow first.
```

**If CLAUDE.md exists, append the opti-gsd section:**

Check if `## opti-gsd Workflow` section already exists. If not, append:

```markdown

---

## opti-gsd Workflow

This project uses **opti-gsd** for spec-driven development.

**Before any code changes:**
1. Check status: `/opti-gsd:status`
2. Ensure on milestone branch (never master/main)
3. Follow: Plan → Execute → Verify

**Protected branches:** master, main, production, prod — PR only!

**Key commands:** `/opti-gsd:status`, `/opti-gsd:milestone start`, `/opti-gsd:roadmap`, `/opti-gsd:plan`, `/opti-gsd:execute`, `/opti-gsd:verify`
```

### Step 11: Commit

```bash
git add .opti-gsd/
git add CLAUDE.md
git commit -m "chore: initialize opti-gsd

- Created .opti-gsd/ workflow directory
- Updated CLAUDE.md with workflow instructions"
```

### Step 12: Report

Display summary:
- Detected: {framework} ({app_type})
- Base branch: {base}
- Tools detected: {MCP servers and plugins}
- Codebase analysis: {yes/no}

Suggest next commands:
- /opti-gsd:roadmap — Plan work (init is for brownfield projects, so roadmap is the natural next step)
- Optional: /opti-gsd:plan research — Get domain best practices before planning
- Optional: /opti-gsd:tools ci — Customize CI/CD settings

Note: /opti-gsd:init new is for greenfield projects starting from scratch. Since /opti-gsd:init is for existing codebases, suggest roadmap instead.

## Output

```
opti-gsd initialized!

Detected:
  Framework:        Next.js (web)
  Base branch:      main
  Package manager:  npm

Toolchain:
  Build:      npm run build
  Test:       npm test
  Lint:       npm run lint

URLs:
  Local:      http://localhost:3000

Deployment:
  Platform:   {detected or "Not configured"}
  Detected:   {from config file | CLI | documentation | not detected}
  Prod URL:   {if known}

Tools Detected:
  MCP Servers: cclsp, GitHub, Chrome
  Plugins: opti-gsd

Created/Updated:
  .opti-gsd/config.json
  .opti-gsd/state.json
  .opti-gsd/tools.json
  CLAUDE.md (workflow instructions)

```

**Next steps:**
-> /opti-gsd:roadmap      — Plan your work (create phases)
-> /opti-gsd:tools        — View/configure available tools (optional)
-> /opti-gsd:plan research — Research best practices (optional)

State saved. Safe to /compact or start new session if needed.

---

## Action: New Project

Create a new project with guided setup, research, and roadmap generation.

### Step 1: Check Prerequisites

If `.opti-gsd/` doesn't exist, run /opti-gsd:init first.

### Step 2: Deep Questioning

Gather project understanding through conversation. Ask these in natural flow, not as a checklist:

**Core Questions:**
1. What are you building? (one sentence)
2. Who is it for? (target users)
3. What's the core problem it solves?
4. What does success look like?

**Scope Questions:**
5. What are the must-have features for v1?
6. What's explicitly out of scope?
7. Any hard constraints? (tech, time, budget, compliance)

**Technical Questions:**
8. Any tech stack preferences or requirements?
9. What integrations are needed? (payments, auth, email, etc.)
10. Any existing code or systems to integrate with?

**Deployment Questions (optional):**
11. Do you know where this will be deployed? (Vercel, Netlify, Railway, VPS, Docker, or "not decided yet")
12. If known: Do you have a production domain in mind?

Keep asking clarifying questions until you fully understand the project. Don't proceed with ambiguity.

### Step 3: Write project.md

Create `.opti-gsd/project.md`:

```markdown
# {Project Name}

## Overview
{One paragraph synthesizing what this project is}

## Goals
- {Goal 1: Specific, measurable}
- {Goal 2: Specific, measurable}
- {Goal 3: Specific, measurable}

## Non-Goals
- {What this project is NOT}
- {Scope boundaries}

## Target Users
{Who uses this and why}

## Tech Stack
- Framework: {framework}
- Database: {database}
- Auth: {auth_solution}
- Payments: {if applicable}

## Deployment
- Platform: {vercel | netlify | railway | vps | docker | not decided}
- Domain: {if known, or "TBD"}
- Notes: {any deployment constraints}

## Constraints
- {Hard constraint 1}
- {Hard constraint 2}

## Success Criteria
- {How we know v1 is successful}
```

### Step 4: Research Decision

Ask user:

> "Would you like me to research best practices for this type of project before planning? This helps avoid common pitfalls but adds ~5 minutes."

**If yes**, spawn 4 parallel opti-gsd-project-researcher agents:
- Focus: stack (technology recommendations)
- Focus: features (table stakes vs differentiators)
- Focus: architecture (patterns and structure)
- Focus: pitfalls (common mistakes to avoid)

Then spawn opti-gsd-research-synthesizer to consolidate findings into `.opti-gsd/research/summary.md`.

**If no**, proceed directly to stories.

### Step 5: Capture Initial Stories

Create initial user stories in `.opti-gsd/stories/` for v1 features:

```markdown
# US001: {Feature Title}

**From:** Initial planning
**Requested:** {date}
**Status:** backlog

## Request
{What the user needs to be able to do}

## Why
{Why this is important for v1}

## Acceptance Criteria
- [ ] {Criterion 1}
- [ ] {Criterion 2}
- [ ] {Criterion 3}

## Milestone
v1.0

## Notes
{Any additional context}
```

Create one story file per major v1 feature. Keep them user-focused:
- US001-user-registration.md
- US002-user-login.md
- US003-dashboard.md
- etc.

**v2 feature ideas** go to `.opti-gsd/features/` as low-priority items.

### Step 6: Generate Roadmap

Spawn opti-gsd-roadmapper agent with:
- project.md
- Stories from `.opti-gsd/stories/`
- summary.md (if research was done)

The roadmapper will:
1. Group stories into phases by dependency
2. Order phases logically
3. Import acceptance criteria as success criteria
4. Validate all stories are assigned to a phase

### Step 7: Present Roadmap for Approval

Show the generated roadmap to user:

```markdown
## Proposed Roadmap: v1.0

### Phase 1: {Title}
- Delivers: US001, US002
- Success: {From acceptance criteria}

### Phase 2: {Title}
- Delivers: US003, US004
- Success: {From acceptance criteria}

{etc.}

Does this phasing make sense? Any adjustments?
```

Iterate until user approves.

### Step 8: Write roadmap.md

Create `.opti-gsd/roadmap.md`:

```markdown
# Roadmap

## Milestone: v1.0

### Phase 1: {Title}
- [ ] Not started
- {Description}

**Delivers:** US001, US002

**Success Criteria:**
- [ ] {From US001 acceptance criteria}
- [ ] {From US002 acceptance criteria}

---

### Phase 2: {Title}
- [ ] Not started
- {Description}

**Delivers:** US003, US004

**Success Criteria:**
- [ ] {From US003 acceptance criteria}
- [ ] {From US004 acceptance criteria}

{Continue for all phases}
```

### Step 9: Update state.json

Update `.opti-gsd/state.json`:

```json
{
  "milestone": "v1.0",
  "phase": 1,
  "task": null,
  "status": "initialized",
  "branch": null,
  "last_active": "{current_timestamp}",
  "phases": {
    "complete": [],
    "in_progress": [],
    "pending": [1, 2, 3]
  },
  "context": "Project defined. Ready to plan Phase 1."
}
```

### Step 10: Create Phase Directories

```bash
mkdir -p .opti-gsd/plans/phase-01
mkdir -p .opti-gsd/plans/phase-02
# etc. for each phase
```

### Step 11: Commit

```bash
git add .opti-gsd/
git add CLAUDE.md
git commit -m "chore: initialize opti-gsd project

- Created project.md with goals and constraints
- Created {N} user stories in .opti-gsd/stories/
- Generated roadmap.md with {N} phases
- Updated CLAUDE.md with workflow instructions
- Research: {yes/no}"
```

### Step 12: Report

```
Project initialized!

Project: {name}
Phases: {count}
Stories: {count} for v1

Files created:
  .opti-gsd/project.md
  .opti-gsd/stories/*.md
  .opti-gsd/roadmap.md
  .opti-gsd/state.json
  CLAUDE.md (workflow instructions)
  {.opti-gsd/research/* if researched}

Next: Run /opti-gsd:plan 1 to plan the first phase
```

### Context Budget

This command may use significant context for research. Target allocations:
- Questioning: ~10%
- Research (if enabled): ~40% (spawned as subagents)
- Roadmapping: ~15%
- File writing: ~5%

Total orchestrator usage: ~30% (within budget)

---

## Action: Setup CLAUDE.md

Add opti-gsd workflow instructions to the project's CLAUDE.md file.

### Step 1: Check Current State

Check if CLAUDE.md exists and if it already has opti-gsd section:

```bash
# Check if file exists
if [ -f "CLAUDE.md" ]; then
  # Check if opti-gsd section exists
  grep -q "opti-gsd Workflow" CLAUDE.md && echo "exists" || echo "missing"
else
  echo "no_file"
fi
```

### Step 2: Handle Each Case

**If CLAUDE.md doesn't exist:**

Create it with full instructions:

```markdown
# Project Instructions

This project uses **opti-gsd** for spec-driven development workflow.

## Workflow Requirements

**IMPORTANT:** All development work must follow the opti-gsd workflow:

1. **Never commit directly to master/main** — These are protected branches
2. **Always use milestone branches** — Run `/opti-gsd:milestone start [name]` first
3. **Check status before starting** — Run `/opti-gsd:status` to understand current state
4. **Follow the phase workflow** — Plan → Execute → Verify

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/opti-gsd:status` | Check current state and next action |
| `/opti-gsd:milestone start [name]` | Start a new milestone branch |
| `/opti-gsd:roadmap` | View or create project roadmap |
| `/opti-gsd:plan [N]` | Plan a phase |
| `/opti-gsd:execute` | Execute current phase |
| `/opti-gsd:verify` | Verify phase completion |

## Protected Branches

**NEVER push or commit directly to:**
- `master`
- `main`
- `production`
- `prod`

All changes to these branches MUST go through a pull request.

## Before Any Code Changes

Ask yourself:
1. Is there an active milestone? (`/opti-gsd:status`)
2. Am I on a milestone branch? (not master/main)
3. Is there a plan for this work? (`/opti-gsd:plan`)

If any answer is "no", set up the workflow first.
```

**If CLAUDE.md exists but missing opti-gsd section:**

Append to the file:

```markdown

---

## opti-gsd Workflow

This project uses **opti-gsd** for spec-driven development.

**Before any code changes:**
1. Check status: `/opti-gsd:status`
2. Ensure on milestone branch (never master/main)
3. Follow: Plan → Execute → Verify

**Protected branches:** master, main, production, prod — PR only!

**Key commands:** `/opti-gsd:status`, `/opti-gsd:milestone start`, `/opti-gsd:roadmap`, `/opti-gsd:plan`, `/opti-gsd:execute`, `/opti-gsd:verify`
```

**If opti-gsd section already exists:**

```
CLAUDE.md already has opti-gsd workflow instructions.
No changes needed.
```

### Step 3: Commit

```bash
git add CLAUDE.md
git commit -m "docs: add opti-gsd workflow instructions to CLAUDE.md

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Step 4: Report

```
CLAUDE.md Updated
-------------------------------------------------------------
Added opti-gsd workflow instructions to CLAUDE.md.

Claude will now consider the opti-gsd workflow on every prompt.

Key rules added:
- Never commit to master/main directly
- Always use milestone branches
- Follow Plan -> Execute -> Verify workflow
```

### Context Budget

Minimal: ~5%

---

## Action: Migrate

Migrate from old workflow formats to current structure.

### Arguments

- `type` — Migration type: `requirements` (default), `all`

### Step 1: Detect What Needs Migration

Check for legacy files:

```markdown
## Migration Check

**Legacy files found:**
- [x] `.opti-gsd/requirements.md` — Convert to stories
- [ ] `.opti-gsd/todos.md` — Convert to features directory (if exists)

**Already current:**
- [x] `.opti-gsd/stories/` exists
- [x] `.opti-gsd/features/` exists
```

### Step 2: Migrate Requirements to Stories

If `.opti-gsd/requirements.md` exists:

1. Parse each requirement (REQ-ID format)
2. Create a story file for each:

**Before (requirements.md):**
```markdown
### AUTH-01: User Registration
- **Phase:** 1
- **Status:** pending
- **Verification:** User can create account with email/password
```

**After (.opti-gsd/stories/US001-user-registration.md):**
```markdown
# US001: User Registration

**From:** Migrated from AUTH-01
**Requested:** {original date or migration date}
**Status:** {pending -> backlog, complete -> delivered}

## Request
User can create account with email/password

## Why
Core authentication functionality

## Acceptance Criteria
- [ ] {Derived from verification field}

## Milestone
{From phase assignment if known}

## Notes
Migrated from requirements.md (AUTH-01)
```

3. Create mapping file `.opti-gsd/migrations/requirements-to-stories.md`:

```markdown
# Requirements -> Stories Migration

**Date:** {timestamp}

| Old ID | New ID | Title |
|--------|--------|-------|
| AUTH-01 | US001 | User Registration |
| AUTH-02 | US002 | User Login |
| DASH-01 | US003 | Dashboard Layout |
```

4. Update roadmap.md references:
   - Replace `**Requirements:** AUTH-01, AUTH-02`
   - With `**Delivers:** US001, US002`

5. Archive requirements.md:
   - Move to `.opti-gsd/archive/requirements.md.bak`

### Step 3: Migrate TODOS to FEATURES

If `.opti-gsd/todos.md` exists but `.opti-gsd/features/` doesn't:

1. Create `.opti-gsd/features/` directory
2. Convert each todo to a feature file: `.opti-gsd/features/F{NNN}.md`
3. Update ID format (T001 -> F001)
4. Archive todos.md

### Step 4: Commit Migration

```bash
git add .opti-gsd/stories/
git add .opti-gsd/migrations/
git add .opti-gsd/roadmap.md
git add .opti-gsd/archive/
git rm .opti-gsd/requirements.md 2>/dev/null || true
git commit -m "chore: migrate to stories-based workflow

- Converted {N} requirements to user stories
- Updated roadmap.md references
- Archived requirements.md"
```

### Step 5: Report

```markdown
## Migration Complete

**Converted:**
- {N} requirements -> {N} user stories

**Files created:**
- .opti-gsd/stories/US001-*.md through US{N}-*.md

**Files archived:**
- .opti-gsd/archive/requirements.md.bak

**roadmap.md updated:**
- Replaced requirement references with story references

**Mapping preserved:**
- .opti-gsd/migrations/requirements-to-stories.md

Your project now uses the simplified workflow:
- Features (your enhancement ideas)
- Stories (user needs with acceptance criteria)
- Issues (bugs/problems)

Run /opti-gsd:track list stories to see your migrated stories.
```

### Context Budget

Minimal: ~5%

---

## Context Budget

| Action | Budget |
|--------|--------|
| Init Existing Project | ~15% |
| New Project | ~30% (with research subagents) |
| Setup CLAUDE.md | ~5% |
| Migrate | ~5% |
