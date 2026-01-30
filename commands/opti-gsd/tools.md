---
description: Discover, configure, and manage MCP servers, plugins, and skills for the project.
---

# tools [action] [args...]

Unified tool management for MCP servers, plugins, and skills.

## Actions

- (no args) — List all configured tools
- `detect` — Auto-detect available MCP servers and plugins
- `add-mcp [name]` — Add MCP server to project
- `add-skill [name]` — Add skill to project
- `scan` — Scan project dependencies for tool opportunities
- `recommend` — Get tool recommendations based on stack
- `check` — Verify configured tools are available
- `usage` — Display tool usage summary for current session

## Behavior

### List Tools (no args)

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

### Detect Tools

Auto-detect available MCP servers and plugins. Writes capability manifest to `.opti-gsd/tools.json`.

#### Step 1: Create .opti-gsd/ if needed

If `.opti-gsd/` doesn't exist, create it.

#### Step 2: Probe MCP Servers

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

#### Step 3: Scan for Installed Plugins

Check these locations for plugin manifests:
- `~/.claude/` (global plugins)
- `./.claude/` (project-local plugins)

Extract from each plugin:
- Plugin name
- Available commands (skills)
- Available agents

#### Step 4: Write .opti-gsd/tools.json

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

#### Step 5: Report Results

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

---

### Add Skill

Add skill to project configuration:

```markdown
## Add Skill: {skill}

**Integration points:**
- /opti-gsd:execute — Available during task execution
- /opti-gsd:pause — Include in commit workflow

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

---

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

---

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

---

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

### Usage

Display tool usage summary for the current session. Analyzes which tools were used, their frequency, and provides insights into MCP vs built-in tool distribution.

#### Data Source

Reads from `.opti-gsd/tool-usage.json` which is populated during execution sessions. Uses `scripts/analyze-tool-usage.js` for analysis and formatting.

#### Behavior

1. Load tool usage data from `.opti-gsd/tool-usage.json`
2. Calculate session metrics (duration, total calls)
3. Categorize tools as MCP or built-in
4. Generate visual summary with bar charts
5. Show per-task breakdown if task data exists

#### Example Output

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

#### Filtering Options

Filter the usage report with optional flags:

| Flag | Description | Example |
|------|-------------|---------|
| `--task=T01` | Filter to specific task | Show only tools used in Task 01 |
| `--type=mcp` | Filter by tool type | Show only MCP tools |
| `--type=builtin` | Filter by tool type | Show only built-in tools |
| `--session=latest` | Session scope (default) | Most recent session only |
| `--session=all` | Session scope | Aggregate all sessions |
| `--format=json` | Output format | Machine-readable JSON |

#### Examples

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

#### No Data Available

If no usage data exists:

```
## Tool Usage Summary

No usage data found.

Tool usage is tracked during /opti-gsd:execute sessions.
Run a phase execution to generate usage data.
```

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
| Add | ~2% |
| Scan | ~5% |
| Recommend | ~8% |
| Check | ~3% |
| Usage | ~2% |
