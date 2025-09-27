#!/bin/bash
set -euo pipefail

# Logging wrapper helper script
# Usage:
#   scripts/log.sh desktop   <<'EOF' ... EOF
#   scripts/log.sh code      <<'EOF' ... EOF

MODE="${1:-}"
if [[ -z "$MODE" ]]; then
    echo "Usage: $0 {desktop|code}"
    exit 1
fi

# Read input from STDIN
INPUT=$(cat)

# Check if input already has a heading (starts with ##)
if [[ "$INPUT" =~ ^##[[:space:]] ]]; then
    # Input already has heading, pass through
    echo "$INPUT" | scripts/log-append.sh
else
    # Prepend appropriate heading template
    case "$MODE" in
        desktop)
            scripts/log-entry-templates.sh desktop
            echo "$INPUT"
            ;;
        code)
            scripts/log-entry-templates.sh code
            echo "$INPUT"
            ;;
        *)
            echo "Error: Unknown mode '$MODE'. Use 'desktop' or 'code'."
            exit 1
            ;;
    esac | scripts/log-append.sh
fi