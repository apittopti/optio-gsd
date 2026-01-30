---
name: tools
description: Discover, configure, and manage MCP servers, plugins, CI/CD, and project toolchain. Subcommands: detect, configure, usage, ci.
disable-model-invocation: true
---

# tools [action] [args...]

Unified tool management for MCP servers, plugins, skills, and CI/CD toolchain.

## Routing

| Input | Action |
|-------|--------|
| `(no args)` | Show current tool configuration |
| `detect` | Discover available MCP servers, plugins, and skills |
| `configure` | Configure tool settings |
| `usage` | Show tool usage statistics |
| `ci` | View CI/CD configuration |
| `ci configure` | Configure CI/CD toolchain |

## Usage
- `/opti-gsd:tools` — Show current tool configuration
- `/opti-gsd:tools detect` — Discover available MCP servers, plugins, and skills
- `/opti-gsd:tools configure` — Configure tool settings
- `/opti-gsd:tools usage` — Show tool usage statistics
- `/opti-gsd:tools ci` — View CI/CD configuration
- `/opti-gsd:tools ci configure` — Configure CI/CD toolchain

---

## Subcommand: (no args) — List Tools

Show all configured tools:

```markdown
## Configured Tools

### MCP Servers
From `.opti-gsd/config.json`:

| MCP | Status | Purpose |
|-----|--------|---------|
| filesystem | Active | File operations |
| postgres | Active | Database queries |
| github | Inactive | Not connected |

### Skills
| Skill | Purpose |
|-------|---------|
| commit | Conventional commit generation |
| test | Test file generation |

### Detected Capabilities
From `.opti-gsd/tools.json`:

| Capability | Available | Tools |
|------------|-----------|-------|
| cclsp | ✓ | find_definition, find_references, get_diagnostics |
| Chrome | ✓ | navigate, read_page, computer |
| GitHub | ✓ | create_pull_request, list_issues |

Actions:
- Detect tools: /opti-gsd:tools detect
- Add MCP: /opti-gsd:tools add-mcp {name}
- Add skill: /opti-gsd:tools add-skill {name}
```

---

## Subcommand: detect — Detect Tools

Auto-detect available MCP servers and plugins. Writes capability manifest to `.opti-gsd/tools.json`.

### Step 1: Create .opti-gsd/ if needed

If `.opti-gsd/` doesn't exist, create it.

### Step 2: Probe MCP Servers

Use ToolSearch to discover available MCP tools:

```javascript
const mcpProbes = [
  { name: 'cclsp', query: 'cclsp', purpose: 'Code intelligence - definitions, references, diagnostics' },
  { name: 'GitHub', query: 'mcp github pull_request', purpose: 'GitHub operations - PRs, issues, code search' },
  { name: 'Browser (Playwright)', query: 'browser_navigate browser_snapshot', purpose: 'Browser automation via Playwright' },
  { name: 'Chrome', query: 'claude-in-chrome', purpose: 'Chrome browser automation' },
  { name: 'Memory/Graph', query: 'create_entities read_graph', purpose: 'Knowledge graph for persistent memory' },
  { name: 'Context7 Docs', query: 'get-library-docs resolve-library-id', purpose: 'Up-to-date library documentation' },
  { name: 'MUI Docs', query: 'mui-mcp', purpose: 'Material UI documentation' },
  { name: 'Sequential Thinking', query: 'sequentialthinking', purpose: 'Structured step-by-step reasoning' },
];
```

For each probe:
1. Call `ToolSearch` with the query
2. If tools found, record as available
3. List actual tool names returned

### Step 3: Scan for Installed Plugins

Check these locations for plugin manifests:
- `~/.claude/` (global plugins)
- `./.claude/` (project-local plugins)

Extract from each plugin:
- Plugin name
- Available commands (skills)
- Available agents

### Step 4: Write .opti-gsd/tools.json

```json
{
  "detected": "2026-01-25T10:30:00Z",
  "mcp": {
    "cclsp": {
      "available": true,
      "purpose": "Code intelligence - definitions, references, diagnostics",
      "use_when": "Navigating code, finding errors, renaming symbols",
      "tools": [
        "mcp__cclsp__find_definition",
        "mcp__cclsp__find_references",
        "mcp__cclsp__get_diagnostics"
      ]
    },
    "github": {
      "available": true,
      "purpose": "GitHub operations - PRs, issues, code search",
      "tools": ["mcp__MCP_DOCKER__create_pull_request"]
    },
    "chrome": {
      "available": false,
      "purpose": "Chrome browser automation"
    }
  },
  "plugins": {
    "plugin-dev": {
      "source": "~/.claude/",
      "skills": ["/plugin-dev:create-plugin"],
      "agents": ["plugin-dev:agent-creator"]
    }
  }
}
```

### Step 5: Report Results

