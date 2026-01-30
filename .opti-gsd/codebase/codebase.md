# Opti-GSD Codebase Analysis

**Generated:** 2026-01-25
**Version:** 2.0.0
**Repository:** https://github.com/apittopti/opti-gsd

## Overview

Opti-GSD is a CLI tool that provides spec-driven development workflow automation for Claude Code. It is a meta-prompting and context engineering system that makes Claude Code reliable for complex projects by using fresh context subagents, atomic commits, and goal-backward verification.

The tool is self-hosted (used to build itself) and is installed via `npx opti-gsd`.

---

## Technology Stack

### Core Technology
- **Platform:** Claude Code CLI Extension
- **Runtime:** Node.js 18+
- **Package Manager:** npm
- **Version Control:** Git with conventional commits

### Tool Structure
- **Commands:** Markdown files with YAML frontmatter
- **Agents:** Specialized markdown prompts with tool declarations
- **State:** JSON files (config.json, state.json, tools.json)
- **Plans:** JSON task definitions (plan.json)
- **Documentation:** Markdown files

### External Integrations
| Integration | Purpose | Configuration |
|-------------|---------|---------------|
| MCP Servers | Dynamic tool discovery (cclsp, GitHub, Chrome, etc.) | .opti-gsd/tools.json |
| Git | Version control, branches, commits | Conventional commit format |
| GitHub CLI | PR creation, milestone completion | Via gh command |

---

## Directory Structure

    opti-gsd/
    ├── .claude/                    # Claude Code local settings
    │   └── settings.local.json
    ├── .claude-plugin/             # Claude Code extension manifest
    │   ├── plugin.json            # Extension metadata (name, version)
    │   └── marketplace.json       # Marketplace registry entry
    ├── .opti-gsd/                  # Project workflow state (when self-hosting)
    │   ├── codebase/              # Codebase analysis files
    │   └── features.md            # Feature backlog
    ├── agents/opti-gsd/            # Specialized AI agents (11 agents)
    │   ├── opti-gsd-codebase-mapper.md
    │   ├── opti-gsd-debugger.md
    │   ├── opti-gsd-executor.md
    │   ├── opti-gsd-integration-checker.md
    │   ├── opti-gsd-phase-researcher.md
    │   ├── opti-gsd-plan-checker.md
    │   ├── opti-gsd-planner.md
    │   ├── opti-gsd-project-researcher.md
    │   ├── opti-gsd-research-synthesizer.md
    │   ├── opti-gsd-roadmapper.md
    │   └── opti-gsd-verifier.md
    ├── bin/                        # CLI entry point
    │   └── cli.js                 # Install/uninstall CLI (380 lines)
    ├── skills/opti-gsd/             # Skills (15 consolidated)
    │   ├── status/SKILL.md        # Current state and next action
    │   ├── init/SKILL.md          # Project initialization (+ new, claude-md, migrate)
    │   ├── roadmap/SKILL.md       # Roadmap management (+ add, insert, remove)
    │   ├── plan/SKILL.md          # Planning (+ fix, discuss, research)
    │   ├── execute/SKILL.md       # Execution (+ task, quick)
    │   ├── verify/SKILL.md        # Phase verification
    │   ├── debug/SKILL.md         # Bug investigation (+ recover)
    │   ├── milestone/SKILL.md     # Milestone lifecycle (start, complete)
    │   ├── track/SKILL.md         # Artifact tracking (feature, story, issue, decision)
    │   ├── session/SKILL.md       # Session management (pause, resume, rollback, etc.)
    │   ├── push/SKILL.md          # Push for deployment
    │   ├── tools/SKILL.md         # Tool and CI/CD management
    │   ├── codebase/SKILL.md      # Codebase analysis
    │   ├── help/SKILL.md          # Help, whats-new, mode
    │   └── config/SKILL.md        # Terminal configuration
    ├── docs/                       # Documentation
    │   ├── ERROR-HANDLING.md      # Standardized error patterns
    │   └── WORKFLOW-FLOWCHART.md  # Visual workflow documentation
    ├── hooks/                      # Claude Code hooks
    │   └── hooks.json             # Hook configuration (currently empty)
    ├── scripts/                    # Utility scripts
    │   └── gsd-statusline.js      # Terminal statusline generator
    ├── CLAUDE.md                   # Plugin instructions for Claude
    ├── README.md                   # Installation and usage guide
    └── package.json               # Node.js package manifest

