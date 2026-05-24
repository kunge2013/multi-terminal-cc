#!/bin/bash
# cc-attach - Attach to a Claude Code tmux session
# Usage: cc-attach [session-name]

set -e

SESSION_NAME="${1:-}"

if [ -z "$SESSION_NAME" ]; then
  # Show available sessions
  echo "Available sessions:"
  tmux list-sessions -F "  #{session_name}" 2>/dev/null || echo "  No sessions found"
  echo ""
  echo "Usage: cc-attach <session-name>"
  exit 1
fi

tmux attach -t "$SESSION_NAME"