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
- [x] `.opti-gsd/REQUIREMENTS.md` — Convert to stories
- [ ] `.opti-gsd/TODOS.md` — Rename to FEATURES.md (if exists)

**Already current:**
- [x] `.opti-gsd/stories/` exists
- [x] `.opti-gsd/FEATURES.md` exists
```

### Step 2: Migrate Requirements to Stories

If `.opti-gsd/REQUIREMENTS.md` exists:

1. Parse each requirement (REQ-ID format)
2. Create a story file for each:

**Before (REQUIREMENTS.md):**
```markdown
### AUTH-01: User Registration
- **Phase:** 1
- **Status:** pending
- **Verification:** User can create account with email/password
```

**After (.opti-gsd/stories/US001-user-registration.md):**
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

3. Create mapping file `.opti-gsd/migrations/requirements-to-stories.md`:

```markdown
# Requirements → Stories Migration

**Date:** {timestamp}

| Old ID | New ID | Title |
|--------|--------|-------|
| AUTH-01 | US001 | User Registration |
| AUTH-02 | US002 | User Login |
| DASH-01 | US003 | Dashboard Layout |
```

4. Update roadmap.md references:
   - Replace `**Requirements:** AUTH-01, AUTH-02`
   - With `**Delivers:** US001, US002`

5. Archive REQUIREMENTS.md:
   - Move to `.opti-gsd/archive/REQUIREMENTS.md.bak`

### Step 3: Migrate TODOS to FEATURES

If `.opti-gsd/TODOS.md` exists but `.opti-gsd/FEATURES.md` doesn't:

1. Rename TODOS.md to FEATURES.md
2. Update ID format (T001 → F001)
3. Update internal references

### Step 4: Commit Migration

```bash
git add .opti-gsd/stories/
git add .opti-gsd/migrations/
git add .opti-gsd/roadmap.md
git add .opti-gsd/archive/
git rm .opti-gsd/REQUIREMENTS.md 2>/dev/null || true
git commit -m "chore: migrate to stories-based workflow

- Converted {N} requirements to user stories
- Updated roadmap.md references
- Archived REQUIREMENTS.md"
```

### Step 5: Report

```markdown
## Migration Complete

**Converted:**
- {N} requirements → {N} user stories

**Files created:**
- .opti-gsd/stories/US001-*.md through US{N}-*.md

**Files archived:**
- .opti-gsd/archive/REQUIREMENTS.md.bak

**roadmap.md updated:**
- Replaced requirement references with story references

**Mapping preserved:**
- .opti-gsd/migrations/requirements-to-stories.md

Your project now uses the simplified workflow:
- Features (your enhancement ideas)
- Stories (user needs with acceptance criteria)
- Issues (bugs/problems)

Run /opti-gsd:stories to see your migrated stories.
```

---

## Context Budget

Minimal: ~5%
