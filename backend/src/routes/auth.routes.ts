import { Router } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const authRouter = Router();

authRouter.post("/login", (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");

  if (email !== env.demoEmail.toLowerCase() || password !== env.demoPassword) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign({ email, role: "placement_officer" }, env.jwtSecret, {
    expiresIn: "12h",
  });

  res.json({
    token,
    user: {
      email,
      role: "placement_officer",
      name: "Training & Placement Officer",
    },
  });
});
