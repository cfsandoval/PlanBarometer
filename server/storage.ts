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
    
    if (allPractices.length > 0) {
      console.log('Sample practice target criteria:', allPractices[0].targetCriteria);
    }
    
    const matchedPractices = allPractices.filter(practice => {
      // Very aggressive matching - if ANY criterion word appears ANYWHERE, include it
      const match = criteria.some(criterion => {
        const lowerCriterion = criterion.toLowerCase().trim();
        console.log(`\nChecking criterion: "${criterion}"`);
        console.log(`Practice: "${practice.title}"`);
        console.log(`Target criteria: ${JSON.stringify(practice.targetCriteria)}`);
        
        // Split both the search criterion and each target criterion into words
        const searchWords = lowerCriterion.split(/[\s\-]+/).filter(word => word.length > 2);
        console.log(`Search words: ${JSON.stringify(searchWords)}`);
        
        // Check each search word against all content
        const hasMatch = searchWords.some(searchWord => {
          // 1. Check if the search word appears in target criteria
          const targetMatch = practice.targetCriteria.some(target => {
            const targetWords = target.toLowerCase().split(/[\s\-]+/);
            const directMatch = targetWords.some(targetWord => 
              targetWord.includes(searchWord) || 
              searchWord.includes(targetWord) ||
              this.areRelatedTerms(searchWord, targetWord)
            );
            if (directMatch) console.log(`  Target match: "${searchWord}" in "${target}"`);
            return directMatch;
          });
          
          // 2. Check title
          const titleMatch = practice.title.toLowerCase().includes(searchWord);
          if (titleMatch) console.log(`  Title match: "${searchWord}" in title`);
          
          // 3. Check description
          const descMatch = practice.description.toLowerCase().includes(searchWord);
          if (descMatch) console.log(`  Description match: "${searchWord}" in description`);
          
          // 4. Check tags
          const tagMatch = practice.tags?.some(tag => 
            tag.toLowerCase().includes(searchWord)
          ) || false;
          if (tagMatch) console.log(`  Tag match: "${searchWord}" in tags`);
          
          // 5. Check for semantic matches
          const semanticMatch = this.hasSemanticMatch(searchWord, practice);
          if (semanticMatch) console.log(`  Semantic match: "${searchWord}"`);
          
          return targetMatch || titleMatch || descMatch || tagMatch || semanticMatch;
        });
        
        console.log(`  Result: ${hasMatch ? 'MATCH' : 'NO MATCH'}`);
        return hasMatch;
      });
      
      return match;
    });
    
    console.log(`Found ${matchedPractices.length} matching practices`);
    return matchedPractices;
  }

  private hasSemanticMatch(searchWord: string, practice: BestPractice): boolean {
    // Broad semantic matching for common planning concepts
    const semanticMappings: Record<string, string[]> = {
      'evidence': ['análisis', 'datos', 'información', 'estudio', 'investigación', 'evaluación'],
      'diagnosis': ['diagnóstico', 'análisis', 'evaluación', 'estudio', 'investigación'],
      'capacity': ['capacidad', 'fortalecimiento', 'desarrollo', 'competencia', 'habilidad'],
      'budget': ['presupuesto', 'financiero', 'recursos', 'económico', 'fiscal'],
      'budgetary': ['presupuestario', 'presupuestaria', 'financiero', 'recursos'],
      'financial': ['financiero', 'presupuesto', 'recursos', 'económico'],
      'vision': ['visión', 'estrategia', 'objetivo', 'meta', 'propósito', 'planificación'],
      'visión': ['vision', 'estrategia', 'objetivo', 'meta', 'propósito', 'planificación'],
      'shared': ['compartida', 'común', 'colectiva', 'conjunta', 'participativa'],
      'compartida': ['shared', 'común', 'colectiva', 'conjunta', 'participativa'],
      'construction': ['construcción', 'desarrollo', 'creación', 'formación', 'planificación'],
      'construcción': ['construction', 'desarrollo', 'creación', 'formación', 'planificación'],
      'participation': ['participación', 'ciudadana', 'actores', 'involucrados'],
      'stakeholders': ['actores', 'partes', 'interesados', 'ciudadanos'],
      'actors': ['actores', 'partes', 'interesados', 'participantes'],
      'key': ['clave', 'importante', 'principal', 'fundamental'],
      'planning': ['planificación', 'plan', 'estrategia', 'programación'],
      'management': ['gestión', 'administración', 'dirección', 'organización'],
      'public': ['público', 'gubernamental', 'estatal', 'gobierno'],
      'government': ['gobierno', 'gubernamental', 'público', 'estatal'],
      'institutional': ['institucional', 'organización', 'coordinación'],
      'coordination': ['coordinación', 'articulación', 'intersectorial'],
      'innovation': ['innovación', 'modernización', 'mejora', 'reforma'],
      'evaluation': ['evaluación', 'monitoreo', 'seguimiento', 'análisis'],
      'monitoring': ['monitoreo', 'seguimiento', 'evaluación', 'control']
    };

    const relatedTerms = semanticMappings[searchWord] || [];
    const allPracticeText = `${practice.title} ${practice.description} ${practice.targetCriteria.join(' ')} ${practice.tags?.join(' ') || ''}`.toLowerCase();
    
    return relatedTerms.some(term => allPracticeText.includes(term));
  }

  private areRelatedTerms(term1: string, term2: string): boolean {
    // Comprehensive mapping of related planning terms
    const relatedTermsMap: Record<string, string[]> = {
      // Core planning terms
      'planificación': ['planificacion', 'planning', 'plan', 'estratégica', 'estrategica', 'estratégico', 'estrategico', 'programación', 'programacion'],
      'planificacion': ['planificación', 'planning', 'plan', 'estratégica', 'estrategica', 'estratégico', 'estrategico', 'programación', 'programacion'],
      'planning': ['planificación', 'planificacion', 'plan', 'estratégica', 'estrategica', 'estratégico', 'estrategico', 'programación', 'programacion'],
      
      // Management and administration
      'gestión': ['gestion', 'management', 'administración', 'administracion', 'dirección', 'direccion', 'organización', 'organizacion'],
      'gestion': ['gestión', 'management', 'administración', 'administracion', 'dirección', 'direccion', 'organización', 'organizacion'],
      'management': ['gestión', 'gestion', 'administración', 'administracion', 'dirección', 'direccion', 'organización', 'organizacion'],
      'administración': ['administracion', 'gestión', 'gestion', 'management', 'pública', 'publica', 'gubernamental'],
      'administracion': ['administración', 'gestión', 'gestion', 'management', 'pública', 'publica', 'gubernamental'],
      
      // Coordination and institutional
      'coordinación': ['coordinacion', 'coordination', 'intersectorial', 'institutional', 'articulación', 'articulacion', 'interinstitucional'],
      'coordinacion': ['coordinación', 'coordination', 'intersectorial', 'institutional', 'articulación', 'articulacion', 'interinstitucional'],
      'coordination': ['coordinación', 'coordinacion', 'intersectorial', 'institutional', 'articulación', 'articulacion', 'interinstitucional'],
      'institucional': ['institutional', 'interinstitucional', 'coordinación', 'coordinacion', 'organización', 'organizacion'],
      'institutional': ['institucional', 'interinstitucional', 'coordinación', 'coordinacion', 'organización', 'organizacion'],
      
      // Monitoring and evaluation
      'monitoreo': ['monitoring', 'seguimiento', 'evaluación', 'evaluacion', 'control', 'supervisión', 'supervision'],
      'monitoring': ['monitoreo', 'seguimiento', 'evaluación', 'evaluacion', 'control', 'supervisión', 'supervision'],
      'evaluación': ['evaluacion', 'evaluation', 'monitoreo', 'monitoring', 'seguimiento', 'análisis', 'analisis'],
      'evaluacion': ['evaluación', 'evaluation', 'monitoreo', 'monitoring', 'seguimiento', 'análisis', 'analisis'],
      'evaluation': ['evaluación', 'evaluacion', 'monitoreo', 'monitoring', 'seguimiento', 'análisis', 'analisis'],
      'seguimiento': ['monitoring', 'monitoreo', 'evaluación', 'evaluacion', 'control', 'supervisión', 'supervision'],
      
      // Participation and stakeholders
      'participación': ['participacion', 'participation', 'ciudadana', 'ciudadano', 'actores', 'stakeholders', 'involucrar', 'consulta'],
      'participacion': ['participación', 'participation', 'ciudadana', 'ciudadano', 'actores', 'stakeholders', 'involucrar', 'consulta'],
      'participation': ['participación', 'participacion', 'ciudadana', 'ciudadano', 'actores', 'stakeholders', 'involucrar', 'consulta'],
      'actores': ['stakeholders', 'participación', 'participacion', 'ciudadanos', 'involucrados', 'partes', 'interesados'],
      'stakeholders': ['actores', 'participación', 'participacion', 'ciudadanos', 'involucrados', 'partes', 'interesados'],
      'ciudadana': ['ciudadano', 'participación', 'participacion', 'participation', 'civil', 'comunitaria', 'comunitario'],
      'ciudadano': ['ciudadana', 'participación', 'participacion', 'participation', 'civil', 'comunitaria', 'comunitario'],
      
      // Innovation and modernization
      'innovación': ['innovacion', 'innovation', 'modernización', 'modernizacion', 'mejora', 'reforma', 'transformación', 'transformacion'],
      'innovacion': ['innovación', 'innovation', 'modernización', 'modernizacion', 'mejora', 'reforma', 'transformación', 'transformacion'],
      'innovation': ['innovación', 'innovacion', 'modernización', 'modernizacion', 'mejora', 'reforma', 'transformación', 'transformacion'],
      'modernización': ['modernizacion', 'modernization', 'innovación', 'innovacion', 'reforma', 'mejora', 'transformación', 'transformacion'],
      'modernizacion': ['modernización', 'modernization', 'innovación', 'innovacion', 'reforma', 'mejora', 'transformación', 'transformacion'],
      
      // Transparency and accountability
      'transparencia': ['transparency', 'accountabilidad', 'accountability', 'rendición', 'cuentas', 'acceso', 'información', 'informacion'],
      'transparency': ['transparencia', 'accountabilidad', 'accountability', 'rendición', 'cuentas', 'acceso', 'información', 'informacion'],
      'accountability': ['transparencia', 'transparency', 'rendición', 'cuentas', 'responsabilidad', 'accountabilidad'],
      
      // Efficiency and effectiveness
      'eficiencia': ['efficiency', 'efectividad', 'effectiveness', 'productividad', 'rendimiento', 'optimización', 'optimizacion'],
      'efficiency': ['eficiencia', 'efectividad', 'effectiveness', 'productividad', 'rendimiento', 'optimización', 'optimizacion'],
      'efectividad': ['effectiveness', 'eficiencia', 'efficiency', 'resultados', 'impacto', 'logro'],
      'effectiveness': ['efectividad', 'eficiencia', 'efficiency', 'resultados', 'impacto', 'logro'],
      
      // Capacity and capabilities
      'capacidad': ['capacity', 'capability', 'competencia', 'habilidad', 'fortalecimiento', 'desarrollo'],
      'capacity': ['capacidad', 'capability', 'competencia', 'habilidad', 'fortalecimiento', 'desarrollo'],
      'capability': ['capacidad', 'capacity', 'competencia', 'habilidad', 'fortalecimiento', 'desarrollo'],
      'fortalecimiento': ['strengthening', 'capacity', 'capacidad', 'desarrollo', 'mejora', 'consolidación', 'consolidacion'],
      
      // Budgeting and resources
      'presupuestaria': ['presupuestario', 'budget', 'budgetary', 'presupuesto', 'financiera', 'financiero', 'recursos'],
      'presupuestario': ['presupuestaria', 'budget', 'budgetary', 'presupuesto', 'financiera', 'financiero', 'recursos'],
      'presupuesto': ['budget', 'presupuestaria', 'presupuestario', 'financiera', 'financiero', 'recursos', 'fiscal'],
      'budget': ['presupuesto', 'presupuestaria', 'presupuestario', 'financiera', 'financiero', 'recursos', 'fiscal'],
      'financiera': ['financiero', 'financial', 'presupuestaria', 'presupuestario', 'recursos', 'económica', 'economica'],
      'financiero': ['financiera', 'financial', 'presupuestaria', 'presupuestario', 'recursos', 'económica', 'economica'],
      
      // Diagnosis and analysis
      'diagnóstico': ['diagnostico', 'diagnosis', 'análisis', 'analisis', 'evaluation', 'evaluación', 'evaluacion', 'estudio'],
      'diagnostico': ['diagnóstico', 'diagnosis', 'análisis', 'analisis', 'evaluation', 'evaluación', 'evaluacion', 'estudio'],
      'diagnosis': ['diagnóstico', 'diagnostico', 'análisis', 'analisis', 'evaluation', 'evaluación', 'evaluacion', 'estudio'],
      'análisis': ['analisis', 'analysis', 'diagnóstico', 'diagnostico', 'estudio', 'evaluación', 'evaluacion'],
      'analisis': ['análisis', 'analysis', 'diagnóstico', 'diagnostico', 'estudio', 'evaluación', 'evaluacion'],
      'analysis': ['análisis', 'analisis', 'diagnóstico', 'diagnostico', 'estudio', 'evaluación', 'evaluacion'],
      'evidence-based': ['basado', 'evidencia', 'evidence', 'análisis', 'analisis', 'datos', 'información', 'informacion'],
      
      // Vision and strategy
      'visión': ['vision', 'estrategia', 'strategy', 'objetivo', 'meta', 'propósito', 'proposito'],
      'vision': ['visión', 'estrategia', 'strategy', 'objetivo', 'meta', 'propósito', 'proposito'],
      'estrategia': ['strategy', 'visión', 'vision', 'planificación', 'planificacion', 'plan'],
      'strategy': ['estrategia', 'visión', 'vision', 'planificación', 'planificacion', 'plan'],
      'compartida': ['shared', 'común', 'comun', 'colectiva', 'conjunta', 'participativa', 'participativo'],
      'shared': ['compartida', 'común', 'comun', 'colectiva', 'conjunta', 'participativa', 'participativo'],
      
      // Government and public
      'gobierno': ['government', 'gubernamental', 'público', 'publico', 'estatal', 'administración', 'administracion'],
      'government': ['gobierno', 'gubernamental', 'público', 'publico', 'estatal', 'administración', 'administracion'],
      'público': ['publico', 'public', 'gobierno', 'government', 'estatal', 'gubernamental'],
      'publico': ['público', 'public', 'gobierno', 'government', 'estatal', 'gubernamental'],
      'public': ['público', 'publico', 'gobierno', 'government', 'estatal', 'gubernamental'],
      
      // Municipal and local
      'municipal': ['municipality', 'local', 'ciudad', 'municipio', 'ayuntamiento', 'alcaldía', 'alcaldia'],
      'municipality': ['municipal', 'local', 'ciudad', 'municipio', 'ayuntamiento', 'alcaldía', 'alcaldia'],
      'local': ['municipal', 'municipality', 'territorial', 'regional', 'descentralizado', 'descentralizada']
    };

    // Check if terms are directly related
    const related1 = relatedTermsMap[term1] || [];
    const related2 = relatedTermsMap[term2] || [];
    
    if (related1.includes(term2) || related2.includes(term1)) {
      return true;
    }
    
    // Check for partial word matches (minimum 4 characters)
    if (term1.length >= 4 && term2.length >= 4) {
      if (term1.includes(term2) || term2.includes(term1)) {
        return true;
      }
    }
    
    // Check for common root words
    const commonRoots = ['plan', 'gest', 'admin', 'coord', 'particip', 'innov', 'modern', 'efic', 'evalua'];
    for (const root of commonRoots) {
      if (term1.includes(root) && term2.includes(root)) {
        return true;
      }
    }
    
    return false;
  }

  private checkFullCriterionMatch(criterion: string, practice: BestPractice): boolean {
    // Check target criteria with flexible matching
    const targetMatch = practice.targetCriteria.some(target => {
      const lowerTarget = target.toLowerCase().trim();
      return lowerTarget.includes(criterion) || 
             criterion.includes(lowerTarget) ||
             this.areRelatedTerms(criterion, lowerTarget);
    });
    
    // Check title and description for broader context
    const titleMatch = practice.title.toLowerCase().includes(criterion);
    const descMatch = practice.description.toLowerCase().includes(criterion);
    
    // Check tags if available
    const tagMatch = practice.tags ? practice.tags.some(tag => 
      tag.toLowerCase().includes(criterion) || 
      criterion.includes(tag.toLowerCase()) ||
      this.areRelatedTerms(criterion, tag.toLowerCase())
    ) : false;
    
    return targetMatch || titleMatch || descMatch || tagMatch;
  }

  private hasRelatedTermInText(word: string, text: string): boolean {
    // Check if the word or its related terms appear in the text
    const relatedTermsMap: Record<string, string[]> = {
      'evidence': ['evidencia', 'datos', 'información', 'análisis', 'estudio'],
      'evidencia': ['evidence', 'datos', 'información', 'análisis', 'estudio'],
      'based': ['basado', 'fundamentado', 'sustentado'],
      'basado': ['based', 'fundamentado', 'sustentado'],
      'diagnosis': ['diagnóstico', 'análisis', 'evaluación', 'estudio'],
      'diagnostic': ['diagnóstico', 'análisis', 'evaluación'],
      'diagnostico': ['diagnosis', 'análisis', 'evaluación', 'estudio'],
      'capacity': ['capacidad', 'competencia', 'habilidad', 'fortalecimiento'],
      'capacidad': ['capacity', 'competencia', 'habilidad', 'fortalecimiento'],
      'budget': ['presupuesto', 'financiero', 'recursos', 'fiscal'],
      'budgetary': ['presupuestario', 'presupuestaria', 'fiscal'],
      'presupuestaria': ['budget', 'budgetary', 'financiero', 'recursos'],
      'presupuestario': ['budget', 'budgetary', 'financiero', 'recursos'],
      'vision': ['visión', 'estrategia', 'objetivo', 'meta'],
      'visión': ['vision', 'estrategia', 'objetivo', 'meta'],
      'shared': ['compartida', 'común', 'colectiva', 'conjunta'],
      'compartida': ['shared', 'común', 'colectiva', 'conjunta'],
      'construction': ['construcción', 'desarrollo', 'creación'],
      'construcción': ['construction', 'desarrollo', 'creación'],
      'stakeholders': ['actores', 'partes', 'interesados'],
      'actores': ['stakeholders', 'partes', 'interesados'],
      'key': ['clave', 'importantes', 'principales'],
      'clave': ['key', 'importantes', 'principales']
    };

    const relatedTerms = relatedTermsMap[word] || [];
    
    // Check if the word itself or any related term appears in the text
    if (text.includes(word)) {
      return true;
    }
    
    return relatedTerms.some(term => text.includes(term));
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
