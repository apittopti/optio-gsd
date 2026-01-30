---
name: help
description: Display available opti-gsd skills and usage guide, check for updates, or switch workflow mode. Use when the user asks what commands are available, how to use opti-gsd, or wants to change between interactive and yolo modes.
argument-hint: [advanced | whats-new | mode interactive|yolo]
---

Display help information, check for updates, or switch workflow mode.

Read version from `package.json` in the opti-gsd installation directory (`~/.claude/package.json` for global, `./.claude/package.json` for local). If `.opti-gsd/` exists, also read `.opti-gsd/config.json` to show current configuration.

## Routing

| Argument | Action |
|----------|--------|
| _(none)_ | Show help with the 15-skill reference |
| `advanced` | Show all skills with subcommands |
| `whats-new` | Check for updates and changelog |
| `mode [interactive\|yolo]` | Switch workflow mode |

---

## Output Format

```
╔══════════════════════════════════════════════════════════════╗
║                         opti-gsd                             ║
║          Spec-driven development with fresh context          ║
╠══════════════════════════════════════════════════════════════╣
║  Version: {version}        Author: {author}                  ║
╚══════════════════════════════════════════════════════════════╝
```

**Read version from `package.json` in the installation directory. Author is "apittopti".**

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
  → Run /opti-gsd:init to get started
```

---

## The Core Loop (5 skills)

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
| 1 | /opti-gsd:plan | Generate execution plan for current phase |
| 2 | /opti-gsd:execute | Run the plan (TDD, parallel tasks, auto-commit) |
| 3 | /opti-gsd:push | Push to trigger preview deployment |
| 4 | /opti-gsd:verify | Verify everything works |

**That's it.** Run /opti-gsd:status anytime to see where you are and what to do next.

---

## Quick Start

**New Project:**
```
/opti-gsd:init new        ← Interactive setup wizard
/opti-gsd:roadmap         ← Define your phases
/opti-gsd:plan            ← Plan first phase
/opti-gsd:execute         ← Execute (TDD built-in)
/opti-gsd:verify          ← Verify it works
```

**Existing Project:**
```
/opti-gsd:init            ← Initialize opti-gsd
/opti-gsd:roadmap         ← Plan your work
```

---

## Helpful Commands

| Command | Description |
|---------|-------------|
| /opti-gsd:status | **Start here** — shows where you are + next action |
| /opti-gsd:execute quick [desc] | Fast-track ad-hoc tasks |
| /opti-gsd:track feature [desc] | Capture a feature idea |
| /opti-gsd:track story [desc] | Capture a user request |
| /opti-gsd:debug | Systematic bug investigation |
| /opti-gsd:help | Show this help |

---

## Recovery Commands (when things go wrong)

| Command | Description |
|---------|-------------|
| /opti-gsd:session rollback | Undo to a previous checkpoint |
| /opti-gsd:debug recover | Fix interrupted execution state |
| /opti-gsd:plan fix | Generate fix plan for verification gaps |

---

## Modes

- **interactive** — Confirms before phases, shows plans for approval (default)
- **yolo** — Executes without confirmation, maximum velocity

Switch with /opti-gsd:help mode yolo or /opti-gsd:help mode interactive

---

## All Skills Reference

**Only shown when running /opti-gsd:help advanced**

| Skill | Subcommands | Description |
|-------|-------------|-------------|
| status | — | Current state and next action |
| init | new, claude-md, migrate | Project initialization |
| roadmap | add, insert [N], remove [N] | Manage roadmap and phases |
| plan | [N], fix, discuss [N], research [topic] | Planning and research |
| execute | task [N], quick [desc] | Execute plans and ad-hoc tasks |
| verify | — | Phase verification |
| debug | [issue-id], recover | Bug investigation and recovery |
| milestone | start [name], complete | Milestone lifecycle |
| track | feature, story, issue, decision, list, view, resolve | Track project artifacts |
| session | pause, resume, rollback, archive, context, compact | Session management |
| push | — | Push for deployment |
| tools | detect, configure, usage, ci | Tool and CI/CD management |
| codebase | — | Analyze codebase structure |
| help | advanced, whats-new, mode | Help and configuration |
| config | statusline | Terminal configuration |

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
| `opti-gsd Not Initialized` | No `.opti-gsd/` directory | Run /opti-gsd:init |
| `Project State Missing` | `.opti-gsd/state.json` not found | Run /opti-gsd:init to reinitialize |
| `No Roadmap Found` | `.opti-gsd/roadmap.md` not found | Run /opti-gsd:roadmap to create one |
| `No Plan Found` | Phase plan missing | Run /opti-gsd:plan |
| `Phase Not Executed` | Trying to verify unexecuted phase | Run /opti-gsd:execute first |

---

## Subcommand: whats-new

Check for updates and show recent changes to opti-gsd.

### Step 1: Show Current Version

Read from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`:

