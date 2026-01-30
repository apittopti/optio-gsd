# Gap Types Reference

Gap detection rules, categories, and typical fixes used during verification.

---

## Gap Types

| Gap Type | Description | Typical Fix |
|----------|-------------|-------------|
| orphan | File exists but not imported/used anywhere | Add import + usage in consuming component/module |
| broken_link | Connection between components fails | Fix path, typo, or endpoint URL |
| stub | Placeholder implementation (not substantive) | Implement fully with real logic |
| missing_export | Symbol exists but not exported from module | Add export statement |
| ci_failure | CI check (lint/typecheck/test/build) failed | Fix the specific error reported by CI |

---

## Gap Detection Rules

### Orphan Detection
A file is considered an **orphan** when:
- It exists on disk (L1: Existence passes)
- It contains real implementation (L2: Substantive passes)
- It is NOT imported by any other file in the project (L3: Wired fails)
- It is NOT a top-level entry point (e.g., page routes, main files)

### Broken Link Detection
A link is considered **broken** when:
- Component A references Component B (via import, API call, or route)
- The reference path, URL, or identifier does not resolve correctly
- Common causes: typos in paths, renamed files without updated imports, incorrect API endpoint URLs

### Stub Detection
A file is considered a **stub** when:
- It contains `TODO`, `FIXME`, or placeholder comments indicating incomplete work
- It has placeholder return values (e.g., `return null`, `return []`, `return {}`)
- It has fewer than 10 lines of actual implementation code
- Functions exist but have empty or trivial bodies

### Missing Export Detection
A symbol has a **missing export** when:
- A function, class, or variable is defined in a module
- Another module attempts to import it
- The symbol is not in the module's export list

### CI Failure Detection
A **ci_failure** gap is recorded when:
- Any of the four CI commands (lint, typecheck, test, build) returns a non-zero exit code
- The specific command, exit code, and output are captured for the gap report

---

## Gap Report Format

Gaps are reported in the verification report using XML-style tags:

```xml
<gaps>
  <gap type="orphan" file="components/StatsCard.tsx">
    Component exists but not imported in Dashboard
  </gap>
  <gap type="broken_link" from="Dashboard" to="StatsAPI">
    Fetch URL incorrect: /api/stat vs /api/stats
  </gap>
  <gap type="stub" file="services/ExportService.ts">
    Function exportToExcel returns empty array
  </gap>
  <gap type="missing_export" file="utils/format.ts" symbol="formatCurrency">
    formatCurrency defined but not exported
  </gap>
  <gap type="ci_failure" check="lint">
    unused variable in Button.tsx:15
  </gap>
</gaps>
```

---

## Gap Severity

Gaps do not have explicit severity levels, but their impact varies:

- **Blocking gaps** (ci_failure): Must be fixed before phase can pass verification
- **Functional gaps** (broken_link, missing_export): Will cause runtime errors if not fixed
- **Quality gaps** (orphan, stub): May not cause immediate errors but indicate incomplete work

---

## Handling Gaps

When gaps are found, verification reports `gaps_found` status. The user decides next steps:

1. **`/opti-gsd:plan fix {N}`** — Generate a systematic fix plan for all gaps
2. **Fix manually** — Address gaps directly and re-run `/opti-gsd:verify`
3. **`/opti-gsd:session rollback {N}`** — Revert the phase if fundamentally broken

**Philosophy:** Human judgment gates continuation. No automatic fix loops are performed.
