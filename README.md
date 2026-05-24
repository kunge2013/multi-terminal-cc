# Claude Code Sessions Manager

A TUI tool for managing multiple Claude Code sessions in parallel.

## Problem

Professional developers running 5+ concurrent Claude Code tasks waste 10-20 minutes daily finding and switching between terminal windows. The core issue is **semantic state invisibility** — tmux can switch windows, but can't show what each Claude session is doing.

## Solution

`cc-sessions` provides a TUI dashboard showing all active Claude Code sessions with:
- **Session list**: PID, working directory, status (busy/idle), user-set description
- **One-glance overview**: See all sessions instantly
- **Keyboard control**: Navigate, inspect, edit descriptions without leaving terminal

## Installation

```bash
# Clone and build
git clone https://github.com/kunge2013/multi-terminal-cc.git
cd multi-terminal-cc
bun install
bun run build

# Run
node dist/index.js
```

## Usage

```
Claude Code Sessions (3)
↑↓: Navigate | Enter: Info | e: Edit | r: Refresh | q: Quit

► [busy] PID:13693 /home/fk/workspace/github/multi-terminal-cc (coding task)
  [idle] PID:17336 /home/fk/workspace/github/claude-code-rev
  [idle] PID:33427 /home/fk/workspace/github/claude-code-rev/docs/attach
```

### Keyboard Controls

| Key | Action |
|-----|--------|
| ↑/↓ | Navigate session list |
| Enter | Show full session info (PID, ID, cwd, status, timestamps) |
| e | Edit description for selected session |
| r | Manual refresh |
| q | Quit |

## Technical Details

- **Session source**: Reads `~/.claude/sessions/*.json` (Claude Code metadata)
- **Description storage**: `~/.claude/session-labels.json` (keyed by sessionId)
- **PID liveness**: Validates `/proc/<pid>/stat` starttime against `procStart` field
- **Polling**: 2-second auto-refresh + manual 'r' key
- **Platform**: Linux-only MVP (requires `/proc` filesystem)

## Requirements

- Node.js 18+ or Bun
- Linux (uses `/proc` filesystem for PID checks)
- Claude Code installed with active sessions

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    TUI Frontend                      │
│  Session List View (ink + React)                    │
│  - PID, cwd, status, description                    │
│  - Keyboard navigation                              │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  Session Monitor                     │
│  - Read ~/.claude/sessions/*.json                   │
│  - Parse metadata (pid, sessionId, cwd, status)     │
│  - Validate PID alive via /proc/<pid>/stat          │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  Description Store                   │
│  - ~/.claude/session-labels.json                    │
│  - Atomic writes (temp file + rename)               │
└─────────────────────────────────────────────────────┘
```

## Known Limitations

- **Linux-only**: Requires `/proc` filesystem
- **Manual switching**: Shows info, user finds window manually
- **No tmux auto-attach**: Planned for v1.1

## Roadmap

### v1.1
- tmux auto-attach support
- Clear completed sessions ('c' key)
- macOS support (via `ps -o lstart`)

### v1.2
- Windows support
- Session preview/last output
- Git branch detection

## License

MIT