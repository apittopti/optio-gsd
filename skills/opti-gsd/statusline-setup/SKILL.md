---
name: statusline-setup
description: Configure Claude Code statusline to show opti-gsd progress.
disable-model-invocation: true
---

Help the user set up the opti-gsd statusline integration for Claude Code.

## Your Task

1. Check if `.claude/settings.json` exists in the user's home directory
2. Show the user what the statusline will look like
3. Offer to configure it for them

## Statusline Preview

Show this example:
```
[Opus] gsd:2/4 [████▍░░░] v1.0 ctx:42%
        │       │          │    └─ context usage (shown if >60%)
        │       │          └─ milestone name
        │       └─ smooth progress bar (eighth-blocks)
        └─ current phase / total phases
```

## Configuration

The statusline script is located at:
```
~/.claude-skills/optimotive-marketplace/opti-gsd/scripts/gsd-statusline.js
```

Add to `~/.claude/settings.json`:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude-skills/optimotive-marketplace/opti-gsd/scripts/gsd-statusline.js",
    "padding": 0
  }
}
```

## Steps

1. Read the user's current `~/.claude/settings.json` (create if missing)
2. Add or update the `statusLine` configuration
3. Inform user to restart Claude Code to see changes

## Platform Notes

- **All platforms**: Uses Node.js (required) - works on macOS, Linux, and Windows
- **Windows path**: May need `node "%USERPROFILE%\.claude-skills\optimotive-marketplace\opti-gsd\scripts\gsd-statusline.js"`

## Fallback

If the user prefers not to modify settings, show them how to run:
```
/statusline show opti-gsd phase progress with a Unicode progress bar
```
