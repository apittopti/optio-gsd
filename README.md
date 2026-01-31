# opti-gsd

Spec-driven development with fresh context execution for Claude Code.

A meta-prompting and context engineering system that makes Claude Code reliable for complex projects.

## Installation

### Plugin Install (Recommended)

From inside Claude Code:

```
/plugin marketplace add apittopti/opti-gsd
/plugin install opti-gsd
```

To update: `/plugin update opti-gsd`
To uninstall: `/plugin uninstall opti-gsd`

### Private Repo Access

This repo is private. To use it, you need:

1. **GitHub access** — Be added as a collaborator
2. **Authentication** — Run `gh auth login` once

## Usage

After installation, start Claude Code and run:

```
/opti-gsd:init           # Initialize project (auto-detects tools)
/opti-gsd:status         # See current state and next action
```

### Core Workflow

| Command | Purpose |
|---------|---------|
| /opti-gsd:status | See current state and next action |
| /opti-gsd:roadmap | Create or view project roadmap |
| /opti-gsd:plan-phase N | Generate execution plan for phase |
| /opti-gsd:execute | Execute current phase (review built in between waves) |
| /opti-gsd:review | Review results, provide feedback, get targeted fixes |
| /opti-gsd:push | Push branch to GitHub for CI + preview deployment |
| /opti-gsd:verify | Verify phase completion (review built in after checks) |

### Tracking

| Type | Add | View |
|------|-----|------|
| Features | /opti-gsd:add-feature | /opti-gsd:features |
| Stories | /opti-gsd:add-story | /opti-gsd:stories |
| Issues | /opti-gsd:issues add | /opti-gsd:issues |

Run `/opti-gsd:help` for full command reference.

## How It Works

1. **Roadmap** - Define milestones and phases
2. **Plan** - Generate detailed task plans (max 3 tasks per plan)
3. **Execute** - Each task runs in a fresh subagent with full 200k context
4. **Verify** - Goal-backward verification ensures quality
5. **Commit** - Atomic commits per task for easy rollback

## Tool Detection

opti-gsd automatically discovers available tools during `/opti-gsd:init`. To manually refresh or manage tools:

```
/opti-gsd:tools detect    # Re-detect available tools
/opti-gsd:tools           # View all configured tools
/opti-gsd:tools add-mcp   # Add MCP server to project
/opti-gsd:tools add-skill # Add skill to project
```

This detects:
- **MCP Servers** - cclsp (code intelligence), GitHub, browser automation, etc.
- **Installed Extensions** - Other Claude Code extensions and their skills/agents
- **Available Capabilities** - What each tool can do

Detected tools are written to `.opti-gsd/tools.json` so agents can dynamically use them.

### How Agents Use Tools

Agents read `.opti-gsd/tools.json` and match capabilities to their current task:
- Need code navigation? → Use cclsp if available
- Need to create a PR? → Use GitHub MCP if available
- Need browser testing? → Use chrome automation if available

No hardcoded tool references - agents adapt to whatever you have installed.

## Requirements

- Claude Code installed
- GitHub access (for private repo installation)

## For Teams

### New Team Member Onboarding

```bash
git clone <your-repo>
cd <your-repo>
claude
# Then in Claude Code:
/plugin marketplace add apittopti/opti-gsd
/plugin install opti-gsd
/opti-gsd:init     # Auto-detects tools
/opti-gsd:status
```

## License

MIT
