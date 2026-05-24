# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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