#!/usr/bin/env node
/**
 * Tool Usage Analyzer for opti-gsd
 *
 * Reads .opti-gsd/tool-usage.json and outputs analysis to stdout.
 *
 * Usage:
 *   node scripts/analyze-tool-usage.js [options]
 *
 * Options:
 *   --format=json|text     Output format (default: text)
 *   --filter-task=T01      Filter to specific task
 *   --filter-type=mcp|builtin  Filter by tool type
 *   --session=latest|all   Which sessions to analyze (default: latest)
 */

const fs = require('fs');
const path = require('path');

// Built-in tools (non-MCP)
const BUILTIN_TOOLS = new Set([
  'Read', 'Edit', 'Bash', 'Grep', 'Glob', 'Write',
  'Task', 'WebFetch', 'WebSearch', 'TodoRead', 'TodoWrite',
  'MultiEdit', 'LS', 'Agent', 'Batch'
]);

/**
 * Parse command line arguments
 */
function parseArgs(argv) {
  const args = {
    format: 'text',
    filterTask: null,
    filterType: null,
    session: 'latest'
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--format=')) {
      args.format = arg.split('=')[1];
    } else if (arg.startsWith('--filter-task=')) {
      args.filterTask = arg.split('=')[1];
    } else if (arg.startsWith('--filter-type=')) {
      args.filterType = arg.split('=')[1];
    } else if (arg.startsWith('--session=')) {
      args.session = arg.split('=')[1];
    }
  }

  return args;
}

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
 * Determine if a tool is an MCP tool
 */
function isMcpTool(toolName) {
  return toolName.startsWith('mcp__');
}

/**
 * Calculate session duration in minutes
 */
function getSessionDuration(session) {
  if (!session.entries || session.entries.length < 2) {
    return 0;
  }
  const first = new Date(session.entries[0].ts);
  const last = new Date(session.entries[session.entries.length - 1].ts);
  return Math.round((last - first) / (1000 * 60));
}

/**
 * Format date for display
 */
function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toISOString().split('T')[0];
}

/**
 * Create a visual bar using Unicode block characters
 */
function createBar(count, maxCount, maxWidth = 20) {
  if (maxCount === 0) return '';
  const width = Math.round((count / maxCount) * maxWidth);
  return '\u2588'.repeat(width);
}

/**
 * Analyze tool usage data
 */
function analyzeData(data, args) {
  // Select sessions to analyze
  let sessions = data.sessions || [];
  if (args.session === 'latest' && sessions.length > 0) {
    sessions = [sessions[sessions.length - 1]];
  }

  // Collect all entries
  let entries = [];
  for (const session of sessions) {
    if (session.entries) {
      entries = entries.concat(session.entries.map(e => ({
        ...e,
        sessionStarted: session.started
      })));
    }
  }

  // Apply filters
  if (args.filterTask) {
    entries = entries.filter(e => e.task === args.filterTask);
  }

  if (args.filterType === 'mcp') {
    entries = entries.filter(e => isMcpTool(e.tool));
  } else if (args.filterType === 'builtin') {
    entries = entries.filter(e => !isMcpTool(e.tool));
  }

  // Calculate statistics
  const toolCounts = {};
  const taskCounts = {};
  const taskToolCounts = {};
  let mcpCount = 0;
  let builtinCount = 0;

  for (const entry of entries) {
    const tool = entry.tool;
    const task = entry.task || '(no task)';

    // Count by tool
    toolCounts[tool] = (toolCounts[tool] || 0) + 1;

    // Count by type
    if (isMcpTool(tool)) {
      mcpCount++;
    } else {
      builtinCount++;
    }

    // Count by task
    taskCounts[task] = (taskCounts[task] || 0) + 1;

    // Count tools per task
    if (!taskToolCounts[task]) {
      taskToolCounts[task] = {};
    }
    taskToolCounts[task][tool] = (taskToolCounts[task][tool] || 0) + 1;
  }

  // Sort tools by count
  const sortedTools = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1]);

  // Sort tasks by count
  const sortedTasks = Object.entries(taskCounts)
    .sort((a, b) => {
      // Put "(no task)" at the end
      if (a[0] === '(no task)') return 1;
      if (b[0] === '(no task)') return -1;
      return b[1] - a[1];
    });

  // Calculate session info
  const sessionInfo = sessions.map(s => ({
    date: formatDate(s.started),
    duration: getSessionDuration(s),
    entryCount: s.entries ? s.entries.length : 0
  }));

  return {
    totalCalls: entries.length,
    mcpCount,
    builtinCount,
    toolCounts: sortedTools,
    taskCounts: sortedTasks,
    taskToolCounts,
    sessions: sessionInfo
  };
}

