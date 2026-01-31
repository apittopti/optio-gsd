# opti-gsd: Migration from npx Install to Claude Code Plugin

## Current State (npx install)

```
User runs: npx github:apittopti/opti-gsd init
Result: Files copied to ~/.claude/ or ./.claude/
```

**Problems with this approach:**
- **No auto-updates** — User must re-run npx to get updates
- **No marketplace discovery** — Users can't find opti-gsd through Claude Code's plugin system
- **Manual management** — Install/uninstall is a separate CLI step outside Claude Code
- **Version confusion** — No way to check if installed version matches latest
- **Conflict risk** — Copies files into shared `.claude/` directory alongside other tools

## Target State (Claude Code Plugin)

```
User runs: /plugin marketplace add apittopti/opti-gsd
Then:      /plugin install opti-gsd
Result:    Plugin managed by Claude Code with auto-updates
```

**Benefits:**
- Install/update/remove from inside Claude Code
- Auto-update support
- Marketplace discoverability
- Namespaced commands (`/opti-gsd:*`) — already our pattern
- Version management built in
- Clean install/uninstall

---

## Migration Plan

### Phase 1: Add Plugin Manifest (Non-Breaking)

Create `.claude-plugin/plugin.json` at the repo root:

```json
{
  "name": "opti-gsd",
  "description": "Spec-driven development with fresh context execution — plan, execute, review, verify",
  "version": "2.5.0",
  "author": {
    "name": "apittopti",
    "url": "https://github.com/apittopti"
  },
  "homepage": "https://github.com/apittopti/opti-gsd",
  "repository": "https://github.com/apittopti/opti-gsd",
  "license": "MIT",
  "keywords": [
    "workflow",
    "tdd",
    "planning",
    "execution",
    "development"
  ]
}
```

**File structure change:** The repo already has the right directory structure. Claude Code plugins expect:

```
repo-root/
├── .claude-plugin/
│   └── plugin.json          ← NEW (manifest)
├── commands/
│   └── opti-gsd/            ← ALREADY EXISTS (40+ command files)
├── agents/
│   └── opti-gsd/            ← ALREADY EXISTS (11 agent files)
├── skills/
│   └── opti-gsd/            ← NEEDS CREATION (convert key commands to skills)
├── hooks/
│   └── hooks.json           ← ALREADY EXISTS
├── docs/
│   └── opti-gsd/            ← ALREADY EXISTS
├── CLAUDE.md                ← ALREADY EXISTS
└── package.json             ← KEEP for npx backward compat
```

**Key insight:** The repo structure is already 90% there. Commands, agents, hooks, and docs are in the right directories. We just need the plugin manifest.

### Phase 2: Create the Marketplace

Create a separate repo OR use this repo as both plugin AND marketplace.

**Option A: Separate marketplace repo** (recommended by Superpowers)
```
apittopti/opti-gsd-marketplace/
├── .claude-plugin/
│   └── marketplace.json
└── README.md
```

`marketplace.json`:
```json
{
  "name": "opti-gsd-marketplace",
  "owner": {
    "name": "apittopti",
    "url": "https://github.com/apittopti"
  },
  "plugins": [
    {
      "name": "opti-gsd",
      "source": "https://github.com/apittopti/opti-gsd",
      "description": "Spec-driven development with fresh context execution",
      "version": "2.5.0"
    }
  ]
}
```

**Option B: Self-contained marketplace** (simpler, single repo)
Add marketplace.json alongside plugin.json:
```
apittopti/opti-gsd/
├── .claude-plugin/
│   ├── plugin.json
│   └── marketplace.json
```

Users would add the marketplace and install in one flow:
```
/plugin marketplace add apittopti/opti-gsd
/plugin install opti-gsd
```

**Recommendation: Start with Option B** (self-contained). Split into separate marketplace repo later if you add more plugins.

### Phase 3: Convert Key Commands to Skills

Skills are **model-invoked** (Claude uses them automatically based on context). Commands are **user-invoked** (user types `/opti-gsd:command`).

Some commands should be BOTH — available as slash commands AND as skills that Claude can auto-invoke:

| Current Command | Also Make Skill? | Reasoning |
|----------------|-----------------|-----------|
| status.md | Yes | Claude should auto-check status |
| execute.md | No | User should explicitly trigger |
| review.md | No | User should explicitly trigger |
| verify.md | No | User should explicitly trigger |
| debug.md | Yes | Claude should auto-invoke on errors |
| add-feature.md | Yes | Claude can capture features during discussion |
| add-story.md | Yes | Claude can capture stories during discussion |

For each skill, create `skills/opti-gsd/{skill-name}/SKILL.md`:

