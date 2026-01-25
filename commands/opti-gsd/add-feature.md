---
description: Capture a feature idea without interrupting current work.
---

# add-feature [description]

Capture a feature idea for later without interrupting current work.

**Note:** For bugs/problems, use /opti-gsd:issues add instead.

## Arguments

- `description` — Brief description of the feature

## Behavior

### Step 1: Validate Input

If no description:
```markdown
## Add Feature

Please provide a description:
/opti-gsd:add-feature Add caching layer for API responses
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

### Step 4: Add to FEATURES.md

Append to `.opti-gsd/FEATURES.md`:

```markdown
### F{NNN}: {description}

- **Added:** {timestamp}
- **Category:** {category}
- **Priority:** {priority}
- **Status:** pending

---
```

If FEATURES.md doesn't exist, create it:

```markdown
# Feature Backlog

Quick capture for feature ideas to explore later.
For bugs/problems, see ISSUES.md instead.

---

## Pending

### F001: {description}
...
```

### Step 5: Confirm (No Commit)

Features are lightweight - no commit needed:

```markdown
## Feature Captured

**F{NNN}:** {description}
**Category:** {category}
**Priority:** {priority}

View all: /opti-gsd:features
Continue working - features are saved automatically.
```

---

## Quick Capture Examples

```
/opti-gsd:add-feature Add loading states to dashboard
/opti-gsd:add-feature Refactor database connection pooling
/opti-gsd:add-feature Consider Redis for session storage
/opti-gsd:add-feature important: Add export functionality
```

---

## When to Use Each Tracking Command

| What You Have | Command | Stored In |
|---------------|---------|-----------|
| Bug or problem | /opti-gsd:issues add | ISSUES.md |
| Feature idea (internal) | /opti-gsd:add-feature | FEATURES.md |
| User/client request | /opti-gsd:add-story | stories/ |

---

## Context Budget

Minimal: ~2%
