// Description store - atomic file writes

import { promises as fs } from 'fs';
import { SessionLabels, LABELS_FILE } from './types.js';

export async function readLabels(): Promise<SessionLabels> {
  try {
    const content = await fs.readFile(LABELS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

export async function writeLabels(labels: SessionLabels): Promise<void> {
  // Simple atomic write: write to temp file, then rename
  const tempFile = `${LABELS_FILE}.tmp`;
  const content = JSON.stringify(labels, null, 2);

  await fs.writeFile(tempFile, content, 'utf-8');
  await fs.rename(tempFile, LABELS_FILE);
}

export async function setLabel(sessionId: string, description: string): Promise<void> {
  const labels = await readLabels();
  if (description.trim() === '') {
    delete labels[sessionId];
  } else {
    labels[sessionId] = description.trim();
  }
  await writeLabels(labels);
}