# Feature: Add and Manage Feature Ideas

Capture a feature idea for later without interrupting current work.

**Note:** For bugs/problems, use `/opti-gsd:track issue` instead.

## Arguments

- `description` -- Brief description of the feature

## Procedure

### Step 1: Validate Input

If no description:
```markdown
## Add Feature

Please provide a description:
/opti-gsd:track feature Add caching layer for API responses
```

### Step 2: Categorize Feature

Analyze description and assign category:

| Category | Triggers | Example |
|----------|----------|---------|
| enhancement | "add", "implement", "create", "new" | Add dark mode toggle |
| improvement | "improve", "optimize", "better" | Improve load time |
| refactor | "refactor", "clean", "reorganize" | Refactor auth module |
| docs | "document", "readme", "comment" | Document API endpoints |
| test | "test", "coverage", "spec" | Add tests for user service |
| exploration | (default) | Consider caching strategy |

### Step 3: Determine Priority

Based on keywords:

| Priority | Triggers |
|----------|----------|
| high | "urgent", "critical", "important", "asap" |
| medium | "should", "needed", "would be nice" |
| low | (default) |

### Step 4: Create Feature File

Create `.opti-gsd/features/F{NNN}.md`:

```markdown
# F{NNN}: {description}

**Added:** {timestamp}
**Category:** {category}
**Priority:** {priority}
**Status:** pending

## Description
{description}

## Notes
(none yet)
```

If `.opti-gsd/features/` doesn't exist, create the directory first.

### Step 5: Confirm (No Commit)

Features are lightweight - no commit needed:

```markdown
## Feature Captured

**F{NNN}:** {description}
**Category:** {category}
**Priority:** {priority}

View all: /opti-gsd:track list features
Continue working - features are saved automatically.
```

## Quick Capture Examples

```
/opti-gsd:track feature Add loading states to dashboard
/opti-gsd:track feature Refactor database connection pooling
/opti-gsd:track feature Consider Redis for session storage
/opti-gsd:track feature important: Add export functionality
```

## Feature File Format

Each feature is stored in `.opti-gsd/features/F{NNN}.md`:

```markdown
# F{NNN}: {title}

**Added:** {date}
**Category:** {enhancement|improvement|refactor|docs|test|exploration}
**Priority:** {high|medium|low}
**Status:** {pending|completed|promoted}

## Description
{what the feature is}

## Notes
{additional context}

## Completion
**Completed:** {date, if applicable}
**Promoted to:** {US{NNN}, if promoted}
```

---

## Additional Feature Actions

### Promote Feature to Story

Convert a feature into a user story (for formal tracking with acceptance criteria):

```markdown
## Promote Feature F{id}

**F{id}:** {description}

This will create a user story in `.opti-gsd/stories/` with formal acceptance criteria.

Confirm? (yes/no)
```

On confirm:
- Create story in `.opti-gsd/stories/US{NNN}.md`
- Prompt for acceptance criteria
- Update feature file status to `promoted`

```markdown
## Feature Promoted

**F{id}** -> **US{NNN}**

The feature is now a tracked user story.
Add to milestone via /opti-gsd:roadmap
```

### Delete Feature

Remove a feature entirely:

```markdown
## Delete Feature F{id}?

**F{id}:** {description}
**Status:** {status}
**Added:** {date}

This cannot be undone. Confirm? (yes/no)
```

On confirm, delete `.opti-gsd/features/F{id}.md`.

### Clear Completed Features

Remove all completed features:

```markdown
## Clear Completed Features?

This will remove {count} completed features:
- F001: Setup ESLint config
- F002: Add TypeScript strict mode
- F004: Document env variables
- F006: Improve header styling

Confirm? (yes/no)
```

On confirm:
- Move completed feature files to `.opti-gsd/archive/features/`
- Keep reference in archive index

```markdown
## Completed Features Cleared

Archived {count} items to `.opti-gsd/archive/features-{date}.md`
Remaining: {pending_count} pending features
```
