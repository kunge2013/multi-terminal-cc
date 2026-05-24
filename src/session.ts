// Session monitoring - read and parse ~/.claude/sessions/*.json

import { promises as fs } from 'fs';
import { SessionMeta, Session, SUPPORTED_VERSION, SESSIONS_DIR } from './types.js';
import { readLabels } from './store.js';

export async function readSessions(): Promise<Session[]> {
  const sessions: Session[] = [];
  const labels = await readLabels();

  try {
    const files = await fs.readdir(SESSIONS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    for (const file of jsonFiles) {
      const filePath = `${SESSIONS_DIR}/${file}`;
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const meta: SessionMeta = JSON.parse(content);

        // Version check for schema compatibility
        if (meta.version !== SUPPORTED_VERSION) {
          console.error(`Skipping ${file}: version ${meta.version} != ${SUPPORTED_VERSION}`);
          continue;
        }

        // Check PID liveness
        const alive = await checkPidLiveness(meta.pid, parseInt(meta.procStart, 10));
        const status = alive ? meta.status : 'completed';

        const session: Session = {
          id: meta.sessionId,
          pid: meta.pid,
          procStart: parseInt(meta.procStart, 10),
          status,
          taskDesc: labels[meta.sessionId] || '',
          workDir: meta.cwd,
          lastActivity: new Date(meta.updatedAt),
          startedAt: new Date(meta.startedAt),
        };

        sessions.push(session);
      } catch (e) {
        console.error(`Failed to parse ${file}:`, e);
      }
    }
  } catch (e) {
    // Sessions dir might not exist or be empty
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Failed to read sessions dir:', e);
    }
  }

  // Sort by last activity (most recent first)
  sessions.sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());

  return sessions;
}

// Check if PID is alive and procStart matches (prevents PID reuse)
async function checkPidLiveness(pid: number, procStart: number): Promise<boolean> {
  try {
    const statPath = `/proc/${pid}/stat`;
    const statContent = await fs.readFile(statPath, 'utf-8');

    // Parse starttime (field 22) - parse from right to handle comm field with parentheses
    const fields = statContent.split(' ');
    // Field 22 is starttime (index 21, but we parse from right)
    // Format: pid (comm) state ppid pgrp session tty_nr tpgid flags ...
    // Fields: 1    2      3    4    5     6       7      8     9   ... 22 is starttime
    // Since comm (field 2) can contain spaces and parentheses, parse from right
    const rightFields = statContent.trim().split(/\s+/);
    // starttime is at position 21 (field 22, 0-indexed from right)
    // Actually easier: after field 2 (comm), fields are normal
    // Field 22 is starttime, index 21 from left (but comm may have spaces)
    // Safe approach: find last ) and parse from there
    const lastParen = statContent.lastIndexOf(')');
    if (lastParen === -1) return false;

    const afterComm = statContent.slice(lastParen + 1).trim();
    const afterCommFields = afterComm.split(/\s+/);
    // Now field 3 is state, field 4 is ppid...
    // starttime is field 22, which is afterCommFields index 20 (field 3-22 = 20 fields after comm)
    // Actually: after comm, we have fields 3-52 (50 fields)
    // starttime is field 22, so index = 22 - 3 = 19 in afterCommFields
    const starttime = parseInt(afterCommFields[19], 10);

    return starttime === procStart;
  } catch {
    return false;
  }
}