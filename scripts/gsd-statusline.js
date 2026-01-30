#!/usr/bin/env node
// opti-gsd statusline script for Claude Code
// Displays project phase progress with smooth Unicode progress bars

const fs = require('fs');
const path = require('path');

// Progress bar characters (eighth-blocks for smooth display)
const BLOCKS = ['', '▏', '▎', '▍', '▌', '▋', '▊', '▉'];
const FULL = '█';
const EMPTY = '░';

// Generate smooth progress bar
function progressBar(percent, width = 10) {
    const totalEighths = Math.floor((percent * width * 8) / 100);
    const wholeBlocks = Math.floor(totalEighths / 8);
    const partial = totalEighths % 8;
    const emptyBlocks = width - wholeBlocks - (partial > 0 ? 1 : 0);

    let bar = FULL.repeat(wholeBlocks);
    if (partial > 0) bar += BLOCKS[partial];
    bar += EMPTY.repeat(Math.max(0, emptyBlocks));

    return bar;
}

// Parse state.json for phase info
function parseState(stateContent) {
    const result = {
        phase: 1,
        totalPhases: 1,
        milestone: '',
        mode: ''
    };

    try {
        const state = JSON.parse(stateContent);
        if (state.current_phase) result.phase = parseInt(state.current_phase);
        if (state.total_phases) result.totalPhases = parseInt(state.total_phases);
        if (state.milestone) result.milestone = state.milestone;
        if (state.mode) result.mode = state.mode;
    } catch (e) {
        // Fallback: try regex parsing for backward compatibility
        const phaseMatch = stateContent.match(/current_phase[":]\s*(\d+)/);
        if (phaseMatch) result.phase = parseInt(phaseMatch[1]);

        const totalMatch = stateContent.match(/total_phases[":]\s*(\d+)/);
        if (totalMatch) result.totalPhases = parseInt(totalMatch[1]);

        const milestoneMatch = stateContent.match(/milestone[":]\s*"?(\S+)"?/);
        if (milestoneMatch) result.milestone = milestoneMatch[1];

        const modeMatch = stateContent.match(/mode[":]\s*"?(\w+)"?/);
        if (modeMatch) result.mode = modeMatch[1];
    }

    return result;
}

// Main
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
    let data = {};
    try {
        data = JSON.parse(input);
    } catch (e) {
        data = {};
    }

    const model = data?.model?.display_name || 'Claude';
    const contextUsed = Math.floor(data?.context_window?.used_percentage || 0);
    const cwd = data?.workspace?.current_dir || process.cwd();

    // Check for opti-gsd project
    const gsdDir = path.join(cwd, '.opti-gsd');
    if (!fs.existsSync(gsdDir)) {
        console.log(`[${model}] gsd:--`);
        process.exit(0);
    }

    // Read state.json
    const stateFile = path.join(gsdDir, 'state.json');
    if (!fs.existsSync(stateFile)) {
        console.log(`[${model}] gsd:init`);
        process.exit(0);
    }

    let stateContent = '';
    try {
        stateContent = fs.readFileSync(stateFile, 'utf8');
    } catch (e) {
        console.log(`[${model}] gsd:err`);
        process.exit(0);
    }

    const state = parseState(stateContent);

    // Calculate progress
    const phaseProgress = state.totalPhases > 0
        ? Math.floor(((state.phase - 1) * 100) / state.totalPhases)
        : 0;

    // Build status line
    const bar = progressBar(phaseProgress, 8);
    let status = `[${model}] gsd:${state.phase}/${state.totalPhases} [${bar}]`;

    if (state.milestone) status += ` ${state.milestone}`;

    // Mode indicator
    if (state.mode === 'autonomous') status += ' A';
    else if (state.mode === 'yolo') status += ' Y';

    // Context warning
    if (contextUsed > 80) status += ` ctx:${contextUsed}%!`;
    else if (contextUsed > 60) status += ` ctx:${contextUsed}%`;

    console.log(status);
});
