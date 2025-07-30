import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  groups,
  groupMembers,
  delphiStudies,
  alternatives,
  criteria,
  responses,
  justifications,
  aggregatedScores,
  evaluations,
  bestPractices,
  practiceRecommendations,
  type User,
  type InsertUser,
  type Group,
  type InsertGroup,
  type GroupMember,
  type DelphiStudy,
  type InsertDelphiStudy,
  type Alternative,
  type InsertAlternative,
  type Criteria,
  type InsertCriteria,
  type Response,
  type InsertResponse,
  type Justification,
  type InsertJustification,
  type AggregatedScore,
  type Evaluation,
  type InsertEvaluation,
  type BestPractice,
  type InsertBestPractice,
  type PracticeRecommendation,
  type InsertPracticeRecommendation,
} from "@shared/schema";

export interface IExtendedStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserLastLogin(id: number): Promise<void>;
  getUsersByRole(role: string): Promise<User[]>;
  
  // Group management
  getGroup(id: number): Promise<Group | undefined>;
  getGroupByCode(code: string): Promise<Group | undefined>;
  getAllGroups(): Promise<Group[]>;
  createGroup(group: InsertGroup): Promise<Group>;
  updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined>;
  deleteGroup(id: number): Promise<boolean>;
  getGroupsByCoordinator(coordinatorId: number): Promise<Group[]>;
  
  // Group membership
  addUserToGroup(userId: number, groupId: number): Promise<GroupMember>;
  removeUserFromGroup(userId: number, groupId: number): Promise<boolean>;
  getGroupMembers(groupId: number): Promise<(GroupMember & { user: User })[]>;
  getUserGroups(userId: number): Promise<(GroupMember & { group: Group })[]>;
  hasGroupAccess(userId: number, groupId: number): Promise<boolean>;
  
  // Delphi studies
  getDelphiStudy(id: number): Promise<DelphiStudy | undefined>;
  createDelphiStudy(study: InsertDelphiStudy): Promise<DelphiStudy>;
  updateDelphiStudy(id: number, study: Partial<InsertDelphiStudy>): Promise<DelphiStudy | undefined>;
  deleteDelphiStudy(id: number): Promise<boolean>;
  getStudiesByGroup(groupId: number): Promise<DelphiStudy[]>;
  getStudiesByCreator(creatorId: number): Promise<DelphiStudy[]>;
  hasStudyAccess(userId: number, studyId: number): Promise<boolean>;
  
  // Alternatives and Criteria
  getAlternativesByStudy(studyId: number): Promise<Alternative[]>;
  createAlternative(alternative: InsertAlternative): Promise<Alternative>;
  updateAlternative(id: number, alternative: Partial<InsertAlternative>): Promise<Alternative | undefined>;
  deleteAlternative(id: number): Promise<boolean>;
  
  getCriteriaByStudy(studyId: number): Promise<Criteria[]>;
  createCriteria(criteria: InsertCriteria): Promise<Criteria>;
  updateCriteria(id: number, criteria: Partial<InsertCriteria>): Promise<Criteria | undefined>;
  deleteCriteria(id: number): Promise<boolean>;
  
  // Responses and justifications
  getResponse(userId: number, studyId: number, alternativeId: number, criteriaId: number, round: number): Promise<Response | undefined>;
  createOrUpdateResponse(response: InsertResponse): Promise<Response>;
  getResponsesByUser(userId: number, studyId: number, round?: number): Promise<Response[]>;
  getResponsesByStudy(studyId: number, round?: number): Promise<Response[]>;
  
  createJustification(justification: InsertJustification): Promise<Justification>;
  getJustificationsByCell(studyId: number, alternativeId: number, criteriaId: number, round: number): Promise<(Justification & { user: User })[]>;
  getJustificationsByUser(userId: number, studyId: number, round?: number): Promise<Justification[]>;
  
  // Aggregated scores
  updateAggregatedScores(studyId: number, round: number): Promise<void>;
  getAggregatedScores(studyId: number, round: number): Promise<AggregatedScore[]>;
  
  // Legacy evaluation system
  getEvaluation(id: number): Promise<Evaluation | undefined>;
  getAllEvaluations(): Promise<Evaluation[]>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  updateEvaluation(id: number, evaluation: Partial<InsertEvaluation>): Promise<Evaluation | undefined>;
  deleteEvaluation(id: number): Promise<boolean>;
  
  // Best practices
  getAllBestPractices(): Promise<BestPractice[]>;
  getBestPracticesByCriteria(criteria: string[]): Promise<BestPractice[]>;
  createBestPractice(practice: InsertBestPractice): Promise<BestPractice>;
  updateBestPractice(id: number, practice: Partial<InsertBestPractice>): Promise<BestPractice | undefined>;
  deleteBestPractice(id: number): Promise<boolean>;
  
  // Practice recommendations
  getRecommendationsByPractice(practiceId: number): Promise<PracticeRecommendation[]>;
  getRecommendationsByCriterion(criterionName: string): Promise<PracticeRecommendation[]>;
  createPracticeRecommendation(recommendation: InsertPracticeRecommendation): Promise<PracticeRecommendation>;
}

