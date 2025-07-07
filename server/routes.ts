import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
// Direct GraphQL submission - no database storage needed

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Trail Creator API is running" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
