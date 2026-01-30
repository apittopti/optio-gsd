# detect -- Scan for Available Tools

Auto-detect available MCP servers and plugins. Writes capability manifest to `.opti-gsd/tools.json`.

## Step 1: Create .opti-gsd/ if needed

If `.opti-gsd/` doesn't exist, create it.

## Step 2: Probe MCP Servers

Use ToolSearch to discover available MCP tools. See [../reference/mcp-tools.md](../reference/mcp-tools.md) for the full probe list.

For each probe:
1. Call `ToolSearch` with the query
2. If tools found, record as available
3. List actual tool names returned

## Step 3: Scan for Installed Plugins

Check these locations for plugin manifests:
- `~/.claude/` (global plugins)
- `./.claude/` (project-local plugins)

Extract from each plugin:
- Plugin name
- Available commands (skills)
- Available agents

## Step 4: Write .opti-gsd/tools.json

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

## Step 5: Report Results

```
+--------------------------------------------------------------+
|                    Tool Detection Complete                    |
+--------------------------------------------------------------+

MCP Servers:
  * cclsp (code intelligence)
  * GitHub (PRs, issues, code search)
  * Chrome (browser automation)
  x Memory/Graph (not detected)

Installed Plugins:
  - plugin-dev (3 skills, 2 agents)
  - opti-gsd (this tool)

Written to: .opti-gsd/tools.json

Agents will use these tools dynamically based on task needs.
```
