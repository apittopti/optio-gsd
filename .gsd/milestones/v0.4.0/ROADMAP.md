# Roadmap

## Milestone: v0.4.0 - Verifier Checkpoint Protocol

### Phase 1: Add Checkpoint Protocol to Verifier
- [ ] In Progress
- Implement incremental state saving for verifier agent (fixes #001)

**Problem:** Verifier runs all checks sequentially but only writes results at the end. Context exhaustion = lost progress.

**Success Criteria:**
- [ ] Verifier writes partial results after each major step
- [ ] Support `--resume` flag to continue from last checkpoint
- [ ] Checkpoint pattern matches executor/debugger agents
- [ ] VERIFICATION-PROGRESS.md tracks incremental state

**Files:** `agents/opti-gsd-verifier.md`, `commands/verify.md`

**Resolves:** Issue #001-verifier-checkpoint

---

Progress: 0/1 phases complete (0%)
