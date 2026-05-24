#!/bin/bash
# cc-list - List all Claude Code tmux sessions
# Usage: cc-list

set -e

echo "Claude Code tmux sessions:"
echo ""

# List tmux sessions
tmux list-sessions -F "#{session_name}: #{session_windows} windows" 2>/dev/null || echo "No tmux sessions found"