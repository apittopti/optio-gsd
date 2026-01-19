# Roadmap: v0.8.1 [COMPLETE]

## Overview
Bug fix release to resolve plugin path resolution issues in help and whats-new commands.

## Milestone: v0.8.1 [COMPLETE]

### Phase 1: Fix Plugin Path Resolution [COMPLETE]
**Goal:** Use `${CLAUDE_PLUGIN_ROOT}` for reliable plugin file access

**Problem:** Commands like `/opti-gsd:help` search multiple directories before finding `plugin.json`, causing errors and noise.

**Solution:** Update commands to use `${CLAUDE_PLUGIN_ROOT}` variable which Claude Code provides to plugins.

**Files:**
- `commands/help.md` - Update plugin.json path references
- `commands/whats-new.md` - Update plugin.json path reference

**Acceptance Criteria:**
- [x] Help command reads plugin.json without directory search errors
- [x] Whats-new command reads plugin.json without directory search errors
- [x] Both commands use `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`
