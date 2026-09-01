import { randomUUID } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import { mongoReady } from "../config/db.js";
import { StudentBatchModel } from "../models/StudentBatch.js";
import { parseStudentCsv } from "../services/csvParser.js";
import { memoryStore } from "../store/memoryStore.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = file.originalname.toLowerCase().endsWith(".csv") || file.mimetype.includes("csv");
    cb(ok ? null : new Error("Only CSV files are allowed"), ok);
  },
});

export const uploadRouter = Router();

uploadRouter.post("/students", upload.single("file"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "CSV file is required" });
    return;
  }

  const { students, errors } = parseStudentCsv(req.file.buffer);
  if (students.length === 0) {
    res.status(400).json({ error: "No valid student rows found", errors });
    return;
  }

  let batchId: string;
  if (mongoReady) {
    const doc = await StudentBatchModel.create({
      fileName: req.file.originalname,
      students,
      parseErrors: errors,
    });
    batchId = String(doc._id);
  } else {
    batchId = randomUUID();
    memoryStore.batches.set(batchId, {
      id: batchId,
      fileName: req.file.originalname,
      students,
      parseErrors: errors,
      createdAt: new Date().toISOString(),
    });
  }

  res.json({
    batchId,
    fileName: req.file.originalname,
    count: students.length,
    parseErrors: errors,
    preview: students.slice(0, 8),
    branches: [...new Set(students.map((s) => s.branch))].sort(),
    skillUniverse: [...new Set(students.flatMap((s) => s.skills))].sort(),
  });
});
