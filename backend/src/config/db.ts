import mongoose from "mongoose";
import { env } from "./env.js";

export let mongoReady = false;

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 2500 });
    mongoReady = true;
    console.log("[db] Connected to MongoDB");
  } catch (error) {
    mongoReady = false;
    console.warn(
      "[db] MongoDB unavailable — using in-memory store. Start Docker Mongo with `docker compose up mongo -d`.",
    );
    if (error instanceof Error) {
      console.warn(`[db] ${error.message}`);
    }
  }
}
