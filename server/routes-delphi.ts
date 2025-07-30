import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage-extended";
import { 
  setupSession, 
  requireAuth, 
  requireAdmin, 
  requireCoordinator, 
  requireGroupAccess, 
  requireStudyAccess,
  login,
  hashPassword 
} from "./auth";
import {
  insertUserSchema,
  insertGroupSchema,
  insertDelphiStudySchema,
  insertAlternativeSchema,
  insertCriteriaSchema,
  insertResponseSchema,
  insertJustificationSchema,
  loginSchema,
  groupJoinSchema,
  type LoginData,
  type GroupJoinData,
} from "@shared/schema";

export function registerDelphiRoutes(app: Express) {
  // Setup session middleware
  setupSession(app);

  // Authentication routes
  app.post("/api/auth/register", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Remove password from response
      const { password, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password }: LoginData = loginSchema.parse(req.body);
      
      const user = await login(username, password);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Store user ID in session
      (req.session as any).userId = user.id;

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, (req, res) => {
    const { password, ...userResponse } = req.user!;
    res.json(userResponse);
  });

  // Group management routes
  app.get("/api/delphi/groups", requireAuth, async (req, res) => {
    try {
      let groups;
      if (req.user!.role === 'admin') {
        // Admin can see all groups
        groups = await storage.getAllGroups();
      } else if (req.user!.role === 'coordinator') {
        // Coordinators see their groups
        groups = await storage.getGroupsByCoordinator(req.user!.id);
      } else {
        // Regular users see groups they belong to
        const userGroups = await storage.getUserGroups(req.user!.id);
        groups = userGroups.map(ug => ug.group);
      }
      res.json(groups);
    } catch (error) {
      console.error("Get groups error:", error);
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  app.post("/api/delphi/groups", requireCoordinator, async (req, res) => {
    try {
      const groupData = insertGroupSchema.parse(req.body);
      
      // Generate unique 6-character code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const group = await storage.createGroup({
        ...groupData,
        coordinatorId: req.user!.id,
        code,
      });

      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Create group error:", error);
      res.status(500).json({ error: "Failed to create group" });
    }
  });

  app.get("/api/delphi/groups/:id", requireAuth, async (req, res) => {
    try {
      console.log("Group ID param:", req.params.id);
      const groupId = parseInt(req.params.id);
      console.log("Parsed group ID:", groupId);
      
      if (!groupId) {
        return res.status(400).json({ error: "Invalid group ID" });
      }
      
      const group = await storage.getGroup(groupId);
      console.log("Found group:", group);
      
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }

      res.json(group);
    } catch (error) {
      console.error("Get group error:", error);
      res.status(500).json({ error: "Failed to fetch group" });
    }
  });

  app.get("/api/delphi/groups/:id/members", requireAuth, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const members = await storage.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      console.error("Get group members error:", error);
      res.status(500).json({ error: "Failed to fetch group members" });
    }
  });

  app.get("/api/delphi/groups/:id/studies", requireAuth, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const studies = await storage.getStudiesByGroup(groupId);
      res.json(studies);
    } catch (error) {
      console.error("Get group studies error:", error);
      res.status(500).json({ error: "Failed to fetch group studies" });
    }
  });

  app.post("/api/delphi/groups/join", requireAuth, async (req, res) => {
    try {
      const { code }: GroupJoinData = groupJoinSchema.parse(req.body);
      
      const group = await storage.getGroupByCode(code);
      if (!group) {
        return res.status(404).json({ error: "Invalid group code" });
      }

      // Check if user is already a member
      const hasAccess = await storage.hasGroupAccess(req.user!.id, group.id);
      if (hasAccess) {
        return res.status(400).json({ error: "Already a member of this group" });
      }

      await storage.addUserToGroup(req.user!.id, group.id);
      res.json({ message: "Successfully joined group", group });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Join group error:", error);
      res.status(500).json({ error: "Failed to join group" });
    }
  });

  app.get("/api/groups/:groupId/members", requireAuth, requireGroupAccess, async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const members = await storage.getGroupMembers(groupId);
      res.json(members);
    } catch (error) {
      console.error("Get group members error:", error);
      res.status(500).json({ error: "Failed to fetch group members" });
    }
  });

  // Delphi study management routes
  app.get("/api/groups/:groupId/studies", requireAuth, requireGroupAccess, async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const studies = await storage.getStudiesByGroup(groupId);
      res.json(studies);
    } catch (error) {
      console.error("Get studies error:", error);
      res.status(500).json({ error: "Failed to fetch studies" });
    }
  });

  app.post("/api/groups/:groupId/studies", requireAuth, requireGroupAccess, async (req, res) => {
    try {
      const groupId = parseInt(req.params.groupId);
      const studyData = insertDelphiStudySchema.parse(req.body);
      
      // Only coordinators and admins can create studies
      if (req.user!.role === 'user') {
        const group = await storage.getGroup(groupId);
        if (!group || group.coordinatorId !== req.user!.id) {
          return res.status(403).json({ error: "Only coordinators can create studies" });
        }
      }

      const study = await storage.createDelphiStudy({
        ...studyData,
        groupId,
        createdBy: req.user!.id,
      });

      res.status(201).json(study);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Create study error:", error);
      res.status(500).json({ error: "Failed to create study" });
    }
  });

  app.get("/api/studies/:studyId", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const study = await storage.getDelphiStudy(studyId);
      
      if (!study) {
        return res.status(404).json({ error: "Study not found" });
      }

      res.json(study);
    } catch (error) {
      console.error("Get study error:", error);
      res.status(500).json({ error: "Failed to fetch study" });
    }
  });

  // Alternatives management
  app.get("/api/studies/:studyId/alternatives", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const alternatives = await storage.getAlternativesByStudy(studyId);
      res.json(alternatives);
    } catch (error) {
      console.error("Get alternatives error:", error);
      res.status(500).json({ error: "Failed to fetch alternatives" });
    }
  });

  app.post("/api/studies/:studyId/alternatives", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const alternativeData = insertAlternativeSchema.parse(req.body);
      
      const alternative = await storage.createAlternative({
        ...alternativeData,
        studyId,
      });

      res.status(201).json(alternative);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Create alternative error:", error);
      res.status(500).json({ error: "Failed to create alternative" });
    }
  });

  // Criteria management
  app.get("/api/studies/:studyId/criteria", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const criteria = await storage.getCriteriaByStudy(studyId);
      res.json(criteria);
    } catch (error) {
      console.error("Get criteria error:", error);
      res.status(500).json({ error: "Failed to fetch criteria" });
    }
  });

  app.post("/api/studies/:studyId/criteria", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const criteriaData = insertCriteriaSchema.parse(req.body);
      
      const criteria = await storage.createCriteria({
        ...criteriaData,
        studyId,
      });

      res.status(201).json(criteria);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Create criteria error:", error);
      res.status(500).json({ error: "Failed to create criteria" });
    }
  });

  // Response management
  app.get("/api/studies/:studyId/responses", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const round = req.query.round ? parseInt(req.query.round as string) : undefined;
      const userId = req.query.userId ? parseInt(req.query.userId as string) : req.user!.id;
      
      // Users can only see their own responses unless they're admin/coordinator
      if (userId !== req.user!.id && !['admin', 'coordinator'].includes(req.user!.role)) {
        return res.status(403).json({ error: "Access denied" });
      }

      const responses = await storage.getResponsesByUser(userId, studyId, round);
      res.json(responses);
    } catch (error) {
      console.error("Get responses error:", error);
      res.status(500).json({ error: "Failed to fetch responses" });
    }
  });

  app.post("/api/studies/:studyId/responses", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const responseData = insertResponseSchema.parse(req.body);
      
      const response = await storage.createOrUpdateResponse({
        ...responseData,
        studyId,
        userId: req.user!.id,
      });

      // Update aggregated scores
      await storage.updateAggregatedScores(studyId, responseData.round || 1);

      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Create response error:", error);
      res.status(500).json({ error: "Failed to create response" });
    }
  });

  // Justification management
  app.get("/api/studies/:studyId/justifications", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const alternativeId = parseInt(req.query.alternativeId as string);
      const criteriaId = parseInt(req.query.criteriaId as string);
      const round = parseInt(req.query.round as string);
      
      if (!alternativeId || !criteriaId || !round) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const justifications = await storage.getJustificationsByCell(studyId, alternativeId, criteriaId, round);
      res.json(justifications);
    } catch (error) {
      console.error("Get justifications error:", error);
      res.status(500).json({ error: "Failed to fetch justifications" });
    }
  });

  app.post("/api/studies/:studyId/justifications", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const justificationData = insertJustificationSchema.parse(req.body);
      
      const justification = await storage.createJustification({
        ...justificationData,
        studyId,
        userId: req.user!.id,
      });

      res.status(201).json(justification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Create justification error:", error);
      res.status(500).json({ error: "Failed to create justification" });
    }
  });

  // Aggregated scores
  app.get("/api/studies/:studyId/aggregated-scores", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const round = parseInt(req.query.round as string) || 1;
      
      const scores = await storage.getAggregatedScores(studyId, round);
      res.json(scores);
    } catch (error) {
      console.error("Get aggregated scores error:", error);
      res.status(500).json({ error: "Failed to fetch aggregated scores" });
    }
  });

  // Study progress and analytics
  app.get("/api/studies/:studyId/progress", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const round = parseInt(req.query.round as string) || 1;
      
      const alternatives = await storage.getAlternativesByStudy(studyId);
      const criteria = await storage.getCriteriaByStudy(studyId);
      const responses = await storage.getResponsesByStudy(studyId, round);
      
      // Calculate completion statistics
      const totalCells = alternatives.length * criteria.length;
      // Get study to find group ID
      const study = await storage.getDelphiStudy(studyId);
      if (!study) {
        return res.status(404).json({ error: "Study not found" });
      }
      const groupMembers = await storage.getGroupMembers(study.groupId || 0);
      const totalExpectedResponses = totalCells * groupMembers.length;
      const completionRate = (responses.length / totalExpectedResponses) * 100;
      
      // Calculate user-wise completion
      const userProgress = groupMembers.map(member => {
        const userResponses = responses.filter(r => r.userId === member.userId);
        const userCompletion = (userResponses.length / totalCells) * 100;
        return {
          userId: member.userId,
          username: member.user.username,
          completion: userCompletion,
          responses: userResponses.length,
        };
      });

      res.json({
        totalCells,
        totalExpectedResponses,
        actualResponses: responses.length,
        completionRate,
        userProgress,
        alternatives: alternatives.length,
        criteria: criteria.length,
        participants: groupMembers.length,
      });
    } catch (error) {
      console.error("Get study progress error:", error);
      res.status(500).json({ error: "Failed to fetch study progress" });
    }
  });
}