# /opti-gsd:init

Initialize opti-gsd in an existing project (brownfield).

## Behavior

You are initializing opti-gsd in an existing codebase. Follow these steps:

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

If no match or ambiguous, ask user to confirm app_type.

### Step 3: Detect Skills and MCPs

```bash
# Check for installed skills
ls ~/.claude/skills/ 2>/dev/null

# Check for installed plugins
ls ~/.claude/plugins/ 2>/dev/null
```

### Step 4: Ask User About Services

Ask which external services/MCPs the project uses:
- Database (Supabase, Firebase, Prisma, etc.)
- Payments (Stripe, etc.)
- Auth (Supabase Auth, Auth0, Clerk, etc.)
- Email (Resend, SendGrid, etc.)
- Storage (S3, Supabase Storage, etc.)

### Step 5: Analyze Codebase (Optional)

If the codebase has significant existing code, offer to run codebase mapping:

> "This project has existing code. Would you like me to analyze it? This will help with planning but uses more context."

If yes, spawn opti-gsd-codebase-mapper agents in parallel:
- focus: tech
- focus: arch
- focus: quality
- focus: concerns

### Step 6: Create Directory Structure

```bash
mkdir -p .gsd/plans
mkdir -p .gsd/archive
mkdir -p .gsd/summaries
mkdir -p .gsd/codebase
mkdir -p .gsd/debug
```

### Step 7: Create config.md

Write `.gsd/config.md`:

```yaml
---
# Project Configuration
app_type: {detected_app_type}
framework: {detected_framework}
base_url: {default_base_url}

# Git Workflow
branching: milestone
prefix: gsd/
base: {detected_base_branch}
commits: conventional

# Execution Mode
mode: interactive
depth: standard

# Context Management
budgets:
  orchestrator: 15
  executor: 50
  planner: 60
  researcher: 70

# Discovery Defaults
discovery:
  default_level: 1
  force_research: false

# Browser Testing
browser:
  enabled: {true if web/desktop else false}
  headless: false
  viewport: [1280, 720]

# Skills
skills:
  - test-driven-development
  - systematic-debugging
  - verification-before-completion

# MCP Integrations
mcps:
  {detected_mcps}
---
```

### Step 8: Create Initial STATE.md

Write `.gsd/STATE.md`:

```yaml
---
milestone: null
phase: null
task: null
branch: null

last_active: {current_timestamp}
session_tokens: 0

phases_complete: []
phases_in_progress: []
phases_pending: []

open_issues: []
---

## Session Context
Project initialized. Ready for /opti-gsd:new-project or /opti-gsd:roadmap.

## Recent Decisions
(none yet)
```

### Step 9: Commit

```bash
git add .gsd/
git commit -m "chore: initialize opti-gsd"
```

### Step 10: Report

Display summary:
- Detected: {framework} ({app_type})
- Base branch: {base}
- Skills available: {count}
- MCPs configured: {list}
- Codebase analysis: {yes/no}

Suggest next command:
- If PROJECT.md doesn't exist: `/opti-gsd:new-project`
- If PROJECT.md exists: `/opti-gsd:roadmap`

## Output

```
opti-gsd initialized!

Detected:
  Framework: Next.js (web)
  Base branch: main
  Skills: 3 available
  MCPs: supabase, stripe

Created:
  .gsd/config.md
  .gsd/STATE.md

Next: Run /opti-gsd:new-project to define your project
```
