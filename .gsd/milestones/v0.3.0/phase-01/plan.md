---
phase: 1
title: Agent Tool Consistency
wave_count: 2
discovery_level: 0
reqs: []
estimated_tokens: 15000
---

# Phase 1: Agent Tool Consistency

## Must-Haves (Goal-Backward)

- [ ] All agents have consistent, well-documented tool declarations
- [ ] Browser tool conditional on project type (not hardcoded for CLI projects)
- [ ] MCP tools declared on agents that verify/interact with external services
- [ ] Read-only agents don't have Write/Edit tools
- [ ] All agents that search code have Grep

## Wave 1 (Parallel)

<task id="01" wave="1" reqs="">
  <files>
    <file action="modify">agents/opti-gsd-research-synthesizer.md</file>
    <file action="modify">agents/opti-gsd-roadmapper.md</file>
  </files>
  <action>
    Add missing search tools to agents that analyze files:
    - research-synthesizer: Add Glob (needs to find research files)
    - roadmapper: Add Grep (needs to search requirement content)
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="grep" cmd="grep -A10 'tools:' agents/opti-gsd-research-synthesizer.md">Has Glob in tools list</check>
    <check type="grep" cmd="grep -A10 'tools:' agents/opti-gsd-roadmapper.md">Has Grep in tools list</check>
  </verify>
  <done>Both agents have complete search tool declarations</done>
  <skills>none</skills>
</task>

<task id="02" wave="1" reqs="">
  <files>
    <file action="modify">agents/opti-gsd-integration-checker.md</file>
    <file action="modify">agents/opti-gsd-verifier.md</file>
  </files>
  <action>
    Add mcp__* to agents that verify external service integrations:
    - integration-checker: Add mcp__* (checks if services are wired correctly)
    - verifier: Add mcp__* (verifies MCP integrations work)
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="grep" cmd="grep 'mcp__' agents/opti-gsd-integration-checker.md">Has mcp__* in tools</check>
    <check type="grep" cmd="grep 'mcp__' agents/opti-gsd-verifier.md">Has mcp__* in tools</check>
  </verify>
  <done>Both verification agents can access MCP tools when needed</done>
  <skills>none</skills>
</task>

## Wave 2 (After Wave 1)

<task id="03" wave="2" depends="01,02" reqs="">
  <files>
    <file action="modify">agents/opti-gsd-executor.md</file>
    <file action="modify">agents/opti-gsd-debugger.md</file>
    <file action="modify">agents/opti-gsd-verifier.md</file>
  </files>
  <action>
    Add conditional note for Browser tool - it should only be used when project config has browser testing enabled:

    For each agent with Browser in tools list, add a comment:
    ```yaml
    tools:
      - Read
      - Write
      - ...
      - Browser  # Only when config.testing.browser: true
    ```

    This documents that Browser access is project-dependent, not universal.
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="grep" cmd="grep -A1 'Browser' agents/opti-gsd-executor.md">Has conditional comment</check>
    <check type="grep" cmd="grep -A1 'Browser' agents/opti-gsd-debugger.md">Has conditional comment</check>
    <check type="grep" cmd="grep -A1 'Browser' agents/opti-gsd-verifier.md">Has conditional comment</check>
  </verify>
  <done>Browser tool usage is documented as conditional on project type</done>
  <skills>none</skills>
</task>

<task id="04" wave="2" depends="01,02" reqs="">
  <files>
    <file action="modify">agents/opti-gsd-executor.md</file>
  </files>
  <action>
    Add conditional note for mcp__* tool - document when it applies:

    ```yaml
    tools:
      - ...
      - mcp__*  # Access to project-configured MCPs (github, supabase, etc.)
    ```

    This clarifies that mcp__* provides access to whatever MCPs the project has configured.
  </action>
  <libraries>none</libraries>
  <verify>
    <check type="grep" cmd="grep -A1 'mcp__' agents/opti-gsd-executor.md">Has explanatory comment</check>
  </verify>
  <done>MCP tool usage is documented</done>
  <skills>none</skills>
</task>
