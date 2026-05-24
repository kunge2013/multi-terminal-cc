// Type definitions for multi-terminal-cc

export interface SessionMeta {
  pid: number;
  sessionId: string;
  cwd: string;
  startedAt: number;
  procStart: string;
  version: string;
  status: 'busy' | 'idle';
  updatedAt: number;
  kind: string;
  entrypoint: string;
  peerProtocol: number;
}

export interface Session {
  id: string;          // sessionId (UUID)
  pid: number;         // Process ID
  procStart: number;   // procStart in clock ticks (prevents PID reuse)
  status: 'busy' | 'idle' | 'completed';
  taskDesc: string;    // User-set description
  workDir: string;     // cwd from JSON
  lastActivity: Date;  // updatedAt from JSON
  startedAt: Date;     // startedAt from JSON
}

export interface SessionLabels {
  [sessionId: string]: string;
}

export const SUPPORTED_VERSION = '2.1.119';
export const SESSIONS_DIR = `${process.env.HOME}/.claude/sessions`;
export const LABELS_FILE = `${process.env.HOME}/.claude/session-labels.json`;