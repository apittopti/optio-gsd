# configure -- Set Up Tool Integration

Add and configure MCP servers, skills, and project tools.

## Add MCP

Add MCP server to project configuration:

```markdown
## Add MCP: {name}

**Purpose:** {description}

**Configuration Required:**
{If credentials needed}
- Environment variable: {VAR_NAME}
- Config file: {path}

**Integration Points:**
- /opti-gsd:debug -- Query {service} directly
- /opti-gsd:verify -- Check {service} state

Added to `.opti-gsd/config.json`.
```

Update config.json:
```json
{
  "mcps": ["filesystem", "{new_mcp}"]
}
```

Commit:
```bash
git add .opti-gsd/config.json
git commit -m "chore: add {mcp} MCP to project"
```

## Add Skill

Add skill to project configuration:

```markdown
## Add Skill: {skill}

**Integration points:**
- /opti-gsd:execute -- Available during task execution
- /opti-gsd:session pause -- Include in commit workflow

Added to `.opti-gsd/config.json`.
```

Update config.json:
```json
{
  "skills": ["commit", "test", "{new_skill}"]
}
```

Commit:
```bash
git add .opti-gsd/config.json
git commit -m "chore: add {skill} skill to project"
```

## Scan

Analyze project for tool opportunities:

```markdown
## Tool Scan Results

**Detected Integrations:**

| Service | Detection | Suggested |
|---------|-----------|-----------|
| PostgreSQL | prisma in deps | add-mcp postgres |
| Redis | ioredis in deps | add-mcp redis |
| AWS S3 | @aws-sdk/s3 | add-mcp s3 |
| GitHub | .github/ dir | add-mcp github |

**Recommended Skills:**

| Skill | Relevance | Use Case |
|-------|-----------|----------|
| commit | High | Conventional commits |
| test | High | Generate tests |

Add with: /opti-gsd:tools add-mcp {name} or /opti-gsd:tools add-skill {name}
```

## Recommend

Deep analysis based on project type:

```markdown
## Tool Recommendations

### For Your Stack (Next.js + PostgreSQL)

**Essential:**
1. **postgres** MCP -- Direct database queries during debug
2. **commit** skill -- Consistent commit messages

**Recommended:**
3. **github** MCP -- PR and issue management
4. **browser** MCP -- UI testing and verification
5. **context7** MCP -- Up-to-date library docs

**Optional:**
6. **slack** MCP -- Team notifications

Add with: /opti-gsd:tools add-mcp {name}
```

## Check

Verify configured tools are available:

```markdown
## Tool Status Check

| Tool | Configured | Available | Status |
|------|------------|-----------|--------|
| filesystem | Yes | Yes | OK |
| postgres | Yes | Yes | OK |
| github | Yes | No | Not running |
| commit (skill) | Yes | Yes | OK |

**Issues:**
- github: MCP server not detected. Start with `npx @mcp/github`

**Summary:** 3/4 configured tools available
```
