---
name: whats-new
description: Check for updates and show recent changes to opti-gsd.
disable-model-invocation: true
---

# whats-new

Check for updates and show recent changes to opti-gsd.

## Behavior

### Step 1: Show Current Version

Read from `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`:

```markdown
## opti-gsd Status

**Installed Version:** 0.1.0
**Plugin Location:** {path}
```

### Step 2: Check for Updates

If network available, check for newer version:
- Check npm registry (if published)
- Check GitHub releases
- Compare semantic versions

```markdown
## Update Available

**Current:** 0.1.0
**Latest:** 0.2.0

### What's New in 0.2.0

- Added /opti-gsd:todos command for quick task capture
- Improved context efficiency in execute phase
- Fixed bug in phase renumbering
- New `opti-gsd-integration-checker` agent

### Upgrade

```bash
# If installed via npm
npm update opti-gsd -g

# If installed via git
cd {plugin_path} && git pull
```
```

If no update:
```markdown
## You're Up to Date

**Version:** 0.1.0 (latest)

No updates available.
```

### Step 3: Show Changelog

Display recent changes:

```markdown
## Recent Changes

### Version 0.1.0 (Current)
- Initial release
- 24 commands for full workflow
- 11 specialized agents
- XML task format for better parsing
- Context-efficient execution

### Coming Soon
- Stack-specific guides
- MCP integrations
- Team collaboration features
```

### Step 4: Show Tips

```markdown
## Tips

### New in This Version
- Use /opti-gsd:mode yolo for faster execution
- Try /opti-gsd:context to monitor token usage
- /opti-gsd:compact saves ~70% context on large projects

### Did You Know?
- Phases can run in parallel waves
- Each task gets fresh context (no pollution)
- Archive completed phases to save tokens

### Get Help
- All commands: /opti-gsd:help
- Report issues: {github_url}
```

---

## Offline Behavior

If no network:
```markdown
## opti-gsd v0.1.0

**Status:** Offline - cannot check for updates

### Local Changelog
{Show from local changelog.md if exists}

Check manually: {github_url}/releases
```

---

## Context Budget

Minimal: ~2%
