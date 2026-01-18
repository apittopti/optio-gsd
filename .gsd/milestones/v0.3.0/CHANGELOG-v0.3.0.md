# Changelog: v0.3.0 - Internal Quality

## Summary
Internal quality improvements focusing on agent consistency and standardized error handling across the opti-gsd plugin.

## Changes

### Phase 1: Agent Tool Consistency
Standardized tool declarations across all 11 agents to ensure consistent capabilities and permissions.

- Added missing search tools to research-synthesizer (+Glob) and roadmapper (+Grep)
- Added MCP tool access to verification agents (verifier, integration-checker)
- Documented Browser tool as conditional on `config.testing.browser: true`
- Documented mcp__* tools as project-configured MCPs

**Agents modified:** research-synthesizer, roadmapper, integration-checker, verifier, executor, debugger

### Phase 2: Error Handling Standardization
Created consistent error response format across all commands.

- Created `docs/ERROR-HANDLING.md` as canonical error format reference
- Added prerequisite validation to 8 command files
- Standardized error format with next-step suggestions
- Added error handling quick reference to help command

**Files modified:** status.md, execute.md, verify.md, plan-phase.md, roadmap.md, archive.md, resume.md, ci.md, help.md

## Standard Error Format
```
⚠️ {Error Title}
─────────────────────────────────────
{Brief explanation}

→ {Suggested next action}
```

## Commits
- f071f2e feat(1-01): add missing search tools to synthesizer and roadmapper
- 7418e6e feat(1-02): add mcp__* to verification agents
- f9cb4d6 docs(1-03): document Browser tool as conditional on project config
- 1aadb0f docs(2-01): create error handling standard document
- 4e87195 feat(2-02): add standardized error handling to high-traffic commands
- a2c3db6 docs: standardize error handling in secondary commands
- 90d8abd docs: add error handling section to help command

## Known Issues
- #001: Verifier agent lacks checkpoint protocol (medium) - tracked for v0.4.0
