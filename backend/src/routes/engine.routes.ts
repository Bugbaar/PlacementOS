import { randomUUID } from "node:crypto";
import { Router } from "express";
import { mongoReady } from "../config/db.js";
import { StudentBatchModel } from "../models/StudentBatch.js";
import { ShortlistRunModel } from "../models/ShortlistRun.js";
import { runEligibilityEngine } from "../services/eligibilityEngine.js";
import { buildPdf, toCsv } from "../services/exportService.js";
import { dispatchShortlistNotifications, listNotifications } from "../services/notificationService.js";
import { getIo } from "../realtime/io.js";
import { memoryStore } from "../store/memoryStore.js";
import type { EligibilityCriteria, EngineRunPayload, StudentRecord } from "../types.js";

export const engineRouter = Router();

async function loadBatch(batchId: string): Promise<{ students: StudentRecord[]; fileName: string } | null> {
  if (mongoReady) {
    const doc = await StudentBatchModel.findById(batchId).lean();
    if (!doc) return null;
    return { students: doc.students as StudentRecord[], fileName: doc.fileName };
  }
  const batch = memoryStore.batches.get(batchId);
  if (!batch) return null;
  return { students: batch.students, fileName: batch.fileName };
}

async function saveRun(payload: EngineRunPayload): Promise<string> {
  if (mongoReady) {
    const doc = await ShortlistRunModel.create({
      batchId: payload.batchId,
      criteria: payload.criteria,
      results: payload.results,
      metrics: payload.metrics,
      logs: payload.logs,
    });
    return String(doc._id);
  }
  memoryStore.runs.set(payload.id, payload);
  return payload.id;
}

async function loadRun(runId: string): Promise<EngineRunPayload | null> {
  if (mongoReady) {
    const doc = await ShortlistRunModel.findById(runId).lean();
    if (!doc) return null;
    return {
      id: String(doc._id),
      batchId: doc.batchId,
      criteria: doc.criteria as EligibilityCriteria,
      results: doc.results as EngineRunPayload["results"],
      metrics: doc.metrics as EngineRunPayload["metrics"],
      logs: doc.logs as string[],
      createdAt: (doc.createdAt as Date)?.toISOString?.() ?? new Date().toISOString(),
    };
  }
  return memoryStore.runs.get(runId) ?? null;
}

engineRouter.post("/run", async (req, res) => {
  const batchId = String(req.body?.batchId ?? "");
  const criteria = req.body?.criteria as EligibilityCriteria | undefined;
  if (!batchId || !criteria) {
    res.status(400).json({ error: "batchId and criteria are required" });
    return;
  }

  const batch = await loadBatch(batchId);
  if (!batch) {
    res.status(404).json({ error: "Student batch not found. Upload a CSV first." });
    return;
  }

  const normalized: EligibilityCriteria = {
    companyName: String(criteria.companyName || "Campus Drive").trim(),
    driveName: String(criteria.driveName || "Eligibility Pass").trim(),
    minCgpa: Number(criteria.minCgpa ?? 0),
    maxActiveBacklogs: Number(criteria.maxActiveBacklogs ?? 0),
    requiredSkills: Array.isArray(criteria.requiredSkills) ? criteria.requiredSkills : [],
    skillMatchMode: criteria.skillMatchMode === "any" ? "any" : "all",
    allowedBranches: Array.isArray(criteria.allowedBranches) ? criteria.allowedBranches : [],
    minTenthPercent: criteria.minTenthPercent == null ? undefined : Number(criteria.minTenthPercent),
    minTwelfthPercent: criteria.minTwelfthPercent == null ? undefined : Number(criteria.minTwelfthPercent),
  };

  const { results, metrics, logs } = runEligibilityEngine(batch.students, normalized);
  const tempId = randomUUID();
  const createdAt = new Date().toISOString();
  const persistedId = await saveRun({
    id: tempId,
    batchId,
    criteria: normalized,
    results,
    metrics,
    logs,
    createdAt,
  });

  const notifications = await dispatchShortlistNotifications(
    persistedId,
    results,
    normalized.companyName,
  );

  getIo()?.emit("engine:complete", {
    runId: persistedId,
    metrics,
    notificationCount: notifications.length,
  });

  res.json({
    runId: persistedId,
    metrics,
    logs,
    results,
    notifications,
    createdAt,
  });
});

engineRouter.get("/runs/:id", async (req, res) => {
  const run = await loadRun(String(req.params.id));
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }
  res.json(run);
});

engineRouter.get("/runs/:id/export.csv", async (req, res) => {
  const run = await loadRun(String(req.params.id));
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }
  const mode = req.query.mode === "audit" ? "audit" : "shortlisted";
  const csv = toCsv(run, mode);
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="placementos-${mode}-${run.id}.csv"`,
  );
  res.send(csv);
});

engineRouter.get("/runs/:id/export.pdf", async (req, res) => {
  const run = await loadRun(String(req.params.id));
  if (!run) {
    res.status(404).json({ error: "Run not found" });
    return;
  }
  const pdf = await buildPdf(run);
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="placementos-shortlist-${run.id}.pdf"`,
  );
  res.send(pdf);
});

engineRouter.get("/notifications", async (req, res) => {
  const runId = typeof req.query.runId === "string" ? req.query.runId : undefined;
  const items = await listNotifications(runId);
  res.json({ items });
});
