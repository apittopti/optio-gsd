# Init Existing Project (Brownfield)

Initialize opti-gsd in an existing project with framework detection, toolchain setup, and optional codebase analysis.

## Step 1: Validate Environment

```bash
# Check for git repo
git rev-parse --is-inside-work-tree

# Get default branch
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main"
```

If not a git repo, inform user and offer to initialize one.

## Step 2: Detect Framework

Read `package.json` (or equivalent) and detect the framework and app type.

See [../reference/framework-detection.md](../reference/framework-detection.md) for the full detection tables.

If no match or ambiguous, ask user to confirm app_type.

## Step 3: Detect Deployment Platform

Check for deployment configuration files and detect the hosting platform.

See [../reference/deployment-detection.md](../reference/deployment-detection.md) for the full detection tables and procedures.

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

## Step 4: Detect CI/CD Toolchain

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

## Step 5: Detect Available Tools

Auto-detect available MCP servers and plugins by running `/opti-gsd:tools detect` logic:

1. Probe MCP servers (cclsp, GitHub, Chrome, Context7, etc.)
2. Scan for installed plugins
3. Write capability manifest to `.opti-gsd/tools.json`

This ensures agents can dynamically use available tools from the start.

## Step 6: Ask User About Services

Ask which external services/MCPs the project uses:
- Database (Supabase, Firebase, Prisma, etc.)
- Payments (Stripe, etc.)
- Auth (Supabase Auth, Auth0, Clerk, etc.)
- Email (Resend, SendGrid, etc.)
- Storage (S3, Supabase Storage, etc.)

## Step 7: Analyze Codebase (Optional)

If the codebase has significant existing code, offer to run codebase mapping:

> "This project has existing code. Would you like me to analyze it? This will help with planning but uses more context."

If yes, spawn opti-gsd-codebase-mapper agents in parallel:
- focus: tech
- focus: arch
- focus: quality
- focus: concerns

## Step 8: Create Directory Structure

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

## Step 9: Create config.json

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

## Step 10: Create Initial state.json

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

## Step 11: Update Project CLAUDE.md

Create or update the project's `CLAUDE.md` to ensure opti-gsd workflow is always considered.

See [claude-md.md](claude-md.md) for the full CLAUDE.md content templates (new file vs. append to existing).

## Step 12: Commit

```bash
git add .opti-gsd/
git add CLAUDE.md
git commit -m "chore: initialize opti-gsd

- Created .opti-gsd/ workflow directory
- Updated CLAUDE.md with workflow instructions"
```

## Step 13: Report

Display summary:
- Detected: {framework} ({app_type})
- Base branch: {base}
- Tools detected: {MCP servers and plugins}
- Codebase analysis: {yes/no}

### Output Format

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

## Context Budget

~15%
