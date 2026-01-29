---
name: add-story
description: Capture a user or client request as a story.
---

# add-story [title]

Capture a user or client request as a story.

## Arguments

- `title` — Brief title for the story (optional, will prompt if missing)

## Behavior

### Step 1: Gather Story Details

If title not provided, prompt for it:
```markdown
## New User Story

What's the request? (brief title)
```

Then gather details via prompts:

```markdown
## Story: {title}

**Who requested this?**
- Client name, user feedback, support ticket, etc.

**What do they want?** (in their words)
- Capture the request as they described it

**Why do they need it?**
- What problem does this solve for them?

**How will we know it's done?** (acceptance criteria)
- List specific, testable outcomes
```

### Step 2: Create Story File

Write to `.opti-gsd/stories/US{NNN}-{slug}.md`:

```markdown
# US{NNN}: {title}

**From:** {source}
**Requested:** {date}
**Status:** backlog

## Request
{what they want in their words}

## Why
{why they need it}

## Acceptance Criteria
- [ ] {criterion 1}
- [ ] {criterion 2}
- [ ] {criterion 3}

## Milestone
Not yet assigned

## Notes
{any additional context}
```

### Step 3: Confirm

```markdown
## Story Captured

**US{NNN}:** {title}
**From:** {source}

Acceptance criteria:
- {criterion 1}
- {criterion 2}
- {criterion 3}

Add to milestone: /opti-gsd:roadmap
View all stories: /opti-gsd:stories
```

---

## Quick Capture Mode

For rapid capture, provide details inline:

```
/opti-gsd:add-story Export to Excel --from "Client A" --why "Share with finance team"
```

Will prompt only for acceptance criteria.

---

## Examples

```
/opti-gsd:add-story Dashboard export feature
/opti-gsd:add-story Dark mode toggle
/opti-gsd:add-story "Faster search results" --from "User survey"
```

---

## STORIES Directory Structure

```
.opti-gsd/stories/
  US001-export-to-excel.md
  US002-dark-mode.md
  US003-faster-search.md
```

---

## Context Budget

Minimal: ~3%
