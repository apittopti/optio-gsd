---
description: Display all available opti-gsd commands with descriptions.
---

Display the following help information to the user. First, read `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` for version info. If `.gsd/` exists in the current working directory, also read `.gsd/config.md` to show current configuration.

## Output Format

```
╔══════════════════════════════════════════════════════════════╗
║                         opti-gsd                             ║
║          Spec-driven development with fresh context          ║
╠══════════════════════════════════════════════════════════════╣
║  Version: {version}        Author: {author}                  ║
╚══════════════════════════════════════════════════════════════╝
```

**Read version and author from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` and substitute into the header above.**

If `.gsd/` exists, show current configuration:

```
Current Configuration:
──────────────────────────────────────────────────────────────
  Project: [name from config]
  Mode: [interactive|yolo]
  Branching: [per-milestone|per-phase|none]
  Context Budget: [tokens]k per agent
──────────────────────────────────────────────────────────────
```

If `.gsd/` does not exist:

```
Project: Not initialized
  → Run /opti-gsd:init or /opti-gsd:new-project to get started
```

---

## Commands

### Project Setup
| Command | Description |
|---------|-------------|
| `/opti-gsd:init` | Initialize opti-gsd in an existing project |
| `/opti-gsd:new-project` | Create a new project with guided setup |
| `/opti-gsd:map-codebase` | Analyze existing codebase structure |
| `/opti-gsd:ci [configure]` | View or configure CI/CD toolchain |

### Planning
| Command | Description |
|---------|-------------|
| `/opti-gsd:roadmap` | Create or view project roadmap |
| `/opti-gsd:discuss-phase [N]` | Capture decisions before planning |
| `/opti-gsd:plan-phase [N]` | Generate execution plan for phase N |
| `/opti-gsd:add-phase [title]` | Add a new phase to roadmap |
| `/opti-gsd:insert-phase [N] [title]` | Insert phase at position N |
| `/opti-gsd:remove-phase [N]` | Remove pending phase N |

### Execution
| Command | Description |
|---------|-------------|
| `/opti-gsd:execute` | Execute current phase plan |
| `/opti-gsd:execute-task [N]` | Execute single task N from current phase |
| `/opti-gsd:push` | Push branch to trigger preview deployment |
| `/opti-gsd:verify [phase]` | Verify phase completion (uses preview URL if pushed) |
| `/opti-gsd:debug [issue-id]` | Start or resume debugging session |

### Milestones
| Command | Description |
|---------|-------------|
| `/opti-gsd:start-milestone [name]` | Start new milestone branch |
| `/opti-gsd:complete-milestone` | Complete current milestone |

### Session Management
| Command | Description |
|---------|-------------|
| `/opti-gsd:status` | Show current state and next action |
| `/opti-gsd:resume` | Resume from last session |
| `/opti-gsd:pause` | Pause work with context save |

### Context Management
| Command | Description |
|---------|-------------|
| `/opti-gsd:context` | Show context usage and budget status |
| `/opti-gsd:archive [phase]` | Archive completed phase to save context |
| `/opti-gsd:compact` | Reduce context footprint of project files |

### Todos & Notes
| Command | Description |
|---------|-------------|
| `/opti-gsd:add-todo [desc]` | Capture idea or task for later |
| `/opti-gsd:todos` | List and manage pending todos |
| `/opti-gsd:decisions` | Log and view architectural decisions |
| `/opti-gsd:issues` | Track and manage project issues |

### Utilities
| Command | Description |
|---------|-------------|
| `/opti-gsd:skills` | Discover and configure Claude skills |
| `/opti-gsd:mcps` | Discover and configure MCP servers |
| `/opti-gsd:mode [interactive\|yolo]` | Switch workflow mode (see below) |
| `/opti-gsd:whats-new` | Check for updates and changelog |
| `/opti-gsd:research [topic]` | Research a topic using Context7 |

**Modes:**
- `interactive` — Confirms before phases, shows plans for approval, pauses at checkpoints
- `yolo` — Executes without confirmation, maximum velocity (still pauses on errors)

---

## Quick Start

**New Project:**
```
1. /opti-gsd:new-project     # Set up project
2. /opti-gsd:roadmap         # Define phases
3. /opti-gsd:plan-phase 1    # Plan first phase
4. /opti-gsd:execute         # Execute the plan
5. /opti-gsd:verify 1        # Verify completion
```

**Existing Project:**
```
1. /opti-gsd:map-codebase    # Understand structure
2. /opti-gsd:init            # Initialize opti-gsd
3. /opti-gsd:roadmap         # Plan your work
```

---

## Safe Commands (run anytime)

These commands are read-only or non-destructive:
- `/opti-gsd:status` - View current state
- `/opti-gsd:context` - Check context usage
- `/opti-gsd:ci` - View CI/CD configuration
- `/opti-gsd:help` - This help screen
- `/opti-gsd:add-todo` - Capture ideas
- `/opti-gsd:todos` - View todos
- `/opti-gsd:decisions` - View/add decisions
- `/opti-gsd:issues` - View/add issues
- `/opti-gsd:whats-new` - Check updates

---

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│  INIT → ROADMAP → [RESEARCH] → PLAN → EXECUTE → PUSH →     │
│    ↓                                              ↓         │
│  Setup project    Repeat for each phase      VERIFY →      │
│                                                  ↓          │
│                                              RELEASE        │
└─────────────────────────────────────────────────────────────┘

Recommended flow per phase:
  execute → push → (preview deploys) → verify
```

For detailed status and next actions, run `/opti-gsd:status`

---

## Error Messages

opti-gsd uses standardized error messages with next-step suggestions:

```
⚠️ {Error Title}
─────────────────────────────────────
{Brief explanation}

→ {Suggested action}
```

**Common errors:**

| Error | Meaning | Solution |
|-------|---------|----------|
| `opti-gsd Not Initialized` | No `.gsd/` directory | Run `/opti-gsd:init` or `/opti-gsd:new-project` |
| `Project State Missing` | `.gsd/STATE.md` not found | Run `/opti-gsd:init` to reinitialize |
| `No Roadmap Found` | `.gsd/ROADMAP.md` not found | Run `/opti-gsd:roadmap` to create one |
| `No Plan Found` | Phase plan missing | Run `/opti-gsd:plan-phase N` |
| `Phase Not Executed` | Trying to verify unexecuted phase | Run `/opti-gsd:execute` first |

See `docs/ERROR-HANDLING.md` for the complete error reference
