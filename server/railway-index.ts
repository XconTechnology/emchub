/**
 * Railway deployment entry point.
 * Set DEPLOYMENT_TARGET=railway and STORAGE_PROVIDER=s3 for S3 storage.
 * No Vite dev server - serves static build only.
 */
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { initObjectStorage } from "./storage/factory";
import { registerRoutes } from "./routes";
import { serveStatic, log } from "./vite";

process.env.DEPLOYMENT_TARGET = process.env.DEPLOYMENT_TARGET || "railway";

const app = express();

const baseOrigins = [
  "https://emchub.com.hk",
  "https://emchub-production.up.railway.app",
];
const envOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const allowedOrigins = [...baseOrigins, ...envOrigins];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(express.static("public"));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined;
  const originalResJson = res.json;
  res.json = function (bodyJson?: unknown) {
    capturedJsonResponse = bodyJson as Record<string, unknown>;
    return originalResJson.call(res, bodyJson);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });
  next();
});

// Minimal /health before any async init - so it's registered first (no DB/session dependency)
app.get("/health", (_req, res) => res.status(200).send("OK"));
app.get("/api/health", (_req, res) =>
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
);

(async () => {
  try {
    await initObjectStorage();
    const server = await registerRoutes(app);

    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
      const status =
        (err as { status?: number; statusCode?: number }).status ??
        (err as { statusCode?: number }).statusCode ??
        500;
      const message = (err as Error).message ?? "Internal Server Error";
      res.status(status).json({ message });
      throw err;
    });

    serveStatic(app);

    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
      log(`serving on port ${port} (Railway)`);
    });
  } catch (err) {
    console.error("Railway startup failed:", err);
    process.exit(1);
  }
})();
