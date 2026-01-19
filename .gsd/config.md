---
# Project Configuration
app_type: claude-code-plugin
framework: claude-code

# Git Workflow
branching: milestone
prefix: gsd/
base: master
commits: conventional
workflow: solo  # solo = merge directly, team = create PR

# Execution Mode
mode: interactive
depth: standard

# Context Management
budgets:
  orchestrator: 15
  executor: 50
  planner: 60
  researcher: 70

# CI/CD & Toolchain
ci:
  package_manager: null
  build: null
  test: null
  lint: null
  typecheck: null
  e2e: null

# URLs
urls:
  local: null
  api: null
  staging: null
  production: null

# Deployment
deploy:
  target: github-marketplace
  ci_system: null
  production_branch: master

# Discovery Defaults
discovery:
  default_level: 1
  force_research: false

# Testing
testing:
  type: terminal  # Claude Code plugin - tested via CLI
  browser: false

# Skills
skills:
  - test-driven-development
  - systematic-debugging
  - verification-before-completion

# MCP Integrations
mcps:
  github: MCP_DOCKER
  context7: MCP_DOCKER

# Verification
verification:
  type: terminal  # Test commands in Claude Code CLI
  github: MCP_DOCKER
---
