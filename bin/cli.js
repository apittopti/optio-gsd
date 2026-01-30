#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}○${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  dim: (msg) => console.log(`${colors.dim}  ${msg}${colors.reset}`),
};

// Directories to ignore when scanning
const ignoreDirs = new Set([
  'node_modules', '.git', 'vendor', 'venv', '.venv', 'env', '.env',
  'dist', 'build', 'target', '__pycache__', '.next', '.nuxt',
  'coverage', '.nyc_output', '.cache', '.gsd', '.opti-gsd',
]);

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

function removeRecursive(dir) {
  if (!fs.existsSync(dir)) return false;
  fs.rmSync(dir, { recursive: true, force: true });
  return true;
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

function getVersion() {
  try {
    const packageJsonPath = path.join(getSourceDir(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    return packageJson.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

function printBanner(version) {
  console.log(`
${colors.blue}╔═══════════════════════════════════════╗
║           ${colors.reset}opti-gsd installer${colors.blue}           ║
║   ${colors.dim}Spec-driven development for Claude${colors.blue}   ║
╠═══════════════════════════════════════╣
║   ${colors.reset}Version: ${colors.cyan}${version.padEnd(28)}${colors.blue}║
╚═══════════════════════════════════════╝${colors.reset}
`);
}

async function confirmAction(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`  ${question} ${colors.dim}[Y/n]${colors.reset}: `, (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      resolve(normalized === '' || normalized === 'y' || normalized === 'yes');
    });
  });
}

/**
 * Prompt user for input with a default value
 */
function prompt(question, defaultValue = '') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    const defaultHint = defaultValue ? ` ${colors.dim}[${defaultValue}]${colors.reset}` : '';
    rl.question(`  ${question}${defaultHint}: `, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Prompt user to select from options
 */
async function selectOption(question, options) {
  console.log(`\n  ${colors.yellow}${question}${colors.reset}`);
  options.forEach((opt, i) => {
    console.log(`    ${colors.cyan}${i + 1}${colors.reset}) ${opt.label}`);
  });

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`\n  ${colors.dim}Enter choice [1-${options.length}]:${colors.reset} `, (answer) => {
      rl.close();
      const choice = parseInt(answer.trim(), 10);
      if (choice >= 1 && choice <= options.length) {
        resolve(options[choice - 1].value);
      } else {
        resolve(options[0].value); // Default to first option
      }
    });
  });
}

