# Roadmap

## Milestone: v0.3.0 - Internal Quality

### Phase 1: Agent Tool Consistency
- [x] Complete
- Standardize tool declarations across all 11 agents

**Success Criteria:**
- [x] All agents have consistent tool declarations
- [x] MCP tools (`mcp__*`) declared where needed
- [x] Browser tools only on agents that need browser access
- [x] Tool permissions match agent responsibilities

**Files:** `agents/*.md`

---

### Phase 2: Error Handling Standardization
- [x] Complete
- Create consistent error response format across commands

**Success Criteria:**
- [x] Error format defined and documented
- [x] Commands use consistent error messaging
- [x] Graceful handling when prerequisites missing (e.g., no .gsd/, no STATE.md)
- [x] Clear next-step suggestions on errors

**Files:** `commands/*.md`, `docs/ERROR-HANDLING.md`

---

Progress: 2/2 phases complete (100%)
Milestone v0.3.0 complete!
