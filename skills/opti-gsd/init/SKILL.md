---
name: init
description: Initialize opti-gsd in an existing project (brownfield).
disable-model-invocation: true
---

# init

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
2. **Always use milestone branches** — Run `/opti-gsd:start-milestone [name]` first
3. **Check status before starting** — Run `/opti-gsd:status` to understand current state
4. **Follow the phase workflow** — Plan → Execute → Verify

## Quick Reference

| Command | Purpose |
|---------|---------|
| `/opti-gsd:status` | Check current state and next action |
| `/opti-gsd:start-milestone [name]` | Start a new milestone branch |
| `/opti-gsd:roadmap` | View or create project roadmap |
| `/opti-gsd:plan-phase [N]` | Plan a phase |
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
3. Is there a plan for this work? (`/opti-gsd:plan-phase`)

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

**Key commands:** `/opti-gsd:status`, `/opti-gsd:start-milestone`, `/opti-gsd:roadmap`, `/opti-gsd:plan-phase`, `/opti-gsd:execute`, `/opti-gsd:verify`
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
- Optional: /opti-gsd:research — Get domain best practices before planning
- Optional: /opti-gsd:ci configure — Customize CI/CD settings

Note: /opti-gsd:new-project is for greenfield projects starting from scratch. Since /opti-gsd:init is for existing codebases, suggest roadmap instead.

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
→ /opti-gsd:roadmap      — Plan your work (create phases)
→ /opti-gsd:tools        — View/configure available tools (optional)
→ /opti-gsd:research     — Research best practices (optional)

💾 State saved. Safe to /compact or start new session if needed.
