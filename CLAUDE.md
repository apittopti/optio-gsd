# Claude Code Instructions for opti-gsd

This is the opti-gsd source repository. You are using opti-gsd to develop opti-gsd (bootstrapping).

## Bootstrapping Model

**Two versions exist:**

1. **Installed version** — The stable version providing `/opti-gsd:*` commands (in `~/.claude/` or user settings)
2. **Source version** — This repository you are modifying

**Key rules:**
- The installed version guides your workflow (commands, agents, skills)
- The source version is what you're changing
- After completing a milestone, the user should reinstall: `npx github:apittopti/opti-gsd init`
- Never modify installed files directly — only modify source, then reinstall

## Workflow Requirements

**Before making any changes to this codebase:**

1. Run /opti-gsd:status to understand current project state
2. Use /opti-gsd:roadmap to view or create the project roadmap
3. For new features or significant changes, use /opti-gsd:plan-phase to create an executable plan
4. Execute changes using /opti-gsd:execute for wave-based parallel execution with fresh context

## Key Commands

| Command | Use For |
|---------|---------|
| /opti-gsd:status | Check current state and next suggested action |
| /opti-gsd:roadmap | View/create project roadmap |
| /opti-gsd:plan-phase | Generate executable plan for a phase |
| /opti-gsd:execute | Execute current phase plan |
| /opti-gsd:quick | Fast-track ad-hoc tasks (skips research/checker/verifier) |
| /opti-gsd:verify | Verify phase completion |
| /opti-gsd:add-feature | Capture features without interrupting work |
| /opti-gsd:add-story | Capture user/client requests |
| /opti-gsd:debug | Start systematic debugging session |
| /opti-gsd:research | Research best practices for a topic |
| /opti-gsd:map-codebase | Analyze codebase with focus modes |
| /opti-gsd:ci | Configure CI/CD and deployment |
| /opti-gsd:push | Push branch for preview deployment |
| /opti-gsd:stories | Manage user stories |
| /opti-gsd:issues | Manage issues/bugs |
| /opti-gsd:features | Manage feature ideas |

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
- `.opti-gsd/` - Main workflow directory
  - `stories/` - User stories (US{NNN}.md)
  - `issues/` - Bug tracking (ISS{NNN}.md)
  - `features/` - Feature ideas (F{NNN}.md)
  - `codebase/` - Codebase analysis files
  - `plans/` - Phase execution plans
  - `quick/` - Quick task artifacts ({NNN}-{slug}/)
  - `debug/` - Debug session files

## Ad-hoc Changes

For small ad-hoc changes, use /opti-gsd:quick for fast execution with GSD guarantees (atomic commits, state tracking) while skipping optional agents.

For other cases:

1. Consider if it should be captured as a feature (/opti-gsd:add-feature) or story (/opti-gsd:add-story)
2. For bug fixes, use /opti-gsd:debug for systematic investigation
3. After changes, consider running /opti-gsd:verify to ensure nothing broke

## Version Management

**IMPORTANT: When completing a milestone (/opti-gsd:complete-milestone):**

Update `package.json` version field to match the milestone (e.g., `"2.1.0"` for milestone `v2.1.0`).
