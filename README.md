# opti-gsd

Spec-driven development with fresh context execution for Claude Code.

A meta-prompting and context engineering system that makes Claude Code reliable for complex projects.

## Installation

### Quick Start (Global)

```bash
npx github:apittopti/opti-gsd init
```

This installs opti-gsd globally (`~/.claude/`) making it available in all projects.

### Project-Local Installation

```bash
npx github:apittopti/opti-gsd init --local
```

Installs to `./.claude/` for this project only. Useful for team sharing via git.

### Options

```bash
npx github:apittopti/opti-gsd init              # Interactive prompt
npx github:apittopti/opti-gsd init --global     # Install to ~/.claude/
npx github:apittopti/opti-gsd init --local      # Install to ./.claude/
```

### Uninstalling

```bash
npx github:apittopti/opti-gsd uninstall           # Uninstall from global (~/.claude/)
npx github:apittopti/opti-gsd uninstall --local   # Uninstall from project (./.claude/)
```

This removes opti-gsd folders and cleans CLAUDE.md.

### Updating

Just run `init` again - npx always fetches the latest from GitHub:

```bash
npx github:apittopti/opti-gsd init
```

Updates overwrite command files while preserving your `.opti-gsd/` project state.

### Private Repo Access

This repo is private. To use it, you need:

1. **GitHub access** - Be added as a collaborator
2. **Authentication** - Run `gh auth login` once

Then installation works normally:
```bash
npx github:apittopti/opti-gsd init
```

## Usage

After installation, start Claude Code and run:

```
/opti-gsd:detect-tools   # Discover available MCP servers and plugins
/opti-gsd:status         # See current state and next action
```

### Core Workflow

| Command | Purpose |
|---------|---------|
| /opti-gsd:status | See current state and next action |
| /opti-gsd:roadmap | Create or view project roadmap |
| /opti-gsd:plan-phase N | Generate execution plan for phase |
| /opti-gsd:execute | Execute current phase with fresh context |
| /opti-gsd:verify | Verify phase completion |

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

opti-gsd automatically discovers and uses available tools in your environment:

```
/opti-gsd:detect-tools
```

This detects:
- **MCP Servers** - cclsp (code intelligence), GitHub, browser automation, etc.
- **Installed Plugins** - Other Claude Code plugins and their skills/agents
- **Available Capabilities** - What each tool can do

Detected tools are written to `.opti-gsd/tools.md` so agents can dynamically use them.

### How Agents Use Tools

Agents read `.opti-gsd/tools.md` and match capabilities to their current task:
- Need code navigation? → Use cclsp if available
- Need to create a PR? → Use GitHub MCP if available
- Need browser testing? → Use chrome automation if available

No hardcoded tool references - agents adapt to whatever you have installed.

## Requirements

- Node.js 18+
- Claude Code installed
- GitHub access (for private repo installation)

## For Teams

### New Team Member Onboarding

```bash
git clone <your-repo>
cd <your-repo>
npx github:apittopti/opti-gsd init --local
claude
/opti-gsd:detect-tools
/opti-gsd:status
```

## License

MIT
