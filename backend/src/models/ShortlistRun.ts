import mongoose, { Schema } from "mongoose";

const shortlistRunSchema = new Schema(
  {
    batchId: { type: String, required: true },
    criteria: { type: Schema.Types.Mixed, required: true },
    results: { type: [Schema.Types.Mixed], default: [] },
    metrics: { type: Schema.Types.Mixed, required: true },
    logs: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const ShortlistRunModel = mongoose.model("ShortlistRun", shortlistRunSchema);
