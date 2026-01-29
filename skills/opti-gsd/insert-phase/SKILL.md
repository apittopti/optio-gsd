---
name: insert-phase
description: Insert a new phase at a specific position, renumbering subsequent phases.
disable-model-invocation: true
---

# insert-phase [position] [title]

Insert a new phase at a specific position, renumbering subsequent phases.

## Arguments

- `position` — Phase number where new phase should be inserted
- `title` — Phase title

## Behavior

### Step 1: Validate Context

Check:
- Milestone is active
- roadmap.md exists
- Position is valid (1 to N+1 where N is current phase count)

If position out of range:
```markdown
## Invalid Position

Position {position} is out of range.
Valid range: 1 to {max+1}

Use /opti-gsd:add-phase {title} to add at end.
```

### Step 2: Check for Conflicts

If any phase >= position is in progress or complete:
```markdown
## Cannot Insert Phase

Phase {N} is already {status}. Inserting would disrupt active work.

Options:
1. Add at end: /opti-gsd:add-phase {title}
2. Complete current phase first
3. Use `--force` to insert anyway (will renumber)
```

### Step 3: Renumber Phases

For each phase >= position:
- Increment phase number by 1
- Update all references in roadmap.md
- Update plan file paths if they exist

### Step 4: Insert New Phase

Add new phase at position with:
- Status: PENDING
- Goal: (to be defined)
- Requirements: TBD

### Step 5: Update state.json

Update phase arrays to reflect new numbering:
- `phases_complete`: update numbers
- `phases_in_progress`: update numbers
- `phases_pending`: add new phase, update numbers

### Step 6: Rename Plan Directories

```bash
# Rename from highest to lowest to avoid conflicts
for phase in {highest..position}; do
  if [ -d ".opti-gsd/plans/phase-${phase}" ]; then
    mv ".opti-gsd/plans/phase-${phase}" ".opti-gsd/plans/phase-$((phase+1))"
  fi
done

# Create new phase directory
mkdir -p ".opti-gsd/plans/phase-{position}"
```

### Step 7: Commit

```bash
git add .opti-gsd/
git commit -m "chore: insert phase {position} - {title}

Renumbered phases {position}+ to {position+1}+"
```

### Step 8: Report

```markdown
## Phase Inserted

**New Phase {position}:** {title}

**Renumbered:**
- Phase {position} → Phase {position+1}
- Phase {position+1} → Phase {position+2}
- ...

```

**Next steps:**
→ /opti-gsd:plan-phase {position} — Plan new phase

---

## Context Budget

- Analysis: ~3%
- Renumbering: ~5%
- Total: ~8%
