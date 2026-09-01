import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import { env } from "../config/env.js";

let io: Server | null = null;

export function initIo(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: { origin: env.clientOrigin, credentials: true },
  });
  io.on("connection", (socket) => {
    socket.emit("engine:ready", { message: "PlacementOS realtime channel connected" });
  });
  return io;
}

export function getIo(): Server | null {
  return io;
}
