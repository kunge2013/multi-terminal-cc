// tmux detection and attachment

import { spawnSync, spawn } from 'child_process';
import { promises as fs, readFileSync } from 'fs';

// Type for tmux detection result
interface TmuxSessionInfo {
  sessionName: string;
}

// Type for parsed TMUX env
interface TmuxEnvParsed {
  socketPath: string;
  sessionIndex: string;
}

/**
 * Parse TMUX environment variable
 * Format: "/tmp/tmux-1000/default,11247,0"
 * Returns: { socketPath, sessionIndex } or null
 */
export function parseTmuxEnv(env: string): TmuxEnvParsed | null {
  if (!env || env.trim() === '') return null;

  const parts = env.split(',');
  if (parts.length !== 3) return null;

  const socketPath = parts[0];
  const sessionIndex = parts[2];

  if (!socketPath || !sessionIndex) return null;

  return { socketPath, sessionIndex };
}

/**
 * Get TMUX environment variable from a process via /proc/<pid>/environ
 * Returns: TMUX env value or null
 */
export async function getProcessTmuxEnv(pid: number): Promise<string | null> {
  try {
    const environPath = `/proc/${pid}/environ`;
    const content = await fs.readFile(environPath, 'utf-8');

    // environ file is null-separated key=value pairs
    const envVars = content.split('\0');
    for (const envVar of envVars) {
      if (envVar.startsWith('TMUX=')) {
        return envVar.slice(5); // Remove 'TMUX=' prefix
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * List all tmux sessions
 * Returns: Array of session names
 */
export function listTmuxSessions(): string[] {
  try {
    const result = spawnSync('tmux', ['list-sessions', '-F', '#{session_name}'], {
      encoding: 'utf-8',
    });

    if (result.status !== 0) return [];

    return result.stdout.trim().split('\n').filter(s => s.length > 0);
  } catch {
    return [];
  }
}

/**
 * Detect which tmux session contains a given PID
 * Strategy:
 * 1. Get TMUX env from process (contains socket path and session index)
 * 2. List tmux sessions and match
 * Returns: { sessionName } or null
 */
export async function detectTmuxSession(pid: number): Promise<TmuxSessionInfo | null> {
  // Check if tmux is available
  const tmuxCheck = spawnSync('tmux', ['-V'], { encoding: 'utf-8' });
  if (tmuxCheck.status !== 0) return null;

  // Get TMUX env from process
  const tmuxEnv = await getProcessTmuxEnv(pid);
  if (!tmuxEnv) return null;

  const parsed = parseTmuxEnv(tmuxEnv);
  if (!parsed) return null;

  // List sessions and find the one containing this process
  const sessions = listTmuxSessions();
  if (sessions.length === 0) return null;

  // Try to find session by checking which session's clients include our PID's tmux client
  // The session index from TMUX env points to the session
  // We can use tmux display-message to get session name for a given session index
  try {
    const result = spawnSync('tmux', [
      '-S', parsed.socketPath,
      'display-message',
      '-p',
      '-t', parsed.sessionIndex,
      '#{session_name}'
    ], { encoding: 'utf-8' });

    if (result.status === 0 && result.stdout.trim()) {
      return { sessionName: result.stdout.trim() };
    }
  } catch {}

  // Fallback: iterate sessions and check if any has the process
  for (const sessionName of sessions) {
    try {
      // List PIDs in this session's windows
      const panePids = spawnSync('tmux', [
        'list-panes',
        '-t', sessionName,
        '-F', '#{pane_pid}'
      ], { encoding: 'utf-8' });

      if (panePids.status === 0) {
        const pids = panePids.stdout.trim().split('\n').filter(s => s.length > 0);
        // Check if our PID or any child is in this session
        // Note: The Claude Code process might be a child of the pane's shell
        for (const panePid of pids) {
          if (parseInt(panePid, 10) === pid) {
            return { sessionName };
          }
          // Check if pid is a descendant of panePid
          if (isDescendantOf(pid, parseInt(panePid, 10))) {
            return { sessionName };
          }
        }
      }
    } catch {}
  }

  return null;
}

/**
 * Check if pid1 is a descendant of pid2
 */
function isDescendantOf(pid1: number, pid2: number): boolean {
  try {
    // Walk up the process tree from pid1
    let currentPid = pid1;
    const maxDepth = 20; // Prevent infinite loop

    for (let i = 0; i < maxDepth; i++) {
      const statPath = `/proc/${currentPid}/stat`;
      const content = readFileSync(statPath, 'utf-8');

      // Parse ppid (field 4)
      const lastParen = content.lastIndexOf(')');
      const afterComm = content.slice(lastParen + 1).trim();
      const fields = afterComm.split(/\s+/);
      const ppid = parseInt(fields[1], 10); // field 4 = ppid, but after comm it's index 1

      if (ppid === pid2) return true;
      if (ppid === 0 || ppid === currentPid) break;

      currentPid = ppid;
    }
  } catch {}

  return false;
}

/**
 * Attach to a tmux session
 * Uses spawnSync with stdio: inherit so tmux takes over the terminal
 * When user detaches (Ctrl-b d), tmux returns and calling code can resume
 */
export function attachToTmux(sessionName: string): void {
  // Clear the terminal before attaching
  process.stdout.write('\x1b[2J\x1b[H');

  // Attach to tmux session
  spawnSync('tmux', ['attach', '-t', sessionName], {
    stdio: 'inherit',
  });
}

/**
 * Build tmux attach command string (for display/testing)
 */
export function buildAttachCommand(sessionName: string, socketPath?: string): string {
  if (socketPath) {
    return `tmux -S "${socketPath}" attach -t "${sessionName}"`;
  }
  return `tmux attach -t "${sessionName}"`;
}