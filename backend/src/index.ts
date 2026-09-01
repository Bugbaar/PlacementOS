import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { requireAuth } from "./middleware/auth.js";
import { initIo } from "./realtime/io.js";
import { authRouter } from "./routes/auth.routes.js";
import { engineRouter } from "./routes/engine.routes.js";
import { uploadRouter } from "./routes/upload.routes.js";

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "placementos-api", version: "1.0.0" });
});

app.use("/api/auth", authRouter);
app.use("/api/uploads", requireAuth, uploadRouter);
app.use("/api/engine", requireAuth, engineRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ error: err.message || "Request failed" });
});

initIo(httpServer);

await connectDatabase();

httpServer.listen(env.port, () => {
  console.log(`[api] PlacementOS engine listening on http://localhost:${env.port}`);
});
