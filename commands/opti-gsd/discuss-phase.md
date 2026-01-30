---
description: Capture implementation decisions and constraints before planning a phase.
---

# discuss-phase [phase]

Capture implementation decisions and constraints for a phase.

Can be run:
- **Before planning** — to inform the initial plan
- **After planning** — to refine decisions, then re-run `plan-phase` to regenerate

## Arguments

- `phase` — Phase number to discuss (defaults to next pending phase)

## Behavior

### Step 0: Validate Branch

If `branching: milestone` is configured in `.opti-gsd/config.json`:

1. Get current branch:
   ```bash
   git branch --show-current
   ```

2. Get base branch from config (default: `master`)

3. If current branch == base branch:

   **If no milestone set in state.json:**
   ```
   ⚠️ No Milestone Active
   ─────────────────────────────────────
   You're on {base} with branching: milestone configured,
   but no milestone is active.

   → Run /opti-gsd:start-milestone [name] to create a milestone branch
   ```
   Stop execution here.

   **If milestone is set but on base branch:**

   - **interactive mode**:
     > "You're on {base} but milestone {milestone} exists. Switch to {prefix}{milestone}? [Y/n]"

     If yes: `git checkout {prefix}{milestone}`
     If no: "Continuing on {base}. Changes will be on base branch."

   - **yolo mode**:
     Auto-switch: `git checkout {prefix}{milestone}`
     If branch doesn't exist: `git checkout -b {prefix}{milestone}`

### Step 1: Identify Phase

If no phase specified:
- Find first phase with status PENDING
- If none, suggest adding a phase

```markdown
## No Pending Phases

All phases are complete or in progress.

Add a new phase: /opti-gsd:add-phase {title}
```

### Step 2: Load Phase Context

Read from roadmap.md:
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

Write to `.opti-gsd/plans/phase-{N}/discussion.md`:

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

*This informs the planning phase. Run /opti-gsd:plan-phase {N} when ready.*
```

### Step 6: Update state.json

```json
{
  "phase": "{N}",
  "status": "discussed",
  "context": "Phase {N} discussed. Key decisions captured."
}
```

### Step 7: Commit and Report

```bash
git add .opti-gsd/plans/phase-{N}/discussion.md .opti-gsd/state.json
git commit -m "doc: capture phase {N} discussion"
```

```markdown
## Discussion Captured

**Phase {N}:** {title}
**Decisions:** {count}
**Open Questions:** {count}

Saved to: `.opti-gsd/plans/phase-{N}/discussion.md`

```

**Next steps:**
→ /opti-gsd:plan-phase {N}    — Generate/regenerate plan with these decisions
→ /opti-gsd:discuss-phase {N} — Add more notes (appends)
→ /opti-gsd:execute           — Start executing (if plan exists)

---

## Integration with Planning

When /opti-gsd:plan-phase runs, it:
1. Loads discussion.md if exists
2. Incorporates decisions into plan
3. References constraints in task definitions
4. Flags open questions for research

---

## Context Budget

- Discussion facilitation: ~5%
- Note capture: ~3%
- Total: ~8%
