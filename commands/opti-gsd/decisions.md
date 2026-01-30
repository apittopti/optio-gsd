---
description: Manage architectural decisions.
---

# decisions [action] [args...]

Manage architectural decisions.

## Actions

- (no args) — List all decisions
- `add` — Record a new decision
- `view [id]` — View decision details
- `search [query]` — Search decisions

## Behavior

### List Decisions (no args)

Read `.opti-gsd/decisions.md` and display summary:

```markdown
## Decisions

| ID | Date | Decision | Category |
|----|------|----------|----------|
| D001 | 2026-01-15 | jose > jsonwebtoken | Auth |
| D002 | 2026-01-16 | Zustand for state | State |
| D003 | 2026-01-16 | Feature-based folders | Structure |

Total: 3 decisions

View details: /opti-gsd:decisions view D001
Add new: /opti-gsd:decisions add
```

### Add Decision

Prompt for decision details:

```markdown
## Record Decision

Please provide:

1. **Title:** (brief name, e.g., "Use jose for JWT")
2. **Category:** (Auth, State, Structure, API, UI, Testing, Other)
3. **Context:** (Why was this decision needed?)
4. **Decision:** (What was decided?)
5. **Alternatives:** (What else was considered?)
6. **Consequences:** (What are the implications?)
```

After input, append to `.opti-gsd/decisions.md`:

```markdown
### D{NNN}: {Title}

**Date:** {timestamp}
**Category:** {category}
**Phase:** {current_phase or "Pre-planning"}

**Context:**
{context}

**Decision:**
{decision}

**Alternatives Considered:**
- {alt1}
- {alt2}

**Consequences:**
- {consequence1}
- {consequence2}

---
```

Commit:
```bash
git add .opti-gsd/decisions.md
git commit -m "doc: decision D{NNN} - {title}"
```

### View Decision

Read and display specific decision:

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

### Search Decisions

Search decisions by keyword:

```markdown
## Search Results: "{query}"

Found 2 matching decisions:

### D001: jose > jsonwebtoken
Matched in: Title, Decision
Preview: "Use jose for JWT handling because..."

### D005: JWT refresh token strategy
Matched in: Context
Preview: "Need to handle token refresh for..."

View details: /opti-gsd:decisions view D001
```

---

## decisions.md Format

```markdown
# Decisions Log

## Summary

Quick reference for all architectural decisions.

| ID | Decision | Category | Date |
|----|----------|----------|------|
| D001 | jose > jsonwebtoken | Auth | 2026-01-15 |

---

## Decisions

### D001: jose > jsonwebtoken

**Date:** 2026-01-15
**Category:** Auth
**Phase:** Phase 2

**Context:**
Needed JWT library for authentication.

**Decision:**
Use jose instead of jsonwebtoken.

**Alternatives Considered:**
- jsonwebtoken (most popular)
- jose (ESM native)

**Consequences:**
- ESM compatible out of the box
- Smaller bundle size
- Better TypeScript support

---
```

---

## Context Budget

- List: ~2%
- Add: ~5%
- View/Search: ~3%
