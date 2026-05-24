# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0.0] - 2026-05-24

### Added
- **cc-start** - Wrapper script to auto-start Claude Code in tmux
  - Usage: `cc-start "description"` creates named tmux session
  - Claude Code starts automatically in detached mode
  - Session appears in cc-sessions, press Enter to attach
- **cc-list** - List all tmux sessions
- **cc-attach** - Quick attach to a tmux session

### New Workflow
```bash
# Start new Claude Code session (auto in tmux)
cc-start "coding MVP"

# Manage all sessions
cc-sessions  # Press Enter to attach, Ctrl-b d to detach

# Quick list/attach
cc-list
cc-attach cc-coding-MVP
```

## [0.1.0.0] - 2026-05-24

### Added
- **tmux session attach support** - Press Enter to attach to tmux sessions directly
- tmux session detection via /proc/<pid>/environ (TMUX env variable)
- Session displays `[tmux:session-name]` indicator for tmux sessions
- After detach (Ctrl-b d), TUI resumes automatically with session still running
- Guidance message for non-tmux sessions on how to start Claude in tmux

### Changed
- Enter key now attaches to tmux session (instead of just showing info)
- Footer text updated: "Enter: Attach" (was "Enter: Info")

### Fixed
- TypeScript type annotations for bun build compatibility

## [0.0.0.0] - 2026-05-24

### Added
- Initial MVP release
- TUI session list view with PID, cwd, status display
- Keyboard navigation (↑↓, Enter, e, r, q)
- Session description editing with persistence
- 2-second polling with manual refresh
- PID liveness check with procStart validation
- Schema version compatibility check (2.1.119)
- Linux-only MVP (uses /proc filesystem)

### Known Limitations
- Linux-only (requires /proc filesystem)
- Manual window switching (display info only, no auto-attach)
- No tmux auto-attach (planned for v1.1)

### Technical Notes
- Uses Node.js + TypeScript + ink for TUI
- Reads ~/.claude/sessions/*.json for session metadata
- Stores descriptions in ~/.claude/session-labels.json
- Atomic file writes for concurrent safety