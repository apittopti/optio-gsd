#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}○${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  dim: (msg) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
};

// Language detection configuration
const languageConfig = {
  typescript: {
    configFiles: ['tsconfig.json', 'tsconfig.base.json'],
    extensions: ['.ts', '.tsx'],
    lspPlugin: 'typescript-lsp@claude-plugins-official',
    binary: 'typescript-language-server',
    installCmd: 'npm install -g typescript-language-server typescript',
  },
  javascript: {
    configFiles: ['package.json', 'jsconfig.json'],
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    lspPlugin: 'typescript-lsp@claude-plugins-official', // Same LSP handles JS
    binary: 'typescript-language-server',
    installCmd: 'npm install -g typescript-language-server typescript',
  },
  python: {
    configFiles: ['pyproject.toml', 'requirements.txt', 'setup.py', 'Pipfile'],
    extensions: ['.py'],
    lspPlugin: 'pyright-lsp@claude-plugins-official',
    binary: 'pyright-langserver',
    installCmd: 'pip install pyright',
  },
  go: {
    configFiles: ['go.mod', 'go.sum'],
    extensions: ['.go'],
    lspPlugin: 'gopls-lsp@claude-plugins-official',
    binary: 'gopls',
    installCmd: 'go install golang.org/x/tools/gopls@latest',
  },
  rust: {
    configFiles: ['Cargo.toml', 'Cargo.lock'],
    extensions: ['.rs'],
    lspPlugin: 'rust-analyzer-lsp@claude-plugins-official',
    binary: 'rust-analyzer',
    installCmd: 'rustup component add rust-analyzer',
  },
  java: {
    configFiles: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
    extensions: ['.java'],
    lspPlugin: 'jdtls-lsp@claude-plugins-official',
    binary: 'jdtls',
    installCmd: 'See https://github.com/eclipse-jdtls/eclipse.jdt.ls',
  },
  php: {
    configFiles: ['composer.json'],
    extensions: ['.php'],
    lspPlugin: 'php-lsp@claude-plugins-official',
    binary: 'intelephense',
    installCmd: 'npm install -g intelephense',
  },
  csharp: {
    configFiles: ['*.csproj', '*.sln'],
    extensions: ['.cs'],
    lspPlugin: 'csharp-lsp@claude-plugins-official',
    binary: 'csharp-ls',
    installCmd: 'dotnet tool install -g csharp-ls',
  },
  swift: {
    configFiles: ['Package.swift'],
    extensions: ['.swift'],
    lspPlugin: 'swift-lsp@claude-plugins-official',
    binary: 'sourcekit-lsp',
    installCmd: 'Included with Xcode',
  },
  kotlin: {
    configFiles: ['build.gradle.kts'],
    extensions: ['.kt', '.kts'],
    lspPlugin: 'kotlin-lsp@claude-plugins-official',
    binary: 'kotlin-language-server',
    installCmd: 'See https://github.com/fwcd/kotlin-language-server',
  },
};

// Directories to ignore when scanning
const ignoreDirs = new Set([
  'node_modules', '.git', 'vendor', 'venv', '.venv', 'env', '.env',
  'dist', 'build', 'target', '__pycache__', '.next', '.nuxt',
  'coverage', '.nyc_output', '.cache', '.gsd',
]);