/**
 * Output analysis in text format
 */
function outputText(analysis) {
  const lines = [];

  lines.push('## Tool Usage Summary');
  lines.push('');

  // Session info
  if (analysis.sessions.length === 1) {
    const s = analysis.sessions[0];
    const duration = s.duration > 0 ? `${s.duration} min active` : 'just started';
    lines.push(`Session: ${s.date} (${duration})`);
  } else {
    lines.push(`Sessions: ${analysis.sessions.length}`);
    const totalDuration = analysis.sessions.reduce((sum, s) => sum + s.duration, 0);
    if (totalDuration > 0) {
      lines.push(`Total active time: ${totalDuration} min`);
    }
  }
  lines.push('');

  // Type breakdown
  lines.push('### By Tool Type');
  const total = analysis.totalCalls;
  if (total > 0) {
    const mcpPct = Math.round((analysis.mcpCount / total) * 100);
    const builtinPct = Math.round((analysis.builtinCount / total) * 100);
    lines.push(`MCP Tools:     ${analysis.mcpCount.toString().padStart(3)} calls (${mcpPct}%)`);
    lines.push(`Built-in:      ${analysis.builtinCount.toString().padStart(3)} calls (${builtinPct}%)`);
  } else {
    lines.push('No tool calls recorded');
  }
  lines.push('');

  // Top tools
  lines.push('### Top Tools');
  if (analysis.toolCounts.length > 0) {
    const maxCount = analysis.toolCounts[0][1];
    for (const [tool, count] of analysis.toolCounts) {
      const bar = createBar(count, maxCount);
      const toolPadded = tool.padEnd(14);
      const countPadded = count.toString().padStart(3);
      lines.push(`${toolPadded} ${countPadded} calls  ${bar}`);
    }
  } else {
    lines.push('No tools used');
  }
  lines.push('');

  // By task
  lines.push('### By Task');
  if (analysis.taskCounts.length > 0) {
    for (const [task, count] of analysis.taskCounts) {
      // Get top tools for this task
      const taskTools = analysis.taskToolCounts[task];
      const toolList = Object.entries(taskTools)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([t, c]) => `${t}: ${c}`)
        .join(', ');
      lines.push(`${task}: ${count} calls (${toolList})`);
    }
  } else {
    lines.push('No tasks recorded');
  }

  console.log(lines.join('\n'));
}

/**
 * Output analysis in JSON format
 */
function outputJson(analysis) {
  const output = {
    summary: {
      totalCalls: analysis.totalCalls,
      mcpCalls: analysis.mcpCount,
      builtinCalls: analysis.builtinCount,
      sessions: analysis.sessions
    },
    toolCounts: Object.fromEntries(analysis.toolCounts),
    taskBreakdown: {}
  };

  for (const [task, count] of analysis.taskCounts) {
    output.taskBreakdown[task] = {
      totalCalls: count,
      tools: analysis.taskToolCounts[task]
    };
  }

  console.log(JSON.stringify(output, null, 2));
}

/**
 * Main function
 */
function main() {
  const args = parseArgs(process.argv);

  // Find data file
  const optiGsdDir = findOptiGsdDir();
  if (!optiGsdDir) {
    console.log('No tool usage data found (not in an opti-gsd project)');
    process.exit(0);
  }

  const dataPath = path.join(optiGsdDir, 'tool-usage.json');
  if (!fs.existsSync(dataPath)) {
    console.log('No tool usage data found');
    process.exit(0);
  }

  // Read and parse data
  let data;
  try {
    data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  } catch (e) {
    console.log('Error reading tool usage data: ' + e.message);
    process.exit(1);
  }

  // Check for empty data
  if (!data.sessions || data.sessions.length === 0) {
    console.log('No tool usage data found (no sessions recorded)');
    process.exit(0);
  }

  // Analyze
  const analysis = analyzeData(data, args);

  // Output
  if (args.format === 'json') {
    outputJson(analysis);
  } else {
    outputText(analysis);
  }
}

main();