```
╔══════════════════════════════════════════════════════════════╗
║                    Tool Detection Complete                    ║
╚══════════════════════════════════════════════════════════════╝

MCP Servers:
  ✓ cclsp (code intelligence)
  ✓ GitHub (PRs, issues, code search)
  ✓ Chrome (browser automation)
  ✗ Memory/Graph (not detected)

Installed Plugins:
  • plugin-dev (3 skills, 2 agents)
  • opti-gsd (this tool)

Written to: .opti-gsd/tools.json

Agents will use these tools dynamically based on task needs.
```

---

## Subcommand: configure — Add & Configure Tools

### Add MCP

Add MCP server to project configuration:

```markdown
## Add MCP: {name}

**Purpose:** {description}

**Configuration Required:**
{If credentials needed}
- Environment variable: {VAR_NAME}
- Config file: {path}

**Integration Points:**
- /opti-gsd:debug — Query {service} directly
- /opti-gsd:verify — Check {service} state

Added to `.opti-gsd/config.json`.
```

Update config.json:
```json
{
  "mcps": ["filesystem", "{new_mcp}"]
}
```

Commit:
```bash
git add .opti-gsd/config.json
git commit -m "chore: add {mcp} MCP to project"
```

### Add Skill

Add skill to project configuration:

```markdown
## Add Skill: {skill}

**Integration points:**
- /opti-gsd:execute — Available during task execution
- /opti-gsd:session pause — Include in commit workflow

Added to `.opti-gsd/config.json`.
```

Update config.json:
```json
{
  "skills": ["commit", "test", "{new_skill}"]
}
```

Commit:
```bash
git add .opti-gsd/config.json
git commit -m "chore: add {skill} skill to project"
```

### Scan

Analyze project for tool opportunities:

```markdown
## Tool Scan Results

**Detected Integrations:**

| Service | Detection | Suggested |
|---------|-----------|-----------|
| PostgreSQL | prisma in deps | add-mcp postgres |
| Redis | ioredis in deps | add-mcp redis |
| AWS S3 | @aws-sdk/s3 | add-mcp s3 |
| GitHub | .github/ dir | add-mcp github |

**Recommended Skills:**

| Skill | Relevance | Use Case |
|-------|-----------|----------|
| commit | High | Conventional commits |
| test | High | Generate tests |

Add with: /opti-gsd:tools add-mcp {name} or /opti-gsd:tools add-skill {name}
```

### Recommend

Deep analysis based on project type:

```markdown
## Tool Recommendations

### For Your Stack (Next.js + PostgreSQL)

**Essential:**
1. **postgres** MCP — Direct database queries during debug
2. **commit** skill — Consistent commit messages

**Recommended:**
3. **github** MCP — PR and issue management
4. **browser** MCP — UI testing and verification
5. **context7** MCP — Up-to-date library docs

**Optional:**
6. **slack** MCP — Team notifications

Add with: /opti-gsd:tools add-mcp {name}
```

### Check

Verify configured tools are available:

```markdown
## Tool Status Check

| Tool | Configured | Available | Status |
|------|------------|-----------|--------|
| filesystem | Yes | Yes | ✓ OK |
| postgres | Yes | Yes | ✓ OK |
| github | Yes | No | ✗ Not running |
| commit (skill) | Yes | Yes | ✓ OK |

**Issues:**
- github: MCP server not detected. Start with `npx @mcp/github`

**Summary:** 3/4 configured tools available
```

---

## Subcommand: usage — Tool Usage Statistics

Display tool usage summary for the current session. Analyzes which tools were used, their frequency, and provides insights into MCP vs built-in tool distribution.

### Data Source

Reads from `.opti-gsd/tool-usage.json` which is populated during execution sessions. Uses `scripts/analyze-tool-usage.js` for analysis and formatting.

### Behavior

1. Load tool usage data from `.opti-gsd/tool-usage.json`
2. Calculate session metrics (duration, total calls)
3. Categorize tools as MCP or built-in
4. Generate visual summary with bar charts
5. Show per-task breakdown if task data exists

### Example Output

```
## Tool Usage Summary

Session: 2026-01-25 (45 min active)

### By Tool Type
MCP Tools:     12 calls (27%)
Built-in:      33 calls (73%)

### Top Tools
Read           18 calls  ████████████████████
Edit           12 calls  ████████████
Bash            8 calls  ████████
Grep            5 calls  █████
Glob            4 calls  ████
mcp__cclsp__find_definition
                3 calls  ███
Write           2 calls  ██
mcp__cclsp__get_diagnostics
                2 calls  ██

### By Task
Task 01: 15 calls (Read: 8, Edit: 5, Bash: 2)
Task 02: 12 calls (Read: 6, Edit: 4, Grep: 2)
Task 03: 18 calls (Read: 4, Edit: 3, mcp__cclsp: 5, Bash: 6)

### Insights
- Most used: Read (40% of all calls)
- MCP tools used in 3/5 tasks
- Avg tools per task: 9 calls
```

