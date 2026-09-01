import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 5000),
  mongoUri: process.env.MONGO_URI ?? "mongodb://127.0.0.1:27017/placementos",
  jwtSecret: process.env.JWT_SECRET ?? "placementos-dev-secret-change-me",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  demoEmail: process.env.DEMO_EMAIL ?? "tpo@placementos.dev",
  demoPassword: process.env.DEMO_PASSWORD ?? "Placement@2026",
};
