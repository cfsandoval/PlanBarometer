import type { Express } from "express";
import { z } from "zod";
import { storage } from "./storage-extended";
import { db } from "./db";
import { groups, groupMembers } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";
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
  app.get("/api/delphi/groups", async (req, res) => {
    try {
      // For now, return all groups to test
      const allGroups = await storage.getAllGroups();
      res.json(allGroups);
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
        name: groupData.name,
        description: groupData.description,
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

  app.post("/api/delphi/groups/:id/studies", requireAuth, requireCoordinator, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const studyData = insertDelphiStudySchema.parse({
        ...req.body,
        groupId,
        coordinatorId: req.user!.id,
      });

      const study = await storage.createDelphiStudy(studyData);
      res.status(201).json(study);
    } catch (error) {
      console.error("Create study error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid study data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create study" });
    }
  });

  // Member management routes
  app.post("/api/delphi/groups/:id/members", requireAuth, requireCoordinator, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const { email, role } = req.body;

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found with that email" });
      }

      // Check if user is already a member
      const existingMember = await storage.getGroupMember(groupId, user.id);
      if (existingMember) {
        return res.status(400).json({ error: "User is already a member of this group" });
      }

      // Add user to group
      const member = await storage.addGroupMember({
        groupId,
        userId: user.id,
        role: role || 'user',
      });

      res.status(201).json(member);
    } catch (error) {
      console.error("Add member error:", error);
      res.status(500).json({ error: "Failed to add member" });
    }
  });

  app.patch("/api/delphi/groups/:id/members/:memberId", requireAuth, requireCoordinator, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const memberId = parseInt(req.params.memberId);
      const { role } = req.body;

      const updatedMember = await storage.updateGroupMemberRole(memberId, role);
      res.json(updatedMember);
    } catch (error) {
      console.error("Update member role error:", error);
      res.status(500).json({ error: "Failed to update member role" });
    }
  });

  app.delete("/api/delphi/groups/:id/members/:memberId", requireAuth, requireCoordinator, async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const memberId = parseInt(req.params.memberId);

      await storage.removeGroupMember(memberId);
      res.status(204).send();
    } catch (error) {
      console.error("Remove member error:", error);
      res.status(500).json({ error: "Failed to remove member" });
    }
  });

  // Study participants management routes
  app.get("/api/delphi/studies/:studyId/participants", requireAuth, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      // For now, return group members as participants
      const study = await storage.getDelphiStudy(studyId);
      if (!study) {
        return res.status(404).json({ error: "Study not found" });
      }
      
      const members = await storage.getGroupMembers(study.groupId || 0);
      const participants = members.map(member => ({
        id: member.id,
        studyId: studyId,
        userId: member.userId,
        status: 'active',
        role: 'participant',
        expertise: null,
        invitedAt: member.joinedAt,
        joinedAt: member.joinedAt,
        user: member.user
      }));
      
      res.json(participants);
    } catch (error) {
      console.error("Get study participants error:", error);
      res.status(500).json({ error: "Failed to fetch study participants" });
    }
  });

  app.post("/api/delphi/studies/:studyId/participants", requireAuth, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const { email, role = 'participant', expertise } = req.body;
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found with that email" });
      }
      
      // Get study and add user to group if not already a member
      const study = await storage.getDelphiStudy(studyId);
      if (!study) {
        return res.status(404).json({ error: "Study not found" });
      }
      
      const existingMember = await storage.getGroupMember(study.groupId || 0, user.id);
      if (!existingMember) {
        await storage.addGroupMember({
          groupId: study.groupId || 0,
          userId: user.id,
          role: 'user'
        });
      }
      
      const participant = {
        id: Date.now(), // Temporary ID
        studyId: studyId,
        userId: user.id,
        status: 'invited',
        role: role,
        expertise: expertise,
        invitedAt: new Date().toISOString(),
        user: user
      };
      
      res.status(201).json(participant);
    } catch (error) {
      console.error("Add study participant error:", error);
      res.status(500).json({ error: "Failed to add participant" });
    }
  });

  app.delete("/api/delphi/studies/:studyId/participants/:participantId", requireAuth, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const participantId = parseInt(req.params.participantId);
      
      // For now, we'll just return success
      res.status(204).send();
    } catch (error) {
      console.error("Remove study participant error:", error);
      res.status(500).json({ error: "Failed to remove participant" });
    }
  });

  // Study details route
  app.get("/api/delphi/studies/:studyId", requireAuth, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const study = await storage.getDelphiStudy(studyId);
      if (!study) {
        return res.status(404).json({ error: "Study not found" });
      }
      
      // Get group info
      const group = await storage.getGroup(study.groupId || 0);
      const studyWithGroup = {
        ...study,
        group: group
      };
      
      res.json(studyWithGroup);
    } catch (error) {
      console.error("Get study details error:", error);
      res.status(500).json({ error: "Failed to fetch study details" });
    }
  });

  // Update study route
  app.patch("/api/delphi/studies/:studyId", requireAuth, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const updateData = req.body;
      
      // Verify study exists and user has permission
      const existingStudy = await storage.getDelphiStudy(studyId);
      if (!existingStudy) {
        return res.status(404).json({ error: "Study not found" });
      }
      
      // Check if user is coordinator or admin
      const group = await storage.getGroup(existingStudy.groupId || 0);
      if (req.user!.role !== 'admin' && group?.coordinatorId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized to update this study" });
      }
      
      // Update study (for now, we'll just return the updated data)
      const updatedStudy = {
        ...existingStudy,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      res.json(updatedStudy);
    } catch (error) {
      console.error("Update study error:", error);
      res.status(500).json({ error: "Failed to update study" });
    }
  });

  // Delete study route
  app.delete("/api/delphi/studies/:studyId", requireAuth, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      
      // Verify study exists and user has permission
      const existingStudy = await storage.getDelphiStudy(studyId);
      if (!existingStudy) {
        return res.status(404).json({ error: "Study not found" });
      }
      
      // Check if user is coordinator or admin
      const group = await storage.getGroup(existingStudy.groupId || 0);
      if (req.user!.role !== 'admin' && group?.coordinatorId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized to delete this study" });
      }
      
      // For now, we'll just return success
      // In a real implementation, you'd delete from database
      res.status(204).send();
    } catch (error) {
      console.error("Delete study error:", error);
      res.status(500).json({ error: "Failed to delete study" });
    }
  });

  // Admin user management routes
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email already exists  
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      // Hash password
      const hashedPassword = await hashPassword(userData.password);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.put("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = insertUserSchema.omit({ password: true }).parse(req.body);

      // Check if username already exists (excluding current user)
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Check if email already exists (excluding current user)
      if (userData.email) {
        const existingEmail = await storage.getUserByEmail(userData.email);
        if (existingEmail && existingEmail.id !== userId) {
          return res.status(400).json({ error: "Email already exists" });
        }
      }

      const updatedUser = await storage.updateUser(userId, userData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Return user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Update user error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid user data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Prevent self-deletion
      if (userId === req.user!.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }

      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Failed to delete user" });
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

  // Binary response endpoint for studies
  app.post("/api/delphi/studies/:studyId/responses", requireAuth, requireStudyAccess, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const responseData = req.body;
      
      // Here you would typically save the response to database
      // For now, just acknowledge receipt
      console.log(`Received binary response for study ${studyId}:`, responseData);
      
      res.json({ 
        message: "Response received successfully",
        studyId,
        responseData 
      });
    } catch (error) {
      console.error("Submit response error:", error);
      res.status(500).json({ error: "Failed to submit response" });
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

  // Membership heatmap route
  app.get("/api/delphi/membership-heatmap", requireAuth, async (req, res) => {
    try {
      // Get all groups with their coordinators
      const groups = await storage.getAllGroups();
      const groupsWithCoordinators = await Promise.all(
        groups.map(async (group) => {
          const coordinator = await storage.getUser(group.coordinatorId!);
          const members = await storage.getGroupMembers(group.id);
          return {
            id: group.id,
            name: group.name,
            code: group.code,
            memberCount: members.length,
            coordinatorName: coordinator ? `${coordinator.firstName} ${coordinator.lastName}`.trim() || coordinator.username : 'Unknown',
          };
        })
      );

      // Get all users with their group memberships
      const allUsers = await storage.getAllUsers();
      const usersWithMemberships = await Promise.all(
        allUsers.map(async (user) => {
          const userGroups = await storage.getUserGroups(user.id);
          const groupMemberships = userGroups.map((membership: any) => ({
            groupId: membership.groupId || membership.group?.id,
            joinedAt: membership.joinedAt,
            isCoordinator: groups.some(g => g.coordinatorId === user.id && (g.id === membership.groupId || g.id === membership.group?.id)),
          }));

          return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`.trim() || user.username,
            email: user.email || '',
            role: user.role,
            groupMemberships,
          };
        })
      );

      // Create membership matrix
      const matrix = usersWithMemberships.map((user) => 
        groupsWithCoordinators.map((group) => {
          const membership = user.groupMemberships.find(m => m.groupId === group.id);
          return {
            isMember: !!membership,
            isCoordinator: membership?.isCoordinator || false,
            joinedAt: membership?.joinedAt,
          };
        })
      );

      const heatmapData = {
        groups: groupsWithCoordinators,
        users: usersWithMemberships,
        matrix,
      };

      res.json(heatmapData);
    } catch (error) {
      console.error("Membership heatmap error:", error);
      res.status(500).json({ error: "Failed to generate heatmap data" });
    }
  });

  // Personalized Expert Feedback routes
  app.get("/api/delphi/studies/:studyId/feedback/:expertId", requireAuth, async (req, res) => {
    try {
      const studyId = parseInt(req.params.studyId);
      const expertId = parseInt(req.params.expertId);
      
      // In a real implementation, this would calculate personalized feedback
      // based on the expert's responses compared to group consensus
      const mockFeedback = {
        expertId: expertId,
        studyId: studyId,
        overallPerformance: {
          accuracyScore: 87,
          consensusAlignment: 75,
          confidenceLevel: 82,
          expertLevel: 'advanced'
        },
        criterionFeedback: [
          {
            criterionId: 'crit1',
            criterionName: 'Viabilidad Técnica',
            personalScore: 8,
            groupMean: 7.5,
            deviation: 0.5,
            deviationType: 'optimistic',
            confidenceLevel: 85,
            strengths: [
              'Identificación clara de oportunidades técnicas',
              'Justificación bien fundamentada',
              'Perspectiva innovadora'
            ],
            improvementAreas: [
              'Análisis de limitaciones técnicas',
              'Evaluación de riesgos operacionales'
            ],
            recommendations: [
              'Tu evaluación está ligeramente por encima del promedio grupal',
              'Considera revisar aspectos técnicos que otros expertos pueden haber identificado como limitantes',
              'Profundiza en el análisis de riesgos técnicos'
            ]
          }
        ],
        learningInsights: [
          {
            id: 'insight1',
            title: 'Calibración de Evaluaciones con Consenso Grupal',
            description: 'Aprende técnicas para alinear mejor tus evaluaciones con el consenso sin perder tu perspectiva única',
            category: 'consensus_building',
            priority: 'high',
            resources: [
              {
                title: 'Técnicas de Calibración en Evaluación Delphi',
                type: 'article',
                url: '#'
              }
            ]
          }
        ]
      };

      res.json(mockFeedback);
    } catch (error) {
      console.error("Get expert feedback error:", error);
      res.status(500).json({ error: "Failed to fetch expert feedback" });
    }
  });

  // Get expert profile and evaluation history
  app.get("/api/delphi/experts/:expertId/profile", requireAuth, async (req, res) => {
    try {
      const expertId = parseInt(req.params.expertId);
      
      const mockProfile = {
        id: expertId,
        expertiseAreas: ['Planificación Estratégica', 'Políticas Públicas', 'Desarrollo Sostenible'],
        evaluationHistory: {
          totalEvaluations: 15,
          averageAccuracy: 87,
          consensusAlignment: 75,
          skillMetrics: {
            evaluationPrecision: 87,
            consensusBuilding: 75,
            criticalThinking: 92,
            domainKnowledge: 80
          }
        }
      };

      res.json(mockProfile);
    } catch (error) {
      console.error("Get expert profile error:", error);
      res.status(500).json({ error: "Failed to fetch expert profile" });
    }
  });
}