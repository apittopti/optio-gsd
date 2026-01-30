# Story: Add and Manage User Stories

Capture a user or client request as a story.

## Arguments

- `title` -- Brief title for the story (optional, will prompt if missing)

## Procedure

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
View all stories: /opti-gsd:track list stories
```

## Quick Capture Mode

For rapid capture, provide details inline:

```
/opti-gsd:track story Export to Excel --from "Client A" --why "Share with finance team"
```

Will prompt only for acceptance criteria.

## Examples

```
/opti-gsd:track story Dashboard export feature
/opti-gsd:track story Dark mode toggle
/opti-gsd:track story "Faster search results" --from "User survey"
```

## Story Directory Structure

```
.opti-gsd/stories/
  US001-export-to-excel.md
  US002-dark-mode.md
  US003-faster-search.md
```

## Story File Format

```markdown
# US{NNN}: {title}

**From:** {source}
**Requested:** {date}
**Status:** backlog | planned | in_progress | delivered

## Request
{what they want in their words}

## Why
{why they need it - the problem it solves}

## Acceptance Criteria
- [ ] {criterion 1}
- [ ] {criterion 2}
- [ ] {criterion 3}

## Milestone
{milestone version or "Not yet assigned"}

## Phase
{phase number or "Not yet assigned"}

## Notes
{additional context, history, related items}

## Delivery
**Delivered:** {date}
**Version:** {milestone}
```

---

## Additional Story Actions

### Edit Story

Open story for editing. Update fields as needed:

```markdown
## Edit Story US{NNN}

Current values shown. Provide new values or press Enter to keep.

**Title:** [Export to Excel]
**From:** [Client A]
**Status:** [planned]

**Acceptance Criteria:**
1. [Export button visible on dashboard]
2. [Downloads as .xlsx format]
3. [Includes all visible columns]
4. [Add new criterion...]

Save changes? (yes/no)
```

### Archive Delivered Stories

Move delivered stories to archive:

```markdown
## Archive Delivered Stories?

This will archive {count} delivered stories:
- US000: User login (v1.0.0)
- US001: Export to Excel (v1.2.0)
- US002: Dark mode (v1.2.0)

Stories will be moved to `.opti-gsd/archive/stories/`

Confirm? (yes/no)
```

On confirm:
- Move to `.opti-gsd/archive/stories/`
- Keep reference in archive index
