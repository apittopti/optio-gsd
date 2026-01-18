# Error Handling Standard

All opti-gsd commands follow this standardized error handling pattern to provide consistent, helpful error messages.

## Standard Error Format

```
⚠️ {Error Title}
─────────────────────────────────────
{Brief explanation of what went wrong}

Required: {what's missing}

→ {Next step command or action}
```

## Error Categories

### 1. NOT_INITIALIZED
Triggered when `.gsd/` directory doesn't exist.

```
⚠️ opti-gsd Not Initialized
─────────────────────────────────────
No .gsd/ directory found in this project.

→ Run /opti-gsd:init to initialize an existing project
→ Run /opti-gsd:new-project to start a new project
```

### 2. MISSING_PREREQUISITE
Triggered when a required file is missing.

**STATE.md missing:**
```
⚠️ Project State Missing
─────────────────────────────────────
.gsd/STATE.md not found.

→ Run /opti-gsd:init to reinitialize
```

**ROADMAP.md missing:**
```
⚠️ No Roadmap Found
─────────────────────────────────────
.gsd/ROADMAP.md not found. Create a roadmap before planning phases.

→ Run /opti-gsd:roadmap to create a roadmap
```

**Plan missing:**
```
⚠️ Phase Not Planned
─────────────────────────────────────
No plan found for phase {N}.

→ Run /opti-gsd:plan-phase {N} to create a plan
```

### 3. INVALID_STATE
Triggered when the current state doesn't match expected conditions.

**Phase not started:**
```
⚠️ Phase Not Active
─────────────────────────────────────
Phase {N} is not currently active.

Current phase: {current}
→ Run /opti-gsd:status to see current state
```

**Phase already complete:**
```
⚠️ Phase Already Complete
─────────────────────────────────────
Phase {N} has already been completed.

→ Run /opti-gsd:plan-phase {N+1} for next phase
→ Run /opti-gsd:verify {N} to re-verify
```

### 4. EXECUTION_FAILED
Triggered when a task or command fails during execution.

```
⚠️ Task Failed
─────────────────────────────────────
Task {ID} failed: {reason}

Progress:
- [x] {completed step}
- [ ] {failed step}

→ Fix the issue and run /opti-gsd:execute to resume
→ Run /opti-gsd:debug to investigate
```

## Common Prerequisites

| Command Type | Required Files |
|--------------|----------------|
| Execution (execute, verify) | .gsd/, STATE.md, ROADMAP.md, plan.md |
| Planning (plan-phase, roadmap) | .gsd/, STATE.md |
| Session (status, resume, pause) | .gsd/, STATE.md |
| Utility (help, context) | None (always work) |

## Next-Step Patterns

| Error Condition | Suggested Next Step |
|-----------------|---------------------|
| NOT_INITIALIZED | /opti-gsd:init or /opti-gsd:new-project |
| No roadmap | /opti-gsd:roadmap |
| No plan | /opti-gsd:plan-phase N |
| Task failed | Fix and retry or /opti-gsd:debug |
| Phase incomplete | /opti-gsd:execute to resume |
| Verification failed | /opti-gsd:plan-phase N --gaps |

## Implementation Guidelines

When implementing error handling in a command:

1. **Check prerequisites first** - Before any business logic
2. **Use standard format** - Copy the exact format above
3. **Always suggest next step** - Never leave user without guidance
4. **Be specific** - Include relevant details (phase number, file name, etc.)
5. **Keep it brief** - One clear explanation, one clear action
