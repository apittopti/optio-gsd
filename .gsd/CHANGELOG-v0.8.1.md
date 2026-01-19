# Changelog: v0.8.1

## Summary
Bug fix release that resolves plugin path resolution issues in the help and whats-new commands.

## Fixes
- **Fixed:** `/opti-gsd:help` no longer searches multiple directories before finding plugin.json
- **Fixed:** `/opti-gsd:whats-new` no longer searches multiple directories before finding plugin.json

## Technical
- Updated `commands/help.md` to use `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`
- Updated `commands/whats-new.md` to use `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`
- `${CLAUDE_PLUGIN_ROOT}` is a variable provided by Claude Code that resolves to the plugin's installation directory

## Files Changed
- `commands/help.md`
- `commands/whats-new.md`
- `.claude-plugin/plugin.json` (version bump)
- `.claude-plugin/marketplace.json` (version bump)
