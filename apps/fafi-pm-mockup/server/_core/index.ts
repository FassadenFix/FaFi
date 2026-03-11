import "dotenv/config";
import express from "express";
import compression from "compression";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import multer from "multer";
import { storagePut } from "../storage";
import { nanoid } from "nanoid";
import * as db from "../db";

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
  app.use(compression());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // Health-Check Endpoint (Infrastruktur-Phase)
  app.get("/api/health", async (_req, res) => {
    try {
      const { getDb } = await import("../db");
      const database = await getDb();
      let dbStatus = "disconnected";
      if (database) {
        try {
          await database.execute(await import("drizzle-orm").then(m => m.sql`SELECT 1`));
          dbStatus = "connected";
        } catch {
          dbStatus = "error";
        }
      }
      
      // Performance & Rate Limit Status
      let performanceSummary = {};
      let rateLimitStatus = {};
      try {
        const { getPerformanceSummary } = await import("../services/performanceMonitor");
        performanceSummary = getPerformanceSummary(300_000);
      } catch { /* ignore */ }
      try {
        const { getRateLimitStatus } = await import("../services/rateLimiter");
        rateLimitStatus = getRateLimitStatus();
      } catch { /* ignore */ }

      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbStatus,
        memory: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        },
        performance: performanceSummary,
        rateLimits: rateLimitStatus,
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // File upload endpoint
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
  });
  
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }
      
      const file = req.file;
      const ext = file.originalname.split(".").pop() || "bin";
      const key = `archiv/${nanoid()}-${Date.now()}.${ext}`;
      
      const result = await storagePut(key, file.buffer, file.mimetype);
      
      // Auto-Archiv: Manuell hochgeladene Datei automatisch im Archiv ablegen
      try {
        const { autoArchive } = await import('../services/autoArchive');
        await autoArchive({
          name: file.originalname,
          originalName: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          storageUrl: result.url,
          storageKey: result.key,
          category: 'sonstiges',
          description: 'Manuell hochgeladene Datei',
          uploadedBy: 'Benutzer (Manueller Upload)',
        });
      } catch (archiveErr) {
        console.warn('[AutoArchiv] Manueller Upload Archivierung fehlgeschlagen:', archiveErr);
      }
      
      res.json({
        key: result.key,
        url: result.url,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
  // Photo upload endpointt with automatic naming and DB entry
  app.post("/api/photos/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file provided" });
      }
      const file = req.file;
      const ext = file.originalname.split(".").pop() || "jpg";
      
      // Parse metadata from request body
      const context = req.body.context || "allgemein";
      const companyName = req.body.companyName || "";
      const address = req.body.address || "";
      const side = req.body.side || "";
      const category = req.body.category || "";
      const description = req.body.description || "";
      const propertyId = req.body.propertyId ? parseInt(req.body.propertyId) : undefined;
      const constructionSiteId = req.body.constructionSiteId ? parseInt(req.body.constructionSiteId) : undefined;
      const logEntryId = req.body.logEntryId ? parseInt(req.body.logEntryId) : undefined;
      const projectId = req.body.projectId ? parseInt(req.body.projectId) : undefined;
      const uploadedById = req.body.uploadedById ? parseInt(req.body.uploadedById) : undefined;
      const latitude = req.body.latitude || undefined;
      const longitude = req.body.longitude || undefined;
      
      // Build automatic filename: Kontext_Unternehmen_Adresse_Seite_Kategorie_NNN
      const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9äöüÄÖÜß\-]/g, "_").substring(0, 30);
      const parts = [
        sanitize(context),
        companyName ? sanitize(companyName) : "",
        address ? sanitize(address.split(",")[0]) : "",
        side ? sanitize(side) : "",
        category ? sanitize(category) : "",
        nanoid(6)
      ].filter(Boolean);
      const autoFilename = `${parts.join("_")}.${ext}`;
      
      // Upload to S3
      const s3Key = `fotos/${context}/${autoFilename}`;
      const result = await storagePut(s3Key, file.buffer, file.mimetype);
      
      // Upload thumbnail (client sends it as base64 in body)
      let thumbnailUrl: string | undefined;
      if (req.body.thumbnailBase64) {
        const thumbBuffer = Buffer.from(req.body.thumbnailBase64, "base64");
        const thumbKey = `fotos/thumbnails/${autoFilename}`;
        const thumbResult = await storagePut(thumbKey, thumbBuffer, "image/jpeg");
        thumbnailUrl = thumbResult.url;
      }
      
      // Save to DB
      const photo = await db.createPhoto({
        url: result.url,
        thumbnailUrl: thumbnailUrl || null,
        filename: autoFilename,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        context: context as any,
        category: category || null,
        side: side ? (side as any) : null,
        description: description || null,
        companyName: companyName || null,
        address: address || null,
        propertyId: propertyId || null,
        constructionSiteId: constructionSiteId || null,
        logEntryId: logEntryId || null,
        projectId: projectId || null,
        uploadedById: uploadedById || null,
        latitude: latitude || null,
        longitude: longitude || null,
        takenAt: req.body.takenAt ? new Date(req.body.takenAt) : new Date(),
      });
      
      // Auto-Archiv: Foto automatisch im zentralen Archiv ablegen
      try {
        const { archivePhoto } = await import('../services/autoArchive');
        await archivePhoto({
          url: result.url,
          filename: autoFilename,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          context: context,
          propertyId: propertyId,
          constructionSiteId: constructionSiteId,
          projectId: projectId,
          description: description || null,
        }, 'System (Foto-Upload)');
      } catch (archiveErr) {
        console.warn('[AutoArchiv] Foto-Archivierung fehlgeschlagen:', archiveErr);
      }
      
      res.json({
        id: photo.id,
        url: result.url,
        thumbnailUrl,
        filename: autoFilename,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      });
    } catch (error) {
      console.error("Photo upload error:", error);
      res.status(500).json({ error: "Photo upload failed" });
    }
  });

  // ============================================
  // PDF-Download-Endpunkte (Briefbogen-basiert)
  // ============================================
  app.get("/api/pdf/offer/:id", async (req, res) => {
    try {
      const { generateOfferPdfFromDb } = await import("../services/pdfRouteHandler");
      const pdfBytes = await generateOfferPdfFromDb(parseInt(req.params.id));
      if (!pdfBytes) {
        return res.status(404).json({ error: "Angebot nicht gefunden" });
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="Angebot-${req.params.id}.pdf"`);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("[PDF] Angebots-PDF Fehler:", error);
      res.status(500).json({ error: "PDF-Generierung fehlgeschlagen" });
    }
  });

  app.get("/api/pdf/invoice/:id", async (req, res) => {
    try {
      const { generateInvoicePdfFromDb } = await import("../services/pdfRouteHandler");
      const pdfBytes = await generateInvoicePdfFromDb(parseInt(req.params.id));
      if (!pdfBytes) {
        return res.status(404).json({ error: "Rechnung nicht gefunden" });
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="Rechnung-${req.params.id}.pdf"`);
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("[PDF] Rechnungs-PDF Fehler:", error);
      res.status(500).json({ error: "PDF-Generierung fehlgeschlagen" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
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

    // Starte den Scheduled-Tasks-Runner (alle 5 Minuten)
    import("../services/taskRunner").then(({ startTaskRunner }) => {
      startTaskRunner(5 * 60 * 1000);
    }).catch((e) => {
      console.warn("[TaskRunner] Konnte nicht gestartet werden:", e);
    });
  });
}

startServer().catch(console.error);
