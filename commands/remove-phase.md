# /opti-gsd:remove-phase [phase]

Remove a future phase from the roadmap and renumber subsequent phases.

## Arguments

- `phase` — Phase number to remove

## Behavior

### Step 1: Validate Phase

Check phase status:
- Must be PENDING (not started)
- Cannot remove IN_PROGRESS or COMPLETE phases

If invalid:
```markdown
## Cannot Remove Phase {N}

Phase {N} is {status}. Only PENDING phases can be removed.

{If IN_PROGRESS}
Options:
- Pause work: `/opti-gsd:pause`
- Complete phase first
- Use `--force` to remove anyway (will lose progress)

{If COMPLETE}
This phase is already complete. Removing it would break history.
Consider archiving instead: `/opti-gsd:archive {N}`
```

### Step 2: Show Phase Details

```markdown
## Remove Phase {N}?

**Title:** {title}
**Goal:** {goal}
**Requirements:** {req-ids}
**Status:** Pending

This will:
1. Remove Phase {N} from ROADMAP.md
2. Renumber Phase {N+1} → {N}, Phase {N+2} → {N+1}, etc.
3. Update all phase references
4. Delete `.gsd/plans/phase-{N}/` if exists

**Confirm removal?** (yes/no)
```

### Step 3: Check for Dependencies

Scan other phases for dependencies on this phase:

```markdown
## Warning: Dependencies Found

The following phases depend on Phase {N}:
- Phase {M}: "Requires auth from Phase {N}"
- Phase {K}: "Builds on Phase {N} API"

Removing Phase {N} will break these dependencies.

Options:
1. Update dependent phases first
2. Use `--force` to remove anyway
3. Cancel removal
```

### Step 4: Remove Phase

Delete from ROADMAP.md:
```markdown
### Phase {N}: {Title} [PENDING]
{...content...}
```

### Step 5: Renumber Subsequent Phases

For each phase > N:
- Decrement phase number by 1
- Update phase header in ROADMAP.md
- Rename plan directory if exists

```bash
# Rename from lowest to highest to avoid conflicts
for phase in {N+1..highest}; do
  if [ -d ".gsd/plans/phase-${phase}" ]; then
    mv ".gsd/plans/phase-${phase}" ".gsd/plans/phase-$((phase-1))"
  fi
done
```

### Step 6: Update STATE.md

Update phase arrays:
- Remove from `phases_pending`
- Renumber remaining phases

### Step 7: Update References

Search and update phase references in:
- ROADMAP.md (dependency mentions)
- DECISIONS.md (phase references)
- Other plan files

### Step 8: Commit and Report

```bash
git add .gsd/
git commit -m "chore: remove phase {N} - {title}

Renumbered phases {N+1}+ to {N}+"
```

```markdown
## Phase Removed

**Removed:** Phase {N} - {title}

**Renumbered:**
- Phase {N+1} → Phase {N}
- Phase {N+2} → Phase {N+1}
- ...

**Updated:** {count} phase references

Roadmap now has {total} phases.
```

---

## Safety Features

1. **Cannot remove active phases** - Must be PENDING
2. **Dependency warning** - Shows what depends on this phase
3. **Confirmation required** - Interactive mode always asks
4. **Atomic operation** - All changes in single commit

---

## Context Budget

- Validation: ~3%
- Renumbering: ~5%
- Reference updates: ~5%
- Total: ~13%
