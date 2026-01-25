---
description: Display available opti-gsd commands with descriptions.
---

Display help information. First, read `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json` for version info. If `.opti-gsd/` exists, also read `.opti-gsd/config.json` to show current configuration.

## Arguments

- `advanced` — Show all commands (default shows only essential commands)

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

If `.opti-gsd/` exists, show current configuration:

```
Current Configuration:
──────────────────────────────────────────────────────────────
  Project: [name from config]
  Mode: [interactive|yolo]
  Branching: [per-milestone|per-phase|none]
──────────────────────────────────────────────────────────────
```

If `.opti-gsd/` does not exist:

```
Project: Not initialized
  → Run /opti-gsd:init or /opti-gsd:new-project to get started
```

---

## The Core Loop (5 commands)

**This is all you need to know:**

```
┌──────────────────────────────────────────────────────────────┐
│                    THE opti-gsd WORKFLOW                     │
│                                                              │
│     ┌──────┐     ┌─────────┐     ┌──────┐     ┌─────────┐   │
│  ──►│ PLAN │────►│ EXECUTE │────►│ PUSH │────►│ VERIFY  │   │
│     └──────┘     └─────────┘     └──────┘     └─────────┘   │
│         │                                          │         │
│         └──────────── repeat per phase ◄───────────┘         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

| Step | Command | What it does |
|------|---------|--------------|
| 0 | /opti-gsd:roadmap | Define what you're building (phases) |
| 1 | /opti-gsd:plan-phase | Generate execution plan for current phase |
| 2 | /opti-gsd:execute | Run the plan (TDD, parallel tasks, auto-commit) |
| 3 | /opti-gsd:push | Push to trigger preview deployment |
| 4 | /opti-gsd:verify | Verify everything works |

**That's it.** Run /opti-gsd:status anytime to see where you are and what to do next.

---

## Quick Start

**New Project:**
```
/opti-gsd:new-project     ← Interactive setup wizard
/opti-gsd:roadmap         ← Define your phases
/opti-gsd:plan-phase 1    ← Plan first phase
/opti-gsd:execute         ← Execute (TDD built-in)
/opti-gsd:verify 1        ← Verify it works
```

**Existing Project:**
```
/opti-gsd:init            ← Initialize opti-gsd
/opti-gsd:roadmap         ← Plan your work
```

---

## Helpful Commands (safe to run anytime)

| Command | Description |
|---------|-------------|
| /opti-gsd:status | **Start here** — shows where you are + next action |
| /opti-gsd:add-feature | Capture a feature idea without interrupting work |
| /opti-gsd:add-story | Capture a user request or feature |
| /opti-gsd:debug | Systematic bug investigation |
| /opti-gsd:help advanced | Show all 30+ commands |

---

## Recovery Commands (when things go wrong)

| Command | Description |
|---------|-------------|
| /opti-gsd:rollback | Undo to a previous checkpoint |
| /opti-gsd:recover | Fix interrupted execution state |
| /opti-gsd:plan-fix | Generate fix plan for verification gaps |

---

## Modes

- **interactive** — Confirms before phases, shows plans for approval (default)
- **yolo** — Executes without confirmation, maximum velocity

Switch with /opti-gsd:mode yolo or /opti-gsd:mode interactive

---

## Advanced Commands

**Only shown when running /opti-gsd:help advanced**

### Project Setup
| Command | Description |
|---------|-------------|
| /opti-gsd:init | Initialize opti-gsd in existing project |
| /opti-gsd:new-project | Create new project with guided setup |
| /opti-gsd:map-codebase | Analyze existing codebase structure |
| /opti-gsd:ci [configure] | View or configure CI/CD toolchain |
| /opti-gsd:migrate | Migrate from older opti-gsd version |

### Planning (Advanced)
| Command | Description |
|---------|-------------|
| /opti-gsd:discuss-phase [N] | Capture decisions before planning |
| /opti-gsd:research [topic] | Research best practices before implementing |
| /opti-gsd:add-phase [title] | Add new phase to roadmap |
| /opti-gsd:insert-phase [N] [title] | Insert phase at position N |
| /opti-gsd:remove-phase [N] | Remove pending phase N |

### Execution (Advanced)
| Command | Description |
|---------|-------------|
| /opti-gsd:execute-task [N] | Execute single task N (not whole phase) |

### Milestones
| Command | Description |
|---------|-------------|
| /opti-gsd:start-milestone [name] | Start new milestone branch |
| /opti-gsd:complete-milestone | Complete current milestone, create PR |

### Session & Context
| Command | Description |
|---------|-------------|
| /opti-gsd:pause | Pause work with context save |
| /opti-gsd:resume | Resume from last session |
| /opti-gsd:context | Show context usage and budget |
| /opti-gsd:archive [phase] | Archive completed phase to save context |
| /opti-gsd:compact | Reduce context footprint |

### Tracking
| Command | Description |
|---------|-------------|
| /opti-gsd:features | View captured feature ideas |
| /opti-gsd:stories | View captured user stories |
| /opti-gsd:issues | Track and manage project issues |
| /opti-gsd:decisions | Log and view architectural decisions |

### Configuration
| Command | Description |
|---------|-------------|
| /opti-gsd:mode [interactive\|yolo] | Switch workflow mode |
| /opti-gsd:skills | Discover and configure Claude skills |
| /opti-gsd:mcps | Discover and configure MCP servers |
| /opti-gsd:detect-tools | Detect available MCP servers and plugins |
| /opti-gsd:whats-new | Check for updates and changelog |
| /opti-gsd:statusline-setup | Configure terminal status line |

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
| `opti-gsd Not Initialized` | No `.opti-gsd/` directory | Run /opti-gsd:init or /opti-gsd:new-project |
| `Project State Missing` | `.opti-gsd/state.json` not found | Run /opti-gsd:init to reinitialize |
| `No Roadmap Found` | `.opti-gsd/roadmap.md` not found | Run /opti-gsd:roadmap to create one |
| `No Plan Found` | Phase plan missing | Run /opti-gsd:plan-phase N |
| `Phase Not Executed` | Trying to verify unexecuted phase | Run /opti-gsd:execute first |
