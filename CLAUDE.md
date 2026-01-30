# Claude Code Instructions for opti-gsd

This is the opti-gsd source repository. You are using opti-gsd to develop opti-gsd (bootstrapping).

## Bootstrapping Model

**Two versions exist:**

1. **Installed version** — The stable version providing `/opti-gsd:*` skills (in `~/.claude/` or user settings)
2. **Source version** — This repository you are modifying

**Key rules:**
- The installed version guides your workflow (skills, agents)
- The source version is what you're changing
- After completing a milestone, the user should reinstall: `npx github:apittopti/opti-gsd init`
- Never modify installed files directly — only modify source, then reinstall

## Workflow Requirements

**Before making any changes to this codebase:**

1. Run /opti-gsd:status to understand current project state
2. Use /opti-gsd:roadmap to view or create the project roadmap
3. For new features or significant changes, use /opti-gsd:plan to create an executable plan
4. Execute changes using /opti-gsd:execute for wave-based parallel execution with fresh context

## Skills (15 Total)

opti-gsd uses 15 consolidated skills, each with subcommands. Skills marked with * support auto-invocation by Claude.

### Core Workflow

| Skill | Subcommands | Use For |
|-------|-------------|---------|
| /opti-gsd:status * | — | Check current state and next suggested action |
| /opti-gsd:roadmap | add, insert [N], remove [N] | View/create/modify project roadmap and phases |
| /opti-gsd:plan | [N], fix, discuss [N], research [topic] | Plan phases, fix gaps, discuss decisions, research |
| /opti-gsd:execute | task [N], quick [desc] | Execute phase plans, single tasks, or ad-hoc tasks |
| /opti-gsd:verify | — | Verify phase completion |
| /opti-gsd:push | — | Push branch for preview deployment |

### Project Management

| Skill | Subcommands | Use For |
|-------|-------------|---------|
| /opti-gsd:init | new, claude-md, migrate | Initialize existing/new projects, setup, migration |
| /opti-gsd:milestone | start [name], complete | Start or complete milestones |
| /opti-gsd:track * | feature, story, issue, decision, list, view, resolve | Capture and manage project artifacts |
| /opti-gsd:debug * | [issue-id], recover | Bug investigation and recovery |

### Session & Configuration

| Skill | Subcommands | Use For |
|-------|-------------|---------|
| /opti-gsd:session | pause, resume, rollback, archive, context, compact | Session lifecycle and context management |
| /opti-gsd:tools | detect, configure, usage, ci | Tool discovery and CI/CD configuration |
| /opti-gsd:codebase | --debt, --refresh | Analyze codebase structure |
| /opti-gsd:help * | advanced, whats-new, mode | Help, updates, and mode switching |
| /opti-gsd:config | statusline | Terminal configuration |

## Available Agents

Use these specialized agents for complex tasks:

- **opti-gsd-codebase-mapper** - Analyzes existing codebases with focus modes
- **opti-gsd-debugger** - Systematic bug investigation
- **opti-gsd-executor** - Autonomous plan execution with atomic commits
- **opti-gsd-integration-checker** - Verifies component integration
- **opti-gsd-phase-researcher** - Investigates technical domains before planning
- **opti-gsd-plan-checker** - Validates plans before execution
- **opti-gsd-planner** - Creates executable phase plans
- **opti-gsd-project-researcher** - Investigates domain ecosystems
- **opti-gsd-research-synthesizer** - Consolidates parallel research outputs
- **opti-gsd-roadmapper** - Transforms requirements into delivery plans
- **opti-gsd-verifier** - Goal-backward verification of phase completion

## Naming Conventions (v2.0.0)

**File Naming:**
- Use **lowercase** for all markdown files: `stack.md`, `roadmap.md`, `verification.md`
- Use **JSON** for structured data: `config.json`, `state.json`, `plan.json`, `tools.json`
- Exception: Standard files like `README.md`, `CLAUDE.md` remain uppercase

**Directory Structure:**
- `skills/opti-gsd/` - Skills (15 consolidated, each with SKILL.md + detail files)
  - Each skill uses **progressive disclosure**: SKILL.md (<400 lines) contains routing and overview; `actions/` and `reference/` subdirectories contain full procedures loaded on-demand
  - YAML frontmatter includes `argument-hint` for autocomplete suggestions
- `agents/opti-gsd/` - Specialized agents
- `scripts/` - Utility scripts (statusline, tool analysis)
- `.opti-gsd/` - Main workflow directory
  - `stories/` - User stories (US{NNN}.md)
  - `issues/` - Bug tracking (ISS{NNN}.md)
  - `features/` - Feature ideas (F{NNN}.md)
  - `codebase/` - Codebase analysis files
  - `plans/` - Phase execution plans
  - `quick/` - Quick task artifacts ({NNN}-{slug}/)
  - `debug/` - Debug session files

## Ad-hoc Changes

For small ad-hoc changes, use /opti-gsd:execute quick for fast execution with GSD guarantees (atomic commits, state tracking) while skipping optional agents.

For other cases:

1. Consider if it should be captured (/opti-gsd:track feature or /opti-gsd:track story)
2. For bug fixes, use /opti-gsd:debug for systematic investigation
3. After changes, consider running /opti-gsd:verify to ensure nothing broke

## Version Management

**IMPORTANT: When completing a milestone (/opti-gsd:milestone complete):**

Update `package.json` version field to match the milestone (e.g., `"2.1.0"` for milestone `v2.1.0`).
