---
name: issues
description: Track and manage project issues.
disable-model-invocation: true
---

# issues [action] [args...]

Track and manage project issues.

## Actions

- (no args) — List open issues
- `add` — Log a new issue
- `view [id]` — View issue details
- `resolve [id]` — Mark issue as resolved
- `all` — Show all issues including resolved

## Behavior

### List Issues (no args)

Read `.opti-gsd/issues/` directory and show open issues:

```markdown
## Open Issues

| ID | Severity | Title | Phase | Age |
|----|----------|-------|-------|-----|
| I003 | high | Auth tokens not refreshing | 3 | 2d |
| I005 | medium | Dashboard layout shift | 4 | 1d |
| I006 | low | Typo in error message | 4 | 4h |

Open: 3 | Resolved: 2 | Total: 5

View details: /opti-gsd:issues view I003
Add new: /opti-gsd:issues add
```

### Add Issue

Prompt for issue details:

```markdown
## Log New Issue

Please provide:

1. **Title:** (brief description)
2. **Severity:** (critical, high, medium, low)
3. **Description:** (what's happening?)
4. **Reproduction:** (steps to reproduce, if applicable)
5. **Impact:** (what does this block or affect?)
```

Create `.opti-gsd/issues/ISS{NNN}.md`:

```markdown
# ISS{NNN}: {Title}

**Status:** open
**Severity:** {severity}
**Logged:** {timestamp}
**Phase:** {current_phase}

## Description
{description}

## Reproduction
{steps}

## Impact
{impact}

## Resolution
(pending)
```

Update state.json `open_issues` array.

Commit:
```bash
git add .opti-gsd/issues/ISS{NNN}.md .opti-gsd/state.json
git commit -m "issue: log ISS{NNN} - {title}"
```

### View Issue

Display full issue details:

```markdown
## I{NNN}: {Title}

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

### Resolve Issue

Mark issue as resolved:

```markdown
## Resolve Issue I{NNN}

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

### Show All Issues

Display both open and resolved:

```markdown
## All Issues

### Open (3)
| ID | Severity | Title | Age |
|----|----------|-------|-----|
| I003 | high | Auth tokens not refreshing | 2d |
| I005 | medium | Dashboard layout shift | 1d |
| I006 | low | Typo in error message | 4h |

### Resolved (2)
| ID | Title | Resolved |
|----|-------|----------|
| I001 | Build failing on CI | 2026-01-14 |
| I002 | Missing env vars | 2026-01-15 |

Total: 5 issues (3 open, 2 resolved)
```

---

## Issue File Format

Each issue is stored in `.opti-gsd/issues/ISS{NNN}.md`:

```markdown
# ISS{NNN}: {Title}

**Status:** {open|resolved}
**Severity:** {critical|high|medium|low}
**Logged:** {date}
**Phase:** {phase number}

## Description
{what's happening}

## Reproduction
{steps to reproduce}

## Impact
{what does this block or affect}

## Resolution
{how it was fixed, if resolved}

**Resolved:** {date, if resolved}
**Resolved by:** {commit hash, if resolved}
```

---

## Severity Guide

| Level | Definition | Response |
|-------|------------|----------|
| critical | Blocks all work | Fix immediately |
| high | Blocks phase completion | Fix before phase end |
| medium | Causes problems | Fix this milestone |
| low | Minor inconvenience | Fix when convenient |

---

## The Three Tracking Systems

| Tracking | Purpose | Command | Directory |
|----------|---------|---------|-----------|
| **Issues** | Bugs, problems, things broken | /opti-gsd:issues | `.opti-gsd/issues/` |
| **Features** | Ideas for improvements (internal) | /opti-gsd:features | `.opti-gsd/features/` |
| **Stories** | User/client requests (external) | /opti-gsd:stories | `.opti-gsd/stories/` |

**Note:** For feature ideas, use /opti-gsd:add-feature instead.

---

## Context Budget

- List: ~2%
- Add: ~5%
- Resolve: ~5%
- View: ~3%
