import { randomUUID } from "node:crypto";
import { mongoReady } from "../config/db.js";
import { NotificationLogModel } from "../models/NotificationLog.js";
import { memoryStore } from "../store/memoryStore.js";
import type { EvaluationResult, NotificationLog } from "../types.js";

const CHANNELS: NotificationLog["channel"][] = ["email", "whatsapp", "in-app"];

export async function dispatchShortlistNotifications(
  runId: string,
  results: EvaluationResult[],
  companyName: string,
): Promise<NotificationLog[]> {
  const shortlisted = results.filter((r) => r.eligible);
  const logs: NotificationLog[] = shortlisted.slice(0, 40).map((item, index) => {
    const channel = CHANNELS[index % CHANNELS.length];
    return {
      id: randomUUID(),
      runId,
      channel,
      recipient: item.student.email || item.student.rollNumber,
      message: `You have been shortlisted for ${companyName}. Report to the placement cell dashboard for next steps.`,
      status: index % 17 === 0 ? "queued" : "sent",
      createdAt: new Date().toISOString(),
    };
  });

  if (mongoReady) {
    await NotificationLogModel.insertMany(
      logs.map(({ id, createdAt, ...rest }) => rest),
    );
  } else {
    memoryStore.notifications.push(...logs);
  }

  return logs;
}

export async function listNotifications(runId?: string): Promise<NotificationLog[]> {
  if (mongoReady) {
    const query = runId ? { runId } : {};
    const docs = await NotificationLogModel.find(query).sort({ createdAt: -1 }).limit(80).lean();
    return docs.map((doc) => ({
      id: String(doc._id),
      runId: doc.runId,
      channel: doc.channel as NotificationLog["channel"],
      recipient: doc.recipient,
      message: doc.message,
      status: doc.status as NotificationLog["status"],
      createdAt: (doc.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
    }));
  }

  return memoryStore.notifications
    .filter((n) => (runId ? n.runId === runId : true))
    .slice(-80)
    .reverse();
}