---

## Key Files and Purposes

### Configuration Files

| File | Purpose |
|------|---------|
| .claude-plugin/plugin.json | Plugin identity: name, version, author |
| .claude-plugin/marketplace.json | Marketplace entry for plugin discovery |
| package.json | Node.js metadata, bin entry for CLI |
| CLAUDE.md | Instructions Claude reads on every session |

### State Files (Created by Plugin)

| File | Purpose |
|------|---------|
| .opti-gsd/config.json | Project configuration (mode, branching, CI, MCPs) |
| .opti-gsd/state.json | Current workflow state (milestone, phase, task) |
| .opti-gsd/tools.json | Detected MCP servers and plugin capabilities |
| .opti-gsd/roadmap.md | Project roadmap with phases and success criteria |

### Core Skills (15 Consolidated)

| Skill | File | Purpose |
|-------|------|---------|
| /opti-gsd:status | skills/opti-gsd/status/SKILL.md | Current state and next action |
| /opti-gsd:roadmap | skills/opti-gsd/roadmap/SKILL.md | Roadmap and phase management |
| /opti-gsd:plan | skills/opti-gsd/plan/SKILL.md | Planning, discussion, research |
| /opti-gsd:execute | skills/opti-gsd/execute/SKILL.md | Execution (phase, task, quick) |
| /opti-gsd:verify | skills/opti-gsd/verify/SKILL.md | Phase verification |
| /opti-gsd:push | skills/opti-gsd/push/SKILL.md | Push for deployment |
| /opti-gsd:init | skills/opti-gsd/init/SKILL.md | Project initialization |
| /opti-gsd:milestone | skills/opti-gsd/milestone/SKILL.md | Milestone lifecycle |
| /opti-gsd:track | skills/opti-gsd/track/SKILL.md | Artifact tracking |
| /opti-gsd:debug | skills/opti-gsd/debug/SKILL.md | Bug investigation and recovery |
| /opti-gsd:session | skills/opti-gsd/session/SKILL.md | Session management |
| /opti-gsd:tools | skills/opti-gsd/tools/SKILL.md | Tool and CI/CD management |
| /opti-gsd:codebase | skills/opti-gsd/codebase/SKILL.md | Codebase analysis |
| /opti-gsd:help | skills/opti-gsd/help/SKILL.md | Help and configuration |
| /opti-gsd:config | skills/opti-gsd/config/SKILL.md | Terminal configuration |

### Core Agents (5 Primary)

| Agent | File | Purpose |
|-------|------|---------|
| opti-gsd-planner | agents/opti-gsd/opti-gsd-planner.md | Creates executable phase plans |
| opti-gsd-executor | agents/opti-gsd/opti-gsd-executor.md | Executes tasks with TDD |
| opti-gsd-verifier | agents/opti-gsd/opti-gsd-verifier.md | Goal-backward verification |
| opti-gsd-debugger | agents/opti-gsd/opti-gsd-debugger.md | Scientific bug investigation |
| opti-gsd-roadmapper | agents/opti-gsd/opti-gsd-roadmapper.md | Requirements to phases |

---

## Architecture Patterns

### 1. Command-Agent Separation

Commands are lightweight orchestrators that delegate heavy work to specialized agents.
The command validates state, spawns the agent, and handles the result.
The agent gets fresh 200k context, executes the specialized task, and returns a structured result.

### 2. State Machine Workflow

The workflow follows a state machine pattern:
INITIALIZED -> ROADMAP -> PLAN -> EXECUTE -> PUSH -> VERIFY (repeat per phase)

State is persisted in .opti-gsd/state.json allowing:
- Session recovery after interruption
- Context survival across compacts
- Progress tracking

### 3. Fresh Context Subagents

Each task executes in a fresh subagent with 100% context using the Task tool with run_in_background=true.

Benefits:
- No context pollution between tasks
- Parallel execution via waves
- Recoverable background tasks

### 4. Goal-Backward Verification

Verification works backwards from goals, not forwards from tasks:
1. State goal as OBSERVABLE outcome
2. Identify required TRUTHS (user-perspective)
3. Determine required ARTIFACTS (files)
4. Map critical CONNECTIONS (wiring)

### 5. Three-Level Artifact Verification

