import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import swaggerUi from "swagger-ui-express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { sdk } from "./sdk";
import { getDb } from "../db";
import { notifyOwner } from "./notification";
import { eq } from "drizzle-orm";
import { clients } from "../../drizzle/schema";
import { swaggerSpec } from "../swagger";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  
  // Swagger/OpenAPI documentation
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      url: "/api/swagger.json",
    },
  }));
  
  // Serve Swagger spec as JSON
  app.get("/api/swagger.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Meta Ads Sync Handler
  app.post("/api/scheduled/metaAdsFetch", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      
      const { fetchAndSaveMetaCampaigns } = await import("../metaAdsEdgeFunction");
      
      // Get ad account ID from environment or request
      const adAccountId = process.env.META_AD_ACCOUNT_ID || "";
      if (!adAccountId) {
        return res.status(400).json({ error: "META_AD_ACCOUNT_ID not configured" });
      }
      
      const result = await fetchAndSaveMetaCampaigns(adAccountId);
      res.json({ ok: true, ...result });
    } catch (err) {
      console.error("[MetaAdsFetch]", err);
      res.status(500).json({ 
        error: String(err), 
        timestamp: new Date().toISOString(),
        context: { url: req.url, taskUid: (await sdk.authenticateRequest(req)).taskUid }
      });
    }
  });

  // Payment Reminder Handler
  app.post("/api/scheduled/paymentReminder", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) return res.status(403).json({ error: "cron-only" });
      
      const db = await getDb();
      if (!db) return res.status(500).json({ error: "Database unavailable" });
      
      const clientRows = await db.select()
        .from(clients)
        .where(eq(clients.paymentReminderTaskUid, user.taskUid));
      
      if (clientRows.length === 0) return res.json({ ok: true, skipped: "orphan" });
      const client = clientRows[0];
      
      await notifyOwner({
        title: `تذكير دفع: ${client.name}`,
        content: `موعد دفع العميل ${client.name} اليوم. المبلغ: ₪${client.monthlyAmount || 0}`,
      });
      
      res.json({ ok: true });
    } catch (err) {
      console.error("[PaymentReminder]", err);
      res.status(500).json({ error: String(err), timestamp: new Date().toISOString() });
    }
  });

  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
