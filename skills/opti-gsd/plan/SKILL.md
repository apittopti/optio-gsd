---
name: plan
description: Generate executable phase plans with tasks, waves, and dependencies. Supports research before planning and discussion mode. Subcommands: (default) plan current phase, N (plan specific phase), fix (generate fix plan from verification gaps), discuss N (collaborative planning), research [topic] (investigate before planning).
disable-model-invocation: true
argument-hint: [N | fix | discuss N | research topic]
---

# plan

Plan project phases with research, discussion, and execution plans.

## Usage

- `/opti-gsd:plan [N]` — Generate execution plan for phase N
- `/opti-gsd:plan fix` — Generate fix plan for verification gaps
- `/opti-gsd:plan discuss [N]` — Capture implementation decisions before planning
- `/opti-gsd:plan research [topic]` — Research best practices for a topic

## Routing

| Input | Subcommand | Description |
|-------|------------|-------------|
| `[N]` or (no args) | **phase** | Generate executable plan for phase N |
| `fix` | **fix** | Generate fix plan for verification gaps |
| `discuss [N]` | **discuss** | Capture decisions before planning |
| `research [topic]` | **research** | Research best practices |

---

## Subcommand: phase

Generate an executable plan for phase N with XML-structured tasks.

**Full procedure:** [actions/phase-plan.md](actions/phase-plan.md)

### Arguments

- `N` — Phase number (optional, defaults to current phase from state.json)
- `--research` — Force phase research even if research.md exists
- `--skip-research` — Skip research, use existing knowledge
- `--gaps` — Plan gap closure for failed verification

### Overview

1. **Validate Branch** — Block planning on protected branches (master/main/production/prod). Enforce milestone branching if configured.
2. **Validate Prerequisites** — Ensure `.opti-gsd/`, `state.json`, and `roadmap.md` exist.
3. **Determine Phase** — Use provided N or read from state.json. Normalize numbering (1 -> 01).
4. **Load Context** — Read config, state, roadmap, relevant stories/issues, conventions.
5. **Research (Conditional)** — Spawn `opti-gsd-phase-researcher` if needed.
6. **Generate Plan** — Spawn `opti-gsd-planner` agent with full context.
7. **Validate Plan** — Spawn `opti-gsd-plan-checker` agent. Iterate up to 3x on blockers. See [reference/plan-validation.md](reference/plan-validation.md).
8. **Write plan.json** — Save to `.opti-gsd/plans/phase-{N}/plan.json`. See [reference/task-format.md](reference/task-format.md) for XML task structure.
9. **Update state.json** — Set phase status to "planned".
10. **Commit** — Commit plan and state files.
11. **Present Plan** — Display wave structure, tasks, requirements coverage, and next steps.

### Gap Closure Mode

When `--gaps` flag is used:

1. Read `.opti-gsd/plans/phase-{N}/verification.md` for failed items
2. Create targeted tasks to close specific gaps
3. Mark plan as `gap_closure: true` in frontmatter
4. Only address failed verification items

### Context Budget

- Loading context: ~10%
- Research (if needed): spawned as subagent
- Planning: spawned as subagent
- Validation: spawned as subagent
- File writing: ~5%
- Orchestrator stays under 15%.

### Next Steps After Planning

```
→ /opti-gsd:execute         — Start executing tasks
→ /opti-gsd:plan discuss    — Refine decisions before executing (optional)
```

State saved. Safe to /compact or start new session if needed.

---

## Subcommand: fix

Generate targeted fix plans for gaps identified during verification.

**Full procedure:** [actions/fix-plan.md](actions/fix-plan.md)

### Arguments

- `phase` — Phase number with gaps (optional, defaults to last verified phase)

### Philosophy

Following GSD principles: **"Human judgment gates continuation."**

This command is explicitly triggered by the user after reviewing verification gaps. No automatic fix loops — you decide when and how to address issues.

### Overview