Every artifact is verified at three levels:
| Level | Check | Failure Example |
|-------|-------|-----------------|
| L1: Exists | File exists? | Missing: {path} |
| L2: Substantive | Real code, not stub? | Stub only: {path} |
| L3: Wired | Imported and used? | Orphaned: {path} |

### 6. TDD Enforcement

Tasks with test_required: true execute Red-Green-Refactor:
- RED PHASE: test files WRITE, impl LOCKED - Write failing test
- GREEN PHASE: test files LOCKED, impl WRITE - Make test pass
- REFACTOR PHASE: test files LOCKED, impl WRITE - Clean up while green

File locking prevents gaming the tests.

---

## Data Flow

### 1. Initialization Flow (/opti-gsd:init)
- Detect framework (package.json, Cargo.toml, etc.)
- Detect deployment platform (vercel.json, fly.toml, etc.)
- Detect CI toolchain (scripts in package.json)
- Run /opti-gsd:tools detect (MCP servers, plugins)
- Create .opti-gsd/config.json, state.json, tools.json

### 2. Execution Flow (/opti-gsd:execute)
- Load state.json, plan.json
- FOR each wave: spawn tasks in parallel with Task(opti-gsd-executor, background=true)
- Poll TaskOutput until complete
- Handle results: COMPLETE -> git commit, FAILED -> retry or pause, CHECKPOINT -> pause
- Phase complete -> offer /push or /verify

### 3. Verification Flow (/opti-gsd:verify)
- Task(opti-gsd-verifier)
- Run CI checks (lint, typecheck, test, build)
- Derive must-haves from phase goals
- Check artifacts (L1, L2, L3)
- Trace key links
- Run E2E if configured
- Result: PASSED -> next phase, GAPS -> /plan fix required

---

## Naming Conventions (v2.0.0)

### File Naming
| Type | Convention | Example |
|------|------------|---------|
| Commands | lowercase with hyphens | plan-phase.md, add-feature.md |
| Agents | prefixed with opti-gsd- | opti-gsd-executor.md |
| State files | lowercase JSON | config.json, state.json |
| Plans | JSON format | plan.json |
| Documentation | lowercase | roadmap.md, verification.md |
| Standard files | UPPERCASE | CLAUDE.md, README.md |

### Directory Naming
| Directory | Contents |
|-----------|----------|
| .opti-gsd/stories/ | User stories (US{NNN}.md) |
| .opti-gsd/issues/ | Bug tracking (ISS{NNN}.md) |
| .opti-gsd/features/ | Feature ideas (F{NNN}.md) |
| .opti-gsd/codebase/ | Codebase analysis files |
| .opti-gsd/plans/ | Phase execution plans |
| .opti-gsd/debug/ | Debug session files |

### Commit Convention
Format: {type}({phase}-{task}): {description}
Types: feat, fix, test, refactor, docs, chore, style

---

## Command Structure

Commands use YAML frontmatter for metadata:
- description: Brief description shown in help
- Followed by markdown with behavior, steps, output format

### Agent Structure

Agents declare their tools in YAML frontmatter:
- name: agent name
- description: what agent does
- tools: Read, Write, Edit, Bash, Glob, Grep, Browser (conditional), mcp__* (MCP tools)

### Context Budget Pattern

Commands specify their context usage as a percentage budget.

---

## Integration Points

### MCP Tool Discovery

The /opti-gsd:tools detect command probes for MCP servers:
- cclsp: Code intelligence
- GitHub: GitHub operations (PRs, issues)
- Browser/Chrome: Browser automation
- Memory/Graph: Knowledge graph
- Context7: Library documentation

Results are written to .opti-gsd/tools.json and agents read this to dynamically use available capabilities.

### Git Integration
- Branching: Per-milestone branches (gsd/v1.0)
- Commits: Conventional commits with co-author
- Tags: Checkpoint tags (gsd/checkpoint/phase-{N}/pre, post, T{N})
- PRs: Created via gh pr create

### CLI Installation
The bin/cli.js provides:
- npx github:apittopti/opti-gsd init - Install globally or locally
- npx github:apittopti/opti-gsd uninstall - Remove installation
- Interactive prompts for install location
- Version banner display

---

## Technical Debt and Concerns

### Areas for Improvement

