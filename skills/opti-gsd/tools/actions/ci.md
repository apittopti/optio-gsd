# ci -- Configure CI/CD Workflows

Configure or view CI/CD toolchain and deployment settings.

## Step 1: Validate Prerequisites

Check for required files and report standardized errors:

If `.opti-gsd/` doesn't exist:
```
Warning: opti-gsd Not Initialized
-------------------------------------
No .opti-gsd/ directory found in this project.

-> Run /opti-gsd:init to initialize an existing project
-> Run /opti-gsd:init new to start a new project
```

If `.opti-gsd/config.json` missing:
```
Warning: Configuration Missing
-------------------------------------
.opti-gsd/config.json not found.

-> Run /opti-gsd:init to reinitialize
```

## Step 2: Auto-Detect Toolchain

Detect package manager and scripts from project files. See [../reference/ci-templates.md](../reference/ci-templates.md) for language-specific detection templates.

**Node.js (package.json):**
```bash
# Detect package manager
if [ -f "pnpm-lock.yaml" ]; then echo "pnpm"
elif [ -f "yarn.lock" ]; then echo "yarn"
elif [ -f "bun.lockb" ]; then echo "bun"
elif [ -f "package-lock.json" ]; then echo "npm"
fi
```

Read `package.json` scripts and map:
| Script | CI Command |
|--------|------------|
| `build` | build |
| `test` | test |
| `lint` | lint |
| `typecheck` or `type-check` | typecheck |
| `test:e2e` or `e2e` | e2e |
| `test:unit` | unit_test |
| `test:integration` | integration |

## Step 2b: Detect Deployment Platform CLIs

Check for available deployment platform CLIs and extract project info:

- **Vercel:** `vercel --version`, `vercel inspect --json`, `vercel ls --json`
- **Netlify:** `netlify --version`, `netlify status --json`
- **Railway:** `railway --version`, `railway status`
- **Fly.io:** `fly version`, `fly status --json`

If a platform is detected, record its config:
```json
{
  "deploy": {
    "target": "vercel",
    "detected_from": "cli",
    "build_local": "vercel build",
    "preview_url": "{from vercel inspect}",
    "production_url": "{from vercel inspect --prod}"
  }
}
```

## Step 3: Detect Available MCPs

Check which MCPs are available for verification:

Map MCPs to capabilities:
| MCP | Capability |
|-----|------------|
| `claude-in-chrome` | Browser/E2E testing |
| `MCP_DOCKER` (GitHub) | CI status checks, PR validation |
| `playwright` | Headless browser testing |

## Step 4: Display Current Configuration

Show current CI config from `.opti-gsd/config.json`:

```
+--------------------------------------------------------------+
|                    CI/CD Configuration                        |
+--------------------------------------------------------------+

Toolchain:
--------------------------------------------------------------
  Package Manager:  npm
  Build:            npm run build
  Test:             npm test
  Lint:             npm run lint
  Typecheck:        tsc --noEmit
  E2E:              npm run test:e2e
--------------------------------------------------------------

URLs:
--------------------------------------------------------------
  Local:            http://localhost:3000
  API:              http://localhost:3000/api
  Staging:          https://staging.example.com
  Production:       https://example.com
--------------------------------------------------------------

Verification MCPs:
--------------------------------------------------------------
  [x] Browser (claude-in-chrome) -- E2E testing available
  [x] GitHub (MCP_DOCKER) -- CI status, PR checks
  [ ] Playwright -- Not configured
--------------------------------------------------------------

Deployment:
--------------------------------------------------------------
  Target:           vercel
  CI System:        github-actions
  Prod Branch:      main
--------------------------------------------------------------

Run /opti-gsd:tools ci configure to modify settings.
```

## Step 5: Configure Mode (if `ci configure` argument)

If user runs /opti-gsd:tools ci configure, ask:

**Toolchain Questions:**
1. "What's your build command?" (default: detected)
2. "What's your test command?" (default: detected)
3. "What's your lint command?" (default: detected or "none")
4. "Do you have E2E tests? What command runs them?" (default: detected or "none")

**URL Questions:**
1. "What's your local dev URL?" (default: http://localhost:3000)
2. "What's your API URL?" (default: same as local + /api, or "none")
3. "Do you have a staging environment? What's the URL?" (default: "none")
4. "What's your production URL?" (default: "none")

**Deployment Questions:**
1. "Where do you deploy?" (Vercel / Netlify / Railway / Render / AWS / Docker / Other / None)
2. "Do you use CI/CD?" (GitHub Actions / GitLab CI / CircleCI / None)
3. "What branch deploys to production?" (default: main)
4. "Does your platform auto-deploy branches for preview?" (Yes / No)
5. If yes: "What's your preview URL pattern?" (e.g., `https://{project}-{branch}.vercel.app`)

## Step 6: Update config.json

Update the `ci`, `urls`, and `deploy` sections in `.opti-gsd/config.json`:

```json
{
  "ci": {
    "package_manager": "npm",
    "build": "npm run build",
    "test": "npm test",
    "lint": "npm run lint",
    "typecheck": "tsc --noEmit",
    "e2e": "npm run test:e2e"
  },
  "urls": {
    "local": "http://localhost:3000",
    "api": "http://localhost:3000/api",
    "preview": null,
    "staging": "https://staging.example.com",
    "production": "https://example.com"
  },
  "deploy": {
    "target": "vercel",
    "detected_from": "cli",
    "ci_system": "github-actions",
    "production_branch": "main",
    "preview_pattern": "https://{project}-{branch}-{team}.vercel.app"
  },
  "verification": {
    "type": "browser",
    "browser_mcp": "claude-in-chrome",
    "github_mcp": "MCP_DOCKER"
  }
}
```

## Step 7: Commit Changes

```bash
git add .opti-gsd/config.json
git commit -m "chore: configure CI/CD toolchain"
```

## Step 8: Show Summary

```
CI/CD configured!

Verify will now run:
  1. npm run lint
  2. npm run typecheck
  3. npm test
  4. npm run build

E2E testing: Available via browser MCP
CI checks: Will verify GitHub Actions status

Next: /opti-gsd:verify to test the configuration
```

## CI Arguments

| Argument | Description |
|----------|-------------|
| (none) | Display current CI configuration |
| `configure` | Interactive configuration mode |
| `detect` | Re-run auto-detection and update config |

## Verification Integration

When /opti-gsd:verify runs, it reads the `ci:` section and executes:

1. **Lint** (if configured) -- Fast feedback on code style
2. **Typecheck** (if configured) -- Type safety verification
3. **Unit Tests** (if configured) -- Core functionality
4. **Build** (if configured) -- Compilation/bundling works
5. **E2E Tests** (if configured + browser MCP available) -- User flows work

If any command fails, verification reports the failure with output.
