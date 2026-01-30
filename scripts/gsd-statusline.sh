#!/bin/bash
# opti-gsd statusline script for Claude Code
# Displays project phase progress with smooth Unicode progress bars

input=$(cat)

# Parse Claude Code context
MODEL=$(echo "$input" | jq -r '.model.display_name // "Claude"')
CONTEXT_USED=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
CWD=$(echo "$input" | jq -r '.workspace.current_dir // "."')

# Progress bar characters (eighth-blocks for smooth display)
BLOCKS=("" "▏" "▎" "▍" "▌" "▋" "▊" "▉")
FULL="█"
EMPTY="░"

# Function to generate smooth progress bar
# Usage: progress_bar <percentage> <width>
progress_bar() {
    local percent=$1
    local width=${2:-10}
    local bar=""

    # Calculate eighths
    local total_eighths=$((percent * width * 8 / 100))
    local whole_blocks=$((total_eighths / 8))
    local partial=$((total_eighths % 8))
    local empty_blocks=$((width - whole_blocks - (partial > 0 ? 1 : 0)))

    # Build bar
    for ((i=0; i<whole_blocks; i++)); do
        bar+="$FULL"
    done

    if [ $partial -gt 0 ]; then
        bar+="${BLOCKS[$partial]}"
    fi

    for ((i=0; i<empty_blocks; i++)); do
        bar+="$EMPTY"
    done

    echo "$bar"
}

# Check for opti-gsd project
GSD_DIR="$CWD/.opti-gsd"
if [ ! -d "$GSD_DIR" ]; then
    # Not an opti-gsd project - show minimal status
    echo "[$MODEL] gsd:--"
    exit 0
fi

# Read state.json if it exists
STATE_FILE="$GSD_DIR/state.json"
if [ ! -f "$STATE_FILE" ]; then
    echo "[$MODEL] gsd:init"
    exit 0
fi

# Parse state.json (jq-based parsing)
PHASE=$(jq -r '.current_phase // 1' "$STATE_FILE" 2>/dev/null || echo "1")
TOTAL_PHASES=$(jq -r '.total_phases // 1' "$STATE_FILE" 2>/dev/null || echo "1")
MILESTONE=$(jq -r '.milestone // ""' "$STATE_FILE" 2>/dev/null || echo "")
MODE=$(jq -r '.mode // ""' "$STATE_FILE" 2>/dev/null || echo "")

# Calculate overall progress
if [ "$TOTAL_PHASES" -gt 0 ]; then
    PHASE_PROGRESS=$(( (PHASE - 1) * 100 / TOTAL_PHASES ))
else
    PHASE_PROGRESS=0
fi

# Generate progress bar (width=8 for compact display)
BAR=$(progress_bar $PHASE_PROGRESS 8)

# Build status line
STATUS="[$MODEL] gsd:$PHASE/$TOTAL_PHASES [$BAR]"

# Add milestone if present
if [ -n "$MILESTONE" ]; then
    STATUS="$STATUS $MILESTONE"
fi

# Add mode indicator
case "$MODE" in
    autonomous) STATUS="$STATUS A" ;;
    yolo) STATUS="$STATUS Y" ;;
esac

# Add context usage warning if high
if [ "$CONTEXT_USED" -gt 80 ]; then
    STATUS="$STATUS ctx:${CONTEXT_USED}%!"
elif [ "$CONTEXT_USED" -gt 60 ]; then
    STATUS="$STATUS ctx:${CONTEXT_USED}%"
fi

echo "$STATUS"
