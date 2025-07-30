import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEvaluationSchema, insertBestPracticeSchema, insertPracticeRecommendationSchema } from "@shared/schema";
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

  // === BEST PRACTICES ROUTES ===
  
  // Get all best practices
  app.get("/api/best-practices", async (req, res) => {
    try {
      const practices = await storage.getAllBestPractices();
      res.json(practices);
    } catch (error) {
      res.status(500).json({ message: "Error fetching best practices" });
    }
  });

  // Get best practices by criteria
  app.get("/api/best-practices/criteria", async (req, res) => {
    try {
      const criteriaParam = req.query.criteria as string;
      if (!criteriaParam) {
        return res.status(400).json({ message: "Criteria parameter required" });
      }
      
      // Split comma-separated criteria
      const criteria = criteriaParam.split(',').map(c => c.trim()).filter(Boolean);
      
      const practices = await storage.getBestPracticesByCriteria(criteria);
      res.json(practices);
    } catch (error) {
      res.status(500).json({ message: "Error fetching best practices by criteria" });
    }
  });

  // Create new best practice
  app.post("/api/best-practices", async (req, res) => {
    try {
      const validatedData = insertBestPracticeSchema.parse(req.body);
      const practice = await storage.createBestPractice(validatedData);
      res.status(201).json(practice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating best practice" });
    }
  });

  // Update best practice
  app.put("/api/best-practices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertBestPracticeSchema.partial().parse(req.body);
      const practice = await storage.updateBestPractice(id, validatedData);
      
      if (!practice) {
        return res.status(404).json({ message: "Best practice not found" });
      }
      
      res.json(practice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating best practice" });
    }
  });

  // Delete best practice (soft delete)
  app.delete("/api/best-practices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBestPractice(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Best practice not found" });
      }
      
      res.json({ message: "Best practice deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting best practice" });
    }
  });

  // Get recommendations by criterion
  app.get("/api/recommendations/criterion/:name", async (req, res) => {
    try {
      const criterionName = req.params.name;
      const recommendations = await storage.getRecommendationsByCriterion(criterionName);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recommendations" });
    }
  });

  // Create practice recommendation
  app.post("/api/practice-recommendations", async (req, res) => {
    try {
      const validatedData = insertPracticeRecommendationSchema.parse(req.body);
      const recommendation = await storage.createPracticeRecommendation(validatedData);
      res.status(201).json(recommendation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating recommendation" });
    }
  });

  // New endpoint for fetching policy examples based on weak criteria
  app.post("/api/policy-examples", async (req, res) => {
    try {
      const { dimensionId, dimensionName, weakCriteria } = req.body;
      
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ error: "OpenAI API key not configured" });
      }

      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      // Build search keywords from weak criteria
      const searchKeywords = weakCriteria.join(', ');

      const prompt = `Necesito encontrar 3 políticas, estrategias o programas específicos de América Latina que hayan abordado exitosamente estos criterios débiles: "${searchKeywords}" en el contexto de "${dimensionName}".

Para cada ejemplo, proporciona:
1. País específico
2. Nombre exacto de la política/programa/estrategia
3. Descripción concisa (máximo 2 líneas)
4. Resultados específicos y medibles obtenidos
5. Año de implementación
6. Enlace web a fuente oficial o documento que lo respalde

Responde SOLO en formato JSON:
{
  "examples": [
    {
      "country": "País específico",
      "policy": "Nombre exacto de la política/programa/estrategia",
      "description": "Descripción concisa de máximo 2 líneas",
      "results": "Resultados específicos y medibles obtenidos", 
      "year": "Año de implementación",
      "source": "https://enlace-a-fuente-oficial.gov/documento"
    }
  ]
}

IMPORTANTE: Los enlaces deben ser reales y verificables. Si no conoces un enlace específico, usa el formato del sitio oficial de la institución responsable.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "Eres un investigador especializado en políticas públicas latinoamericanas. Proporciona información precisa con fuentes verificables y enlaces reales a documentos oficiales."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
        max_tokens: 1500
      });

      const result = JSON.parse(response.choices[0].message.content || '{"examples":[]}');
      
      res.json(result);
    } catch (error) {
      console.error('Error generating policy examples:', error);
      res.status(500).json({ error: "Error generating policy examples" });
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
