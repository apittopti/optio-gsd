---
description: Execute small ad-hoc tasks with opti-gsd guarantees while skipping optional agents.
---

# quick [description]

Execute small, ad-hoc tasks with opti-gsd guarantees (atomic commits, state tracking) while skipping optional agents (research, plan-checker, verifier).

Quick tasks are stored in `.opti-gsd/quick/` separate from planned phases.

## Arguments

- `description` — Brief description of the task (optional, will prompt if missing)

## When to Use

- Bug fixes
- Small features
- Config changes
- One-off tasks
- Anything that doesn't warrant full phase planning

## Behavior

### Step 0: Pre-flight Validation

Check for required files:

If `.opti-gsd/` doesn't exist:
```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .opti-gsd/ directory found.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:new-project to start a new project
```

If `.opti-gsd/roadmap.md` doesn't exist:
```
⚠️ No Roadmap Found
─────────────────────────────────────
Quick mode requires an active project with roadmap.md.

→ Run /opti-gsd:roadmap to create one
```

Quick tasks CAN run mid-phase. Only validate that the project is initialized and has a roadmap.

### Step 1: Get Task Description

If `description` argument provided, use it.

Otherwise, prompt user:

> **Quick Task**
> What do you want to do?

Generate slug from description: lowercase, hyphens, max 40 characters.

If empty, re-prompt.

### Step 2: Calculate Next Quick Task Number

1. Ensure `.opti-gsd/quick/` directory exists (create if not)
2. Find highest existing numbered directory
3. Increment sequentially: `001`, `002`, `003`, ...
4. Use three-digit format with leading zeros

### Step 3: Create Quick Task Directory

Create directory: `.opti-gsd/quick/{NNN}-{slug}/`

Report to user:
```
## Quick Task {NNN}: {description}

Creating plan...
```

### Step 4: Spawn Planner (Quick Mode)

Spawn opti-gsd-planner via Task tool with quick mode context:

```xml
You are planning a QUICK TASK for opti-gsd. This is a lightweight ad-hoc task, not a full phase.

<context>
  <project>{.opti-gsd/project.md#overview - if exists, otherwise skip}</project>
  <conventions>{.opti-gsd/codebase/conventions.md - if exists}</conventions>
  <state>{.opti-gsd/state.json - current state}</state>
</context>

<quick_task>
  <number>{NNN}</number>
  <description>{description}</description>
  <output_dir>.opti-gsd/quick/{NNN}-{slug}/</output_dir>
</quick_task>

<constraints>
  <rule>Create a SINGLE plan with 1-3 focused tasks</rule>
  <rule>No research phase needed</rule>
  <rule>No plan-checker phase needed</rule>
  <rule>Target ~30% context usage</rule>
  <rule>Keep it simple and focused</rule>
</constraints>

Output the plan to: .opti-gsd/quick/{NNN}-{slug}/plan.json
```

Verify plan file exists after planner completes. Report path to user.

### Step 5: Spawn Executor

Spawn opti-gsd-executor via Task tool:

```xml
You are executing a QUICK TASK for opti-gsd. Complete all tasks in the plan.

<plan>{contents of .opti-gsd/quick/{NNN}-{slug}/plan.json}</plan>
<state>{.opti-gsd/state.json}</state>

<constraints>
  <rule>Execute all tasks in the plan</rule>
  <rule>Create atomic commits for each task</rule>
  <rule>Create a summary when done</rule>
  <rule>Do NOT update roadmap.md — this is a quick task, not a phase</rule>
</constraints>

Output summary to: .opti-gsd/quick/{NNN}-{slug}/summary.md
```

Verify summary file exists. Extract commit hash(es) from executor output.

### Step 6: Update state.json

**6a.** Read current `state.json`

**6b.** Add or update the `quick_tasks` array:

```json
{
  "quick_tasks": [
    {
      "number": "NNN",
      "description": "{description}",
      "date": "{ISO date}",
      "commit": "{short hash}",
      "directory": ".opti-gsd/quick/{NNN}-{slug}/"
    }
  ]
}
```

**6c.** Update `last_activity` field:

```json
{
  "last_activity": "Quick task {NNN}: {description}"
}
```

### Step 7: Final Commit and Completion

Stage artifacts:
```bash
git add .opti-gsd/quick/{NNN}-{slug}/
git add .opti-gsd/state.json
```

Commit:
```bash
git commit -m "docs(quick-{NNN}): {description}

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Retrieve short commit hash.

### Step 8: Report

```markdown
## Quick Task {NNN} Complete!

**Task:** {description}
**Plan:** .opti-gsd/quick/{NNN}-{slug}/plan.json
**Summary:** .opti-gsd/quick/{NNN}-{slug}/summary.md
**Commit:** {short hash}

→ /opti-gsd:status    — Check project state
→ /opti-gsd:quick     — Run another quick task
```

---

## Success Criteria

- [ ] Project validation passes (`.opti-gsd/` and `roadmap.md` exist)
- [ ] User provides task description
- [ ] Slug generated correctly (lowercase, hyphens, max 40 chars)
- [ ] Next number calculated sequentially (three-digit format)
- [ ] Directory created at `.opti-gsd/quick/{NNN}-{slug}/`
- [ ] Plan file created by planner
- [ ] Summary file created by executor
- [ ] `state.json` updated with quick task entry
- [ ] Artifacts committed to repository

---

## Key Differences from Full Execute

| Aspect | Full Execute | Quick |
|--------|-------------|-------|
| Planning | Full phase plan with waves | 1-3 focused tasks |
| Research | Optional research phase | Skipped |
| Plan Check | Plan-checker agent validates | Skipped |
| Verification | Verifier agent checks | Skipped |
| Storage | `.opti-gsd/plans/phase-{N}/` | `.opti-gsd/quick/{NNN}-{slug}/` |
| Roadmap | Updated on completion | NOT updated |
| State | Full phase tracking | `quick_tasks` array only |
| Context budget | ~15% orchestrator | ~10% orchestrator |

---

## Context Budget

Orchestrator: ~10%
- Validation: ~2%
- Planner spawn: ~3%
- Executor spawn: ~3%
- State update + commit: ~2%

All heavy work delegated to subagents with fresh context.
