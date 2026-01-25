---
description: Initialize opti-gsd in an existing project (brownfield).
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

### Step 2b: Detect CI/CD Toolchain

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
mkdir -p .opti-gsd/plans
mkdir -p .opti-gsd/archive
mkdir -p .opti-gsd/summaries
mkdir -p .opti-gsd/codebase
mkdir -p .opti-gsd/stories
mkdir -p .opti-gsd/issues
mkdir -p .opti-gsd/debug
```

### Step 7: Create config.json

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
  "verification": {
    "type": "browser|terminal",
    "github": null
  }
}
```

### Step 8: Create Initial state.json

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

### Step 9: Commit

```bash
git add .opti-gsd/
git commit -m "chore: initialize opti-gsd"
```

### Step 10: Report

Display summary:
- Detected: {framework} ({app_type})
- Base branch: {base}
- Skills available: {count}
- MCPs configured: {list}
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

Verification:
  Browser: native (claude-in-chrome)
  GitHub: MCP_DOCKER

MCPs:
  Integrations: supabase, stripe

Created:
  .opti-gsd/config.json
  .opti-gsd/state.json

Next steps:
→ /opti-gsd:roadmap      — Plan your work (create phases)
→ /opti-gsd:ci configure — Customize CI/CD settings (optional)
→ /opti-gsd:research     — Research best practices (optional)

💾 State saved. Safe to /compact or start new session if needed.
```