```markdown
---
description: Check current opti-gsd project state and suggest next action
trigger: When the user asks about project status, progress, or what to do next
---

[skill instructions here — same content as command, but with trigger context]
```

### Phase 4: Update Installation Flow

**Keep both installation methods during transition:**

1. **Plugin (new way):**
   ```
   /plugin marketplace add apittopti/opti-gsd
   /plugin install opti-gsd
   ```

2. **npx (legacy, still works):**
   ```
   npx github:apittopti/opti-gsd init
   ```

**Update cli.js** to detect if Claude Code supports plugins and suggest the plugin method:
```
If plugin system detected:
  "Consider installing as a plugin instead:
   /plugin marketplace add apittopti/opti-gsd"
```

### Phase 5: Version Synchronization

**Single source of truth:** Keep version in `package.json` AND `.claude-plugin/plugin.json`.

Update `complete-milestone.md` to update BOTH version files when completing a milestone.

Or better: have `plugin.json` read from `package.json` at build time. But since plugins are just git repos, the simplest approach is to keep both in sync manually (the milestone command already updates package.json — add plugin.json to that step).

---

## What Changes for the User

### Before (npx):
```bash
# Install
npx github:apittopti/opti-gsd init --global

# Update
npx github:apittopti/opti-gsd init --global  # same command

# Uninstall
npx github:apittopti/opti-gsd uninstall --global

# Must be done outside Claude Code in a regular terminal
```

### After (plugin):
```
# In Claude Code:
/plugin marketplace add apittopti/opti-gsd
/plugin install opti-gsd

# Update (automatic, or manual):
/plugin update opti-gsd

# Uninstall:
/plugin uninstall opti-gsd

# All done inside Claude Code
```

---

## What Changes in the Codebase

### New Files:
1. `.claude-plugin/plugin.json` — Plugin manifest
2. `.claude-plugin/marketplace.json` — Marketplace catalog (if self-contained)
3. `skills/opti-gsd/status/SKILL.md` — Auto-invoked status skill
4. `skills/opti-gsd/debug/SKILL.md` — Auto-invoked debug skill
5. `skills/opti-gsd/add-feature/SKILL.md` — Auto-invoked feature capture
6. `skills/opti-gsd/add-story/SKILL.md` — Auto-invoked story capture

### Modified Files:
1. `package.json` — Add plugin-related metadata
2. `CLAUDE.md` — Update installation instructions
3. `README.md` — Update installation instructions
4. `commands/opti-gsd/complete-milestone.md` — Update both version files
5. `commands/opti-gsd/help.md` — Show plugin install method
6. `commands/opti-gsd/whats-new.md` — Plugin update awareness
7. `bin/cli.js` — Suggest plugin install, keep as fallback

### Files to Keep (backward compat):
1. `bin/cli.js` — npx still works as fallback
2. `package.json` — npm/npx entry point

### Files NOT Needed:
- No `skills/` directory currently exists — needs creation
- No build step needed — plugins are just git repos with the right structure

---

## Hooks Integration

The existing `hooks/hooks.json` already uses `${CLAUDE_PLUGIN_ROOT}` which is a plugin-aware environment variable:

```json
{
  "hooks": [
    {
      "event": "PostToolUse",
      "command": "node \"${CLAUDE_PLUGIN_ROOT}/scripts/log-tool-usage.js\" || true"
    }
  ]
}
```

This means **hooks already work in plugin mode**. No changes needed.

---

## Implementation Order

1. **Create `.claude-plugin/plugin.json`** — Makes repo installable as plugin immediately
2. **Create `.claude-plugin/marketplace.json`** — Makes repo a self-contained marketplace
3. **Test installation** — `/plugin marketplace add apittopti/opti-gsd` → `/plugin install opti-gsd`
4. **Create initial skills** — status, debug, add-feature, add-story
5. **Update docs** — README, help.md, CLAUDE.md with new install method
6. **Update complete-milestone** — Sync both version files
7. **Update cli.js** — Suggest plugin method, keep as fallback
8. **Update README** — Plugin as primary, npx as alternative

---

## Versioning Strategy

- **Git tags**: `v2.5.0`, `v2.6.0`, etc.
- **plugin.json version**: Must match package.json
- **Marketplace version**: Updated when plugin version changes
- **Auto-updates**: Users can enable via `/plugin marketplace enable-autoupdate opti-gsd-marketplace`
- **Breaking changes**: MAJOR version bump, changelog in `/opti-gsd:whats-new`

## Timeline

- Phase 1 (plugin manifest): Can be done immediately — single file creation
- Phase 2 (marketplace): Same session as Phase 1
- Phase 3 (skills): Follow-up — requires deciding which commands become skills
- Phase 4 (dual install): Update docs and cli.js
- Phase 5 (version sync): Update milestone command
