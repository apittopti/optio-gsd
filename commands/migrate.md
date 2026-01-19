---
description: Migrate from old workflow formats to current structure.
---

# migrate [type]

Migrate from old workflow formats to current structure.

## Arguments

- `type` — Migration type: `requirements` (default), `all`

## Behavior

### Step 1: Detect What Needs Migration

Check for legacy files:

```markdown
## Migration Check

**Legacy files found:**
- [x] `.gsd/REQUIREMENTS.md` — Convert to stories
- [ ] `.gsd/TODOS.md` — Rename to IDEAS.md (if exists)

**Already current:**
- [x] `.gsd/stories/` exists
- [x] `.gsd/IDEAS.md` exists
```

### Step 2: Migrate Requirements to Stories

If `.gsd/REQUIREMENTS.md` exists:

1. Parse each requirement (REQ-ID format)
2. Create a story file for each:

**Before (REQUIREMENTS.md):**
```markdown
### AUTH-01: User Registration
- **Phase:** 1
- **Status:** pending
- **Verification:** User can create account with email/password
```

**After (.gsd/stories/US001-user-registration.md):**
```markdown
# US001: User Registration

**From:** Migrated from AUTH-01
**Requested:** {original date or migration date}
**Status:** {pending → backlog, complete → delivered}

## Request
User can create account with email/password

## Why
Core authentication functionality

## Acceptance Criteria
- [ ] {Derived from verification field}

## Milestone
{From phase assignment if known}

## Notes
Migrated from REQUIREMENTS.md (AUTH-01)
```

3. Create mapping file `.gsd/migrations/requirements-to-stories.md`:

```markdown
# Requirements → Stories Migration

**Date:** {timestamp}

| Old ID | New ID | Title |
|--------|--------|-------|
| AUTH-01 | US001 | User Registration |
| AUTH-02 | US002 | User Login |
| DASH-01 | US003 | Dashboard Layout |
```

4. Update ROADMAP.md references:
   - Replace `**Requirements:** AUTH-01, AUTH-02`
   - With `**Delivers:** US001, US002`

5. Archive REQUIREMENTS.md:
   - Move to `.gsd/archive/REQUIREMENTS.md.bak`

### Step 3: Migrate TODOS to IDEAS

If `.gsd/TODOS.md` exists but `.gsd/IDEAS.md` doesn't:

1. Rename TODOS.md to IDEAS.md
2. Update ID format (T001 → I001)
3. Update internal references

### Step 4: Commit Migration

```bash
git add .gsd/stories/
git add .gsd/migrations/
git add .gsd/ROADMAP.md
git add .gsd/archive/
git rm .gsd/REQUIREMENTS.md 2>/dev/null || true
git commit -m "chore: migrate to stories-based workflow

- Converted {N} requirements to user stories
- Updated ROADMAP.md references
- Archived REQUIREMENTS.md"
```

### Step 5: Report

```markdown
## Migration Complete

**Converted:**
- {N} requirements → {N} user stories

**Files created:**
- .gsd/stories/US001-*.md through US{N}-*.md

**Files archived:**
- .gsd/archive/REQUIREMENTS.md.bak

**ROADMAP.md updated:**
- Replaced requirement references with story references

**Mapping preserved:**
- .gsd/migrations/requirements-to-stories.md

Your project now uses the simplified workflow:
- Ideas (your thoughts)
- Stories (user needs with acceptance criteria)
- Issues (bugs/problems)

Run `/opti-gsd:stories` to see your migrated stories.
```

---

## Context Budget

Minimal: ~5%
