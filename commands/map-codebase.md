# /opti-gsd:map-codebase

Analyze an existing codebase to understand its structure before starting work.

## Behavior

### Step 1: Check Context

If `.gsd/` already exists:
```markdown
## Project Already Initialized

This project has opti-gsd state at `.gsd/`.

To re-analyze the codebase:
- View existing map: `.gsd/CODEBASE.md`
- Force re-scan: `/opti-gsd:map-codebase --refresh`

To start fresh:
- Remove `.gsd/` and run again
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

### Step 3: Generate Codebase Map

Write to `.gsd/CODEBASE.md`:

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

View full map: `.gsd/CODEBASE.md`

Next steps:
- Initialize project: `/opti-gsd:init`
- Or start fresh: `/opti-gsd:new-project`
```

---

## Use Cases

1. **Before init** - Understand existing project
2. **Onboarding** - New developer orientation
3. **Planning** - Know where to add features
4. **Refactoring** - Identify improvement areas

---

## Context Budget

- Codebase analysis: spawned agent (70% of its context)
- Report generation: ~5%
- Orchestrator total: ~10%
