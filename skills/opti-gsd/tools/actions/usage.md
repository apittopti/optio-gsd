# usage -- Show Tool Utilization

Display tool usage summary for the current session. Analyzes which tools were used, their frequency, and provides insights into MCP vs built-in tool distribution.

## Data Source

Reads from `.opti-gsd/tool-usage.json` which is populated during execution sessions. Uses `scripts/analyze-tool-usage.js` for analysis and formatting.

## Behavior

1. Load tool usage data from `.opti-gsd/tool-usage.json`
2. Calculate session metrics (duration, total calls)
3. Categorize tools as MCP or built-in
4. Generate visual summary with bar charts
5. Show per-task breakdown if task data exists

## Example Output

```
## Tool Usage Summary

Session: 2026-01-25 (45 min active)

### By Tool Type
MCP Tools:     12 calls (27%)
Built-in:      33 calls (73%)

### Top Tools
Read           18 calls  ████████████████████
Edit           12 calls  ████████████
Bash            8 calls  ████████
Grep            5 calls  █████
Glob            4 calls  ████
mcp__cclsp__find_definition
                3 calls  ███
Write           2 calls  ██
mcp__cclsp__get_diagnostics
                2 calls  ██

### By Task
Task 01: 15 calls (Read: 8, Edit: 5, Bash: 2)
Task 02: 12 calls (Read: 6, Edit: 4, Grep: 2)
Task 03: 18 calls (Read: 4, Edit: 3, mcp__cclsp: 5, Bash: 6)

### Insights
- Most used: Read (40% of all calls)
- MCP tools used in 3/5 tasks
- Avg tools per task: 9 calls
```

## Filtering Options

Filter the usage report with optional flags:

| Flag | Description | Example |
|------|-------------|---------|
| `--task=T01` | Filter to specific task | Show only tools used in Task 01 |
| `--type=mcp` | Filter by tool type | Show only MCP tools |
| `--type=builtin` | Filter by tool type | Show only built-in tools |
| `--session=latest` | Session scope (default) | Most recent session only |
| `--session=all` | Session scope | Aggregate all sessions |
| `--format=json` | Output format | Machine-readable JSON |

## Examples

```bash
# Full summary (default)
/opti-gsd:tools usage

# Filter to specific task
/opti-gsd:tools usage --task=T01

# Show only MCP tools
/opti-gsd:tools usage --type=mcp

# Aggregate all sessions
/opti-gsd:tools usage --session=all

# JSON output for scripting
/opti-gsd:tools usage --format=json
```

## No Data Available

If no usage data exists:

```
## Tool Usage Summary

No usage data found.

Tool usage is tracked during /opti-gsd:execute sessions.
Run a phase execution to generate usage data.
```
