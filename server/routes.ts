import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEvaluationSchema } from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from 'ws';

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
  
  // Setup WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active workshop sessions
  const workshops = new Map<string, Set<WebSocket>>();
  const userWorkshopMap = new Map<WebSocket, string>();
  
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    
    ws.on('message', (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join_workshop':
            handleJoinWorkshop(ws, message.workshopId, message.userName);
            break;
          case 'leave_workshop':
            handleLeaveWorkshop(ws);
            break;
          case 'response_update':
            handleResponseUpdate(ws, message);
            break;
          case 'evaluation_update':
            handleEvaluationUpdate(ws, message);
            break;
          case 'participant_cursor':
            handleParticipantCursor(ws, message);
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      handleLeaveWorkshop(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  function handleJoinWorkshop(ws: WebSocket, workshopId: string, userName: string) {
    // Leave current workshop if any
    handleLeaveWorkshop(ws);
    
    // Join new workshop
    if (!workshops.has(workshopId)) {
      workshops.set(workshopId, new Set());
    }
    
    workshops.get(workshopId)!.add(ws);
    userWorkshopMap.set(ws, workshopId);
    
    // Store user info on WebSocket
    (ws as any).userName = userName;
    (ws as any).workshopId = workshopId;
    
    // Notify other participants
    broadcastToWorkshop(workshopId, {
      type: 'participant_joined',
      userName,
      timestamp: new Date().toISOString()
    }, ws);
    
    // Send current participants list to new user
    const participants = Array.from(workshops.get(workshopId)!)
      .map(client => (client as any).userName)
      .filter(name => name);
    
    sendToClient(ws, {
      type: 'workshop_joined',
      workshopId,
      participants
    });
  }
  
  function handleLeaveWorkshop(ws: WebSocket) {
    const workshopId = userWorkshopMap.get(ws);
    if (workshopId && workshops.has(workshopId)) {
      workshops.get(workshopId)!.delete(ws);
      userWorkshopMap.delete(ws);
      
      // Clean up empty workshops
      if (workshops.get(workshopId)!.size === 0) {
        workshops.delete(workshopId);
      } else {
        // Notify remaining participants
        broadcastToWorkshop(workshopId, {
          type: 'participant_left',
          userName: (ws as any).userName,
          timestamp: new Date().toISOString()
        });
      }
    }
  }
  
  function handleResponseUpdate(ws: WebSocket, message: any) {
    const workshopId = userWorkshopMap.get(ws);
    if (workshopId) {
      broadcastToWorkshop(workshopId, {
        type: 'response_updated',
        elementId: message.elementId,
        value: message.value,
        userName: (ws as any).userName,
        timestamp: new Date().toISOString()
      }, ws);
    }
  }
  
  function handleEvaluationUpdate(ws: WebSocket, message: any) {
    const workshopId = userWorkshopMap.get(ws);
    if (workshopId) {
      broadcastToWorkshop(workshopId, {
        type: 'evaluation_updated',
        evaluationData: message.evaluationData,
        userName: (ws as any).userName,
        timestamp: new Date().toISOString()
      }, ws);
    }
  }
  
  function handleParticipantCursor(ws: WebSocket, message: any) {
    const workshopId = userWorkshopMap.get(ws);
    if (workshopId) {
      broadcastToWorkshop(workshopId, {
        type: 'participant_cursor',
        elementId: message.elementId,
        userName: (ws as any).userName,
        action: message.action // 'focus', 'blur', 'hover'
      }, ws);
    }
  }
  
  function broadcastToWorkshop(workshopId: string, message: any, excludeWs?: WebSocket) {
    const workshop = workshops.get(workshopId);
    if (workshop) {
      workshop.forEach(client => {
        if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
          sendToClient(client, message);
        }
      });
    }
  }
  
  function sendToClient(ws: WebSocket, message: any) {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }
  
  return httpServer;
}
