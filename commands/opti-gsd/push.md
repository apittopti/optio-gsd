---
description: Push current branch to remote to trigger preview deployments.
---

# push

Push current branch to remote to enable preview deployments and CI.

## Behavior

### Step 1: Check State

Read `.opti-gsd/state.json` to get current branch.

If no milestone active:
```
No milestone branch active. Nothing to push.

Start a milestone first: /opti-gsd:start-milestone [name]
```

### Step 2: Check for Changes

```bash
# Check if there are commits to push
git log origin/{branch}..HEAD --oneline 2>/dev/null || echo "new-branch"
```

If no commits to push:
```
Branch {branch} is up to date with remote. Nothing to push.
```

### Step 3: Generate Push Summary

Read `.opti-gsd/state.json` and `.opti-gsd/roadmap.md` to compile what's being pushed:

```markdown
## Push Summary: {branch}

### Milestone: {milestone_name}

### Phases Completed:
- [x] Phase 1: {title} (verified: ✓)
- [x] Phase 2: {title} (verified: ✓)
- [x] Phase 3: {title} (verified: pending)

### Current Phase: {N} - {title}
- Tasks: {completed}/{total}
- Status: {in_progress | complete}

### Verification Status:
- Phase 1: VERIFIED ✓
- Phase 2: VERIFIED ✓
- Phase 3: NOT YET VERIFIED

### Commits Being Pushed:
{git log output - list of commits}

### Open Issues:
- {ISS-001}: {description}
- {ISS-002}: {description}
```

### Step 4: Create Summary Commit (if unpushed changes)

If there are uncommitted state changes, commit them first:

```bash
git add .opti-gsd/state.json .opti-gsd/roadmap.md
git commit -m "$(cat <<'EOF'
chore: push checkpoint - {milestone} phase {N}

Phases complete: {list}
Phases verified: {list}
Current phase: {N} ({status})
Tasks: {completed}/{total}

{If any phases not verified:}
⚠️ Pending verification: Phase {N}

{If issues exist:}
Open issues: {count}
EOF
)"
```

### Step 5: Push Branch

```bash
git push -u origin {branch}
```

### Step 6: Detect Preview URL

Based on deployment platform in `.opti-gsd/config.json`:

**Vercel:**
```bash
# If vercel CLI available
vercel ls --json 2>/dev/null | grep {branch}

# Or derive from pattern
# Pattern: {project}-{branch}-{team}.vercel.app
# Sanitized: gsd/v1.0 → gsd-v1-0
```

**Netlify:**
```bash
# Pattern: {branch}--{site-name}.netlify.app
# Sanitized: gsd/v1.0 → gsd-v1-0
```

**Railway:**
```bash
railway status --json 2>/dev/null
```

**GitHub Pages:**
```
# Pattern varies by config
```

### Step 7: Wait for Deployment (optional)

If deployment platform detected:

```
Pushed to origin/{branch}

Waiting for preview deployment...
──────────────────────────────────────────────────────────────
[▸] Vercel: Building...
```

Poll for deployment status:
- Vercel: `vercel ls --json` or check GitHub deployment status
- Use GitHub MCP if available: check deployment statuses

When ready:
```
Preview deployment ready!
──────────────────────────────────────────────────────────────
[✓] Vercel: https://myproject-gsd-v1-0-team.vercel.app

Preview URL saved to config. /verify will use this for E2E tests.
```

### Step 8: Update Config

Store preview URL in `.opti-gsd/state.json`:

```yaml
preview_url: https://myproject-gsd-v1-0-team.vercel.app
preview_deployed_at: {timestamp}
```

### Step 9: Report

```
╔══════════════════════════════════════════════════════════════╗
║                      Branch Pushed                           ║
╚══════════════════════════════════════════════════════════════╝

Branch:      gsd/v1.0
Remote:      origin/gsd/v1.0
Commits:     5 new commits pushed

Progress Summary:
──────────────────────────────────────────────────────────────
  Milestone:   v1.0
  Phase 1:     Auth [COMPLETE] [VERIFIED ✓]
  Phase 2:     Dashboard [COMPLETE] [VERIFIED ✓]
  Phase 3:     Settings [IN PROGRESS: 3/5 tasks]
──────────────────────────────────────────────────────────────

Preview Deployment:
──────────────────────────────────────────────────────────────
  Platform:  Vercel
  Status:    Ready
  URL:       https://myproject-gsd-v1-0-team.vercel.app
──────────────────────────────────────────────────────────────

{If unverified phases:}
⚠️  Phase 3 not yet verified. Run /opti-gsd:verify 3 after testing preview.

Next steps:
→ /opti-gsd:verify        — Verify against preview deployment
→ /opti-gsd:execute       — Continue with more tasks
→ /opti-gsd:status        — Check current state
```

If no deployment platform:
```
╔══════════════════════════════════════════════════════════════╗
║                      Branch Pushed                           ║
╚══════════════════════════════════════════════════════════════╝

Branch:      gsd/v1.0
Remote:      origin/gsd/v1.0
Commits:     5 new commits pushed

No preview deployment configured.
→ Run /opti-gsd:ci configure to set up deployment platform.

Next steps:
→ /opti-gsd:verify        — Verify locally
→ /opti-gsd:execute       — Continue with more tasks
```

---

## Arguments

| Argument | Description |
|----------|-------------|
| (none) | Push current branch and detect preview URL |
| `--wait` | Wait for deployment to complete (default if platform configured) |
| `--no-wait` | Push and return immediately, don't wait for deployment |

---

## Preview URL Patterns

| Platform | URL Pattern | Example |
|----------|-------------|---------|
| Vercel | `{project}-{branch}-{team}.vercel.app` | `myapp-gsd-v1-0-acme.vercel.app` |
| Netlify | `{branch}--{site}.netlify.app` | `gsd-v1-0--mysite.netlify.app` |
| Railway | Custom domain or `{service}.up.railway.app` | Via CLI |
| Render | `{service}-{branch}.onrender.com` | `myapp-gsd-v1-0.onrender.com` |
| Fly.io | Custom or `{app}.fly.dev` | Via CLI |

Branch name sanitization:
- `gsd/v1.0` → `gsd-v1-0`
- Replace `/` with `-`
- Replace `.` with `-`
- Lowercase

---

## Context Budget

Minimal: ~3%