function detectLanguages(dir) {
  const detected = new Map(); // language -> { fromConfig: bool, fileCount: number }

  // First, check config files (most reliable)
  for (const [lang, config] of Object.entries(languageConfig)) {
    for (const configFile of config.configFiles) {
      if (configFile.includes('*')) {
        // Glob pattern - check if any matching files exist
        try {
          const files = fs.readdirSync(dir);
          const pattern = configFile.replace('*', '');
          if (files.some(f => f.endsWith(pattern))) {
            detected.set(lang, { fromConfig: true, fileCount: 0 });
            break;
          }
        } catch (e) { /* ignore */ }
      } else if (fs.existsSync(path.join(dir, configFile))) {
        detected.set(lang, { fromConfig: true, fileCount: 0 });
        break;
      }
    }
  }

  // Then scan for source files (with depth limit)
  const fileCount = {};

  function scanDir(currentDir, depth = 0) {
    if (depth > 3) return; // Limit depth to avoid slow scans

    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          if (!ignoreDirs.has(entry.name) && !entry.name.startsWith('.')) {
            scanDir(path.join(currentDir, entry.name), depth + 1);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          for (const [lang, config] of Object.entries(languageConfig)) {
            if (config.extensions.includes(ext)) {
              fileCount[lang] = (fileCount[lang] || 0) + 1;
            }
          }
        }
      }
    } catch (e) { /* ignore permission errors */ }
  }

  scanDir(dir);

  // Add file counts and detect languages with significant files
  for (const [lang, count] of Object.entries(fileCount)) {
    if (detected.has(lang)) {
      detected.get(lang).fileCount = count;
    } else if (count >= 3) { // At least 3 files to consider it significant
      detected.set(lang, { fromConfig: false, fileCount: count });
    }
  }

  return detected;
}

