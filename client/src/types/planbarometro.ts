export interface Element {
  id: string;
  text: string;
}

export interface Criterion {
  id: string;
  name: string;
  description?: string;
  elements: Element[];
}

export interface Dimension {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  criteria: Criterion[];
}

export interface Model {
  id: string;
  name: string;
  description: string;
  dimensions: Dimension[];
}

export interface EvaluationResponse {
  [elementId: string]: 0 | 1; // 0 = Absent, 1 = Present
}

export interface EvaluationJustifications {
  [elementId: string]: string; // Justification text for each element
}

export interface CriterionScore {
  criterionId: string;
  score: number;
  percentage: number;
}

export interface DimensionScore {
  dimensionId: string;
  score: number;
  percentage: number;
  criteria: CriterionScore[];
}

export interface EvaluationScores {
  overall: number;
  dimensions: DimensionScore[];
}

export interface StrategicAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  criteria: string[];
  recommendation?: string;
  metrics?: {
    riskLevel: number; // 0-100, where 100 is highest risk
    impactLevel: number; // 0-100, impact on planning effectiveness
    urgencyLevel: number; // 0-100, how urgent is attention needed
  };
}

export interface EvaluationData {
  id?: number;
  title: string;
  model: string;
  responses: EvaluationResponse;
  justifications?: EvaluationJustifications;
  scores?: EvaluationScores;
  createdAt?: Date;
  updatedAt?: Date;
}
