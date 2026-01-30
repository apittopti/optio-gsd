# Resolve: Close Tracked Items

Resolve or close a tracked item.

## Arguments

- `id` -- Item ID (e.g., F003, US001, ISS005)

Route based on ID prefix to determine resolution flow.

---

## Resolve Issue (ISS/I prefix)

```markdown
## Resolve Issue ISS{NNN}

Please provide:

1. **Resolution:** (how was it fixed?)
2. **Commit:** (commit hash if applicable)
3. **Verified:** (yes/no - has fix been verified?)
```

Update `.opti-gsd/issues/ISS{NNN}.md`:

```markdown
# ISS{NNN}: {Title}

**Status:** resolved
**Severity:** {severity}
**Logged:** {date}
**Resolved:** {timestamp}
**Phase:** {phase}

## Description
{description}

## Resolution
{resolution}

**Resolved by:** {commit}
```

Remove from state.json `open_issues`.

Commit:
```bash
git add .opti-gsd/issues/ISS{NNN}.md .opti-gsd/state.json
git commit -m "fix: resolve ISS{NNN} - {title}"
```

---

## Deliver Story (US prefix)

```markdown
## Deliver Story US{NNN}?

**US{NNN}:** {title}
**From:** {source}
**Milestone:** {milestone}

### Acceptance Criteria Check
- [x] {criterion 1}
- [x] {criterion 2}
- [x] {criterion 3}

All criteria met? Mark as delivered? (yes/no)
```

On confirm:
- Update story status to `delivered`
- Add delivery date and milestone
- Optionally archive

```markdown
## Story Delivered

**US{NNN}:** {title}
**Delivered in:** {milestone}
**Date:** {date}

{source}'s request has been fulfilled.
```

---

## Complete Feature (F prefix)

Mark a feature as done (handled outside of milestone workflow):

```markdown
## Complete Feature F{id}

**F{id}:** {description}

Marked as complete.

Remaining: {count} pending features
```

Update feature file - change status to `completed`.