function getSourceDir() {
  // Get the directory where opti-gsd package is installed
  return path.resolve(__dirname, '..');
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;

  const stats = fs.statSync(src);

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    for (const entry of fs.readdirSync(src)) {
      // Skip files/dirs we don't want to copy
      if (entry === 'node_modules' || entry === '.git' ||
          entry === 'bin' || entry === 'package.json' ||
          entry === 'package-lock.json' || entry === '.claude-plugin') {
        continue;
      }
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

function installLspPlugin(plugin, scope) {
  try {
    log.dim(`Installing ${plugin}...`);
    execSync(`claude plugin install ${plugin} --scope ${scope}`, {
      stdio: 'pipe',
      timeout: 60000,
    });
    return true;
  } catch (e) {
    // Check if already installed
    if (e.message && e.message.includes('already installed')) {
      return true;
    }
    return false;
  }
}

function checkBinaryExists(binary) {
  try {
    execSync(`which ${binary}`, { stdio: 'pipe' });
    return true;
  } catch (e) {
    return false;
  }
}

function removeRecursive(dir) {
  if (!fs.existsSync(dir)) return false;
  fs.rmSync(dir, { recursive: true, force: true });
  return true;
}

function uninstallLspPlugin(plugin, scope) {
  try {
    execSync(`claude plugin uninstall ${plugin} --scope ${scope}`, {
      stdio: 'pipe',
      timeout: 60000,
    });
    return true;
  } catch (e) {
    return false;
  }
}

function removeOptiGsdFromClaudeMd(claudeMdPath) {
  if (!fs.existsSync(claudeMdPath)) return false;

  const content = fs.readFileSync(claudeMdPath, 'utf8');
  if (!content.includes('opti-gsd')) return false;

  // Remove opti-gsd section - look for the header and remove until next major section or end
  const lines = content.split('\n');
  const filteredLines = [];
  let inOptiGsdSection = false;

  for (const line of lines) {
    // Detect start of opti-gsd section
    if (line.includes('opti-gsd') && (line.startsWith('#') || line.startsWith('**'))) {
      inOptiGsdSection = true;
      continue;
    }

    // Detect end of opti-gsd section (next major header not about opti-gsd)
    if (inOptiGsdSection && line.startsWith('# ') && !line.includes('opti-gsd')) {
      inOptiGsdSection = false;
    }

    if (!inOptiGsdSection) {
      filteredLines.push(line);
    }
  }

  const newContent = filteredLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  if (newContent.length === 0) {
    fs.unlinkSync(claudeMdPath);
    return true;
  }

  fs.writeFileSync(claudeMdPath, newContent + '\n');
  return true;
}

function printBanner() {
  console.log(`
${colors.blue}╔═══════════════════════════════════════╗
║           ${colors.reset}opti-gsd installer${colors.blue}           ║
║   ${colors.dim}Spec-driven development for Claude${colors.blue}   ║
╚═══════════════════════════════════════╝${colors.reset}
`);
}

function printHelp() {
  console.log(`
${colors.blue}opti-gsd${colors.reset} - Spec-driven development for Claude Code

${colors.yellow}Usage:${colors.reset}
  npx github:apittopti/opti-gsd init [options]
  npx github:apittopti/opti-gsd update
  npx github:apittopti/opti-gsd setup-lsp
  npx github:apittopti/opti-gsd uninstall [options]

${colors.yellow}Commands:${colors.reset}
  init        Install opti-gsd and detect project languages
  update      Update opti-gsd to latest version
  setup-lsp   Detect languages and install LSP plugins only
  uninstall   Remove opti-gsd from global or local installation

${colors.yellow}Options:${colors.reset}
  --global    Install/uninstall from ~/.claude/ (available in all projects)
  --local     Install/uninstall from ./.claude/ (this project only)
  --skip-lsp  Skip LSP plugin installation/removal
  --help      Show this help message

${colors.yellow}Examples:${colors.reset}
  npx github:apittopti/opti-gsd init --global
  npx github:apittopti/opti-gsd init --local --skip-lsp
  npx github:apittopti/opti-gsd setup-lsp
  npx github:apittopti/opti-gsd uninstall --global
`);
}

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const command = args.find(a => !a.startsWith('-')) || 'init';
  const isGlobal = args.includes('--global');
  const isLocal = args.includes('--local');
  const skipLsp = args.includes('--skip-lsp');
  const showHelp = args.includes('--help') || args.includes('-h');

  if (showHelp) {
    printHelp();
    process.exit(0);
  }

  printBanner();

  const cwd = process.cwd();
  const sourceDir = getSourceDir();

  // Determine install location
  let installDir;
  let scope;

  if (isLocal) {
    installDir = path.join(cwd, '.claude');
    scope = 'project';
    log.info(`Installing to ${colors.dim}./.claude/${colors.reset} (project-local)`);
  } else {
    // Default to global
    installDir = path.join(os.homedir(), '.claude');
    scope = 'user';
    log.info(`Installing to ${colors.dim}~/.claude/${colors.reset} (global)`);
  }

  if (command === 'init' || command === 'update') {
    // Create install directory
    if (!fs.existsSync(installDir)) {
      fs.mkdirSync(installDir, { recursive: true });
    }

    // Copy opti-gsd files
    log.info('Copying opti-gsd files...');

    const dirsToVopy = ['commands', 'agents', 'skills', 'docs'];
    for (const dir of dirsToVopy) {
      const srcPath = path.join(sourceDir, dir);
      const destPath = path.join(installDir, dir, 'opti-gsd');
      if (fs.existsSync(srcPath)) {
        copyRecursive(srcPath, destPath);
      }
    }

    // Copy CLAUDE.md content
    const claudeMdSrc = path.join(sourceDir, 'CLAUDE.md');
    if (fs.existsSync(claudeMdSrc)) {
      const claudeMdDest = path.join(installDir, 'CLAUDE.md');
      const srcContent = fs.readFileSync(claudeMdSrc, 'utf8');

      if (fs.existsSync(claudeMdDest)) {
        // Append if exists and doesn't already have opti-gsd content
        const existingContent = fs.readFileSync(claudeMdDest, 'utf8');
        if (!existingContent.includes('opti-gsd')) {
          fs.appendFileSync(claudeMdDest, '\n\n' + srcContent);
          log.success('Appended opti-gsd instructions to CLAUDE.md');
        } else {
          log.warn('CLAUDE.md already contains opti-gsd instructions');
        }
      } else {
        fs.writeFileSync(claudeMdDest, srcContent);
        log.success('Created CLAUDE.md');
      }
    }

    log.success('opti-gsd files installed');
  }

  // Language detection and LSP installation
  if (!skipLsp && (command === 'init' || command === 'setup-lsp')) {
    console.log('');
    log.info('Detecting project languages...');

    const detected = detectLanguages(cwd);

    if (detected.size === 0) {
      log.warn('No project languages detected');
      log.dim('Run /opti-gsd:setup-lsp in Claude Code after creating files');
    } else {
      console.log('');
      log.info('Detected languages:');

      const lspToInstall = new Set();
      const missingBinaries = [];

      for (const [lang, info] of detected) {
        const config = languageConfig[lang];
        const source = info.fromConfig ? 'config file' : `${info.fileCount} files`;
        console.log(`  ${colors.green}•${colors.reset} ${lang} ${colors.dim}(${source})${colors.reset}`);

        if (config.lspPlugin) {
          lspToInstall.add(lang);
          if (!checkBinaryExists(config.binary)) {
            missingBinaries.push({ lang, ...config });
          }
        }
      }

      // Install LSP plugins
      if (lspToInstall.size > 0) {
        console.log('');
        log.info('Installing LSP plugins...');

        const installed = [];
        const failed = [];

        for (const lang of lspToInstall) {
          const config = languageConfig[lang];
          // TypeScript and JavaScript share the same LSP
          if (lang === 'javascript' && lspToInstall.has('typescript')) {
            continue; // Skip, will be covered by typescript
          }

          if (installLspPlugin(config.lspPlugin, scope)) {
            installed.push(lang);
            log.success(`Installed ${config.lspPlugin}`);
          } else {
            failed.push(lang);
            log.error(`Failed to install ${config.lspPlugin}`);
          }
        }

        // Report missing binaries
        if (missingBinaries.length > 0) {
          console.log('');
          log.warn('Language server binaries not found:');
          for (const { lang, binary, installCmd } of missingBinaries) {
            console.log(`  ${colors.yellow}•${colors.reset} ${lang}: ${binary}`);
            log.dim(`  Install: ${installCmd}`);
          }
        }
      }
    }
  }

  // Handle uninstall command
  if (command === 'uninstall') {
    console.log('');
    log.info('Uninstalling opti-gsd...');

    const dirsToRemove = ['commands', 'agents', 'skills', 'docs'];
    let removedCount = 0;

    for (const dir of dirsToRemove) {
      const targetPath = path.join(installDir, dir, 'opti-gsd');
      if (removeRecursive(targetPath)) {
        log.success(`Removed ${dir}/opti-gsd`);
        removedCount++;
      }
    }

    // Remove opti-gsd content from CLAUDE.md
    const claudeMdPath = path.join(installDir, 'CLAUDE.md');
    if (removeOptiGsdFromClaudeMd(claudeMdPath)) {
      log.success('Removed opti-gsd content from CLAUDE.md');
    }

    // Uninstall LSP plugins if requested
    if (!skipLsp) {
      console.log('');
      log.info('Checking for LSP plugins to remove...');

      const lspPlugins = new Set();
      for (const config of Object.values(languageConfig)) {
        if (config.lspPlugin) {
          lspPlugins.add(config.lspPlugin);
        }
      }

      for (const plugin of lspPlugins) {
        if (uninstallLspPlugin(plugin, scope)) {
          log.success(`Uninstalled ${plugin}`);
        }
      }
    }

    if (removedCount === 0) {
      log.warn('No opti-gsd installation found');
    }

    console.log('');
    console.log(`${colors.green}════════════════════════════════════════${colors.reset}`);
    log.success('Uninstall complete!');
    console.log(`${colors.green}════════════════════════════════════════${colors.reset}`);
    return;
  }

  // Final message
  console.log('');
  console.log(`${colors.green}════════════════════════════════════════${colors.reset}`);
  log.success('Installation complete!');
  console.log('');
  console.log('Next steps:');
  console.log(`  1. Start Claude Code: ${colors.blue}claude${colors.reset}`);
  console.log(`  2. Run: ${colors.blue}/opti-gsd:status${colors.reset}`);
  console.log(`${colors.green}════════════════════════════════════════${colors.reset}`);
}

main().catch((err) => {
  log.error(`Installation failed: ${err.message}`);
  process.exit(1);
});
