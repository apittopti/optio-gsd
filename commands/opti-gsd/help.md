# opti-gsd Help

Display all available opti-gsd commands.

---

## Commands

### Project Setup

| Command | Description |
|---------|-------------|
| `/opti-gsd:init` | Initialise opti-gsd in an existing project. Detects framework, app type, and creates `.gsd/` directory. |
| `/opti-gsd:new-project` | Create a new project with guided setup. Asks about app type, framework, services, and project goals. |

### Roadmap & Planning

| Command | Description |
|---------|-------------|
| `/opti-gsd:roadmap` | Create or view the project roadmap with milestones and phases. |
| `/opti-gsd:plan-phase [N]` | Generate a detailed execution plan for phase N with atomic tasks. |
| `/opti-gsd:add-phase` | Add a new phase to the end of the current milestone. |
| `/opti-gsd:insert-phase [N]` | Insert an urgent phase after phase N (creates phase N.1). |

### Execution

| Command | Description |
|---------|-------------|
| `/opti-gsd:execute` | Execute all tasks in the current phase plan sequentially. |
| `/opti-gsd:execute-task [N]` | Execute a single task N from the current phase. |

### Git Workflow

| Command | Description |
|---------|-------------|
| `/opti-gsd:start-milestone [name]` | Create a new milestone branch and start working. |
| `/opti-gsd:complete-milestone` | Complete the current milestone: review, PR, tag release. |

### Session Management

| Command | Description |
|---------|-------------|
| `/opti-gsd:status` | Show current state: milestone, phase, task, progress, and next action. |
| `/opti-gsd:resume` | Resume work from the last session. |
| `/opti-gsd:pause` | Pause work and save context to STATE.md. |

### Project Management

| Command | Description |
|---------|-------------|
| `/opti-gsd:decisions` | Log an architectural decision with rationale. |
| `/opti-gsd:issues` | Review and manage tracked issues. |

### Configuration

| Command | Description |
|---------|-------------|
| `/opti-gsd:skills` | Show detected and active skills. |
| `/opti-gsd:mcps` | Show configured MCP integrations. |

---

## Quick Start

1. **New project:** `/opti-gsd:new-project`
2. **Existing project:** `/opti-gsd:init`
3. **Create roadmap:** `/opti-gsd:roadmap`
4. **Plan first phase:** `/opti-gsd:plan-phase 1`
5. **Execute:** `/opti-gsd:execute`

---

## Project Files

When initialised, opti-gsd creates a `.gsd/` directory:

```
.gsd/
├── config.md      # App type, framework, skills, MCPs
├── PROJECT.md     # Goals, constraints, tech stack
├── ROADMAP.md     # Milestones and phases
├── STATE.md       # Current progress and session info
├── ISSUES.md      # Tracked issues
├── DECISIONS.md   # Architectural decisions
└── plans/         # Phase execution plans
    └── phase-XX/
        ├── plan.md
        └── summary.md
```
