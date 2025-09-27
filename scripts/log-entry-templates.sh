#!/bin/bash
set -euo pipefail

# Log entry templates for structured logging

desktop_summary() {
    cat <<EOF
## [$(date -Iseconds)] Desktop Summary
### Core Changes
- …
### Verification Results
- …
### Docs Updated
- …
### Next Actions
1) …

EOF
}

code_run() {
    cat <<EOF
## [$(date -Iseconds)] Code Run
**Commands**
\`\`\`bash
# paste commands that were run
\`\`\`
**Results (truncated)**
\`\`\`
# paste brief outputs / statuses
\`\`\`
**Artifacts**
- path/to/file …

EOF
}

# Main function dispatcher
case "${1:-}" in
    desktop)
        desktop_summary
        ;;
    code)
        code_run
        ;;
    *)
        echo "Usage: $0 {desktop|code}"
        exit 1
        ;;
esac