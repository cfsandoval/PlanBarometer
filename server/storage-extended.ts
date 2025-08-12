import { 
  users,
  evaluations,
  bestPractices, 
  practiceRecommendations,
  scrapingConfigs, 
  externalApis, 
  scrapingSessions,
  type User,
  type InsertUser,
  type Evaluation,
  type InsertEvaluation,
  type BestPractice, 
  type InsertBestPractice,
  type PracticeRecommendation,
  type InsertPracticeRecommendation,
  type ScrapingConfig,
  type InsertScrapingConfig,
  type ExternalApi,
  type InsertExternalApi,
  type ScrapingSession
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { IStorage } from "./storage";

export interface IExtendedStorage extends IStorage {
  // Best Practices - Database methods
  bulkCreateBestPractices(practices: InsertBestPractice[]): Promise<BestPractice[]>;
  getBestPracticesByCountry(country: string): Promise<BestPractice[]>;
  getBestPracticesByInstitution(institution: string): Promise<BestPractice[]>;
  searchBestPractices(query: string): Promise<BestPractice[]>;
  markPracticesAsOld(): Promise<void>;
  
  // Scraping Configuration methods
  getAllScrapingConfigs(): Promise<ScrapingConfig[]>;
  getActiveScrapingConfigs(): Promise<ScrapingConfig[]>;
  createScrapingConfig(config: InsertScrapingConfig): Promise<ScrapingConfig>;
  updateScrapingConfig(id: number, config: Partial<InsertScrapingConfig>): Promise<ScrapingConfig | undefined>;
  deleteScrapingConfig(id: number): Promise<boolean>;
  updateScrapingStats(id: number, success: boolean): Promise<void>;
  
  // External API methods
  getAllExternalApis(): Promise<ExternalApi[]>;
  getActiveExternalApis(): Promise<ExternalApi[]>;
  createExternalApi(api: InsertExternalApi): Promise<ExternalApi>;
  updateExternalApi(id: number, api: Partial<InsertExternalApi>): Promise<ExternalApi | undefined>;
  deleteExternalApi(id: number): Promise<boolean>;
  updateApiStats(id: number, success: boolean): Promise<void>;
  
  // Scraping Session methods
  createScrapingSession(configId: number): Promise<ScrapingSession>;
  updateScrapingSession(sessionId: number, data: Partial<ScrapingSession>): Promise<void>;
  getRecentScrapingSessions(limit?: number): Promise<ScrapingSession[]>;
}

export class DatabaseStorage implements IExtendedStorage {
  // Implement base IStorage methods (delegated to existing implementation)
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getEvaluation(id: number): Promise<Evaluation | undefined> {
    const [evaluation] = await db.select().from(evaluations).where(eq(evaluations.id, id));
    return evaluation;
  }

  async getAllEvaluations(): Promise<Evaluation[]> {
    return await db.select().from(evaluations).orderBy(desc(evaluations.updatedAt));
  }

  async createEvaluation(insertEvaluation: InsertEvaluation): Promise<Evaluation> {
    const [evaluation] = await db.insert(evaluations).values(insertEvaluation).returning();
    return evaluation;
  }

  async updateEvaluation(id: number, updateData: Partial<InsertEvaluation>): Promise<Evaluation | undefined> {
    const [evaluation] = await db
      .update(evaluations)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(evaluations.id, id))
      .returning();
    return evaluation;
  }

  async deleteEvaluation(id: number): Promise<boolean> {
    const result = await db.delete(evaluations).where(eq(evaluations.id, id));
    return result.rowCount! > 0;
  }

  // Best Practices - Database implementation
  async getAllBestPractices(): Promise<BestPractice[]> {
    return await db.select().from(bestPractices)
      .where(eq(bestPractices.isActive, true))
      .orderBy(desc(bestPractices.createdAt));
  }

  async getBestPracticesByCriteria(criteria: string[]): Promise<BestPractice[]> {
    // This needs to be implemented with proper JSON querying
    // For now, get all practices and filter in memory
    const allPractices = await this.getAllBestPractices();
    return allPractices.filter(practice => 
      criteria.some(criterion => 
        practice.targetCriteria.some(target => 
          target.toLowerCase().includes(criterion.toLowerCase())
        )
      )
    );
  }

  async createBestPractice(practice: InsertBestPractice): Promise<BestPractice> {
    const [created] = await db.insert(bestPractices).values(practice).returning();
    return created;
  }

  async updateBestPractice(id: number, practice: Partial<InsertBestPractice>): Promise<BestPractice | undefined> {
    const [updated] = await db
      .update(bestPractices)
      .set({ ...practice, updatedAt: new Date() })
      .where(eq(bestPractices.id, id))
      .returning();
    return updated;
  }

  async deleteBestPractice(id: number): Promise<boolean> {
    const result = await db.delete(bestPractices).where(eq(bestPractices.id, id));
    return result.rowCount > 0;
  }

  async bulkCreateBestPractices(practices: InsertBestPractice[]): Promise<BestPractice[]> {
    if (practices.length === 0) return [];
    const created = await db.insert(bestPractices).values(practices).returning();
    return created;
  }

  async getBestPracticesByCountry(country: string): Promise<BestPractice[]> {
    return await db.select().from(bestPractices)
      .where(and(
        eq(bestPractices.country, country),
        eq(bestPractices.isActive, true)
      ));
  }

  async getBestPracticesByInstitution(institution: string): Promise<BestPractice[]> {
    return await db.select().from(bestPractices)
      .where(and(
        eq(bestPractices.institution, institution),
        eq(bestPractices.isActive, true)
      ));
  }

  async searchBestPractices(query: string): Promise<BestPractice[]> {
    // This would need full-text search implementation
    // For now, basic ILIKE search on title and description
    const allPractices = await this.getAllBestPractices();
    const lowerQuery = query.toLowerCase();
    return allPractices.filter(practice => 
      practice.title.toLowerCase().includes(lowerQuery) ||
      practice.description.toLowerCase().includes(lowerQuery)
    );
  }

  async markPracticesAsOld(): Promise<void> {
    // Mark practices as old by updating their updated_at timestamp
    await db.update(bestPractices)
      .set({ updatedAt: new Date() });
  }

  // Scraping Configuration methods
  async getAllScrapingConfigs(): Promise<ScrapingConfig[]> {
    return await db.select().from(scrapingConfigs).orderBy(desc(scrapingConfigs.createdAt));
  }

  async getActiveScrapingConfigs(): Promise<ScrapingConfig[]> {
    return await db.select().from(scrapingConfigs)
      .where(eq(scrapingConfigs.isActive, true));
  }

  async createScrapingConfig(config: InsertScrapingConfig): Promise<ScrapingConfig> {
    const [created] = await db.insert(scrapingConfigs).values(config).returning();
    return created;
  }

  async updateScrapingConfig(id: number, config: Partial<InsertScrapingConfig>): Promise<ScrapingConfig | undefined> {
    const [updated] = await db
      .update(scrapingConfigs)
      .set({ ...config, updatedAt: new Date() })
      .where(eq(scrapingConfigs.id, id))
      .returning();
    return updated;
  }

  async deleteScrapingConfig(id: number): Promise<boolean> {
    const result = await db.delete(scrapingConfigs).where(eq(scrapingConfigs.id, id));
    return result.rowCount > 0;
  }

  async updateScrapingStats(id: number, success: boolean): Promise<void> {
    const config = await db.select().from(scrapingConfigs).where(eq(scrapingConfigs.id, id));
    if (!config[0]) return;

    if (success) {
      await db.update(scrapingConfigs)
        .set({ 
          successCount: (config[0].successCount || 0) + 1,
          lastScrapedAt: new Date()
        })
        .where(eq(scrapingConfigs.id, id));
    } else {
      await db.update(scrapingConfigs)
        .set({ errorCount: (config[0].errorCount || 0) + 1 })
        .where(eq(scrapingConfigs.id, id));
    }
  }

  // External API methods
  async getAllExternalApis(): Promise<ExternalApi[]> {
    return await db.select().from(externalApis).orderBy(desc(externalApis.createdAt));
  }

  async getActiveExternalApis(): Promise<ExternalApi[]> {
    return await db.select().from(externalApis)
      .where(eq(externalApis.isActive, true));
  }

  async createExternalApi(api: InsertExternalApi): Promise<ExternalApi> {
    const [created] = await db.insert(externalApis).values(api).returning();
    return created;
  }

  async updateExternalApi(id: number, api: Partial<InsertExternalApi>): Promise<ExternalApi | undefined> {
    const [updated] = await db
      .update(externalApis)
      .set({ ...api, updatedAt: new Date() })
      .where(eq(externalApis.id, id))
      .returning();
    return updated;
  }

  async deleteExternalApi(id: number): Promise<boolean> {
    const result = await db.delete(externalApis).where(eq(externalApis.id, id));
    return result.rowCount > 0;
  }

  async updateApiStats(id: number, success: boolean): Promise<void> {
    const api = await db.select().from(externalApis).where(eq(externalApis.id, id));
    if (!api[0]) return;

    if (success) {
      await db.update(externalApis)
        .set({ 
          successCount: (api[0].successCount || 0) + 1,
          lastUsedAt: new Date()
        })
        .where(eq(externalApis.id, id));
    } else {
      await db.update(externalApis)
        .set({ errorCount: (api[0].errorCount || 0) + 1 })
        .where(eq(externalApis.id, id));
    }
  }

  // Scraping Session methods
  async createScrapingSession(configId: number): Promise<ScrapingSession> {
    const [session] = await db.insert(scrapingSessions)
      .values({ configId })
      .returning();
    return session;
  }

  async updateScrapingSession(sessionId: number, data: Partial<ScrapingSession>): Promise<void> {
    await db.update(scrapingSessions)
      .set(data)
      .where(eq(scrapingSessions.id, sessionId));
  }

  async getRecentScrapingSessions(limit: number = 10): Promise<ScrapingSession[]> {
    return await db.select().from(scrapingSessions)
      .orderBy(desc(scrapingSessions.startedAt))
      .limit(limit);
  }

  // Practice Recommendations methods (from base interface)
  async getRecommendationsByPractice(practiceId: number): Promise<PracticeRecommendation[]> {
    return await db.select().from(practiceRecommendations)
      .where(eq(practiceRecommendations.practiceId, practiceId));
  }

  async getRecommendationsByCriterion(criterionName: string): Promise<PracticeRecommendation[]> {
    return await db.select().from(practiceRecommendations)
      .where(eq(practiceRecommendations.criterionName, criterionName));
  }

  async createPracticeRecommendation(recommendation: InsertPracticeRecommendation): Promise<PracticeRecommendation> {
    const [created] = await db.insert(practiceRecommendations)
      .values(recommendation).returning();
    return created;
  }
}

// No export here to avoid conflicts - use the main storage.ts export