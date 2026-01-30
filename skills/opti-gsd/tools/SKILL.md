---
name: tools
description: Discover and configure MCP servers, project toolchain, testing frameworks, and CI/CD pipelines. Subcommands: detect (scan for available tools), configure [tool] (set up integration), usage (show tool utilization), ci (configure CI/CD workflows).
disable-model-invocation: true
argument-hint: detect|configure|usage|ci [args]
---

# tools [action] [args...]

Unified tool management for MCP servers, plugins, skills, and CI/CD toolchain.

## Routing

| Input | Action | Detail |
|-------|--------|--------|
| `(no args)` | Show current tool configuration | See [List Tools](#subcommand-no-args--list-tools) below |
| `detect` | Discover available MCP servers, plugins, and skills | [actions/detect.md](actions/detect.md) |
| `configure` | Configure tool settings | [actions/configure.md](actions/configure.md) |
| `usage` | Show tool usage statistics | [actions/usage.md](actions/usage.md) |
| `ci` | View CI/CD configuration | [actions/ci.md](actions/ci.md) |
| `ci configure` | Configure CI/CD toolchain | [actions/ci.md](actions/ci.md) |

## Usage

- `/opti-gsd:tools` -- Show current tool configuration
- `/opti-gsd:tools detect` -- Discover available MCP servers, plugins, and skills
- `/opti-gsd:tools configure` -- Configure tool settings
- `/opti-gsd:tools usage` -- Show tool usage statistics
- `/opti-gsd:tools ci` -- View CI/CD configuration
- `/opti-gsd:tools ci configure` -- Configure CI/CD toolchain

## Reference Files

- [reference/mcp-tools.md](reference/mcp-tools.md) -- MCP probe list, common MCPs, capability mapping
- [reference/ci-templates.md](reference/ci-templates.md) -- Language-specific CI/CD detection templates

---

## Subcommand: (no args) -- List Tools

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
| cclsp | Yes | find_definition, find_references, get_diagnostics |
| Chrome | Yes | navigate, read_page, computer |
| GitHub | Yes | create_pull_request, list_issues |

Actions:
- Detect tools: /opti-gsd:tools detect
- Add MCP: /opti-gsd:tools add-mcp {name}
- Add skill: /opti-gsd:tools add-skill {name}
```

---

## Subcommand: detect -- Detect Tools

Auto-detect available MCP servers and plugins. Writes capability manifest to `.opti-gsd/tools.json`.

**Procedure:** Follow [actions/detect.md](actions/detect.md) for the full step-by-step process.

**Summary:**
1. Create `.opti-gsd/` if needed
2. Probe MCP servers using ToolSearch (see [reference/mcp-tools.md](reference/mcp-tools.md) for probe list)
3. Scan for installed plugins in `~/.claude/` and `./.claude/`
4. Write results to `.opti-gsd/tools.json`
5. Report detection results

---

## Subcommand: configure -- Add & Configure Tools

Add and configure MCP servers, skills, and project tools.

**Procedure:** Follow [actions/configure.md](actions/configure.md) for the full step-by-step process.

**Sub-actions:**
- **add-mcp {name}** -- Add MCP server to project, update `config.json`, commit
- **add-skill {name}** -- Add skill to project, update `config.json`, commit
- **scan** -- Analyze project dependencies for tool opportunities
- **recommend** -- Deep analysis with stack-specific recommendations
- **check** -- Verify all configured tools are available and running

---

## Subcommand: usage -- Tool Usage Statistics

Display tool usage summary for the current session with MCP vs built-in breakdown.

**Procedure:** Follow [actions/usage.md](actions/usage.md) for the full step-by-step process.

**Data source:** `.opti-gsd/tool-usage.json` (populated during execution sessions)

**Filtering options:**
| Flag | Description |
|------|-------------|
| `--task=T01` | Filter to specific task |
| `--type=mcp` | Show only MCP tools |
| `--type=builtin` | Show only built-in tools |
| `--session=latest` | Most recent session (default) |
| `--session=all` | Aggregate all sessions |
| `--format=json` | Machine-readable output |

---

## Subcommand: ci -- CI/CD Configuration

Configure or view CI/CD toolchain and deployment settings.

**Procedure:** Follow [actions/ci.md](actions/ci.md) for the full step-by-step process.

**CI Arguments:**

| Argument | Description |
|----------|-------------|
| (none) | Display current CI configuration |
| `configure` | Interactive configuration mode |
| `detect` | Re-run auto-detection and update config |

**Overview:**
1. Validate prerequisites (`.opti-gsd/` and `config.json` exist)
2. Auto-detect toolchain from project files (see [reference/ci-templates.md](reference/ci-templates.md))
3. Detect deployment platform CLIs (Vercel, Netlify, Railway, Fly.io)
4. Detect available MCPs for verification
5. Display or configure CI settings
6. Update `config.json` and commit

**Verification integration:** When `/opti-gsd:verify` runs, it reads `ci:` from config and executes lint, typecheck, test, build, and E2E in order.

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