export class DatabaseStorage implements IExtendedStorage {
  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...user, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role));
  }

  // Group management
  async getGroup(id: number): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }

  async getGroupByCode(code: string): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.code, code));
    return group;
  }

  async getAllGroups(): Promise<Group[]> {
    return await db.select().from(groups).where(eq(groups.isActive, true));
  }

  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    return newGroup;
  }

  async updateGroup(id: number, group: Partial<InsertGroup>): Promise<Group | undefined> {
    const [updatedGroup] = await db
      .update(groups)
      .set({ ...group, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<boolean> {
    const result = await db.delete(groups).where(eq(groups.id, id));
    return result.rowCount > 0;
  }

  async getGroupsByCoordinator(coordinatorId: number): Promise<Group[]> {
    return await db.select().from(groups).where(eq(groups.coordinatorId, coordinatorId));
  }

  // Group membership
  async addUserToGroup(userId: number, groupId: number): Promise<GroupMember> {
    const [member] = await db
      .insert(groupMembers)
      .values({ userId, groupId })
      .returning();
    return member;
  }

  async removeUserFromGroup(userId: number, groupId: number): Promise<boolean> {
    const result = await db
      .delete(groupMembers)
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)));
    return result.rowCount > 0;
  }

  async getGroupMembers(groupId: number): Promise<(GroupMember & { user: User })[]> {
    return await db
      .select()
      .from(groupMembers)
      .innerJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, groupId));
  }

  async getUserGroups(userId: number): Promise<(GroupMember & { group: Group })[]> {
    return await db
      .select()
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, userId));
  }

  async hasGroupAccess(userId: number, groupId: number): Promise<boolean> {
    // Check if user is coordinator of the group
    const [coordinatorGroup] = await db
      .select()
      .from(groups)
      .where(and(eq(groups.id, groupId), eq(groups.coordinatorId, userId)));
    
    if (coordinatorGroup) return true;

    // Check if user is a member of the group
    const [membership] = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
    
    return !!membership;
  }

  // Delphi studies
  async getDelphiStudy(id: number): Promise<DelphiStudy | undefined> {
    const [study] = await db.select().from(delphiStudies).where(eq(delphiStudies.id, id));
    return study;
  }

  async createDelphiStudy(study: InsertDelphiStudy): Promise<DelphiStudy> {
    const [newStudy] = await db.insert(delphiStudies).values(study).returning();
    return newStudy;
  }

  async updateDelphiStudy(id: number, study: Partial<InsertDelphiStudy>): Promise<DelphiStudy | undefined> {
    const [updatedStudy] = await db
      .update(delphiStudies)
      .set({ ...study, updatedAt: new Date() })
      .where(eq(delphiStudies.id, id))
      .returning();
    return updatedStudy;
  }

  async deleteDelphiStudy(id: number): Promise<boolean> {
    const result = await db.delete(delphiStudies).where(eq(delphiStudies.id, id));
    return result.rowCount > 0;
  }

  async getStudiesByGroup(groupId: number): Promise<DelphiStudy[]> {
    return await db.select().from(delphiStudies).where(eq(delphiStudies.groupId, groupId));
  }

  async getStudiesByCreator(creatorId: number): Promise<DelphiStudy[]> {
    return await db.select().from(delphiStudies).where(eq(delphiStudies.createdBy, creatorId));
  }

  async hasStudyAccess(userId: number, studyId: number): Promise<boolean> {
    // Get the study and check group access
    const [study] = await db.select().from(delphiStudies).where(eq(delphiStudies.id, studyId));
    if (!study) return false;

    return await this.hasGroupAccess(userId, study.groupId);
  }

  // Alternatives and Criteria
  async getAlternativesByStudy(studyId: number): Promise<Alternative[]> {
    return await db
      .select()
      .from(alternatives)
      .where(and(eq(alternatives.studyId, studyId), eq(alternatives.isActive, true)))
      .orderBy(alternatives.order);
  }

  async createAlternative(alternative: InsertAlternative): Promise<Alternative> {
    const [newAlternative] = await db.insert(alternatives).values(alternative).returning();
    return newAlternative;
  }

  async updateAlternative(id: number, alternative: Partial<InsertAlternative>): Promise<Alternative | undefined> {
    const [updatedAlternative] = await db
      .update(alternatives)
      .set(alternative)
      .where(eq(alternatives.id, id))
      .returning();
    return updatedAlternative;
  }

  async deleteAlternative(id: number): Promise<boolean> {
    const [updated] = await db
      .update(alternatives)
      .set({ isActive: false })
      .where(eq(alternatives.id, id))
      .returning();
    return !!updated;
  }

  async getCriteriaByStudy(studyId: number): Promise<Criteria[]> {
    return await db
      .select()
      .from(criteria)
      .where(and(eq(criteria.studyId, studyId), eq(criteria.isActive, true)))
      .orderBy(criteria.order);
  }

  async createCriteria(criteriaData: InsertCriteria): Promise<Criteria> {
    const [newCriteria] = await db.insert(criteria).values(criteriaData).returning();
    return newCriteria;
  }

  async updateCriteria(id: number, criteriaData: Partial<InsertCriteria>): Promise<Criteria | undefined> {
    const [updatedCriteria] = await db
      .update(criteria)
      .set(criteriaData)
      .where(eq(criteria.id, id))
      .returning();
    return updatedCriteria;
  }

  async deleteCriteria(id: number): Promise<boolean> {
    const [updated] = await db
      .update(criteria)
      .set({ isActive: false })
      .where(eq(criteria.id, id))
      .returning();
    return !!updated;
  }

  // Responses and justifications
  async getResponse(userId: number, studyId: number, alternativeId: number, criteriaId: number, round: number): Promise<Response | undefined> {
    const [response] = await db
      .select()
      .from(responses)
      .where(and(
        eq(responses.userId, userId),
        eq(responses.studyId, studyId),
        eq(responses.alternativeId, alternativeId),
        eq(responses.criteriaId, criteriaId),
        eq(responses.round, round)
      ));
    return response;
  }

  async createOrUpdateResponse(response: InsertResponse): Promise<Response> {
    const existing = await this.getResponse(
      response.userId,
      response.studyId,
      response.alternativeId,
      response.criteriaId,
      response.round
    );

    if (existing) {
      const [updated] = await db
        .update(responses)
        .set({ 
          score: response.score, 
          confidence: response.confidence,
          updatedAt: new Date() 
        })
        .where(eq(responses.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(responses).values(response).returning();
      return created;
    }
  }

  async getResponsesByUser(userId: number, studyId: number, round?: number): Promise<Response[]> {
    const conditions = [
      eq(responses.userId, userId),
      eq(responses.studyId, studyId)
    ];
    
    if (round !== undefined) {
      conditions.push(eq(responses.round, round));
    }

    return await db.select().from(responses).where(and(...conditions));
  }

  async getResponsesByStudy(studyId: number, round?: number): Promise<Response[]> {
    const conditions = [eq(responses.studyId, studyId)];
    
    if (round !== undefined) {
      conditions.push(eq(responses.round, round));
    }

    return await db.select().from(responses).where(and(...conditions));
  }

  async createJustification(justification: InsertJustification): Promise<Justification> {
    const [newJustification] = await db.insert(justifications).values(justification).returning();
    return newJustification;
  }

  async getJustificationsByCell(studyId: number, alternativeId: number, criteriaId: number, round: number): Promise<(Justification & { user: User })[]> {
    return await db
      .select()
      .from(justifications)
      .innerJoin(users, eq(justifications.userId, users.id))
      .where(and(
        eq(justifications.studyId, studyId),
        eq(justifications.alternativeId, alternativeId),
        eq(justifications.criteriaId, criteriaId),
        eq(justifications.round, round),
        eq(justifications.isVisible, true)
      ));
  }

  async getJustificationsByUser(userId: number, studyId: number, round?: number): Promise<Justification[]> {
    const conditions = [
      eq(justifications.userId, userId),
      eq(justifications.studyId, studyId)
    ];
    
    if (round !== undefined) {
      conditions.push(eq(justifications.round, round));
    }

    return await db.select().from(justifications).where(and(...conditions));
  }

  // Aggregated scores
  async updateAggregatedScores(studyId: number, round: number): Promise<void> {
    // Get all alternatives and criteria for this study
    const studyAlternatives = await this.getAlternativesByStudy(studyId);
    const studyCriteria = await this.getCriteriaByStudy(studyId);

    for (const alternative of studyAlternatives) {
      for (const criteriaItem of studyCriteria) {
        // Get all responses for this combination
        const cellResponses = await db
          .select()
          .from(responses)
          .where(and(
            eq(responses.studyId, studyId),
            eq(responses.alternativeId, alternative.id),
            eq(responses.criteriaId, criteriaItem.id),
            eq(responses.round, round)
          ));

        if (cellResponses.length > 0) {
          const scores = cellResponses.map(r => parseFloat(r.score));
          const average = scores.reduce((a, b) => a + b, 0) / scores.length;
          const sortedScores = scores.sort((a, b) => a - b);
          const median = sortedScores.length % 2 === 0
            ? (sortedScores[sortedScores.length / 2 - 1] + sortedScores[sortedScores.length / 2]) / 2
            : sortedScores[Math.floor(sortedScores.length / 2)];
          
          const variance = scores.reduce((acc, score) => acc + Math.pow(score - average, 2), 0) / scores.length;
          const standardDeviation = Math.sqrt(variance);

          // Upsert aggregated score
          await db
            .insert(aggregatedScores)
            .values({
              studyId,
              alternativeId: alternative.id,
              criteriaId: criteriaItem.id,
              average: average.toString(),
              median: median.toString(),
              standardDeviation: standardDeviation.toString(),
              responseCount: cellResponses.length,
              round,
            })
            .onConflictDoUpdate({
              target: [aggregatedScores.studyId, aggregatedScores.alternativeId, aggregatedScores.criteriaId, aggregatedScores.round],
              set: {
                average: average.toString(),
                median: median.toString(),
                standardDeviation: standardDeviation.toString(),
                responseCount: cellResponses.length,
                updatedAt: new Date(),
              },
            });
        }
      }
    }
  }

  async getAggregatedScores(studyId: number, round: number): Promise<AggregatedScore[]> {
    return await db
      .select()
      .from(aggregatedScores)
      .where(and(eq(aggregatedScores.studyId, studyId), eq(aggregatedScores.round, round)));
  }

  // Legacy evaluation system - keeping existing methods
  async getEvaluation(id: number): Promise<Evaluation | undefined> {
    const [evaluation] = await db.select().from(evaluations).where(eq(evaluations.id, id));
    return evaluation;
  }

  async getAllEvaluations(): Promise<Evaluation[]> {
    return await db.select().from(evaluations).orderBy(desc(evaluations.createdAt));
  }

  async createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation> {
    const [newEvaluation] = await db.insert(evaluations).values(evaluation).returning();
    return newEvaluation;
  }

  async updateEvaluation(id: number, evaluation: Partial<InsertEvaluation>): Promise<Evaluation | undefined> {
    const [updatedEvaluation] = await db
      .update(evaluations)
      .set({ ...evaluation, updatedAt: new Date() })
      .where(eq(evaluations.id, id))
      .returning();
    return updatedEvaluation;
  }

  async deleteEvaluation(id: number): Promise<boolean> {
    const result = await db.delete(evaluations).where(eq(evaluations.id, id));
    return result.rowCount > 0;
  }

  // Best practices - keeping existing methods
  async getAllBestPractices(): Promise<BestPractice[]> {
    return await db.select().from(bestPractices).where(eq(bestPractices.isActive, true));
  }

  async getBestPracticesByCriteria(criteriaList: string[]): Promise<BestPractice[]> {
    return await db
      .select()
      .from(bestPractices)
      .where(and(
        eq(bestPractices.isActive, true),
        sql`${bestPractices.targetCriteria} && ${criteriaList}`
      ));
  }

  async createBestPractice(practice: InsertBestPractice): Promise<BestPractice> {
    const [newPractice] = await db.insert(bestPractices).values(practice).returning();
    return newPractice;
  }

  async updateBestPractice(id: number, practice: Partial<InsertBestPractice>): Promise<BestPractice | undefined> {
    const [updatedPractice] = await db
      .update(bestPractices)
      .set({ ...practice, updatedAt: new Date() })
      .where(eq(bestPractices.id, id))
      .returning();
    return updatedPractice;
  }

  async deleteBestPractice(id: number): Promise<boolean> {
    const [updated] = await db
      .update(bestPractices)
      .set({ isActive: false })
      .where(eq(bestPractices.id, id))
      .returning();
    return !!updated;
  }

  // Practice recommendations - keeping existing methods
  async getRecommendationsByPractice(practiceId: number): Promise<PracticeRecommendation[]> {
    return await db.select().from(practiceRecommendations).where(eq(practiceRecommendations.practiceId, practiceId));
  }

  async getRecommendationsByCriterion(criterionName: string): Promise<PracticeRecommendation[]> {
    return await db.select().from(practiceRecommendations).where(eq(practiceRecommendations.criterionName, criterionName));
  }

  async createPracticeRecommendation(recommendation: InsertPracticeRecommendation): Promise<PracticeRecommendation> {
    const [newRecommendation] = await db.insert(practiceRecommendations).values(recommendation).returning();
    return newRecommendation;
  }

  // Additional member management functions
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getGroupMember(groupId: number, userId: number): Promise<GroupMember | undefined> {
    const [member] = await db.select()
      .from(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ));
    
    return member;
  }

  async addGroupMember(member: { groupId: number; userId: number; role: string }): Promise<GroupMember> {
    const [newMember] = await db.insert(groupMembers).values(member).returning();
    return newMember;
  }

  async updateGroupMemberRole(memberId: number, role: string): Promise<GroupMember> {
    const [updatedMember] = await db
      .update(groupMembers)
      .set({ role })
      .where(eq(groupMembers.id, memberId))
      .returning();

    return updatedMember;
  }

  async removeGroupMember(memberId: number): Promise<void> {
    await db.delete(groupMembers).where(eq(groupMembers.id, memberId));
  }

  // Admin user management functions
  async getAllUsers(): Promise<User[]> {
    return await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      lastLoginAt: users.lastLoginAt,
    }).from(users);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }
}

// Export the storage instance
export const storage = new DatabaseStorage();