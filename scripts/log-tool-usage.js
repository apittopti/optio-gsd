#!/usr/bin/env node
/**
 * Tool Usage Logger for opti-gsd
 *
 * Receives tool call data via stdin (JSON) and appends entries to
 * .opti-gsd/tool-usage.json for workflow analytics.
 *
 * Usage: echo '{"tool_name":"Read"}' | node scripts/log-tool-usage.js
 *
 * Always exits 0 to avoid breaking hook execution.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Session timeout in milliseconds (30 minutes)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Find .opti-gsd directory by walking up from cwd
 */
function findOptiGsdDir() {
  let dir = process.cwd();
  const root = path.parse(dir).root;

  while (dir !== root) {
    const candidate = path.join(dir, '.opti-gsd');
    if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
      return candidate;
    }
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * Read current task from state.json if available
 */
function getCurrentTask(optiGsdDir) {
  try {
    const statePath = path.join(optiGsdDir, 'state.json');
    if (!fs.existsSync(statePath)) {
      return null;
    }

    const stateData = JSON.parse(fs.readFileSync(statePath, 'utf8'));

    // Check for current_task in loop
    if (stateData.loop && stateData.loop.current_task) {
      return stateData.loop.current_task;
    }

    // Fallback: check background_tasks for a single running task
    if (stateData.loop && stateData.loop.background_tasks) {
      const running = stateData.loop.background_tasks.filter(t => t.status === 'running');
      if (running.length === 1) {
        return running[0].task_num || null;
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Atomic write: write to temp file then rename
 */
function atomicWrite(filePath, data) {
  const tempPath = filePath + '.tmp.' + process.pid + '.' + Date.now();
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempPath, filePath);
}

/**
 * Main logging function
 */
async function logToolUsage() {
  // Read stdin
  let input = '';
  for await (const chunk of process.stdin) {
    input += chunk;
  }

  if (!input.trim()) {
    return; // No input, silently exit
  }

  // Parse input JSON
  const hookData = JSON.parse(input);
  const toolName = hookData.tool_name;

  if (!toolName) {
    return; // No tool name, silently exit
  }

  // Find .opti-gsd directory
  const optiGsdDir = findOptiGsdDir();
  if (!optiGsdDir) {
    return; // Not in an opti-gsd project, silently exit
  }

  // Get current task context
  const currentTask = getCurrentTask(optiGsdDir);

  // Prepare log file path
  const logPath = path.join(optiGsdDir, 'tool-usage.json');

  // Read existing log or create new structure
  let logData = {
    version: '1.0',
    sessions: []
  };

  if (fs.existsSync(logPath)) {
    try {
      logData = JSON.parse(fs.readFileSync(logPath, 'utf8'));
    } catch (e) {
      // Corrupted file, start fresh
      logData = { version: '1.0', sessions: [] };
    }
  }

  const now = new Date();
  const nowIso = now.toISOString();

  // Create new entry
  const entry = {
    tool: toolName,
    ts: nowIso
  };

  // Only add task if we have one
  if (currentTask) {
    entry.task = currentTask;
  }

  // Determine if we need a new session
  let needNewSession = true;

  if (logData.sessions.length > 0) {
    const lastSession = logData.sessions[logData.sessions.length - 1];
    if (lastSession.entries && lastSession.entries.length > 0) {
      const lastEntry = lastSession.entries[lastSession.entries.length - 1];
      const lastTime = new Date(lastEntry.ts);
      const timeDiff = now.getTime() - lastTime.getTime();

      if (timeDiff < SESSION_TIMEOUT_MS) {
        // Continue existing session
        needNewSession = false;
        lastSession.entries.push(entry);
      }
    }
  }

  if (needNewSession) {
    // Start new session
    logData.sessions.push({
      started: nowIso,
      entries: [entry]
    });
  }

  // Atomic write
  atomicWrite(logPath, logData);
}

// Run with full error handling - always exit 0
logToolUsage()
  .then(() => process.exit(0))
  .catch(() => process.exit(0));