1. **Hooks Unused**
   - hooks/hooks.json is empty {}
   - PostToolUse hook could enable tool usage logging (see F001 in features.md)

2. **Version Mismatch**
   - package.json shows version 1.0.0
   - .claude-plugin/plugin.json shows 2.0.0
   - These should be synchronized

3. **Statusline Script Outdated**
   - scripts/gsd-statusline.js references .gsd/ instead of .opti-gsd/
   - Uses old STATE.md instead of state.json

4. **No Skills Directory**
   - bin/cli.js copies skills/opti-gsd/ but directory does not exist
   - Skills are mentioned in config but not implemented

5. **Documentation Gaps**
   - Some commands referenced in help.md do not have dedicated command files
   - /opti-gsd:skills and /opti-gsd:mcps listed but may be consolidated into /opti-gsd:tools

### Consistency Issues
| Issue | Location | Impact |
|-------|----------|--------|
| Old .gsd/ references | statusline script | Script will not work |
| Missing skills dir | Plugin structure | Copy fails silently |
| Version mismatch | package.json vs plugin.json | Confusion |

---

## Testing Patterns

### TDD Built Into Workflow

The planner auto-detects test requirements based on:
1. File path patterns (src/**/*.ts -> test_required: true)
2. Action keywords (implement, fix bug -> true; refactor -> existing)
3. Project overrides (config.testing.always_test[], never_test[])

### Verification CI Pipeline
CI execution order (fail-fast):
1. {ci.lint} - Quick syntax/style check
2. {ci.typecheck} - Type safety
3. {ci.test} - Unit/integration tests
4. {ci.build} - Compilation
5. {ci.e2e} - End-to-end (optional)

---

## Key Insights for Feature Development

### Adding New Skills or Subcommands

**Adding a subcommand to an existing skill:**
1. Edit `skills/opti-gsd/{skill-name}/SKILL.md`
2. Add new routing entry and full documentation section
3. Update help skill's advanced reference table

**Adding a new top-level skill (rare — prefer subcommands):**
1. Create `skills/opti-gsd/{skill-name}/SKILL.md`
2. Add YAML frontmatter with name, description, and `disable-model-invocation: true` (unless safe for auto-invoke)
3. Document behavior with step-by-step instructions
4. Follow error handling patterns from docs/ERROR-HANDLING.md
5. Specify context budget
6. Update help skill with new skill reference

### Adding New Agents

1. Create agents/opti-gsd/opti-gsd-{name}.md
2. Declare tools in YAML frontmatter
3. Document startup sequence (check tools.json)
4. Specify output formats
5. Define checkpoint/resume protocol if long-running

### Adding Tool Usage Logging (F001)

Based on the feature request in .opti-gsd/features.md:

1. Enable hooks in hooks/hooks.json with PostToolUse handler
2. Create logging script that writes to .opti-gsd/tool-usage.json
3. Inject task context so logs attribute calls to specific tasks
4. Add /opti-gsd:tools usage command to summarize patterns
5. Update executor agent to correlate tool calls with task completion

---

## Summary

Opti-GSD is a sophisticated Claude Code workflow tool implementing:

- **Fresh context execution** via Task tool subagents
- **Goal-backward verification** that tests outcomes, not tasks
- **TDD enforcement** with file locking
- **Dynamic tool discovery** via MCP probing
- **State persistence** for session recovery
- **Standardized patterns** for errors, commits, and documentation

The codebase is well-structured but has minor technical debt (version sync, outdated scripts, missing skills directory) that should be addressed.

For implementing new features like tool usage logging, the hooks system provides the extension point, and the existing patterns for commands and agents provide clear templates to follow.

---

## File References

Key files for understanding the tool:

- **Extension manifest:** C:/Optimotive-dev/opti-gsd/.claude-plugin/plugin.json
- **CLI installer:** C:/Optimotive-dev/opti-gsd/bin/cli.js
- **Main workflow:** skills/opti-gsd/execute/SKILL.md
- **Tool discovery:** skills/opti-gsd/tools/SKILL.md
- **Error patterns:** C:/Optimotive-dev/opti-gsd/docs/ERROR-HANDLING.md
- **Workflow diagram:** C:/Optimotive-dev/opti-gsd/docs/WORKFLOW-FLOWCHART.md
- **Feature backlog:** C:/Optimotive-dev/opti-gsd/.opti-gsd/features.md
