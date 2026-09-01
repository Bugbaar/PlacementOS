import type { EngineRunPayload, NotificationLog, StudentRecord } from "../types.js";

export interface MemoryBatch {
  id: string;
  fileName: string;
  students: StudentRecord[];
  parseErrors: string[];
  createdAt: string;
}

const batches = new Map<string, MemoryBatch>();
const runs = new Map<string, EngineRunPayload>();
const notifications: NotificationLog[] = [];

export const memoryStore = {
  batches,
  runs,
  notifications,
};
