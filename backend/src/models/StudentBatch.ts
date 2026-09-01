import mongoose, { Schema } from "mongoose";
import type { StudentRecord } from "../types.js";

const studentSchema = new Schema<StudentRecord>(
  {
    rollNumber: String,
    name: String,
    email: String,
    branch: String,
    cgpa: Number,
    activeBacklogs: Number,
    skills: [String],
    tenthPercent: Number,
    twelfthPercent: Number,
  },
  { _id: false },
);

const studentBatchSchema = new Schema(
  {
    fileName: { type: String, required: true },
    students: { type: [studentSchema], default: [] },
    parseErrors: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const StudentBatchModel = mongoose.model("StudentBatch", studentBatchSchema);