1. **Load Verification Report** — Read `.opti-gsd/plans/phase-{N}/verification.md`.
2. **Parse Gaps** — Extract gaps from `<gaps>` XML section (orphan, ci_failure, broken_link, stub, missing_export).
3. **Generate Fix Tasks** — Create targeted fix task per gap using templates.
4. **Create Fix Plan** — Write `.opti-gsd/plans/phase-{N}/fix-plan.json`.
5. **Offer Execution** — Prompt user to execute or review first.
6. **Commit Plan** — Commit the fix plan file.

### Fix Strategy by Gap Type

| Gap Type | Fix Strategy | Task Structure |
|----------|--------------|----------------|
| orphan | Add import + usage | Modify parent file |
| broken_link | Fix path/reference | Modify caller file |
| stub | Full implementation | Modify stub file |
| missing_export | Add export | Modify source file |
| ci_failure | Fix specific error | Based on error type |

### Context Budget

- Loading: ~5%, Gap parsing: ~2%, Plan generation: ~5%
- Total: ~12%
- Fix plans are intentionally lightweight — quick wiring fixes, not new features.

---

## Subcommand: discuss

Capture implementation decisions and constraints for a phase.

**Full procedure:** [actions/discuss.md](actions/discuss.md)

### Arguments

- `phase` — Phase number to discuss (defaults to next pending phase)

### When to Use

- **Before planning** — to inform the initial plan
- **After planning** — to refine decisions, then re-run `/opti-gsd:plan` to regenerate

### Overview

1. **Validate Branch** — Enforce milestone branching if configured.
2. **Identify Phase** — Find first pending phase or use specified N.
3. **Load Phase Context** — Read phase title, goal, requirements from roadmap.
4. **Facilitate Discussion** — Prompt user for technical preferences, constraints, open questions, prior art.
5. **Capture Discussion** — Organize input into structured notes.
6. **Save** — Write to `.opti-gsd/plans/phase-{N}/discussion.md`.
7. **Update state.json** — Set status to "discussed".
8. **Commit and Report** — Commit discussion notes, show summary.

### Integration with Planning

When /opti-gsd:plan runs, it:
1. Loads discussion.md if exists
2. Incorporates decisions into plan
3. References constraints in task definitions
4. Flags open questions for research

### Context Budget

- Discussion facilitation: ~5%, Note capture: ~3%
- Total: ~8%

---

## Subcommand: research

Research best practices, patterns, and pitfalls for your project domain.

**Full procedure:** [actions/research.md](actions/research.md)

### Arguments

- `scope` — What to research (optional):
  - `project` — Full project domain research (default)
  - `phase N` — Research specific to phase N
  - `topic "query"` — Research a specific topic

### Research Modes

| Mode | Agents | Output |
|------|--------|--------|
| **Project** (default) | 4 parallel `opti-gsd-project-researcher` + synthesizer | `.opti-gsd/research/summary.md` |
| **Phase** | 1 `opti-gsd-phase-researcher` | `.opti-gsd/plans/phase-{N}/research.md` |
| **Topic** | 1 `opti-gsd-project-researcher` | Displayed + optional `.opti-gsd/research/{slug}.md` |

### When to Use

| Situation | Command |
|-----------|---------|
| Starting existing project (after init) | /opti-gsd:plan research |
| Before planning a complex phase | /opti-gsd:plan research phase N |
| Unsure about a technical decision | /opti-gsd:plan research topic "..." |
| Want to validate approach | /opti-gsd:plan research |

### Integration with Planning

When /opti-gsd:plan runs:
1. Checks for `.opti-gsd/research/summary.md`
2. Checks for `.opti-gsd/plans/phase-{N}/research.md`
3. Incorporates findings into task planning
4. References pitfalls in verification steps

### Context Budget

- Project research: ~40% (4 parallel subagents + synthesizer)
- Phase research: ~20% (spawned as subagent)
- Topic research: ~15% (single focused query)

---

## Reference Documents

- [reference/task-format.md](reference/task-format.md) — XML task structure, fields, and examples
- [reference/plan-validation.md](reference/plan-validation.md) — Plan checker rules and severity handling
