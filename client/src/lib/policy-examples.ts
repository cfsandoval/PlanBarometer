import { apiRequest } from './queryClient';

export interface PolicyExample {
  country: string;
  policy: string;
  description: string;
  results: string;
  year: string;
  source?: string;
}

export interface DimensionPolicyExamples {
  dimensionId: string;
  dimensionName: string;
  percentage: number;
  examples: PolicyExample[];
  loading: boolean;
  error?: string;
}

// Cache for policy examples to avoid repeated API calls
const policyExamplesCache = new Map<string, PolicyExample[]>();

export async function fetchPolicyExamples(
  dimensionId: string, 
  dimensionName: string, 
  criteria: any[]
): Promise<PolicyExample[]> {
  const cacheKey = `${dimensionId}-${dimensionName}`;
  
  // Check cache first
  if (policyExamplesCache.has(cacheKey)) {
    return policyExamplesCache.get(cacheKey)!;
  }

  try {
    // Prepare the criteria and elements information for context
    const criteriaContext = criteria.map(criterion => ({
      name: criterion.name,
      elements: criterion.elements.map((el: any) => el.name)
    }));

    const response = await apiRequest('POST', '/api/policy-examples', {
      dimensionId,
      dimensionName,
      criteria: criteriaContext
    });

    const examples = (response as any).examples || [];
    
    // Cache the results
    policyExamplesCache.set(cacheKey, examples);
    
    return examples;
  } catch (error) {
    console.error('Error fetching policy examples:', error);
    throw new Error('No se pudieron obtener ejemplos de políticas públicas');
  }
}

export function clearPolicyCache() {
  policyExamplesCache.clear();
}

// Predefined fallback examples for each dimension (in case API fails)
export const fallbackExamples = {
  technical: [
    {
      country: "Chile",
      policy: "Sistema Nacional de Información Municipal (SINIM)",
      description: "Plataforma integrada para la gestión municipal con indicadores estandarizados",
      results: "Mejoró la transparencia y eficiencia en 345 municipios",
      year: "2015",
      source: "SUBDERE Chile"
    },
    {
      country: "Colombia",
      policy: "SINERGIA - Sistema Nacional de Evaluación de Resultados",
      description: "Sistema de monitoreo y evaluación de políticas públicas",
      results: "Evaluó más de 400 programas gubernamentales con metodología estandarizada",
      year: "2018",
      source: "DNP Colombia"
    }
  ],
  operational: [
    {
      country: "Brasil",
      policy: "Programa de Modernización de la Gestión Pública",
      description: "Reforma administrativa para mejorar procesos y coordinación institucional",
      results: "Redujo 30% el tiempo de trámites y mejoró satisfacción ciudadana",
      year: "2019",
      source: "Ministerio de Economía Brasil"
    },
    {
      country: "México",
      policy: "Modelo Integral de Evaluación del Desempeño (MIDE)",
      description: "Sistema integrado de gestión por resultados en el sector público",
      results: "Implementado en 32 estados con mejoras en eficiencia operativa",
      year: "2017",
      source: "CONEVAL México"
    }
  ],
  political: [
    {
      country: "Uruguay",
      policy: "Espacios de Diálogo Social Tripartito",
      description: "Mecanismos institucionalizados de negociación entre gobierno, empresarios y trabajadores",
      results: "Logró consensos en 85% de las negociaciones laborales y sociales",
      year: "2016",
      source: "Ministerio de Trabajo Uruguay"
    },
    {
      country: "Costa Rica",
      policy: "Consejos Territoriales de Desarrollo Rural",
      description: "Instancias participativas para la planificación del desarrollo local",
      results: "Involucró 25,000 personas en procesos de planificación territorial",
      year: "2020",
      source: "INDER Costa Rica"
    }
  ],
  prospective: [
    {
      country: "Argentina",
      policy: "Sistema de Alerta Temprana para Emergencias",
      description: "Red nacional de monitoreo y anticipación de crisis climáticas y sociales",
      results: "Redujo 40% el impacto de desastres naturales con alertas preventivas",
      year: "2021",
      source: "SINAGIR Argentina"
    },
    {
      country: "Perú",
      policy: "Centro Nacional de Planeamiento Estratégico (CEPLAN)",
      description: "Sistema nacional de prospectiva y planificación estratégica",
      results: "Desarrolló escenarios futuros para 25 sectores prioritarios",
      year: "2018",
      source: "CEPLAN Perú"
    }
  ]
};