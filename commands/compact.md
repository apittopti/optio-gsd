# /opti-gsd:compact

Reduce context footprint of all project files.

## Behavior

### Step 1: Analyze Current State

Scan `.gsd/` directory and calculate token estimates for all files.

### Step 2: Archive Completed Phases

For each completed phase not yet archived:
- Run archive process (same as `/opti-gsd:archive`)

### Step 3: Summarize Research Files

For each `.gsd/plans/phase-{N}/RESEARCH.md`:
- If phase is complete, condense to key findings only
- Remove verbose examples and exploration

Before:
```markdown
# Research: Phase 2

## Investigation
I explored several options...
{500 lines of exploration}

## Findings
- Use TanStack Query v5
- Avoid lodash, use native methods
- Pattern: feature-based folders
```

After:
```markdown
# Research Summary: Phase 2

- TanStack Query v5 for data fetching
- Native methods over lodash
- Feature-based folder structure
```

### Step 4: Compact STATE.md

Remove old session notes, keep only recent:

Before:
```markdown
## Session Context
{Old context from 5 sessions ago}
{Old context from 4 sessions ago}
{Old context from 3 sessions ago}
{Current context}
```

After:
```markdown
## Session Context
{Current context only}
```

### Step 5: Trim DECISIONS.md

Keep decisions, remove verbose rationale:

Before:
```markdown
### Decision: Use jose over jsonwebtoken

**Date:** 2026-01-15
**Context:** We needed a JWT library...
{50 lines of context}
**Decision:** Use jose
**Rationale:** {30 lines of rationale}
**Consequences:** {20 lines}
```

After:
```markdown
### 2026-01-15: jose > jsonwebtoken
ESM compatible, smaller bundle, better TypeScript support.
```

### Step 6: Clean Debug Sessions

For resolved issues:
- Move to `.gsd/archive/debug/`
- Keep only summary in main debug folder

### Step 7: Report Savings

```markdown
## Compaction Complete

### Actions Taken
- Archived {N} completed phases
- Condensed {M} research files
- Trimmed STATE.md history
- Compacted DECISIONS.md
- Archived {K} resolved debug sessions

### Token Savings
| Category | Before | After | Saved |
|----------|--------|-------|-------|
| Phase archives | 4,500 | 300 | 4,200 |
| Research files | 2,400 | 600 | 1,800 |
| STATE.md | 500 | 150 | 350 |
| DECISIONS.md | 800 | 200 | 600 |
| Debug sessions | 1,200 | 100 | 1,100 |
| **Total** | **9,400** | **1,350** | **8,050** |

**Reduction:** 85%
```

### Step 8: Commit

```bash
git add .gsd/
git commit -m "chore: compact project files

Saved ~{total}k tokens ({percentage}% reduction)"
```

---

## Context Budget

- Analysis: ~5%
- Compaction: ~10%
- Total: ~15% (at orchestrator limit)
