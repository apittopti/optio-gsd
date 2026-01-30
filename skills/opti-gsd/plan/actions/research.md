# Research Before Planning

Detailed step-by-step procedure for researching best practices, patterns, and pitfalls.

**Parent:** [../SKILL.md](../SKILL.md) > Subcommand: research

## Project Research (default)

Spawn 4 parallel `opti-gsd-project-researcher` agents:

| Agent | Focus | Investigates |
|-------|-------|--------------|
| 1 | **stack** | Technology recommendations, library choices, compatibility |
| 2 | **features** | Table stakes vs differentiators, what users expect |
| 3 | **architecture** | Patterns, structure, scalability approaches |
| 4 | **pitfalls** | Common mistakes, anti-patterns, things to avoid |

Each agent receives:
- `.opti-gsd/project.md` — project goals and type (if exists)
- `.opti-gsd/config.json` — detected stack and framework
- `.opti-gsd/stories/` — user stories to implement
- `.opti-gsd/codebase/summary.md` — existing codebase context (if exists)

Then spawn `opti-gsd-research-synthesizer` to consolidate into `.opti-gsd/research/summary.md`.

## Phase Research

For `/opti-gsd:plan research phase N`:

Spawn `opti-gsd-phase-researcher` with:
- Phase goals from roadmap.md
- Stories/issues to deliver in that phase
- Project research summary.md (if exists)
- Codebase conventions

Focus areas:
- Best libraries/patterns for these specific requirements
- How to implement within existing codebase conventions
- Common pitfalls for this type of feature
- Integration considerations with existing code

Output: `.opti-gsd/plans/phase-{N}/research.md`

## Topic Research

For `/opti-gsd:plan research topic "authentication with OAuth"`:

Spawn single `opti-gsd-project-researcher` with:
- Specific topic query
- Project context
- Current stack

Output: Displayed directly + optionally saved to `.opti-gsd/research/{topic-slug}.md`

## Output Format

### Project Research Summary

```markdown
# Research Summary

**Project Type:** {app_type}
**Stack:** {framework, key dependencies}
**Researched:** {timestamp}

## Stack Recommendations

### Recommended
- {library} — {why it fits this project}
- {pattern} — {benefits for this use case}

### Avoid
- {anti-pattern} — {why it's problematic here}

## Feature Insights

### Table Stakes (Must Have)
- {feature} — users expect this
- {feature} — standard for this app type

### Differentiators (Nice to Have)
- {feature} — would set you apart

## Architecture Patterns

### Recommended Structure
- {pattern} — {when to use}
- {approach} — {benefits}

### Scalability Considerations
- {consideration}

## Common Pitfalls

### Critical to Avoid
- {pitfall} — {why and how to avoid}
- {mistake} — {what to do instead}

### Warnings
- {warning} — {context}

---
```

**Next steps:**
```
→ /opti-gsd:plan {N}   — Generate plan with these insights
→ /opti-gsd:roadmap     — Create roadmap (if not done)
```

State saved. Safe to /compact or start new session if needed.

## When to Use

| Situation | Command |
|-----------|---------|
| Starting existing project (after init) | /opti-gsd:plan research |
| Before planning a complex phase | /opti-gsd:plan research phase N |
| Unsure about a technical decision | /opti-gsd:plan research topic "..." |
| Want to validate approach | /opti-gsd:plan research |

## Integration with Planning

When /opti-gsd:plan runs:
1. Checks for `.opti-gsd/research/summary.md`
2. Checks for `.opti-gsd/plans/phase-{N}/research.md`
3. Incorporates findings into task planning
4. References pitfalls in verification steps

## Context Budget

- Project research: ~40% (spawned as 4 parallel subagents + synthesizer)
- Phase research: ~20% (spawned as subagent)
- Topic research: ~15% (single focused query)
