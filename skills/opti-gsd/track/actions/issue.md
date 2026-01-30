# Issue: Log and Track Issues/Bugs

Log and track a project issue or bug.

## Arguments

- `description` -- Brief description of the issue (optional, will prompt if missing)

## Procedure

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

## Severity Guide

| Level | Definition | Response |
|-------|------------|----------|
| critical | Blocks all work | Fix immediately |
| high | Blocks phase completion | Fix before phase end |
| medium | Causes problems | Fix this milestone |
| low | Minor inconvenience | Fix when convenient |