### Filtering Options

Filter the usage report with optional flags:

| Flag | Description | Example |
|------|-------------|---------|
| `--task=T01` | Filter to specific task | Show only tools used in Task 01 |
| `--type=mcp` | Filter by tool type | Show only MCP tools |
| `--type=builtin` | Filter by tool type | Show only built-in tools |
| `--session=latest` | Session scope (default) | Most recent session only |
| `--session=all` | Session scope | Aggregate all sessions |
| `--format=json` | Output format | Machine-readable JSON |

### Examples

```bash
# Full summary (default)
/opti-gsd:tools usage

# Filter to specific task
/opti-gsd:tools usage --task=T01

# Show only MCP tools
/opti-gsd:tools usage --type=mcp

# Aggregate all sessions
/opti-gsd:tools usage --session=all

# JSON output for scripting
/opti-gsd:tools usage --format=json
```

### No Data Available

If no usage data exists:

```
## Tool Usage Summary

No usage data found.

Tool usage is tracked during /opti-gsd:execute sessions.
Run a phase execution to generate usage data.
```

---

## Subcommand: ci — CI/CD Configuration

Configure or view CI/CD toolchain and deployment settings.

### Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .opti-gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:init new to start a new project
```

If `.opti-gsd/config.json` missing:
```
⚠️ Configuration Missing
─────────────────────────────────────
.opti-gsd/config.json not found.

→ Run /opti-gsd:init to reinitialize
```

### Step 2: Auto-Detect Toolchain

Detect package manager and scripts from project files:

**Node.js (package.json):**
```bash
# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then echo "pnpm"
elif [ -f "yarn.lock" ]; then echo "yarn"
elif [ -f "bun.lockb" ]; then echo "bun"
elif [ -f "package-lock.json" ]; then echo "npm"
fi
```

Read `package.json` scripts and map:
| Script | CI Command |
|--------|------------|
| `build` | build |
| `test` | test |
| `lint` | lint |
| `typecheck` or `type-check` | typecheck |
| `test:e2e` or `e2e` | e2e |
| `test:unit` | unit_test |
| `test:integration` | integration |

**Rust (Cargo.toml):**
```json
{
  "package_manager": "cargo",
  "build": "cargo build --release",
  "test": "cargo test",
  "lint": "cargo clippy -- -D warnings"
}
```

**Python (pyproject.toml or requirements.txt):**
```json
{
  "package_manager": "pip",
  "build": "python -m build",
  "test": "pytest",
  "lint": "ruff check .",
  "typecheck": "mypy ."
}
```

**Go (go.mod):**
```json
{
  "package_manager": "go",
  "build": "go build ./...",
  "test": "go test ./...",
  "lint": "golangci-lint run"
}
```

**C# (.csproj or .sln):**
```json
{
  "package_manager": "dotnet",
  "build": "dotnet build",
  "test": "dotnet test",
  "lint": "dotnet format --verify-no-changes"
}
```

### Step 2b: Detect Deployment Platform CLIs

**Vercel:**
```bash
# Check if Vercel CLI is available
vercel --version 2>/dev/null

# If available, get project info
vercel inspect --json  # Returns project URL, aliases, etc.
vercel ls --json       # List deployments with URLs
```

If Vercel project detected:
```json
{
  "deploy": {
    "target": "vercel",
    "detected_from": "cli",
    "build_local": "vercel build",
    "preview_url": "{from vercel inspect}",
    "production_url": "{from vercel inspect --prod}"
  }
}
```

**Netlify:**
```bash
netlify --version 2>/dev/null
netlify status --json  # Get site URL
```

**Railway:**
```bash
railway --version 2>/dev/null
railway status  # Get deployment URL
```

**Fly.io:**
```bash
fly version 2>/dev/null
fly status --json  # Get app URL
```

### Step 3: Detect Available MCPs

Check which MCPs are available for verification:

```bash
# List configured MCPs from Claude config
```

Map MCPs to capabilities:
| MCP | Capability |
|-----|------------|
| `claude-in-chrome` | Browser/E2E testing |
| `MCP_DOCKER` (GitHub) | CI status checks, PR validation |
| `playwright` | Headless browser testing |

### Step 4: Display Current Configuration

Show current CI config from `.opti-gsd/config.json`:

```
╔══════════════════════════════════════════════════════════════╗
║                    CI/CD Configuration                       ║
╚══════════════════════════════════════════════════════════════╝

Toolchain:
──────────────────────────────────────────────────────────────
  Package Manager:  npm
  Build:            npm run build
  Test:             npm test
  Lint:             npm run lint
  Typecheck:        tsc --noEmit
  E2E:              npm run test:e2e
