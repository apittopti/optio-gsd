# Decision: Record Architectural Decisions

Record an architectural decision with context, alternatives, and consequences.

## Arguments

- `description` -- Brief description of the decision (optional, will prompt if missing)

## Procedure

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

## Additional Decision Actions

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

View details: /opti-gsd:track view D001
```
