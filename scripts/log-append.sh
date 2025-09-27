#!/bin/bash
set -euo pipefail

# Script to append log entries with rotation and index management
TODAY=$(date +%F)
TARGET="logs/PROJECT_LOG/${TODAY}.md"
INDEX_FILE="logs/INDEX.md"

# Ensure the target file exists with header
if [[ ! -f "$TARGET" ]]; then
    echo "# Project Log — ${TODAY}" > "$TARGET"
    echo "" >> "$TARGET"
fi

# Check if file is too large (>200000 bytes) and needs rotation
if [[ -f "$TARGET" ]] && [[ $(stat -c%s "$TARGET") -gt 200000 ]]; then
    # Find next part number
    PART=2
    while [[ -f "${TARGET%.md}-part${PART}.md" ]]; do
        ((PART++))
    done

    # Create new part file
    TARGET="${TARGET%.md}-part${PART}.md"
    echo "# Project Log — ${TODAY} (Part ${PART})" > "$TARGET"
    echo "" >> "$TARGET"
fi

# Append content from STDIN to target file
cat >> "$TARGET"

# Update INDEX.md to include today's file(s) at the top
# First, get all today's files sorted by part number
TODAY_FILES=$(find logs/PROJECT_LOG -name "${TODAY}*.md" | sort -V)

# Create temporary file with new index content
TEMP_INDEX=$(mktemp)

# Write header
echo "---" > "$TEMP_INDEX"
echo "# Project Log Index" >> "$TEMP_INDEX"
echo "(Recent days – newest first)" >> "$TEMP_INDEX"
echo "<!-- ClaudeCode:insert-recent-here -->" >> "$TEMP_INDEX"

# Add today's files first
for file in $TODAY_FILES; do
    basename_file=$(basename "$file")
    echo "- [${basename_file}](PROJECT_LOG/${basename_file})" >> "$TEMP_INDEX"
done

# Add existing entries (excluding today's files), keep only 14 lines max
if [[ -f "$INDEX_FILE" ]]; then
    # Extract existing entries, excluding today's files
    sed -n '/<!-- ClaudeCode:insert-recent-here -->/,/---$/p' "$INDEX_FILE" | \
        grep -v "<!-- ClaudeCode:insert-recent-here -->" | \
        grep -v "^---$" | \
        grep -v "^$" | \
        grep -v "${TODAY}" | \
        head -14 >> "$TEMP_INDEX"
fi

echo "---" >> "$TEMP_INDEX"

# Replace the index file
mv "$TEMP_INDEX" "$INDEX_FILE"

echo "Log entry appended to: $TARGET"