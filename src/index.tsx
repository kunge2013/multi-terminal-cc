#!/usr/bin/env node
// Main entry point for cc-sessions TUI

import React from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { Session } from './types.js';
import { readSessions } from './session.js';
import { setLabel } from './store.js';

// Session List Component
interface SessionListProps {
  sessions: Session[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onEdit: (session: Session) => void;
  onQuit: () => void;
}

function SessionList({ sessions, selectedIndex, onSelect, onEdit, onQuit }: SessionListProps) {
  useInput((input, key) => {
    if (key.upArrow) {
      onSelect(Math.max(0, selectedIndex - 1));
    } else if (key.downArrow) {
      onSelect(Math.min(sessions.length - 1, selectedIndex + 1));
    } else if (key.return && sessions[selectedIndex]) {
      // Show full info
      console.log('\n--- Session Info ---');
      console.log('PID:', sessions[selectedIndex].pid);
      console.log('Session ID:', sessions[selectedIndex].id);
      console.log('Working Dir:', sessions[selectedIndex].workDir);
      console.log('Status:', sessions[selectedIndex].status);
      console.log('Description:', sessions[selectedIndex].taskDesc || '(none)');
      console.log('Last Activity:', sessions[selectedIndex].lastActivity.toLocaleString());
      console.log('Started At:', sessions[selectedIndex].startedAt.toLocaleString());
    } else if (input === 'e' && sessions[selectedIndex]) {
      onEdit(sessions[selectedIndex]);
    } else if (input === 'r') {
      // Refresh handled by parent
    } else if (input === 'q' || input === 'c' && key.ctrl) {
      onQuit();
    }
  });

  if (sessions.length === 0) {
    return (
      <Box flexDirection="column" padding={1}>
        <Text color="yellow">No active Claude Code sessions found.</Text>
        <Text dimColor>Press 'q' to quit</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Claude Code Sessions ({sessions.length})</Text>
      <Text dimColor>↑↓: Navigate | Enter: Info | e: Edit | r: Refresh | q: Quit</Text>
      <Box flexDirection="column" marginTop={1}>
        {sessions.map((session, index) => (
          <Box key={session.id} flexDirection="row">
            <Text color={index === selectedIndex ? 'green' : 'white'}>
              {index === selectedIndex ? '► ' : '  '}
            </Text>
            <Text color={session.status === 'busy' ? 'yellow' : session.status === 'idle' ? 'blue' : 'gray'}>
              [{session.status}]
            </Text>
            <Text> PID:{session.pid} </Text>
            <Text dimColor>{truncate(session.workDir, 30)}</Text>
            {session.taskDesc && <Text color="magenta"> ({truncate(session.taskDesc, 20)})</Text>}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// Edit Description Component
interface EditDescriptionProps {
  session: Session;
  onSave: (description: string) => void;
  onCancel: () => void;
}

function EditDescription({ session, onSave, onCancel }: EditDescriptionProps) {
  const [input, setInput] = React.useState(session.taskDesc);

  useInput((char, key) => {
    if (key.return) {
      onSave(input);
    } else if (key.escape) {
      onCancel();
    } else if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1));
    } else if (char && !key.ctrl) {
      setInput(prev => prev + char);
    }
  });

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold color="cyan">Edit Description for Session</Text>
      <Text dimColor>PID: {session.pid} | {truncate(session.workDir, 40)}</Text>
      <Box flexDirection="row" marginTop={1}>
        <Text color="green">Description: </Text>
        <Text bold>{input}</Text>
        <Text dimColor>_</Text>
      </Box>
      <Text dimColor marginTop={1}>Enter: Save | Esc: Cancel</Text>
    </Box>
  );
}

// Main App Component
function App() {
  const { exit } = useApp();
  const [sessions, setSessions] = React.useState<Session[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [editingSession, setEditingSession] = React.useState<Session | null>(null);
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Load sessions on mount and on refresh
  React.useEffect(() => {
    loadSessions();
  }, [refreshKey]);

  // Poll every 2 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      loadSessions();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  async function loadSessions() {
    const s = await readSessions();
    setSessions(s);
    // Keep selectedIndex valid
    if (selectedIndex >= s.length) {
      setSelectedIndex(Math.max(0, s.length - 1));
    }
  }

  const handleSaveDescription = async (description: string) => {
    if (editingSession) {
      await setLabel(editingSession.id, description);
      setEditingSession(null);
      setRefreshKey(prev => prev + 1);
    }
  };

  if (editingSession) {
    return (
      <EditDescription
        session={editingSession}
        onSave={handleSaveDescription}
        onCancel={() => setEditingSession(null)}
      />
    );
  }

  return (
    <SessionList
      sessions={sessions}
      selectedIndex={selectedIndex}
      onSelect={setSelectedIndex}
      onEdit={setEditingSession}
      onQuit={exit}
    />
  );
}

// Helper: truncate string with ellipsis
function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

// Entry point
render(<App />);