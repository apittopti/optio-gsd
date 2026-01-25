---
description: Generate fix plans for verification gaps (user-triggered gap closure)
---

# plan-fix [phase]

Generate targeted fix plans for gaps identified during verification.

## Arguments

- `phase` — Phase number with gaps (optional, defaults to last verified phase)

## Philosophy

Following GSD principles: **"Human judgment gates continuation."**

This command is explicitly triggered by the user after reviewing verification gaps.
No automatic fix loops - you decide when and how to address issues.

## Behavior

### Step 1: Load Verification Report

Read `.opti-gsd/plans/phase-{N}/verification.md` and extract:
- Gap list with types and affected files
- CI failures with error messages
- Integration issues with break points

If no verification.md exists:
```
⚠️ No Verification Report
─────────────────────────────────────
Phase {N} has not been verified yet.

→ Run /opti-gsd:verify {N} first
```

### Step 2: Parse Gaps

Extract gaps from verification.md `<gaps>` section:

```xml
<gaps>
  <gap type="orphan" file="components/StatsCard.tsx">
    Component exists but not imported in Dashboard
  </gap>
  <gap type="ci_failure" check="typecheck">
    src/api/stats.ts:15 - Property 'userId' does not exist
  </gap>
</gaps>
```

### Step 3: Generate Fix Tasks

For each gap, create a targeted fix task:

| Gap Type | Fix Strategy | Task Structure |
|----------|--------------|----------------|
| orphan | Add import + usage | Modify parent file |
| broken_link | Fix path/reference | Modify caller file |
| stub | Full implementation | Modify stub file |
| missing_export | Add export | Modify source file |
| ci_failure | Fix specific error | Based on error type |

### Step 4: Create Fix Plan

Write `.opti-gsd/plans/phase-{N}/fix-plan.json`:

```markdown
# Fix Plan: Phase {N} Gaps

## Source
Generated from: verification.md
Gaps identified: {count}

## Fix Tasks

### Fix 1: Import StatsCard in Dashboard
- **Type:** orphan
- **Files:** src/app/dashboard/page.tsx
- **Test Required:** false (wiring only)
- **Action:** Add import and usage of StatsCard component
- **Verify:** Component renders in dashboard
- **Done:** StatsCard visible on dashboard page

### Fix 2: Fix userId type error
- **Type:** ci_failure
- **Files:** src/api/stats.ts
- **Test Required:** existing
- **Action:** Add userId to request type or fix property access
- **Verify:** `npm run typecheck` passes
- **Done:** No type errors in stats.ts
```

### Step 5: Offer Execution

```markdown
## Fix Plan Created

**Gaps:** {count}
**Fix tasks:** {task_count}
**Estimated:** Quick fixes, < 15 min total

**Next Steps:**
→ /opti-gsd:execute — Execute fix plan
→ Review fix-plan.json and edit if needed
→ /opti-gsd:verify {N} — Re-verify after fixes

Execute fixes now? [Y/n]
```

If user confirms (or yolo mode), run /opti-gsd:execute on fix plan.

### Step 6: Commit Plan

```bash
git add .opti-gsd/plans/phase-{N}/fix-plan.json
git commit -m "docs(phase-{N}): create fix plan for {count} gaps"
```

---

## Fix Task Templates

### Orphan Fix
```xml
<task id="FIX-01" type="orphan">
  <files>
    <file action="modify">{parent_file}</file>
  </files>
  <action>
    Import {orphan_file} and add usage where appropriate.
    Follow existing import patterns in the file.
  </action>
  <verify>
    <check type="import">Import statement exists</check>
    <check type="usage">Component/function is used</check>
  </verify>
  <done>{orphan} is imported and used in {parent}</done>
</task>
```

### CI Failure Fix
```xml
<task id="FIX-02" type="ci_failure">
  <files>
    <file action="modify">{error_file}</file>
  </files>
  <action>
    Fix {error_type} error at line {line}:
    {error_message}

    Specific fix: {suggested_fix}
  </action>
  <verify>
    <check type="ci" cmd="{ci_command}">Passes without this error</check>
  </verify>
  <done>{ci_check} passes for {file}</done>
</task>
```

### Broken Link Fix
```xml
<task id="FIX-03" type="broken_link">
  <files>
    <file action="modify">{caller_file}</file>
  </files>
  <action>
    Fix reference from {from} to {to}:
    Current: {broken_reference}
    Should be: {correct_reference}
  </action>
  <verify>
    <check type="link">Connection works</check>
  </verify>
  <done>{from} correctly references {to}</done>
</task>
```

---

## Context Budget

- Loading: ~5%
- Gap parsing: ~2%
- Plan generation: ~5%
- Total: ~12%

Fix plans are intentionally lightweight - quick wiring fixes, not new features.
