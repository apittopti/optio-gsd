---
name: init
description: Initialize opti-gsd workflow in an existing or new project. Sets up directory structure, detects frameworks, and configures branching. Subcommands: (default) brownfield setup, new (greenfield wizard), claude-md (add workflow instructions), migrate (convert legacy formats).
disable-model-invocation: true
argument-hint: [new | claude-md | migrate]
---

# init $ARGUMENTS

Initialize opti-gsd in a project, create a new project with guided setup, configure CLAUDE.md, or migrate from old formats.

## Usage
- `/opti-gsd:init` — Initialize in existing project
- `/opti-gsd:init new` — New project with guided setup
- `/opti-gsd:init claude-md` — Add opti-gsd instructions to CLAUDE.md
- `/opti-gsd:init migrate [type]` — Migrate from old workflow formats

## Routing

Parse `$ARGUMENTS` and route to the appropriate action:

| Arguments | Action | Detail File |
|-----------|--------|-------------|
| (none) or `existing` | Init Existing Project (brownfield) | [actions/brownfield.md](actions/brownfield.md) |
| `new` | New Project (greenfield wizard) | [actions/greenfield.md](actions/greenfield.md) |
| `claude-md` | Setup CLAUDE.md | [actions/claude-md.md](actions/claude-md.md) |
| `migrate [type]` | Migrate legacy formats | [actions/migrate.md](actions/migrate.md) |

If arguments don't match any subcommand, show the Usage section above as help.

## Reference Files

| File | Contents |
|------|----------|
| [reference/framework-detection.md](reference/framework-detection.md) | npm dependency and non-npm project type detection tables |
| [reference/deployment-detection.md](reference/deployment-detection.md) | Deployment platform detection procedures and config file tables |

---

## Action: Init Existing Project (Brownfield)

**Full procedure:** [actions/brownfield.md](actions/brownfield.md)

Initialize opti-gsd in an existing project. High-level flow:

1. **Validate environment** — Confirm git repo, detect base branch
2. **Detect framework** — Read package.json or project files to determine framework and app_type (see [reference/framework-detection.md](reference/framework-detection.md))
3. **Detect deployment** — Check for platform config files and CLI tools (see [reference/deployment-detection.md](reference/deployment-detection.md))
4. **Detect CI/CD toolchain** — Package manager, build/test/lint scripts, default URLs
5. **Detect available tools** — Probe MCP servers and plugins, write `tools.json`
6. **Ask about services** — Database, payments, auth, email, storage
7. **Analyze codebase (optional)** — Offer codebase mapping for projects with existing code
8. **Create directory structure** — `.opti-gsd/` with plans, archive, summaries, codebase, stories, issues, features, debug
9. **Create config.json** — Project settings, git config, CI commands, URLs
10. **Create state.json** — Initial workflow state
11. **Update CLAUDE.md** — Add workflow instructions (uses claude-md procedure)
12. **Commit** — Stage and commit all init files
13. **Report** — Display summary and suggest next steps

**Next steps after init:** `/opti-gsd:roadmap` to plan work.

**Context budget:** ~15%

---

## Action: New Project (Greenfield)

**Full procedure:** [actions/greenfield.md](actions/greenfield.md)

Create a new project with guided setup, research, and roadmap generation.

1. **Check prerequisites** — Ensure `.opti-gsd/` exists (run init first if not)
2. **Deep questioning** — Gather project understanding: goals, scope, tech stack, deployment
3. **Write project.md** — Synthesize answers into structured project definition
4. **Research decision** — Optionally spawn parallel research agents (stack, features, architecture, pitfalls)
5. **Capture initial stories** — Create user stories in `.opti-gsd/stories/` for v1 features
6. **Generate roadmap** — Spawn roadmapper agent to group stories into phases
7. **Present roadmap** — Show proposed phasing, iterate until user approves
8. **Write roadmap.md** — Persist the approved roadmap
9. **Update state.json** — Set milestone, phases, and status
10. **Create phase directories** — Prepare plan directories for each phase
11. **Commit** — Stage and commit all project files
12. **Report** — Display summary with next step: `/opti-gsd:plan 1`

**Context budget:** ~30% (with research subagents)

---

## Action: Setup CLAUDE.md

**Full procedure:** [actions/claude-md.md](actions/claude-md.md)

Add opti-gsd workflow instructions to the project's CLAUDE.md file.

1. **Check current state** — Determine if CLAUDE.md exists and if it already has opti-gsd section
2. **Handle each case:**
   - **No file** — Create full CLAUDE.md with workflow requirements, quick reference table, protected branches, and pre-change checklist
   - **File exists, no section** — Append condensed opti-gsd workflow section with key commands and protected branch rules
   - **Section exists** — Report no changes needed
3. **Commit** — Stage and commit CLAUDE.md
4. **Report** — Confirm instructions added

**Context budget:** ~5%

---

## Action: Migrate

**Full procedure:** [actions/migrate.md](actions/migrate.md)

Migrate from old workflow formats to current structure.

**Arguments:** `type` — `requirements` (default), `all`

1. **Detect what needs migration** — Check for `.opti-gsd/requirements.md`, `.opti-gsd/todos.md`
2. **Migrate requirements to stories** — Parse REQ-ID format, create story files, build mapping, update roadmap references, archive original
3. **Migrate todos to features** — Convert todo items to feature files in `.opti-gsd/features/`
4. **Commit migration** — Stage all changes with descriptive commit message
5. **Report** — Show conversion counts, created files, archived files, and mapping location

**Context budget:** ~5%

---

## Context Budget Summary

| Action | Budget |
|--------|--------|
| Init Existing Project | ~15% |
| New Project | ~30% (with research subagents) |
| Setup CLAUDE.md | ~5% |
| Migrate | ~5% |