```markdown
## opti-gsd Status

**Installed Version:** 0.1.0
**Plugin Location:** {path}
```

### Step 2: Check for Updates

If network available, check for newer version:
- Check npm registry (if published)
- Check GitHub releases
- Compare semantic versions

```markdown
## Update Available

**Current:** 0.1.0
**Latest:** 0.2.0

### What's New in 0.2.0

- Added /opti-gsd:execute quick command for ad-hoc tasks
- Improved context efficiency in execute phase
- Fixed bug in phase renumbering
- New `opti-gsd-integration-checker` agent

### Upgrade

```bash
# If installed via npm
npm update opti-gsd -g

# If installed via git
cd {plugin_path} && git pull
```
```

If no update:
```markdown
## You're Up to Date

**Version:** 0.1.0 (latest)

No updates available.
```

### Step 3: Show Changelog

Display recent changes:

```markdown
## Recent Changes

### Version 0.1.0 (Current)
- Initial release
- 15 consolidated skills covering the full workflow
- 11 specialized agents
- XML task format for better parsing
- Context-efficient execution

### Coming Soon
- Stack-specific guides
- MCP integrations
- Team collaboration features
```

### Step 4: Show Tips

```markdown
## Tips

### New in This Version
- Use /opti-gsd:help mode yolo for faster execution
- Try /opti-gsd:session context to monitor token usage
- /opti-gsd:session compact saves ~70% context on large projects

### Did You Know?
- Phases can run in parallel waves
- Each task gets fresh context (no pollution)
- Archive completed phases to save tokens

### Get Help
- All commands: /opti-gsd:help
- Report issues: {github_url}
```

### Offline Behavior

If no network:
```markdown
## opti-gsd v0.1.0

**Status:** Offline - cannot check for updates

### Local Changelog
{Show from local changelog.md if exists}

Check manually: {github_url}/releases
```

---

## Subcommand: mode [interactive|yolo]

Switch workflow execution mode.

### Arguments

- `interactive` — Confirm before phases, show plans, pause at checkpoints
- `yolo` — Execute without confirmation, maximum velocity

### Behavior

#### Step 1: Validate Argument

If no argument:
```markdown
## Current Mode: {current_mode}

**interactive:** Confirm before phases, show plans for approval, pause at checkpoints.
Best for: Learning the system, complex projects, careful work.

**yolo:** Execute without confirmation, only stop on errors/checkpoints.
Best for: Familiar patterns, rapid iteration, trusted workflows.

To switch: /opti-gsd:help mode interactive or /opti-gsd:help mode yolo
```

#### Step 2: Update Config

Edit `.opti-gsd/config.json`:

```json
{
  "mode": "{new_mode}"
}
```

#### Step 3: Commit

```bash
git add .opti-gsd/config.json
git commit -m "chore: switch to {mode} mode"
```

#### Step 4: Confirm

```markdown
## Mode Changed

**Previous:** {old_mode}
**Current:** {new_mode}

{If yolo}
⚡ YOLO mode active. Commands will execute without confirmation.
   Use Ctrl+C to interrupt if needed.

{If interactive}
🎯 Interactive mode active. You'll be asked to confirm before each phase.
```

### Mode Behaviors

#### Interactive Mode

| Action | Behavior |
|--------|----------|
| Phase start | Confirm before beginning |
| Plan display | Show plan and ask for approval |
| Wave transition | Confirm before each wave |
| Checkpoint | Always pause and ask |
| Completion | Show summary and next steps |

#### YOLO Mode

| Action | Behavior |
|--------|----------|
| Phase start | Begin immediately |
| Plan display | Brief summary only |
| Wave transition | Continue automatically |
| Checkpoint | Still pause (safety) |
| Completion | Brief confirmation |

---

## Context Budget

Minimal: ~2%
