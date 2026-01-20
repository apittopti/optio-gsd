# Changelog: v0.8.2

## Summary
Bug fix release that resolves stop hook path resolution errors occurring in all Claude Code sessions.

## Fixes
- **Fixed:** Stop hook no longer errors with "No such file or directory" in every session
- **Fixed:** Hook now correctly references the plugin directory using `$CLAUDE_PLUGIN_ROOT`

## Technical
- Updated `hooks/hooks.json` to use `$CLAUDE_PLUGIN_ROOT` instead of `$CLAUDE_PROJECT_DIR`
- The hook script is part of the plugin, not the user's project, so it must be referenced relative to the plugin root

## Files Changed
- `hooks/hooks.json`
- `.claude-plugin/plugin.json` (version bump)
- `.claude-plugin/marketplace.json` (version bump)
