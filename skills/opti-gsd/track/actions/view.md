# View: Display Item Details

View full details of a tracked item by ID.

## Arguments

- `id` -- Item ID (e.g., F003, US001, ISS005, D001)

## Routing

Route based on ID prefix:

| Prefix | Type | Source |
|--------|------|--------|
| F | Feature | `.opti-gsd/features/F{NNN}.md` |
| US | Story | `.opti-gsd/stories/US{NNN}-*.md` |
| ISS or I | Issue | `.opti-gsd/issues/ISS{NNN}.md` |
| D | Decision | `.opti-gsd/decisions.md` (section) |

---

## View Feature

```markdown
## F{NNN}: {title}

**Added:** {date}
**Category:** {category}
**Priority:** {priority}
**Status:** {status}

### Description
{description}

### Notes
{notes}
```

---

## View Story

```markdown
## US{NNN}: {title}

**From:** {source}
**Requested:** {date}
**Status:** {status}
**Milestone:** {milestone}
**Phase:** {phase}

### Request
{request in their words}

### Why
{why they need it}

### Acceptance Criteria
- [ ] {criterion 1}
- [ ] {criterion 2}
- [ ] {criterion 3}

### Notes
{notes}

---
Actions:
- Edit: /opti-gsd:track story edit US{NNN}
- Mark delivered: /opti-gsd:track resolve US{NNN}
```

---

## View Issue

```markdown
## ISS{NNN}: {Title}

**Status:** {status}
**Severity:** {severity}
**Logged:** {date} ({age} ago)
**Phase:** {phase}

### Description
{description}

### Reproduction Steps
{steps}

### Impact
{impact}

### Resolution
{resolution or "Pending"}

### Related
- Debug session: {if any}
- Commit: {if resolved}
```

---

## View Decision

```markdown
## D{NNN}: {Title}

**Recorded:** {date}
**Category:** {category}
**Phase:** {phase}

### Context
{context}

### Decision
{decision}

### Alternatives Considered
{alternatives}

### Consequences
{consequences}
```
