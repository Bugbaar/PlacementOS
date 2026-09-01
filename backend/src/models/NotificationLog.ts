import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    runId: { type: String, required: true },
    channel: { type: String, enum: ["email", "whatsapp", "in-app"], required: true },
    recipient: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["queued", "sent", "failed"], default: "queued" },
  },
  { timestamps: true },
);

export const NotificationLogModel = mongoose.model("NotificationLog", notificationSchema);
