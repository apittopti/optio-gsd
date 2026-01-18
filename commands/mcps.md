---
description: Discover and configure MCP servers for the project.
---

# mcps [action] [args...]

Discover and configure MCP servers for the project.

## Actions

- (no args) — List configured MCPs
- `scan` — Detect MCPs from project dependencies
- `recommend` — Get MCP recommendations for stack
- `add [mcp]` — Add MCP to project configuration
- `check` — Verify MCP availability

## Behavior

### List MCPs (no args)

Show currently configured MCPs:

```markdown
## Configured MCPs

MCPs referenced in `.gsd/config.md`:

| MCP | Status | Purpose |
|-----|--------|---------|
| filesystem | Active | File operations |
| postgres | Active | Database queries |
| github | Inactive | Not connected |

Add MCP: `/opti-gsd:mcps add {name}`
Check status: `/opti-gsd:mcps check`
```

### Scan for MCPs

Analyze project for MCP opportunities:

```bash
# Check package.json for database clients
# Check for API integrations
# Check for service configurations
```

```markdown
## MCP Scan Results

**Detected Integrations:**

| Service | Detection | Suggested MCP |
|---------|-----------|---------------|
| PostgreSQL | prisma in deps | postgres |
| Redis | ioredis in deps | redis |
| AWS S3 | @aws-sdk/s3 | s3 |
| GitHub | .github/ dir | github |

**Not Detected:**
- No Slack integration found
- No Stripe integration found

Add detected: `/opti-gsd:mcps add postgres`
```

### Recommend MCPs

Based on project type and workflow needs:

```markdown
## MCP Recommendations

### For Your Stack (Next.js + PostgreSQL)

1. **postgres** — Direct database queries during debug
   - Useful in `/opti-gsd:debug` sessions
   - Verify data during `/opti-gsd:verify`

2. **filesystem** — Extended file operations
   - Already available by default
   - Enhanced for large file handling

### For Development Workflow

3. **github** — PR and issue management
   - Integrates with `/opti-gsd:complete-milestone`
   - Track issues with `/opti-gsd:issues`

4. **browser** — UI testing and verification
   - Screenshot verification in `/opti-gsd:verify`
   - E2E flow checking

5. **context7** — Up-to-date library documentation
   - Used during `/opti-gsd:execute` for current APIs
   - Prevents deprecated patterns
   - Only fetched when task lists specific libraries

### Optional

6. **slack** — Team notifications
   - Notify on milestone completion
   - Alert on critical issues

Install: See MCP documentation
Configure: `/opti-gsd:mcps add {name}`
```

### Add MCP

Configure MCP for project:

```markdown
## Add MCP: {mcp}

**Purpose:** {description}

**Configuration Required:**
{If credentials needed}
- Environment variable: {VAR_NAME}
- Config file: {path}

**Integration Points:**
- /opti-gsd:debug — Query {service} directly
- /opti-gsd:verify — Check {service} state

Added to `.gsd/config.md`.

**Note:** Ensure MCP server is installed and running.
See: https://modelcontextprotocol.io/servers/{mcp}
```

Update `.gsd/config.md`:
```yaml
mcps:
  - filesystem
  - {new_mcp}
```

### Check MCPs

Verify MCP availability:

```markdown
## MCP Status Check

| MCP | Configured | Available | Status |
|-----|------------|-----------|--------|
| filesystem | Yes | Yes | OK |
| postgres | Yes | Yes | OK |
| github | Yes | No | Not running |
| redis | No | - | Not configured |

**Issues:**
- github: MCP server not detected. Start with `npx @mcp/github`

**All Clear:** 2/3 configured MCPs available
```

---

## MCP Integration Points

| Command | MCP Usage |
|---------|-----------|
| debug | Database MCPs for data inspection |
| verify | Browser MCP for visual checks |
| complete-milestone | GitHub MCP for PR creation |
| execute | Filesystem MCP for file ops, Context7 for library docs |

---

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

---

## Context Budget

- List: ~2%
- Scan: ~5%
- Recommend: ~8%
- Add: ~2%
- Check: ~3%
