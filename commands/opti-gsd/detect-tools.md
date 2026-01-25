---
description: Detect available MCP servers, plugins, and capabilities for dynamic tool usage.
---

# detect-tools

Discovers all available tools, MCP servers, and plugins in the user's Claude Code environment. Writes a capability manifest to `.opti-gsd/tools.json` that agents read to dynamically use available tools.

## Why This Exists

opti-gsd agents need to know what tools are available without hardcoding tool names. This command:
1. Probes for MCP servers (cclsp, GitHub, browser, etc.)
2. Scans for installed Claude Code plugins
3. Writes a self-describing manifest that agents interpret dynamically

## Behavior

### Step 1: Create .opti-gsd/ if needed

If `.opti-gsd/` doesn't exist, create it.

### Step 2: Probe MCP Servers

Use ToolSearch to discover available MCP tools. For each known MCP category, search and record what's available:

```javascript
// Probe these categories
const mcpProbes = [
  { name: 'cclsp', query: 'cclsp', purpose: 'Code intelligence - find definitions, references, diagnostics, refactoring', useWhen: 'Navigating code, finding errors, renaming symbols, understanding call hierarchies' },
  { name: 'GitHub', query: 'mcp github pull_request', purpose: 'GitHub operations - PRs, issues, code search, repository management', useWhen: 'Creating PRs, managing issues, searching code across repos' },
  { name: 'Browser (Playwright)', query: 'browser_navigate browser_snapshot', purpose: 'Browser automation via Playwright - navigate, screenshot, interact', useWhen: 'E2E testing, visual verification, form filling' },
  { name: 'Chrome', query: 'claude-in-chrome', purpose: 'Chrome browser automation - navigate, read pages, interact with elements', useWhen: 'Testing web UIs, capturing screenshots, browser-based verification' },
  { name: 'Memory/Graph', query: 'create_entities read_graph', purpose: 'Knowledge graph for persistent memory across sessions', useWhen: 'Storing project knowledge, remembering decisions, building context' },
  { name: 'Context7 Docs', query: 'get-library-docs resolve-library-id', purpose: 'Fetch up-to-date library documentation', useWhen: 'Looking up API docs, checking library usage patterns' },
  { name: 'MUI Docs', query: 'mui-mcp', purpose: 'Material UI documentation lookup', useWhen: 'Working with MUI components, checking props and styling' },
  { name: 'Sequential Thinking', query: 'sequentialthinking', purpose: 'Structured step-by-step reasoning', useWhen: 'Complex problem solving, breaking down difficult tasks' },
];
```

For each probe:
1. Call `ToolSearch` with the query
2. If tools are found, record them as available
3. List the actual tool names returned

### Step 3: Scan for Installed Plugins

Check these locations for plugin manifests:
- `~/.claude/` (global plugins)
- `./.claude/` (project-local plugins)

For each directory, look for:
- `plugin.json` files
- Subdirectories with `commands/`, `agents/`, `skills/`

Extract from each plugin:
- Plugin name
- Available commands (skills)
- Available agents
- Brief description if available

### Step 4: Write .opti-gsd/tools.json

Write the capability manifest in JSON format:

```json
{
  "detected": "2026-01-25T10:30:00Z",
  "mcp": {
    "cclsp": {
      "available": true,
      "purpose": "Code intelligence - find definitions, references, diagnostics, refactoring",
      "use_when": "Navigating code, finding errors, renaming symbols, understanding call hierarchies",
      "tools": [
        "mcp__cclsp__find_definition",
        "mcp__cclsp__find_references",
        "mcp__cclsp__get_diagnostics",
        "mcp__cclsp__get_hover",
        "mcp__cclsp__rename_symbol",
        "mcp__cclsp__find_implementation",
        "mcp__cclsp__get_incoming_calls",
        "mcp__cclsp__get_outgoing_calls"
      ]
    },
    "github": {
      "available": true,
      "purpose": "GitHub operations - PRs, issues, code search",
      "use_when": "Creating PRs, managing issues, searching code across repos",
      "tools": [
        "mcp__MCP_DOCKER__create_pull_request",
        "mcp__MCP_DOCKER__list_issues",
        "mcp__MCP_DOCKER__search_code"
      ]
    },
    "chrome": {
      "available": false,
      "purpose": "Chrome browser automation",
      "use_when": "Testing web UIs, capturing screenshots"
    }
  },
  "plugins": {
    "plugin-dev": {
      "source": "~/.claude/",
      "purpose": "Tools for developing Claude Code plugins",
      "skills": [
        "/plugin-dev:create-plugin",
        "/plugin-dev:agent-development",
        "/plugin-dev:skill-development"
      ],
      "agents": [
        "plugin-dev:agent-creator",
        "plugin-dev:plugin-validator"
      ]
    },
    "opti-gsd": {
      "source": "~/.claude/",
      "purpose": "Spec-driven development workflow",
      "skills": ["See /opti-gsd:help"]
    }
  }
}
```

**How agents use this file:**
1. Read `.opti-gsd/tools.json`
2. Check if needed capability is available (`mcp.cclsp.available`)
3. Use `ToolSearch` to load MCP tools before calling
4. Use Skill tool for plugin skills, Task tool for plugin agents
5. Fall back to built-in approaches if capability unavailable

### Step 5: Report Results

Display a summary:

```
╔══════════════════════════════════════════════════════════════╗
║                    Tool Detection Complete                    ║
╚══════════════════════════════════════════════════════════════╝

MCP Servers:
  ✓ cclsp (code intelligence)
  ✓ GitHub (PRs, issues, code search)
  ✓ Chrome (browser automation)
  ✗ Memory/Graph (not detected)
  ✗ MUI Docs (not detected)

Installed Plugins:
  • plugin-dev (3 skills, 2 agents)
  • opti-gsd (this plugin)

Capabilities written to: .opti-gsd/tools.json

Agents will now use these tools dynamically based on task needs.
```

---

## Arguments

- `refresh` — Force re-detection even if tools.json exists
- `list` — Just show what's available without writing file

---

## Examples

```
/opti-gsd:detect-tools           # Detect and write .opti-gsd/tools.json
/opti-gsd:detect-tools refresh   # Force refresh
/opti-gsd:detect-tools list      # Show available tools without writing
```

---

## When to Run

- After installing opti-gsd
- After adding new MCP servers to your config
- After installing new Claude Code plugins
- When agents report missing tools
- Periodically to keep the manifest current

---

## Context Budget

Minimal: ~3%
