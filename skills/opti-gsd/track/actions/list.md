# List: Display Tracked Items

List tracked items by type.

## Arguments

- `type` -- One of: `features`, `stories`, `issues`, `decisions`
- Append `all` to include completed/resolved items (e.g., `list features all`)

---

## list features

Read `.opti-gsd/features/` directory and display pending items:

```markdown
## Pending Features

| ID | Priority | Category | Description | Age |
|----|----------|----------|-------------|-----|
| F003 | high | enhancement | Add loading states | 2d |
| F005 | medium | improvement | Optimize API calls | 1d |
| F007 | low | exploration | Consider Redis caching | 4h |

**Pending:** 3 | **Completed:** 4 | **Total:** 7

Actions:
- Complete: /opti-gsd:track resolve F003
- Promote to story: /opti-gsd:track story (from feature)
- Add new: /opti-gsd:track feature {description}
```

### list features all

Show all features including completed:

```markdown
## All Features

### Pending (3)
| ID | Priority | Description | Age |
|----|----------|-------------|-----|
| F003 | high | Add loading states | 2d |
| F005 | medium | Optimize API calls | 1d |
| F007 | low | Consider Redis caching | 4h |

### Completed (4)
| ID | Description | Completed |
|----|-------------|-----------|
| F001 | Setup ESLint config | 2026-01-14 |
| F002 | Add TypeScript strict mode | 2026-01-14 |
| F004 | Document env variables | 2026-01-15 |
| F006 | Improve header styling | 2026-01-16 |

Clear completed: /opti-gsd:track resolve --clear features
```

---

## list stories

Read `.opti-gsd/stories/` and display by status:

```markdown
## User Stories

### Backlog (3)
| ID | Title | From | Requested |
|----|-------|------|-----------|
| US003 | Faster search | User survey | 2026-01-10 |
| US004 | Bulk delete | Client B | 2026-01-12 |
| US005 | API access | Client A | 2026-01-15 |

### Planned (2)
| ID | Title | Milestone | Phase |
|----|-------|-----------|-------|
| US001 | Export to Excel | v1.2.0 | Phase 1 |
| US002 | Dark mode | v1.2.0 | Phase 2 |

### Delivered (1)
| ID | Title | Delivered |
|----|-------|-----------|
| US000 | User login | v1.0.0 |

**Total:** 6 stories (3 backlog, 2 planned, 1 delivered)

Actions:
- Add: /opti-gsd:track story {title}
- Plan: /opti-gsd:roadmap (assign to milestone)
- View: /opti-gsd:track view US001
```

---

## list issues

Read `.opti-gsd/issues/` directory and show open issues:

```markdown
## Open Issues

| ID | Severity | Title | Phase | Age |
|----|----------|-------|-------|-----|
| I003 | high | Auth tokens not refreshing | 3 | 2d |
| I005 | medium | Dashboard layout shift | 4 | 1d |
| I006 | low | Typo in error message | 4 | 4h |

Open: 3 | Resolved: 2 | Total: 5

View details: /opti-gsd:track view I003
Add new: /opti-gsd:track issue
```

### list issues all

Show all issues including resolved:

```markdown
## All Issues

### Open (3)
| ID | Severity | Title | Age |
|----|----------|-------|-----|
| I003 | high | Auth tokens not refreshing | 2d |
| I005 | medium | Dashboard layout shift | 1d |
| I006 | low | Typo in error message | 4h |

### Resolved (2)
| ID | Title | Resolved |
|----|-------|----------|
| I001 | Build failing on CI | 2026-01-14 |
| I002 | Missing env vars | 2026-01-15 |

Total: 5 issues (3 open, 2 resolved)
```

---

## list decisions

Read `.opti-gsd/decisions.md` and display summary:

```markdown
## Decisions

| ID | Date | Decision | Category |
|----|------|----------|----------|
| D001 | 2026-01-15 | jose > jsonwebtoken | Auth |
| D002 | 2026-01-16 | Zustand for state | State |
| D003 | 2026-01-16 | Feature-based folders | Structure |

Total: 3 decisions

View details: /opti-gsd:track view D001
Add new: /opti-gsd:track decision
```
