import { randomUUID } from 'node:crypto';
import { memoryStore } from './memoryStore';
import type { EvaluationResult, NotificationLog } from './types';

const CHANNELS: NotificationLog['channel'][] = ['email', 'whatsapp', 'in-app'];

export function dispatchShortlistNotifications(
  runId: string,
  results: EvaluationResult[],
  companyName: string,
): NotificationLog[] {
  const shortlisted = results.filter((r) => r.eligible);
  const logs: NotificationLog[] = shortlisted.slice(0, 40).map((item, index) => {
    const channel = CHANNELS[index % CHANNELS.length];
    return {
      id: randomUUID(),
      runId,
      channel,
      recipient: item.student.email || item.student.rollNumber,
      message: `You have been shortlisted for ${companyName}. Check with the placement cell for next steps.`,
      status: index % 17 === 0 ? 'queued' : 'sent',
      createdAt: new Date().toISOString(),
    };
  });

  memoryStore.notifications.push(...logs);
  return logs;
}

export function listNotifications(runId?: string): NotificationLog[] {
  return memoryStore.notifications
    .filter((n) => (runId ? n.runId === runId : true))
    .slice(-80)
    .reverse();
}
