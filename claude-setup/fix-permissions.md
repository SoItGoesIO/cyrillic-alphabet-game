# Fix Claude Code Permission Prompts - WSL Setup

## The Problem

Claude Code keeps asking for permissions because approvals are per-tool and session-scoped, plus Windows/WSL path mismatches.

## The Solution

### 1. Install Settings in WSL (Not Windows)

```bash
# In WSL terminal, create Claude config directory
mkdir -p ~/.claude

# Copy the settings file I created to the correct WSL location
cp /mnt/d/claudio/cyrillic-alphabet-game/cyril/claude-setup/wsl-settings.json ~/.claude/settings.json

# Verify it's there
ls -la ~/.claude/settings.json
cat ~/.claude/settings.json
```

### 2. Enable Auto-Accept for Edits

In Claude Code, press **Shift+Tab** to toggle "auto-accept edit on" mode. This eliminates file editing prompts.

### 3. Verification Script

```bash
# Test that Claude can read your settings
echo "Claude settings location: ~/.claude/settings.json"
echo "File exists: $(test -f ~/.claude/settings.json && echo "YES" || echo "NO")"
echo "File size: $(wc -c < ~/.claude/settings.json) bytes"
echo "Last modified: $(stat -c %y ~/.claude/settings.json)"
```

### 4. Additional Troubleshooting

#### If Still Getting Prompts:

- **Restart Claude Code completely**
- **Launch from project root consistently**
- **Update Claude Code** (recent Windows builds have permission bugs)

#### Project-Specific Override (Optional):

```bash
# If you want project-specific settings
cp ~/.claude/settings.json .claude/settings.local.json
# Edit .claude/settings.local.json as needed
```

### 5. What This Settings File Does

**ALLOWS** (No prompts):

- All file edits and reads
- Safe commands: git, make, npm, npx, psql, curl
- Docker read-only operations (ps, logs)
- Environment loading (source .env.private)
- File operations (ls, cat, mkdir, cp, mv)

**ASKS** (Confirms first):

- Destructive operations (rm, rmdir)
- Docker start/stop operations
- npm install/uninstall
- Database resets
- File modifications (sed -i)

**DENIES** (Never allowed):

- Reading secret files (.env._, secrets/_)
- Dangerous system operations (rm -rf, shutdown)
- Disk operations (dd, mkfs, fdisk)

### 6. Test the Setup

```bash
# These should work without prompts:
git status
make status
npm test
ls -la

# These should ask for confirmation:
make reset
rm somefile.txt
sudo anything
```

## Quick Fix Commands

```bash
# Copy settings to WSL
mkdir -p ~/.claude && cp /mnt/d/claudio/cyrillic-alphabet-game/cyril/claude-setup/wsl-settings.json ~/.claude/settings.json

# Verify settings
cat ~/.claude/settings.json | head -10

# Restart Claude Code after this setup
```

This should eliminate 90% of permission prompts while keeping you safe from dangerous operations.
