---
description: Display all available opti-gsd commands with descriptions.
---

Display the following help information to the user exactly as formatted below:

---

## opti-gsd Commands

### Project Setup
| Command | Description |
|---------|-------------|
| `/opti-gsd:init` | Initialize opti-gsd in an existing project |
| `/opti-gsd:new-project` | Create a new project with guided setup |
| `/opti-gsd:map-codebase` | Analyze existing codebase structure |

### Planning
| Command | Description |
|---------|-------------|
| `/opti-gsd:roadmap` | Create or view project roadmap |
| `/opti-gsd:discuss-phase [N]` | Capture decisions before planning |
| `/opti-gsd:plan-phase [N]` | Generate execution plan for phase N |
| `/opti-gsd:add-phase [title]` | Add a new phase to roadmap |
| `/opti-gsd:insert-phase [N] [title]` | Insert phase at position N |
| `/opti-gsd:remove-phase [N]` | Remove pending phase N |

### Execution
| Command | Description |
|---------|-------------|
| `/opti-gsd:execute` | Execute current phase plan |
| `/opti-gsd:execute-task [N]` | Execute single task N from current phase |
| `/opti-gsd:verify [phase]` | Verify phase completion |
| `/opti-gsd:debug [issue-id]` | Start or resume debugging session |

### Milestones
| Command | Description |
|---------|-------------|
| `/opti-gsd:start-milestone [name]` | Start new milestone branch |
| `/opti-gsd:complete-milestone` | Complete current milestone |

### Session Management
| Command | Description |
|---------|-------------|
| `/opti-gsd:status` | Show current state and next action |
| `/opti-gsd:resume` | Resume from last session |
| `/opti-gsd:pause` | Pause work with context save |

### Context Management
| Command | Description |
|---------|-------------|
| `/opti-gsd:context` | Show context usage and budget status |
| `/opti-gsd:archive [phase]` | Archive completed phase to save context |
| `/opti-gsd:compact` | Reduce context footprint of project files |

### Todos
| Command | Description |
|---------|-------------|
| `/opti-gsd:add-todo [desc]` | Capture idea or task for later |
| `/opti-gsd:todos` | List and manage pending todos |

### Utilities
| Command | Description |
|---------|-------------|
| `/opti-gsd:decisions` | Log and view architectural decisions |
| `/opti-gsd:issues` | Track and manage project issues |
| `/opti-gsd:skills` | Discover and configure Claude skills |
| `/opti-gsd:mcps` | Discover and configure MCP servers |
| `/opti-gsd:mode [interactive|yolo]` | Switch workflow mode |
| `/opti-gsd:whats-new` | Check for updates and changelog |

### Quick Start

```
1. /opti-gsd:new-project     # Set up project
2. /opti-gsd:roadmap         # Define phases
3. /opti-gsd:plan-phase 1    # Plan first phase
4. /opti-gsd:execute         # Execute the plan
5. /opti-gsd:verify 1        # Verify completion
```

### For Existing Projects

```
1. /opti-gsd:map-codebase    # Understand structure
2. /opti-gsd:init            # Initialize opti-gsd
3. /opti-gsd:roadmap         # Plan your work
```
