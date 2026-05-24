#!/bin/bash
# cc-start - Start Claude Code in a new tmux session
# Usage: cc-start [description] [session-name]

set -e

DESCRIPTION="${1:-}"
SESSION_NAME="${2:-}"

# Generate session name if not provided
if [ -z "$SESSION_NAME" ]; then
  # Use description as base, or generate random
  if [ -n "$DESCRIPTION" ]; then
    # Clean description for session name (remove spaces, special chars)
    SESSION_NAME="cc-$(echo "$DESCRIPTION" | tr -c '[:alnum:]' '-' | tr -s '-' | head -c 20)"
  else
    SESSION_NAME="cc-$(date +%H%M%S)"
  fi
fi

# Ensure tmux is available
if ! command -v tmux &> /dev/null; then
  echo "Error: tmux is not installed"
  echo "Install tmux: sudo apt install tmux (or brew install tmux)"
  exit 1
fi

# Check if session already exists
if tmux has-session -t "$SESSION_NAME" 2>/dev/null; then
  echo "Session '$SESSION_NAME' already exists"
  echo "Attach to it: tmux attach -t $SESSION_NAME"
  exit 1
fi

# Create new tmux session and start Claude Code
echo "Creating tmux session: $SESSION_NAME"
if [ -n "$DESCRIPTION" ]; then
  echo "Description: $DESCRIPTION"
fi

# Start tmux session in detached mode
tmux new-session -d -s "$SESSION_NAME" -x 120 -y 40

# Set session description (if provided)
if [ -n "$DESCRIPTION" ]; then
  # Store description in session labels file for cc-sessions to pick up
  LABELS_FILE="$HOME/.claude/session-labels.json"

  # We'll set the description after Claude starts (session ID will be in ~/.claude/sessions)
  # For now, store mapping: session_name -> description
  MAPPING_FILE="$HOME/.claude/session-tmux-mapping.json"

  if [ ! -f "$MAPPING_FILE" ]; then
    echo "{}" > "$MAPPING_FILE"
  fi

  # Use jq if available, otherwise simple approach
  if command -v jq &> /dev/null; then
    jq --arg name "$SESSION_NAME" --arg desc "$DESCRIPTION" \
      '.[$name] = $desc' "$MAPPING_FILE" > "$MAPPING_FILE.tmp" && \
      mv "$MAPPING_FILE.tmp" "$MAPPING_FILE"
  else
    # Simple append without jq
    echo "{\"$SESSION_NAME\":\"$DESCRIPTION\"}" > "$MAPPING_FILE"
  fi
fi

# Start Claude Code in the session
tmux send-keys -t "$SESSION_NAME" 'claude' Enter

# Wait a moment for Claude to start
sleep 2

echo ""
echo "Session created and Claude Code started!"
echo ""
echo "Options:"
echo "  - Attach now:     tmux attach -t $SESSION_NAME"
echo "  - Manage later:   cc-sessions (press Enter to attach)"
echo "  - Detach from inside: Ctrl-b d"
echo ""

# Optionally attach immediately
if [ "$CC_START_ATTACH" = "true" ]; then
  tmux attach -t "$SESSION_NAME"
fi