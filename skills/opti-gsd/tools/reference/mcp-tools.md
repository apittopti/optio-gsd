# MCP Tool Detection and Configuration

Reference for MCP server probes used during `detect` and common MCP integrations.

## Probe List

The following MCP servers are probed during `/opti-gsd:tools detect`:

```javascript
const mcpProbes = [
  { name: 'cclsp', query: 'cclsp', purpose: 'Code intelligence - definitions, references, diagnostics' },
  { name: 'GitHub', query: 'mcp github pull_request', purpose: 'GitHub operations - PRs, issues, code search' },
  { name: 'Browser (Playwright)', query: 'browser_navigate browser_snapshot', purpose: 'Browser automation via Playwright' },
  { name: 'Chrome', query: 'claude-in-chrome', purpose: 'Chrome browser automation' },
  { name: 'Memory/Graph', query: 'create_entities read_graph', purpose: 'Knowledge graph for persistent memory' },
  { name: 'Context7 Docs', query: 'get-library-docs resolve-library-id', purpose: 'Up-to-date library documentation' },
  { name: 'MUI Docs', query: 'mui-mcp', purpose: 'Material UI documentation' },
  { name: 'Sequential Thinking', query: 'sequentialthinking', purpose: 'Structured step-by-step reasoning' },
];
```

## Common MCPs

| MCP | Purpose | Install |
|-----|---------|---------|
| filesystem | File operations | Built-in |
| context7 | Library documentation | @context7/mcp |
| postgres | PostgreSQL queries | @mcp/postgres |
| mysql | MySQL queries | @mcp/mysql |
| github | GitHub API | @mcp/github |
| browser | Browser automation | @mcp/browser |
| slack | Slack messaging | @mcp/slack |
| redis | Redis operations | @mcp/redis |
| s3 | AWS S3 access | @mcp/s3 |

## MCP-to-Capability Mapping

Used during CI/CD verification to determine what testing is possible:

| MCP | Capability | Used By |
|-----|------------|---------|
| `claude-in-chrome` | Browser/E2E testing | /opti-gsd:verify, /opti-gsd:tools ci |
| `MCP_DOCKER` (GitHub) | CI status checks, PR validation | /opti-gsd:verify, /opti-gsd:tools ci |
| `playwright` | Headless browser testing | /opti-gsd:verify |
| `cclsp` | Code intelligence | /opti-gsd:debug, /opti-gsd:execute |
| `context7` | Library documentation | /opti-gsd:plan research |