──────────────────────────────────────────────────────────────

URLs:
──────────────────────────────────────────────────────────────
  Local:            http://localhost:3000
  API:              http://localhost:3000/api
  Staging:          https://staging.example.com
  Production:       https://example.com
──────────────────────────────────────────────────────────────

Verification MCPs:
──────────────────────────────────────────────────────────────
  [✓] Browser (claude-in-chrome) — E2E testing available
  [✓] GitHub (MCP_DOCKER) — CI status, PR checks
  [ ] Playwright — Not configured
──────────────────────────────────────────────────────────────

Deployment:
──────────────────────────────────────────────────────────────
  Target:           vercel
  CI System:        github-actions
  Prod Branch:      main
──────────────────────────────────────────────────────────────

Run /opti-gsd:tools ci configure to modify settings.
```

### Step 5: Configure Mode (if `ci configure` argument)

If user runs /opti-gsd:tools ci configure, ask:

**Toolchain Questions:**
1. "What's your build command?" (default: detected)
2. "What's your test command?" (default: detected)
3. "What's your lint command?" (default: detected or "none")
4. "Do you have E2E tests? What command runs them?" (default: detected or "none")

**URL Questions:**
1. "What's your local dev URL?" (default: http://localhost:3000)
2. "What's your API URL?" (default: same as local + /api, or "none")
3. "Do you have a staging environment? What's the URL?" (default: "none")
4. "What's your production URL?" (default: "none")

**Deployment Questions:**
1. "Where do you deploy?" (Vercel / Netlify / Railway / Render / AWS / Docker / Other / None)
2. "Do you use CI/CD?" (GitHub Actions / GitLab CI / CircleCI / None)
3. "What branch deploys to production?" (default: main)
4. "Does your platform auto-deploy branches for preview?" (Yes / No)
5. If yes: "What's your preview URL pattern?" (e.g., `https://{project}-{branch}.vercel.app`)

### Step 6: Update config.json

Update the `ci`, `urls`, and `deploy` sections in `.opti-gsd/config.json`:

```json
{
  "ci": {
    "package_manager": "npm",
    "build": "npm run build",
    "test": "npm test",
    "lint": "npm run lint",
    "typecheck": "tsc --noEmit",
    "e2e": "npm run test:e2e"
  },
  "urls": {
    "local": "http://localhost:3000",
    "api": "http://localhost:3000/api",
    "preview": null,
    "staging": "https://staging.example.com",
    "production": "https://example.com"
  },
  "deploy": {
    "target": "vercel",
    "detected_from": "cli",
    "ci_system": "github-actions",
    "production_branch": "main",
    "preview_pattern": "https://{project}-{branch}-{team}.vercel.app"
  },
  "verification": {
    "type": "browser",
    "browser_mcp": "claude-in-chrome",
    "github_mcp": "MCP_DOCKER"
  }
}
```

### Step 7: Commit Changes

```bash
git add .opti-gsd/config.json
git commit -m "chore: configure CI/CD toolchain"
```

### Step 8: Show Summary

```
CI/CD configured!

Verify will now run:
  1. npm run lint
  2. npm run typecheck
  3. npm test
  4. npm run build

E2E testing: Available via browser MCP
CI checks: Will verify GitHub Actions status

Next: /opti-gsd:verify to test the configuration
```

### CI Arguments

| Argument | Description |
|----------|-------------|
| (none) | Display current CI configuration |
| `configure` | Interactive configuration mode |
| `detect` | Re-run auto-detection and update config |

### Verification Integration

When /opti-gsd:verify runs, it reads the `ci:` section and executes:

1. **Lint** (if configured) — Fast feedback on code style
2. **Typecheck** (if configured) — Type safety verification
3. **Unit Tests** (if configured) — Core functionality
4. **Build** (if configured) — Compilation/bundling works
5. **E2E Tests** (if configured + browser MCP available) — User flows work

If any command fails, verification reports the failure with output.

---

## Common MCPs

| MCP | Purpose | Install |
|-----|---------|---------|
| filesystem | File operations | Built-in |
| context7 | Library documentation | @context7/mcp |
| postgres | PostgreSQL queries | @mcp/postgres |
| mysql | MySQL queries | @mcp/mysql |
| github | GitHub API | @mcp/github |
| browser | Browser automation | @mcp/browser |
| slack | Slack messaging | @mcp/slack |
| redis | Redis operations | @mcp/redis |
| s3 | AWS S3 access | @mcp/s3 |

---

## Context Budget

| Action | Budget |
|--------|--------|
| List | ~2% |
| Detect | ~3% |
| Configure | ~2% |
| Scan | ~5% |
| Recommend | ~8% |
| Check | ~3% |
| Usage | ~2% |
| CI View | ~3% |
| CI Configure | ~3% |
