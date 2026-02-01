---
name: init
description: Initialize opti-gsd in an existing project — analyzes codebase, creates config, state, and directory structure
disable-model-invocation: true
---

# Initialize opti-gsd

Set up opti-gsd for an existing project. For brownfield projects (existing code), this includes codebase analysis to understand the architecture before planning.

## Step 1: Check if Already Initialized

If `.opti-gsd/` already exists:
```
⚠️ Already Initialized
─────────────────────────────────────
.opti-gsd/ directory already exists.

→ Run /opti-gsd:status to see current state
→ Delete .opti-gsd/ and re-run /opti-gsd:init to start fresh
```

## Step 2: Check Branch Safety

```bash
git branch --show-current
```

If on `master`, `main`, `production`, or `prod`:
```
🛑 BLOCKED: Protected Branch
─────────────────────────────────────
Cannot initialize on '{branch}'. This is a protected branch.

Create a milestone branch first:
  git checkout -b gsd/v1.0
Then run /opti-gsd:init again.
```

## Step 3: Detect Project Type

Read existing project files to detect:
- `package.json` → project name, scripts (test, lint, build, typecheck), dependencies
- `tsconfig.json` / `jsconfig.json` → TypeScript/JavaScript
- `pyproject.toml` / `setup.py` / `requirements.txt` → Python
- `Cargo.toml` → Rust
- `go.mod` → Go
- `pom.xml` / `build.gradle` → Java/Kotlin
- `.github/workflows/` → existing CI
- `Dockerfile` / `docker-compose.yml` → container setup
- `next.config.*` / `nuxt.config.*` / `vite.config.*` → framework

## Step 4: Brownfield Analysis

**Determine if brownfield** (existing code) or greenfield (empty/new project):

```bash
# Count source files (excluding node_modules, .git, etc.)
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" -o -name "*.rs" -o -name "*.go" -o -name "*.java" \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*" | wc -l
```

**If brownfield (>5 source files)**, analyze the codebase:

### 4a: Architecture Scan

Use Glob and Grep to identify:
- **Directory structure** — top-level layout, key directories
- **Entry points** — main files, index files, app files
- **Tech stack** — frameworks, libraries, major dependencies
- **Patterns** — component structure, API routes, data models

### 4b: Dependency Analysis

Read package.json/pyproject.toml/Cargo.toml for:
- **Core dependencies** — framework, ORM, HTTP client, testing
- **Dev dependencies** — build tools, linters, formatters, test runners
- **Scripts** — available build/test/lint commands

### 4c: Code Metrics

```bash
# File count by type
find . -type f -name "*.ts" -not -path "*/node_modules/*" | wc -l
find . -type f -name "*.test.*" -not -path "*/node_modules/*" | wc -l
```

- Total source files
- Test file count
- Approximate test coverage indicator
- Number of components/modules/packages

### 4d: Write Analysis

Write `.opti-gsd/codebase-analysis.md`:

```markdown
# Codebase Analysis

Generated: {date}

## Overview

| Metric | Value |
|--------|-------|
| Project | {name} |
| Type | {detected_type} |
| Framework | {framework} |
| Language | {language} |
| Source files | {count} |
| Test files | {count} |

## Architecture

{description of directory structure and patterns}

### Key Directories
- `src/` — {description}
- `tests/` — {description}
- ...

### Entry Points
- {file} — {purpose}

## Tech Stack

### Core
- {framework} — {version}
- {library} — {purpose}

### Dev Tools
- {tool} — {purpose}

## Existing Patterns

{describe coding patterns observed: component structure, API conventions, state management, etc.}

## CI/CD

{describe existing CI setup if found, or note absence}

## Notes for Planning

{any observations relevant to future phase planning — tech debt, areas needing refactoring, well-structured vs messy areas}
```

**If greenfield (<= 5 source files)**, skip analysis — note "greenfield project" in config.

## Step 5: Confirm with User

```
Setting up opti-gsd for: {detected_name}
Type: {detected_type} ({brownfield|greenfield})
{if brownfield: "Files: {count} source, {count} test"}

Detected CI commands:
  lint:      {detected or "none"}
  typecheck: {detected or "none"}
  test:      {detected or "none"}
  build:     {detected or "none"}

Does this look right? (yes / adjust)
```

## Step 6: Create Directory Structure

```
.opti-gsd/
├── config.json
├── state.json
├── codebase-analysis.md   (brownfield only)
├── roadmap.md              (empty placeholder)
├── stories/
├── issues/
├── features/
├── plans/
└── research/
```

### config.json

```json
{
  "version": "3.0",
  "project": {
    "name": "{name}",
    "type": "{type}",
    "framework": "{framework or null}",
    "language": "{language}"
  },
  "branching": {
    "enabled": true,
    "pattern": "gsd/v{milestone}",
    "protected": ["master", "main", "production", "prod"]
  },
  "ci": {
    "lint": "{detected}",
    "typecheck": "{detected}",
    "test": "{detected}",
    "build": "{detected}",
    "e2e": null
  },
  "deployment": {
    "platform": null,
    "preview_url": null
  },
  "testing": {
    "always_test": [],
    "never_test": ["*.md", "*.json"]
  },
  "mode": "interactive"
}
```

### state.json

```json
{
  "version": "3.0",
  "milestone": null,
  "branch": "{current_branch}",
  "phase": null,
  "status": "initialized",
  "phases": {
    "total": 0,
    "complete": [],
    "current": null,
    "pending": []
  },
  "execution": null,
  "last_active": "{timestamp}"
}
```

## Step 7: CLAUDE.md Integration

Check if CLAUDE.md exists and contains opti-gsd section:

```bash
grep -q "opti-gsd" CLAUDE.md 2>/dev/null
```

If missing, ask:
```
Add opti-gsd workflow instructions to CLAUDE.md? (yes/no)
```

If yes, append:

```markdown

---

## opti-gsd Workflow

This project uses **opti-gsd** for spec-driven development.

**Before any code changes:**
1. Check status: `/opti-gsd:status`
2. Ensure on milestone branch (never master/main)
3. Follow: Plan → Execute → Review → Verify

**Protected branches:** master, main, production, prod — PR only!

**Key commands:** `/opti-gsd:status`, `/opti-gsd:roadmap`, `/opti-gsd:plan`, `/opti-gsd:execute`, `/opti-gsd:review`, `/opti-gsd:verify`
```

## Step 8: Commit

```bash
git add .opti-gsd/
git add CLAUDE.md  # if modified
git commit -m "chore: initialize opti-gsd

- Created .opti-gsd/ directory structure
- Configured for {project_type} project
- {if brownfield: 'Analyzed existing codebase ({file_count} files)'}
- CI commands: {detected_commands}"
```

## Step 9: Report

```
✓ opti-gsd Initialized
─────────────────────────────────────
Project: {name}
Type:    {type} ({brownfield|greenfield})
Branch:  {branch}
{if brownfield:
Analysis: .opti-gsd/codebase-analysis.md
          {source_count} source files, {test_count} test files
          Stack: {framework}, {key_deps}
}

→ Run /opti-gsd:roadmap to create your delivery roadmap
→ Run /opti-gsd:status to see current state
```
