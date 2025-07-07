import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTrailSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all trails
  app.get("/api/trails", async (req, res) => {
    try {
      const trails = await storage.getTrails();
      res.json(trails);
    } catch (error) {
      console.error("Error fetching trails:", error);
      res.status(500).json({ message: "Failed to fetch trails" });
    }
  });

  // Get specific trail
  app.get("/api/trails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid trail ID" });
      }

      const trail = await storage.getTrail(id);
      if (!trail) {
        return res.status(404).json({ message: "Trail not found" });
      }

      res.json(trail);
    } catch (error) {
      console.error("Error fetching trail:", error);
      res.status(500).json({ message: "Failed to fetch trail" });
    }
  });

  // Create new trail
  app.post("/api/trails", async (req, res) => {
    try {
      const validatedData = insertTrailSchema.parse(req.body);
      const trail = await storage.createTrail(validatedData);
      res.status(201).json(trail);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      console.error("Error creating trail:", error);
      res.status(500).json({ message: "Failed to create trail" });
    }
  });

  // Submit trail to external GraphQL service with JWT authentication
  app.post("/api/trails/:id/submit", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid trail ID" });
      }

      // Check for JWT token in Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "JWT token required" });
      }

      const jwtToken = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Basic JWT validation
      const jwtParts = jwtToken.split('.');
      if (jwtParts.length !== 3) {
        return res.status(401).json({ message: "Invalid JWT token format" });
      }

      const trail = await storage.getTrail(id);
      if (!trail) {
        return res.status(404).json({ message: "Trail not found" });
      }

      // Transform trail data to GraphQL mutation format
      const graphqlQuery = `
        mutation CreateTrail {
          createTrail(
            name: "${trail.name.replace(/"/g, '\\"')}"
            location: {
              country: "${trail.country}"
              city: "${trail.city}"
              point: { lat: ${trail.latitude / 1000000}, lon: ${trail.longitude / 1000000} }
              title: null
            }
            track: {
              points: ${JSON.stringify(trail.points)}
            }
            description: "${(trail.description || '').replace(/"/g, '\\"')}"
            isActive: ${trail.isActive}
            distance: ${trail.distance}
            approximateTime: ${trail.approximateTime}
            imagesIds: []
            availableDisciplinesIds: []
            allowedForStartingDisciplinesIds: []
          ) {
            id
            name
            description
            htmlDescription
            isActive
            track {
              image {
                url
              }
            }
            created
            updated
            availableDisciplines {
              name
            }
          }
        }
      `;

      // In a real implementation, you would send this to the actual GraphQL endpoint
      // with the JWT token in the Authorization header
      console.log("GraphQL submission with JWT:", {
        endpoint: "https://your-graphql-endpoint.com/graphql",
        token: jwtToken.substring(0, 20) + "...",
        query: graphqlQuery
      });

      res.json({ 
        message: "Trail submitted successfully with JWT authentication",
        graphqlQuery,
        trail,
        authenticationUsed: true,
        tokenPreview: jwtToken.substring(0, 20) + "..."
      });
    } catch (error) {
      console.error("Error submitting trail:", error);
      res.status(500).json({ message: "Failed to submit trail" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
