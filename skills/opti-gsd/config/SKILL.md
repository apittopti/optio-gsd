---
name: config
description: Configure opti-gsd settings and integrations. Currently supports terminal statusline setup for Claude Code with Unicode progress bars.
disable-model-invocation: true
argument-hint: statusline
---

# config $ARGUMENTS

Configure opti-gsd settings.

## Usage

- `/opti-gsd:config statusline` — Configure terminal statusline

## Routing

Route based on first argument:

- `statusline` → Configure statusline integration

---

## Subcommand: statusline

Help the user set up the opti-gsd statusline integration for Claude Code.

### Your Task

1. Check if `.claude/settings.json` exists in the user's home directory
2. Show the user what the statusline will look like
3. Offer to configure it for them

### Statusline Preview

Show this example:
```
[Opus] gsd:2/4 [████▍░░░] v1.0 ctx:42%
        │       │          │    └─ context usage (shown if >60%)
        │       │          └─ milestone name
        │       └─ smooth progress bar (eighth-blocks)
        └─ current phase / total phases
```

### Configuration

The statusline script is located at:
```
~/.claude/scripts/opti-gsd/gsd-statusline.js
```

Add to `~/.claude/settings.json`:
```json
{
  "statusLine": {
    "type": "command",
    "command": "node ~/.claude/scripts/opti-gsd/gsd-statusline.js",
    "padding": 0
  }
}
```

### Steps

1. Check if `~/.claude/scripts/opti-gsd/gsd-statusline.js` exists. If not, inform the user to reinstall: `npx github:apittopti/opti-gsd init`
2. Read the user's current `~/.claude/settings.json` (create if missing)
3. Add or update the `statusLine` configuration
4. Inform user to restart Claude Code to see changes

### Platform Notes

- **All platforms**: Uses Node.js (required) - works on macOS, Linux, and Windows
- **Windows path**: May need `node "%USERPROFILE%\.claude\scripts\opti-gsd\gsd-statusline.js"`

### Fallback

If the user prefers not to modify settings, show them how to run:
```
/statusline show opti-gsd phase progress with a Unicode progress bar
```
