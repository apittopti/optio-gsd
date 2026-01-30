---
name: roadmap
description: Create, view, or modify the project roadmap and its delivery phases. Defines what will be built and in what order. Subcommands: (default) view or create roadmap, add (append phase), insert N (insert at position), remove N (delete phase).
disable-model-invocation: true
argument-hint: [add | insert N | remove N]
---

# roadmap $ARGUMENTS

Create or view the project roadmap, and manage phases (add, insert, remove).

## Usage

- `/opti-gsd:roadmap` — View or create project roadmap
- `/opti-gsd:roadmap add [title]` — Add new phase to end of roadmap
- `/opti-gsd:roadmap insert [N] [title]` — Insert phase at position N
- `/opti-gsd:roadmap remove [N]` — Remove phase N from roadmap

## Routing

Parse `$ARGUMENTS` and route to the appropriate action:

| Arguments | Action | Detail File |
|-----------|--------|-------------|
| (none) | View or Create | See below + [actions/view.md](actions/view.md) or [actions/create.md](actions/create.md) |
| `add [title]` | Add Phase | [actions/add.md](actions/add.md) |
| `insert [N] [title]` | Insert Phase | [actions/insert.md](actions/insert.md) |
| `remove [N]` | Remove Phase | [actions/remove.md](actions/remove.md) |

If arguments don't match any subcommand, show usage help for this skill.

---

## Action: Default — View or Create Roadmap

### Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
opti-gsd Not Initialized
-------------------------------------
No .opti-gsd/ directory found in this project.

> Run /opti-gsd:init to initialize an existing project
> Run /opti-gsd:init new to start a new project
```

If `.opti-gsd/state.json` missing:
```
Project State Missing
-------------------------------------
.opti-gsd/state.json not found.

> Run /opti-gsd:init to reinitialize
```

### Routing

This command has two modes based on whether `.opti-gsd/roadmap.md` exists:

- **roadmap.md exists** -> **View Mode**: Display roadmap with live status. Follow [actions/view.md](actions/view.md) for full procedure.
- **roadmap.md missing** -> **Create Mode**: Create a new roadmap. Follow [actions/create.md](actions/create.md) for full procedure.

#### View Mode Summary

1. Load `.opti-gsd/state.json` and `.opti-gsd/roadmap.md`
2. Display roadmap with phase statuses (COMPLETE / IN PROGRESS / PENDING)
3. Show progress summary and suggested next action

#### Create Mode Summary

1. Load project context (project.md, research, stories, issues, features)
2. Ask about milestones
3. Gather items for milestone from input buckets (stories, issues, features)
4. Define phases using clustering rules (group by dependency, order technically, name by user outcome)
5. Validate coverage — every selected item maps to exactly one phase
6. Define success criteria from story acceptance criteria
7. Write roadmap.md, update item statuses, update state.json
8. Create phase directories and commit

---

## Action: Add Phase

Append a new phase to the end of the roadmap.

**Arguments:** `title` — Phase title (e.g., "Admin Dashboard")

**Quick flow:**
1. Validate milestone is active and roadmap.md exists
2. Find highest phase number, increment by 1
3. Gather phase details (goal, requirements, dependencies) or use defaults
4. Append phase to roadmap.md
5. Update state.json and commit

**Full procedure:** [actions/add.md](actions/add.md)

**Context Budget:** ~3%

---

## Action: Insert Phase

Insert a new phase at a specific position, renumbering subsequent phases.

**Arguments:** `position` — Target phase number; `title` — Phase title

**Quick flow:**
1. Validate position is in range (1 to N+1) and no active/complete phases would be displaced
2. Renumber all phases >= position (increment by 1)
3. Insert new phase at position with PENDING status
4. Rename plan directories (highest to lowest to avoid conflicts)
5. Update state.json and commit

**Full procedure:** [actions/insert.md](actions/insert.md)

**Context Budget:** ~8%

---

## Action: Remove Phase

Remove a pending phase and renumber subsequent phases.

**Arguments:** `phase` — Phase number to remove

**Quick flow:**
1. Validate phase is PENDING (cannot remove IN_PROGRESS or COMPLETE)
2. Show phase details and confirm removal
3. Check for dependencies from other phases
4. Remove phase from roadmap.md
5. Renumber subsequent phases (decrement by 1), rename plan directories
6. Update state.json, update references, commit

**Safety:** Cannot remove active phases, warns about dependencies, requires confirmation, atomic commit.

**Full procedure:** [actions/remove.md](actions/remove.md)

**Context Budget:** ~13%

---

## Context Budget Summary

| Action | Budget |
|--------|--------|
| Default (view) | ~5% |
| Default (create) | ~20% |
| Add Phase | ~3% |
| Insert Phase | ~8% |
| Remove Phase | ~13% |
