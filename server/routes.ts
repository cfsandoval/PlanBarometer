import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEvaluationSchema, insertBestPracticeSchema, insertPracticeRecommendationSchema } from "@shared/schema";
import { z } from "zod";
import { WebSocketServer, WebSocket } from 'ws';
import { registerDelphiRoutes } from "./routes-delphi";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Register Delphi RT multi-user routes
  registerDelphiRoutes(app);
  
  // Legacy evaluation routes (TOPP system)
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
      console.log("Received criteria param:", criteriaParam);
      
      if (!criteriaParam) {
        return res.status(400).json({ message: "Criteria parameter required" });
      }
      
      // Split comma-separated criteria and decode URL encoding
      const criteria = criteriaParam.split(',')
        .map(c => decodeURIComponent(c.trim()))
        .filter(Boolean);
      
      console.log("Processed criteria:", criteria);
      
      const practices = await storage.getBestPracticesByCriteria(criteria);
      res.json(practices);
    } catch (error) {
      console.error("Error in criteria endpoint:", error);
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

  // Web scraping endpoint for external repositories  
  app.post("/api/best-practices/scrape", async (req, res) => {
    try {
      const { WebScraper } = await import('./web-scraper');
      const scraper = new WebScraper();
      
      console.log('Starting web scraping of external repositories...');
      const scrapedPractices = await scraper.scrapeAllRepositories();
      
      // Convert and save scraped practices
      const savedPractices = [];
      for (const scraped of scrapedPractices) {
        try {
          const practiceData = WebScraper.convertToBestPractice(scraped);
          const savedPractice = await storage.createBestPractice(practiceData);
          savedPractices.push(savedPractice);
        } catch (error) {
          console.error('Error saving scraped practice:', error);
        }
      }
      
      console.log(`Successfully scraped and saved ${savedPractices.length} new practices`);
      res.json({ 
        message: `Successfully scraped ${savedPractices.length} new practices`,
        practices: savedPractices 
      });
    } catch (error) {
      console.error('Error during web scraping:', error);
      res.status(500).json({ message: 'Failed to scrape external repositories' });
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

  // Scraping configuration routes
  app.get('/api/scraping-configs', async (req, res) => {
    try {
      const configs = await storage.getAllScrapingConfigs();
      res.json(configs);
    } catch (error) {
      console.error("Error fetching scraping configs:", error);
      res.status(500).json({ message: "Failed to fetch scraping configs" });
    }
  });

  app.post('/api/scraping-configs', async (req, res) => {
    try {
      const config = await storage.createScrapingConfig(req.body);
      res.json(config);
    } catch (error) {
      console.error("Error creating scraping config:", error);
      res.status(500).json({ message: "Failed to create scraping config" });
    }
  });

  app.put('/api/scraping-configs/:id', async (req, res) => {
    try {
      const config = await storage.updateScrapingConfig(parseInt(req.params.id), req.body);
      if (!config) {
        return res.status(404).json({ message: "Scraping config not found" });
      }
      res.json(config);
    } catch (error) {
      console.error("Error updating scraping config:", error);
      res.status(500).json({ message: "Failed to update scraping config" });
    }
  });

  app.delete('/api/scraping-configs/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteScrapingConfig(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ message: "Scraping config not found" });
      }
      res.json({ message: "Scraping config deleted successfully" });
    } catch (error) {
      console.error("Error deleting scraping config:", error);
      res.status(500).json({ message: "Failed to delete scraping config" });
    }
  });

  // External API routes
  app.get('/api/external-apis', async (req, res) => {
    try {
      const apis = await storage.getAllExternalApis();
      res.json(apis);
    } catch (error) {
      console.error("Error fetching external APIs:", error);
      res.status(500).json({ message: "Failed to fetch external APIs" });
    }
  });

  app.post('/api/external-apis', async (req, res) => {
    try {
      const api = await storage.createExternalApi(req.body);
      res.json(api);
    } catch (error) {
      console.error("Error creating external API:", error);
      res.status(500).json({ message: "Failed to create external API" });
    }
  });

  app.put('/api/external-apis/:id', async (req, res) => {
    try {
      const api = await storage.updateExternalApi(parseInt(req.params.id), req.body);
      if (!api) {
        return res.status(404).json({ message: "External API not found" });
      }
      res.json(api);
    } catch (error) {
      console.error("Error updating external API:", error);
      res.status(500).json({ message: "Failed to update external API" });
    }
  });

  app.delete('/api/external-apis/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteExternalApi(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ message: "External API not found" });
      }
      res.json({ message: "External API deleted successfully" });
    } catch (error) {
      console.error("Error deleting external API:", error);
      res.status(500).json({ message: "Failed to delete external API" });
    }
  });

  // Scrape best practices from external repositories
  app.post("/api/best-practices/scrape", async (req, res) => {
    try {
      const { WebScraper } = await import('./web-scraper');
      const scraper = new WebScraper();
      const scrapedPractices = await scraper.scrapeAllRepositories();
      
      // Save all scraped practices
      const savedPractices = [];
      for (const practice of scrapedPractices) {
        try {
          const practiceData = WebScraper.convertToBestPractice(practice);
          const saved = await storage.createBestPractice(practiceData);
          savedPractices.push(saved);
        } catch (error) {
          console.error('Error saving practice:', practice.title, error);
        }
      }
      
      res.json({ 
        message: "Scraping completed successfully", 
        practices: savedPractices,
        count: savedPractices.length 
      });
    } catch (error) {
      console.error("Error during scraping:", error);
      res.status(500).json({ 
        message: "Error during web scraping", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  // TOPP-focused scraping for capacity building practices
  app.post("/api/best-practices/scrape-topp", async (req, res) => {
    try {
      const { TOPPScraper } = await import('./topp-scraper');
      const scraper = new TOPPScraper();
      const toppPractices = await scraper.scrapeAll();
      
      // Save all TOPP practices
      const savedPractices = [];
      for (const practice of toppPractices) {
        try {
          const practiceData = TOPPScraper.convertToBestPractice(practice);
          const saved = await storage.createBestPractice(practiceData);
          savedPractices.push(saved);
        } catch (error) {
          console.error('Error saving TOPP practice:', practice.title, error);
        }
      }
      
      res.json({ 
        message: "TOPP scraping completed successfully", 
        practices: savedPractices,
        count: savedPractices.length,
        toppDimensions: toppPractices.map(p => p.toppDimensions)
      });
    } catch (error) {
      console.error("Error during TOPP scraping:", error);
      res.status(500).json({ 
        message: "Error during TOPP web scraping", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
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
