# /opti-gsd:discuss-phase [phase]

Capture implementation decisions and constraints before planning a phase.

## Arguments

- `phase` — Phase number to discuss (defaults to next pending phase)

## Behavior

### Step 1: Identify Phase

If no phase specified:
- Find first phase with status PENDING
- If none, suggest adding a phase

```markdown
## No Pending Phases

All phases are complete or in progress.

Add a new phase: `/opti-gsd:add-phase {title}`
```

### Step 2: Load Phase Context

Read from ROADMAP.md:
- Phase title and goal
- Requirements (REQ-IDs)
- Dependencies

### Step 3: Facilitate Discussion

```markdown
## Discuss Phase {N}: {Title}

Before planning, let's capture key decisions and constraints.

### Goal
{goal from roadmap}

### Requirements
{REQ-IDs}

---

**Please share any of the following:**

1. **Technical Preferences**
   - Preferred libraries or tools?
   - Patterns to follow or avoid?
   - Performance requirements?

2. **Constraints**
   - Time constraints?
   - Must integrate with existing code?
   - Security/compliance requirements?

3. **Open Questions**
   - Anything unclear about requirements?
   - Decisions you're unsure about?

4. **Prior Art**
   - Similar implementations to reference?
   - Existing code to build on?

Type your thoughts, or say "skip" to proceed to planning.
```

### Step 4: Capture Discussion

As user provides input, organize into structured notes:

```markdown
## Discussion Notes: Phase {N}

### Technical Decisions
- Use TanStack Query for data fetching (user preference)
- Follow existing auth patterns from Phase 2
- Target <100ms response times

### Constraints
- Must work with legacy API endpoints
- Cannot modify database schema
- Needs to support offline mode

### Open Questions
- [ ] How should we handle concurrent edits?
- [ ] What's the fallback for offline?

### References
- Similar to Dashboard component pattern
- See auth service for token handling
```

### Step 5: Save to Phase Directory

Write to `.gsd/plans/phase-{N}/DISCUSSION.md`:

```markdown
# Phase {N} Discussion

**Captured:** {timestamp}
**Participants:** User, Claude

## Summary
{brief summary of key points}

## Technical Decisions
{decisions}

## Constraints
{constraints}

## Open Questions
{questions}

## References
{references}

---

*This informs the planning phase. Run `/opti-gsd:plan-phase {N}` when ready.*
```

### Step 6: Update STATE.md

```yaml
phase: {N}
phase_status: discussed
```

Add to session context:
```
Phase {N} discussed. Key decisions captured.
```

### Step 7: Commit and Report

```bash
git add .gsd/plans/phase-{N}/DISCUSSION.md .gsd/STATE.md
git commit -m "doc: capture phase {N} discussion"
```

```markdown
## Discussion Captured

**Phase {N}:** {title}
**Decisions:** {count}
**Open Questions:** {count}

Saved to: `.gsd/plans/phase-{N}/DISCUSSION.md`

Next steps:
- Plan the phase: `/opti-gsd:plan-phase {N}`
- Add more notes: `/opti-gsd:discuss-phase {N}` (appends)
```

---

## Integration with Planning

When `/opti-gsd:plan-phase` runs, it:
1. Loads DISCUSSION.md if exists
2. Incorporates decisions into plan
3. References constraints in task definitions
4. Flags open questions for research

---

## Context Budget

- Discussion facilitation: ~5%
- Note capture: ~3%
- Total: ~8%
