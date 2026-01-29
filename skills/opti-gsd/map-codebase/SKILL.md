---
name: map-codebase
description: Analyze an existing codebase to understand its structure before starting work.
disable-model-invocation: true
---

# map-codebase

Analyze an existing codebase to understand its structure before starting work.

## Arguments

- `--debt` — Scan for technical debt markers and generate/compare baseline
- `--refresh` — Force re-scan of codebase (existing)

## Behavior

### Step 1: Check Context

If `.opti-gsd/` already exists:
```markdown
## Project Already Initialized

This project has opti-gsd state at `.opti-gsd/`.

To re-analyze the codebase:
- View existing map: `.opti-gsd/codebase/`
- Force re-scan: /opti-gsd:map-codebase --refresh

To start fresh:
- Remove `.opti-gsd/` and run again
```

### Step 2: Spawn Codebase Mapper

Spawn `opti-gsd-codebase-mapper` agent with:
- Project root path
- Instruction to analyze structure

The agent will:
1. Identify framework and language
2. Map directory structure
3. Find key entry points
4. Catalog existing patterns
5. Identify integration points
6. Note technical debt

### Step 2a: Check for --debt Flag

When `--debt` flag is present:
- Skip normal codebase mapping
- Check if `.opti-gsd/debt-baseline.json` exists
- Spawn `opti-gsd-codebase-mapper` with `focus='debt'`
- If baseline exists, pass path for comparison mode
- If no baseline, agent creates initial baseline

### Step 3: Generate Codebase Map

Write to `.opti-gsd/codebase/` directory (multiple focus files):

### Step 3a: Debt Scan Report

Display formatted debt scan results:

```
Debt Scan Results
──────────────────────────────────────────────────────────────
Baseline: {date} ({count} items)
Current:  {date} ({count} items)

Resolved: {count} items ✓
  - {file}:{line} ({type}: {content}) → Resolved

Remaining: {count} items
  - {file}:{line} ({type}: {content})

New debt: {count} items ⚠️
  - {file}:{line} ({type}: {content})

Net change: {±count} ({good!/needs attention})

🎉 DEBT-FREE! (when zero items)
```

This baseline complements per-phase debt tracking in `/opti-gsd:verify`. The baseline shows overall project debt state while verification shows what changed in each phase.

```markdown
# Codebase Map

**Generated:** {timestamp}
**Root:** {project_path}

## Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 14.1.0 |
| Language | TypeScript | 5.3.0 |
| Styling | Tailwind CSS | 3.4.0 |
| State | Zustand | 4.5.0 |
| Database | PostgreSQL | 15 |
| ORM | Prisma | 5.8.0 |

## Directory Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── (auth)/         # Auth group routes
│   ├── (dashboard)/    # Dashboard group routes
│   └── api/            # API routes
├── components/         # React components
│   ├── ui/            # Base UI components
│   └── features/      # Feature components
├── lib/               # Utilities and helpers
├── services/          # Business logic
└── types/             # TypeScript types
```

## Key Files

| File | Purpose |
|------|---------|
| src/app/layout.tsx | Root layout |
| src/lib/auth.ts | Auth utilities |
| src/services/api.ts | API client |
| prisma/schema.prisma | Database schema |

## Patterns Identified

### Component Pattern
- Feature-based organization
- Compound components for complex UI
- Props interfaces in same file

### Data Fetching
- TanStack Query for client
- Server components for initial load
- API routes for mutations

### State Management
- Zustand for global state
- React Query for server state
- Local state for forms

## Integration Points

| System | Connection | Notes |
|--------|------------|-------|
| Database | Prisma client | src/lib/db.ts |
| Auth | NextAuth | src/lib/auth.ts |
| External API | REST | src/services/external.ts |

## Technical Debt

- [ ] Mixed styling approaches (some inline, some Tailwind)
- [ ] Inconsistent error handling in API routes
- [ ] Missing TypeScript strict mode
- [ ] Some any types in services/

## Entry Points for New Features

| Feature Type | Start Here |
|--------------|------------|
| New page | src/app/{route}/page.tsx |
| API endpoint | src/app/api/{route}/route.ts |
| UI component | src/components/ui/ |
| Business logic | src/services/ |
| Database change | prisma/schema.prisma |
```

### Step 4: Report

```markdown
## Codebase Mapped

**Stack:** {framework} + {language}
**Files:** {count} analyzed
**Patterns:** {count} identified

**Key Findings:**
- {finding 1}
- {finding 2}
- {finding 3}

**Technical Debt:** {count} items noted

View full map: `.opti-gsd/codebase/`

```

**Next steps:**
→ /opti-gsd:init        — Initialize project
→ /opti-gsd:new-project — Or start fresh

---

## Use Cases

1. **Before init** - Understand existing project
2. **Onboarding** - New developer orientation
3. **Planning** - Know where to add features
4. **Refactoring** - Identify improvement areas
5. **Debt tracking** - Baseline and track technical debt over time

---

## Context Budget

- Codebase analysis: spawned agent (70% of its context)
- Report generation: ~5%
- Orchestrator total: ~10%