function printHelp() {
  console.log(`
${colors.blue}opti-gsd${colors.reset} - Spec-driven development for Claude Code

${colors.yellow}Usage:${colors.reset}
  npx github:apittopti/opti-gsd init [options]
  npx github:apittopti/opti-gsd uninstall [options]

${colors.yellow}Commands:${colors.reset}
  init        Install or update opti-gsd (always fetches latest)
  uninstall   Remove opti-gsd from global or local installation

${colors.yellow}Options:${colors.reset}
  --global    Install/uninstall from ~/.claude/ (available in all projects)
  --local     Install/uninstall from ./.claude/ (this project only)
  --help      Show this help message

${colors.yellow}Examples:${colors.reset}
  npx github:apittopti/opti-gsd init           # Interactive prompt
  npx github:apittopti/opti-gsd init --global  # Install to ~/.claude/
  npx github:apittopti/opti-gsd init --local   # Install to ./.claude/
  npx github:apittopti/opti-gsd uninstall      # Remove installation

${colors.yellow}Tool Detection:${colors.reset}
  After installation, run /opti-gsd:tools detect in Claude Code
  to discover available MCP servers, plugins, and capabilities.
`);
}

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const command = args.find(a => !a.startsWith('-')) || 'init';
  let isGlobal = args.includes('--global');
  let isLocal = args.includes('--local');
  const showHelp = args.includes('--help') || args.includes('-h');

  if (showHelp) {
    printHelp();
    process.exit(0);
  }

  const version = getVersion();
  printBanner(version);

  const cwd = process.cwd();
  const sourceDir = getSourceDir();

  // Interactive mode if no location flag provided and TTY is available
  if (!isGlobal && !isLocal && (command === 'init' || command === 'uninstall')) {
    if (process.stdin.isTTY) {
      const location = await selectOption('Where would you like to install?', [
        { label: `Global ${colors.dim}(~/.claude/ - available in all projects)${colors.reset}`, value: 'global' },
        { label: `Local ${colors.dim}(./.claude/ - this project only)${colors.reset}`, value: 'local' },
      ]);
      isGlobal = location === 'global';
      isLocal = location === 'local';
      console.log('');
    } else {
      // Default to global when not interactive
      isGlobal = true;
      log.info('No TTY detected, defaulting to global install');
    }
  }

  // Determine install location
  let installDir;

  if (isLocal) {
    installDir = path.join(cwd, '.claude');
    log.info(`Installing to ${colors.dim}./.claude/${colors.reset} (project-local)`);
  } else {
    // Default to global
    installDir = path.join(os.homedir(), '.claude');
    log.info(`Installing to ${colors.dim}~/.claude/${colors.reset} (global)`);
  }

  if (command === 'init') {
    // Check if already installed (check both old commands/ and new skills/ locations)
    const existingCommands = fs.existsSync(path.join(installDir, 'commands', 'opti-gsd'));
    const existingSkills = fs.existsSync(path.join(installDir, 'skills', 'opti-gsd'));
    const existingInstall = existingCommands || existingSkills;
    const action = existingInstall ? 'Update' : 'Install';

    // Confirm before proceeding (if TTY available)
    if (process.stdin.isTTY) {
      const confirmed = await confirmAction(`${action} opti-gsd v${version}?`);
      if (!confirmed) {
        log.warn('Installation cancelled');
        process.exit(0);
      }
      console.log('');
    }

    // Create install directory
    if (!fs.existsSync(installDir)) {
      fs.mkdirSync(installDir, { recursive: true });
    }

    // Clean up legacy commands/ directory (migrated to skills/ in v2.6.0)
    const legacyCommandsPath = path.join(installDir, 'commands', 'opti-gsd');
    if (fs.existsSync(legacyCommandsPath)) {
      removeRecursive(legacyCommandsPath);
      log.success('Removed legacy commands/opti-gsd (migrated to skills/)');
    }

    // Clean up old individual skill directories (consolidated in v2.6.0)
    // 41 individual skills were consolidated into 15. Remove stale directories.
    const skillsPath = path.join(installDir, 'skills', 'opti-gsd');
    if (fs.existsSync(skillsPath)) {
      const consolidatedSkills = new Set([
        'codebase', 'config', 'debug', 'execute', 'help', 'init',
        'milestone', 'plan', 'push', 'roadmap', 'session', 'status',
        'tools', 'track', 'verify',
      ]);
      for (const entry of fs.readdirSync(skillsPath)) {
        if (!consolidatedSkills.has(entry)) {
          const staleDir = path.join(skillsPath, entry);
          if (fs.statSync(staleDir).isDirectory()) {
            removeRecursive(staleDir);
          }
        }
      }
      log.success('Cleaned up legacy individual skill directories');
    }

    // Copy opti-gsd files
    log.info('Copying opti-gsd files...');

    // Skills consolidated in v2.6.0 — 15 skills with subcommand routing
    const dirsToInstall = ['skills', 'agents', 'docs'];
    for (const dir of dirsToInstall) {
      const srcPath = path.join(sourceDir, dir, 'opti-gsd');
      const destPath = path.join(installDir, dir, 'opti-gsd');
      if (fs.existsSync(srcPath)) {
        copyRecursive(srcPath, destPath);
        log.success(`Installed ${dir}/opti-gsd`);
      }
    }

    // Copy scripts (statusline, tool analysis)
    const scriptsSrc = path.join(sourceDir, 'scripts');
    if (fs.existsSync(scriptsSrc)) {
      const scriptsDest = path.join(installDir, 'scripts', 'opti-gsd');
      copyRecursive(scriptsSrc, scriptsDest);
      log.success('Installed scripts/opti-gsd');
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

    console.log('');
    log.info('Tool detection is now done inside Claude Code');
    log.dim('Run /opti-gsd:tools detect to discover MCP servers and plugins');
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
  console.log(`  2. Run: ${colors.blue}/opti-gsd:init${colors.reset} (auto-detects tools)`);
  console.log(`  3. Run: ${colors.blue}/opti-gsd:status${colors.reset}`);
  console.log(`${colors.green}════════════════════════════════════════${colors.reset}`);
}

main().catch((err) => {
  log.error(`Installation failed: ${err.message}`);
  process.exit(1);
});
