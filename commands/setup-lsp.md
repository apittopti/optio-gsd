---
description: Detect project languages and recommend LSP plugins for enhanced code intelligence.
---

# setup-lsp

Detect project languages and recommend LSP plugins for enhanced code intelligence.

**Note:** LSP is optional. opti-gsd works without it, but LSP provides faster navigation and real-time error detection.

## Behavior

### Step 1: Scan Project for Languages

Count files by extension in the project (excluding node_modules, .git, vendor, etc.):

```bash
# Pseudocode - scan common extensions
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" ... \) | wc -l
```

Build a language profile:

```markdown
## Project Language Profile

| Language | Files | Extensions |
|----------|-------|------------|
| TypeScript | 127 | .ts, .tsx |
| Python | 34 | .py |
| Go | 12 | .go |
| Rust | 0 | .rs |
```

### Step 2: Map Languages to LSP Plugins

Use this mapping (official Claude Code marketplace):

| Language | Plugin | Binary Required |
|----------|--------|-----------------|
| TypeScript/JavaScript | typescript-lsp@claude-plugins-official | typescript-language-server |
| Python | pyright-lsp@claude-plugins-official | pyright-langserver |
| Go | gopls-lsp@claude-plugins-official | gopls |
| Rust | rust-analyzer-lsp@claude-plugins-official | rust-analyzer |
| C/C++ | clangd-lsp@claude-plugins-official | clangd |
| Java | jdtls-lsp@claude-plugins-official | jdtls |
| C# | csharp-lsp@claude-plugins-official | csharp-ls |
| PHP | php-lsp@claude-plugins-official | intelephense |
| Swift | swift-lsp@claude-plugins-official | sourcekit-lsp |
| Kotlin | kotlin-lsp@claude-plugins-official | kotlin-language-server |
| Lua | lua-lsp@claude-plugins-official | lua-language-server |

### Step 3: Check Current LSP Status

Run `/plugins` or check installed plugins to see what's already available.

### Step 4: Present Recommendations

```markdown
## LSP Recommendations

Based on your project, these LSP plugins would help:

### Recommended (detected in project)

**TypeScript** (127 files)
```
/plugin install typescript-lsp@claude-plugins-official
```
Binary: `npm install -g typescript-language-server typescript`

**Python** (34 files)
```
/plugin install pyright-lsp@claude-plugins-official
```
Binary: `pip install pyright` or `npm install -g pyright`

### Already Installed
- gopls-lsp (Go)

### Not Needed (no files detected)
- rust-analyzer-lsp, clangd-lsp, jdtls-lsp, etc.

---

## What LSP Provides

| Feature | Without LSP | With LSP |
|---------|-------------|----------|
| Find definition | ~45 seconds (text search) | ~50ms |
| Type errors | After running build | Real-time |
| Missing imports | Manual detection | Automatic |
| Symbol navigation | Grep-based | Language-aware |

---

## Next Steps

1. Install recommended plugins above
2. Install required binaries on your system
3. Restart Claude Code session
4. Run /opti-gsd:verify to see LSP diagnostics in action
```

### Step 5: Optional - Project Settings

Offer to add plugins to project settings for team sharing:

```markdown
## Share with Team?

Add to `.claude/settings.json` so teammates get the same LSP setup:

```json
{
  "enabledPlugins": [
    "typescript-lsp@claude-plugins-official",
    "pyright-lsp@claude-plugins-official"
  ]
}
```

Create this file? (yes/no)
```

On confirm, create or update `.claude/settings.json`.

---

## Quick Mode

Skip detection and just show the full plugin list:

```
/opti-gsd:setup-lsp list
```

Shows all available LSP plugins with install commands.

---

## Examples

```
/opti-gsd:setup-lsp           # Detect and recommend
/opti-gsd:setup-lsp list      # Show all available plugins
/opti-gsd:setup-lsp status    # Check what's installed
```

---

## Why LSP is Optional

opti-gsd is language-agnostic by design:
- Works with any language, framework, or stack
- LSP enhances but doesn't change the workflow
- Projects without LSP support still get full opti-gsd functionality

LSP is recommended for:
- Large codebases where navigation speed matters
- Statically-typed languages where type checking helps
- Teams that want consistent code intelligence

---

## Context Budget

Minimal: ~3%
