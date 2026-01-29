---
name: context
description: Show current context usage and budget status with optimization suggestions.
disable-model-invocation: true
---

# context

Show current context usage and budget status with optimization suggestions.

## Behavior

### Step 1: Analyze Usage

Read:
- `.opti-gsd/state.json` for session_tokens
- `.opti-gsd/config.json` for budgets
- Count files in `.opti-gsd/plans/` vs `.opti-gsd/archive/`
- Estimate file sizes

### Step 2: Calculate Metrics

```
Total session tokens: {from state.json}
Budget used: {percentage}%

File breakdown:
- config.json: ~200 tokens
- state.json: ~150 tokens
- Current plan: ~{X} tokens
- Active research: ~{Y} tokens
- Unarchived phases: ~{Z} tokens
```

### Step 3: Display Report

```markdown
# Context Usage Report

## Current Session
- **Tokens used:** ~80,000
- **Budget:** 200,000 (40% used)
- **Quality zone:** GOOD (< 50%)

## Breakdown
| Category | Tokens | % |
|----------|--------|---|
| Config + State | 350 | 0.2% |
| Current phase plan | 1,200 | 0.6% |
| Research (active) | 2,400 | 1.2% |
| Codebase analysis | 3,500 | 1.8% |
| Execution context | 72,550 | 36.3% |

## Archived vs Active
- **Archived phases:** 1 (saved ~1,500 tokens)
- **Active phases:** 1
- **Pending phases:** 2

## Budget by Agent Type
| Agent | Budget | Typical Use | Status |
|-------|--------|-------------|--------|
| Orchestrator | 15% | ~10% | ✓ OK |
| Executor | 50% | ~45% | ✓ OK |
| Planner | 60% | ~55% | ✓ OK |
| Researcher | 70% | ~65% | ✓ OK |

## Recommendations

{If > 50% used}
⚠️ Context usage is high. Consider:
1. Run /opti-gsd:archive {completed_phases} to archive completed phases
2. Run /opti-gsd:compact to reduce file sizes
3. Prioritize completing current phase before starting research

{If unarchived completed phases}
💡 You have {N} completed phases not yet archived.
   Run /opti-gsd:archive to save ~{X}k tokens.

{If research files from old phases}
💡 Old research files can be summarized.
   Run /opti-gsd:compact to condense.

{If all good}
✓ Context usage is healthy. No action needed.
```

---

## Context Budget

Minimal: ~3% (analysis only)
