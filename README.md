# opti-gsd

Spec-driven development with fresh context execution for Claude Code.

A meta-prompting and context engineering system that makes Claude Code reliable for complex projects.

## Installation

### Quick Start (Global)

```bash
npx github:apittopti/opti-gsd init
```

This installs opti-gsd globally (`~/.claude/`) and automatically:
- Detects your project's languages
- Installs appropriate LSP plugins for code intelligence

### Project-Local Installation

```bash
npx github:apittopti/opti-gsd init --local
```

Installs to `./.claude/` for this project only. Useful for team sharing via git.

### Options

```bash
npx github:apittopti/opti-gsd init --global     # Install globally (default)
npx github:apittopti/opti-gsd init --local      # Install to project only
npx github:apittopti/opti-gsd init --skip-lsp   # Skip LSP plugin detection
npx github:apittopti/opti-gsd update            # Update to latest version
npx github:apittopti/opti-gsd setup-lsp         # Just detect and install LSP
```

### Uninstalling

```bash
npx github:apittopti/opti-gsd uninstall           # Uninstall from global (~/.claude/)
npx github:apittopti/opti-gsd uninstall --local   # Uninstall from project (./.claude/)
npx github:apittopti/opti-gsd uninstall --skip-lsp  # Keep LSP plugins installed
```

This removes opti-gsd folders, cleans CLAUDE.md, and optionally removes LSP plugins.

### Updating

```bash
npx github:apittopti/opti-gsd update
```

npx always fetches the latest from GitHub - no cache issues. Updates overwrite command files while preserving:

| Updated | Preserved |
|---------|-----------|
| commands/, agents/, skills/ | .gsd/ project state |
| docs/ | Your CLAUDE.md additions |
| | Project settings |
| | Installed LSP plugins |

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
/opti-gsd:status
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

## LSP Integration (Optional)

opti-gsd auto-detects your project languages and recommends LSP plugins:

| Language | LSP Plugin |
|----------|------------|
| TypeScript/JavaScript | typescript-lsp |
| Python | pyright-lsp |
| Go | gopls-lsp |
| Rust | rust-analyzer-lsp |
| And more... | |

LSP provides:
- Real-time type error detection
- 50ms code navigation (vs 45s text search)
- Automatic missing import detection

Run `/opti-gsd:setup-lsp` anytime to reconfigure.

## Requirements

- Node.js 18+
- Claude Code installed
- GitHub access (for private repo installation)

## For Teams

### Sharing Configuration

Add to `.claude/settings.json` in your project:

```json
{
  "enabledPlugins": {
    "typescript-lsp@claude-plugins-official": true,
    "pyright-lsp@claude-plugins-official": true
  }
}
```

Commit this file so teammates get the same LSP setup.

### New Team Member Onboarding

```bash
git clone <your-repo>
cd <your-repo>
npx github:apittopti/opti-gsd init --local
claude
/opti-gsd:status
```

## License

MIT
