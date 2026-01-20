# Roadmap: v0.8.2 [COMPLETE]

## Overview
Bug fix release to fix stop hook path resolution error.

## Milestone: v0.8.2 [COMPLETE]

### Phase 1: Fix Stop Hook Path [COMPLETE]
**Goal:** Fix stop hook to use correct path variable

**Problem:** The stop hook uses `$CLAUDE_PROJECT_DIR/hooks/stop-hook.sh` but the hook script is in the plugin directory, not the user's project. This causes "No such file or directory" errors in every Claude Code session.

**Solution:** Update hooks.json to use `$CLAUDE_PLUGIN_ROOT` instead of `$CLAUDE_PROJECT_DIR`.

**Files:**
- `hooks/hooks.json` - Fix path variable

**Acceptance Criteria:**
- [x] Stop hook uses `${CLAUDE_PLUGIN_ROOT}/hooks/stop-hook.sh`
- [x] No "No such file or directory" errors in non-opti-gsd projects
- [x] Hook still works correctly in opti-gsd projects with active loops
