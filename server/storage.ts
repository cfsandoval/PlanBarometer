import { users, evaluations, bestPractices, practiceRecommendations, type User, type InsertUser, type Evaluation, type InsertEvaluation, type BestPractice, type InsertBestPractice, type PracticeRecommendation, type InsertPracticeRecommendation } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getEvaluation(id: number): Promise<Evaluation | undefined>;
  getAllEvaluations(): Promise<Evaluation[]>;
  createEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  updateEvaluation(id: number, evaluation: Partial<InsertEvaluation>): Promise<Evaluation | undefined>;
  deleteEvaluation(id: number): Promise<boolean>;
  
  // Best Practices methods
  getAllBestPractices(): Promise<BestPractice[]>;
  getBestPracticesByCriteria(criteria: string[]): Promise<BestPractice[]>;
  createBestPractice(practice: InsertBestPractice): Promise<BestPractice>;
  updateBestPractice(id: number, practice: Partial<InsertBestPractice>): Promise<BestPractice | undefined>;
  deleteBestPractice(id: number): Promise<boolean>;
  
  // Practice Recommendations methods
  getRecommendationsByPractice(practiceId: number): Promise<PracticeRecommendation[]>;
  getRecommendationsByCriterion(criterionName: string): Promise<PracticeRecommendation[]>;
  createPracticeRecommendation(recommendation: InsertPracticeRecommendation): Promise<PracticeRecommendation>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private evaluations: Map<number, Evaluation>;
  private bestPractices: Map<number, BestPractice>;
  private practiceRecommendations: Map<number, PracticeRecommendation>;
  private currentUserId: number;
  private currentEvaluationId: number;
  private currentBestPracticeId: number;
  private currentRecommendationId: number;

  constructor() {
    this.users = new Map();
    this.evaluations = new Map();
    this.bestPractices = new Map();
    this.practiceRecommendations = new Map();
    this.currentUserId = 1;
    this.currentEvaluationId = 1;
    this.currentBestPracticeId = 1;
    this.currentRecommendationId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getEvaluation(id: number): Promise<Evaluation | undefined> {
    return this.evaluations.get(id);
  }

  async getAllEvaluations(): Promise<Evaluation[]> {
    return Array.from(this.evaluations.values()).sort((a, b) => 
      new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
    );
  }

  async createEvaluation(insertEvaluation: InsertEvaluation): Promise<Evaluation> {
    const id = this.currentEvaluationId++;
    const now = new Date();
    const evaluation: Evaluation = { 
      ...insertEvaluation, 
      justifications: insertEvaluation.justifications || {},
      customAlerts: insertEvaluation.customAlerts || [],
      scores: insertEvaluation.scores || null,
      customStructure: insertEvaluation.customStructure || null,
      exerciseCode: insertEvaluation.exerciseCode || null,
      groupCode: insertEvaluation.groupCode || null,
      country: insertEvaluation.country || null,
      territory: insertEvaluation.territory || null,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.evaluations.set(id, evaluation);
    return evaluation;
  }

  async updateEvaluation(id: number, updateData: Partial<InsertEvaluation>): Promise<Evaluation | undefined> {
    const existing = this.evaluations.get(id);
    if (!existing) return undefined;
    
    const updated: Evaluation = {
      ...existing,
      ...updateData,
      exerciseCode: updateData.exerciseCode || existing.exerciseCode,
      groupCode: updateData.groupCode || existing.groupCode,
      country: updateData.country || existing.country,
      territory: updateData.territory || existing.territory,
      updatedAt: new Date()
    };
    this.evaluations.set(id, updated);
    return updated;
  }

  async deleteEvaluation(id: number): Promise<boolean> {
    return this.evaluations.delete(id);
  }

  // Best Practices methods implementation
  async getAllBestPractices(): Promise<BestPractice[]> {
    return Array.from(this.bestPractices.values()).filter(practice => practice.isActive);
  }

  async getBestPracticesByCriteria(criteria: string[]): Promise<BestPractice[]> {
    const allPractices = await this.getAllBestPractices();
    console.log(`Searching for criteria: ${JSON.stringify(criteria)}`);
    console.log(`Total practices available: ${allPractices.length}`);
    
    const matchedPractices = allPractices.filter(practice => {
      // More flexible matching approach
      return criteria.some(criterion => {
        const lowerCriterion = criterion.toLowerCase().trim();
        
        // Check target criteria with flexible matching
        const targetMatch = practice.targetCriteria.some(target => {
          const lowerTarget = target.toLowerCase().trim();
          return lowerTarget.includes(lowerCriterion) || 
                 lowerCriterion.includes(lowerTarget) ||
                 // Check for similar terms
                 this.areRelatedTerms(lowerCriterion, lowerTarget);
        });
        
        // Check title and description for broader context
        const titleMatch = practice.title.toLowerCase().includes(lowerCriterion);
        const descMatch = practice.description.toLowerCase().includes(lowerCriterion);
        
        // Check tags if available
        const tagMatch = practice.tags ? practice.tags.some(tag => 
          tag.toLowerCase().includes(lowerCriterion) || 
          lowerCriterion.includes(tag.toLowerCase())
        ) : false;
        
        const isMatch = targetMatch || titleMatch || descMatch || tagMatch;
        if (isMatch) {
          console.log(`Practice "${practice.title}" matches criterion "${criterion}"`);
        }
        
        return isMatch;
      });
    });
    
    console.log(`Found ${matchedPractices.length} matching practices`);
    return matchedPractices;
  }

  private areRelatedTerms(term1: string, term2: string): boolean {
    const relatedTermsMap: Record<string, string[]> = {
      'coordinación': ['coordinacion', 'coordination', 'intersectorial', 'institutional'],
      'coordinacion': ['coordinación', 'coordination', 'intersectorial', 'institutional'],
      'coordination': ['coordinación', 'coordinacion', 'intersectorial', 'institutional'],
      'planificación': ['planificacion', 'planning', 'plan', 'estratégica', 'estrategica'],
      'planificacion': ['planificación', 'planning', 'plan', 'estratégica', 'estrategica'],
      'planning': ['planificación', 'planificacion', 'plan', 'estratégica', 'estrategica'],
      'gestión': ['gestion', 'management', 'administración', 'administracion'],
      'gestion': ['gestión', 'management', 'administración', 'administracion'],
      'management': ['gestión', 'gestion', 'administración', 'administracion'],
      'monitoreo': ['monitoring', 'seguimiento', 'evaluación', 'evaluacion'],
      'monitoring': ['monitoreo', 'seguimiento', 'evaluación', 'evaluacion'],
      'participación': ['participacion', 'participation', 'ciudadana', 'ciudadano'],
      'participacion': ['participación', 'participation', 'ciudadana', 'ciudadano'],
      'participation': ['participación', 'participacion', 'ciudadana', 'ciudadano'],
      'innovación': ['innovacion', 'innovation', 'modernización', 'modernizacion'],
      'innovacion': ['innovación', 'innovation', 'modernización', 'modernizacion'],
      'innovation': ['innovación', 'innovacion', 'modernización', 'modernizacion'],
      'transparencia': ['transparency', 'accountabilidad', 'accountability'],
      'transparency': ['transparencia', 'accountabilidad', 'accountability'],
      'eficiencia': ['efficiency', 'efectividad', 'effectiveness'],
      'efficiency': ['eficiencia', 'efectividad', 'effectiveness']
    };

    const related1 = relatedTermsMap[term1] || [];
    const related2 = relatedTermsMap[term2] || [];
    
    return related1.includes(term2) || related2.includes(term1);
  }

  async createBestPractice(insertPractice: InsertBestPractice): Promise<BestPractice> {
    const id = this.currentBestPracticeId++;
    const now = new Date();
    const practice: BestPractice = {
      id,
      title: insertPractice.title,
      description: insertPractice.description,
      country: insertPractice.country,
      institution: insertPractice.institution || null,
      year: insertPractice.year || null,
      sourceUrl: insertPractice.sourceUrl || null,
      sourceType: insertPractice.sourceType,
      targetCriteria: insertPractice.targetCriteria as string[],
      results: insertPractice.results || null,
      keyLessons: insertPractice.keyLessons as string[] || null,
      tags: insertPractice.tags as string[] || null,
      isActive: true,
      createdAt: now,
      updatedAt: now
    };
    this.bestPractices.set(id, practice);
    return practice;
  }

  async updateBestPractice(id: number, updateData: Partial<InsertBestPractice>): Promise<BestPractice | undefined> {
    const existing = this.bestPractices.get(id);
    if (!existing) return undefined;
    
    const updated: BestPractice = {
      ...existing,
      title: updateData.title || existing.title,
      description: updateData.description || existing.description,
      country: updateData.country || existing.country,
      institution: updateData.institution !== undefined ? updateData.institution : existing.institution,
      year: updateData.year !== undefined ? updateData.year : existing.year,
      sourceUrl: updateData.sourceUrl !== undefined ? updateData.sourceUrl : existing.sourceUrl,
      sourceType: updateData.sourceType || existing.sourceType,
      targetCriteria: updateData.targetCriteria as string[] || existing.targetCriteria,
      results: updateData.results !== undefined ? updateData.results : existing.results,
      keyLessons: updateData.keyLessons as string[] || existing.keyLessons,
      tags: updateData.tags as string[] || existing.tags,
      updatedAt: new Date()
    };
    this.bestPractices.set(id, updated);
    return updated;
  }

  async deleteBestPractice(id: number): Promise<boolean> {
    const existing = this.bestPractices.get(id);
    if (!existing) return false;
    
    const updated = { ...existing, isActive: false, updatedAt: new Date() };
    this.bestPractices.set(id, updated);
    return true;
  }

  // Practice Recommendations methods implementation
  async getRecommendationsByPractice(practiceId: number): Promise<PracticeRecommendation[]> {
    return Array.from(this.practiceRecommendations.values())
      .filter(rec => rec.practiceId === practiceId);
  }

  async getRecommendationsByCriterion(criterionName: string): Promise<PracticeRecommendation[]> {
    return Array.from(this.practiceRecommendations.values())
      .filter(rec => rec.criterionName.toLowerCase().includes(criterionName.toLowerCase()));
  }

  async createPracticeRecommendation(insertRecommendation: InsertPracticeRecommendation): Promise<PracticeRecommendation> {
    const id = this.currentRecommendationId++;
    const now = new Date();
    const recommendation: PracticeRecommendation = {
      id,
      practiceId: insertRecommendation.practiceId || null,
      criterionName: insertRecommendation.criterionName,
      recommendation: insertRecommendation.recommendation,
      implementationSteps: insertRecommendation.implementationSteps as string[] || null,
      expectedImpact: insertRecommendation.expectedImpact || null,
      timeframe: insertRecommendation.timeframe || null,
      createdAt: now
    };
    this.practiceRecommendations.set(id, recommendation);
    return recommendation;
  }
}

export const storage = new MemStorage();
