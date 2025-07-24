import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEvaluationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all evaluations
  app.get("/api/evaluations", async (req, res) => {
    try {
      const evaluations = await storage.getAllEvaluations();
      res.json(evaluations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching evaluations" });
    }
  });

  // Get evaluation by ID
  app.get("/api/evaluations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const evaluation = await storage.getEvaluation(id);
      
      if (!evaluation) {
        return res.status(404).json({ message: "Evaluation not found" });
      }
      
      res.json(evaluation);
    } catch (error) {
      res.status(500).json({ message: "Error fetching evaluation" });
    }
  });

  // Create new evaluation
  app.post("/api/evaluations", async (req, res) => {
    try {
      const validatedData = insertEvaluationSchema.parse(req.body);
      const evaluation = await storage.createEvaluation(validatedData);
      res.status(201).json(evaluation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating evaluation" });
    }
  });

  // Update evaluation
  app.put("/api/evaluations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEvaluationSchema.partial().parse(req.body);
      const evaluation = await storage.updateEvaluation(id, validatedData);
      
      if (!evaluation) {
        return res.status(404).json({ message: "Evaluation not found" });
      }
      
      res.json(evaluation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating evaluation" });
    }
  });

  // Delete evaluation
  app.delete("/api/evaluations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEvaluation(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Evaluation not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting evaluation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
