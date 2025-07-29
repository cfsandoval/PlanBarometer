export type Language = 'en' | 'es';

export interface Translations {
  // Navigation and general
  appTitle: string;
  home: string;
  evaluation: string;
  results: string;
  strategicAlerts: string;
  
  // Evaluation form
  selectModel: string;
  exerciseCode: string;
  groupCode: string;
  country: string;
  territory: string;
  exerciseCodePlaceholder: string;
  groupCodePlaceholder: string;
  countryPlaceholder: string;
  territoryPlaceholder: string;
  startEvaluation: string;
  continueEvaluation: string;
  newEvaluation: string;
  completeRandomly: string;
  present: string;
  absent: string;
  editStructure: string;
  customAlerts: string;
  
  // Models
  toppModel: string;
  toppDescription: string;
  nationalModel: string;
  nationalDescription: string;
  subnationalModel: string;
  subnationalDescription: string;
  
  // Dimensions
  technicalCapacity: string;
  operationalCapacity: string;
  politicalCapacity: string;
  prospectiveCapacity: string;
  
  // Results and charts
  evaluationResults: string;
  overallScore: string;
  dimensionScores: string;
  completion: string;
  exportPdf: string;
  charts: string;
  dimensionRadarCharts: string;
  dimensionRadarDescription: string;
  criteriaBreakdown: string;
  
  // Strategic alerts
  strategicAlertsTitle: string;
  strategicAlertsDescription: string;
  generalRiskStatus: string;
  lowRisk: string;
  mediumRisk: string;
  highRisk: string;
  riskLevel: string;
  impact: string;
  urgency: string;
  generalRisk: string;
  stability: string;
  alertIndicators: string;
  favorableSituation: string;
  favorableSituationText: string;
  criteriaInvolved: string;
  recommendation: string;
  
  // Alert types
  implementationWithoutDirection: string;
  implementationWithoutDirectionDesc: string;
  implementationWithoutDirectionRec: string;
  
  governmentWithoutGovernance: string;
  governmentWithoutGovernanceDesc: string;
  governmentWithoutGovernanceRec: string;
  
  generalImbalance: string;
  generalImbalanceDesc: string;
  generalImbalanceRec: string;
  
  insufficientCapabilities: string;
  insufficientCapabilitiesDesc: string;
  insufficientCapabilitiesRec: string;
  
  highAbsentElements: string;
  highAbsentElementsDesc: string;
  highAbsentElementsRec: string;
  
  mediumAbsentElements: string;
  mediumAbsentElementsDesc: string;
  mediumAbsentElementsRec: string;
  
  weakProspectiveCapabilities: string;
  weakProspectiveCapabilitiesDesc: string;
  weakProspectiveCapabilitiesRec: string;
  
  weakTechnicalCapabilities: string;
  weakTechnicalCapabilitiesDesc: string;
  weakTechnicalCapabilitiesRec: string;
  
  politicalInstabilityRisk: string;
  politicalInstabilityRiskDesc: string;
  politicalInstabilityRiskRec: string;
  
  operationalBottlenecks: string;
  operationalBottlenecksDesc: string;
  operationalBottlenecksRec: string;
  
  isolatedExcellence: string;
  isolatedExcellenceDesc: string;
  isolatedExcellenceRec: string;
  
  moderateBalancedCapabilities: string;
  moderateBalancedCapabilitiesDesc: string;
  moderateBalancedCapabilitiesRec: string;
  
  // Structure editor
  structureEditor: string;
  addCriterion: string;
  addElement: string;
  editCriterion: string;
  editElement: string;
  deleteCriterion: string;
  deleteElement: string;
  save: string;
  cancel: string;
  
  // Custom alerts editor
  customAlertsEditor: string;
  alertTitle: string;
  alertDescription: string;
  alertSeverity: string;
  alertCriteria: string;
  threshold: string;
  operator: string;
  addAlert: string;
  saveAlerts: string;
  
  // Language selector
  language: string;
  english: string;
  spanish: string;
  
  // Common actions
  close: string;
  edit: string;
  delete: string;
  confirm: string;
  loading: string;
  error: string;
  
  // Collaboration
  collaborativeWorkshop: string;
  connected: string;
  disconnected: string;
  workshopId: string;
  enterWorkshopId: string;
  yourName: string;
  enterYourName: string;
  joinWorkshop: string;
  leaveWorkshop: string;
  connecting: string;
  workshop: string;
  participants: string;
  activeParticipants: string;
  recentUpdates: string;
  viewing: string;
  noOtherParticipants: string;
  updated: string;
  joined: string;
  left: string;
  savedEvaluation: string;
  noRecentUpdates: string;
  workshopJoined: string;
  connectionError: string;
  websocketConnectionFailed: string;
  fillAllFields: string;
  success: string;
  
  // Interpretation section
  interpretation: string;
  excellentPerformance: string;
  goodPerformance: string;
  moderatePerformance: string;
  poorPerformance: string;
  strongCriteria: string;
  weakCriteria: string;
  improvementRecommendation: string;
  leverageStrengthsRecommendation: string;
  
  // Dimension-specific recommendations
  technicalLowRecommendation: string;
  technicalMediumRecommendation: string;
  technicalHighRecommendation: string;
  operationalLowRecommendation: string;
  operationalMediumRecommendation: string;
  operationalHighRecommendation: string;
  politicalLowRecommendation: string;
  politicalMediumRecommendation: string;
  politicalHighRecommendation: string;
  prospectiveLowRecommendation: string;
  prospectiveMediumRecommendation: string;
  prospectiveHighRecommendation: string;
  
  // Severity levels
  low: string;
  medium: string;
  high: string;
  
  // Operators
  lessThan: string;
  greaterThan: string;
  equals: string;
  
  // Messages
  evaluationNotComplete: string;
  evaluationCompleteMessage: string;
  noAlertsMessage: string;
  pdfExportSuccess: string;
  pdfExportError: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation and general
    appTitle: "Planbarometer - Government Planning Capacity Assessment",
    home: "Home",
    evaluation: "Evaluation",
    results: "Results",
    strategicAlerts: "Strategic Alerts",
    
    // Evaluation form
    selectModel: "Select Evaluation Model",
    exerciseCode: "Exercise Code",
    groupCode: "Group Code", 
    country: "Country",
    territory: "Territory",
    exerciseCodePlaceholder: "Optional exercise identifier",
    groupCodePlaceholder: "Optional group identifier",
    countryPlaceholder: "Country where evaluation is conducted",
    territoryPlaceholder: "Specific territory or region",
    startEvaluation: "Start Evaluation",
    continueEvaluation: "Continue Evaluation",
    newEvaluation: "New Evaluation",
    completeRandomly: "Complete Randomly",
    present: "Present",
    absent: "Absent",
    editStructure: "Edit Structure",
    customAlerts: "Custom Alerts",
    
    // Models
    toppModel: "TOPP Capabilities Model",
    toppDescription: "Evaluates Technical, Operational, Political, and Prospective capabilities of planning systems",
    nationalModel: "National Level Model",
    nationalDescription: "Assessment framework designed for national-level planning institutions",
    subnationalModel: "Subnational Level Model", 
    subnationalDescription: "Assessment framework for regional and local planning organizations",
    
    // Dimensions
    technicalCapacity: "Technical Capacity",
    operationalCapacity: "Operational Capacity",
    politicalCapacity: "Political Capacity",
    prospectiveCapacity: "Prospective Capacity",
    
    // Results and charts
    evaluationResults: "Evaluation Results",
    overallScore: "Overall Score",
    dimensionScores: "Dimension Scores",
    completion: "Completion",
    exportPdf: "Export PDF",
    charts: "Charts",
    dimensionRadarCharts: "Dimension Radar Charts",
    dimensionRadarDescription: "Individual performance analysis for each TOPP dimension showing criteria breakdown",
    criteriaBreakdown: "Criteria Breakdown",
    
    // Strategic alerts
    strategicAlertsTitle: "Strategic Alerts",
    strategicAlertsDescription: "Risk identification and problematic situations based on evaluation patterns",
    generalRiskStatus: "General Risk Status",
    lowRisk: "LOW",
    mediumRisk: "MEDIUM", 
    highRisk: "HIGH",
    riskLevel: "Risk Level",
    impact: "Impact",
    urgency: "Urgency",
    generalRisk: "General Risk",
    stability: "Stability",
    alertIndicators: "Alert Indicators",
    favorableSituation: "Favorable Situation",
    favorableSituationText: "The evaluation results indicate adequate balance between different capabilities. It is recommended to maintain current levels and continue with periodic monitoring to ensure this favorable situation is maintained.",
    criteriaInvolved: "Criteria involved",
    recommendation: "Recommendation",
    
    // Alert types
    implementationWithoutDirection: "Implementation without strategic direction",
    implementationWithoutDirectionDesc: "High operational capacity but without clear prospective vision. May lead to fragmented actions without strategic coherence.",
    implementationWithoutDirectionRec: "Develop strategic planning processes and shared long-term vision building.",
    
    governmentWithoutGovernance: "Government without governance",
    governmentWithoutGovernanceDesc: "High formal political capacity but insufficient technical and operational capabilities to transform.",
    governmentWithoutGovernanceRec: "Invest in strengthening technical capabilities and operational structures to materialize political support.",
    
    generalImbalance: "Imbalance between capabilities",
    generalImbalanceDesc: "There is a large disparity between different institutional capabilities, which can generate inefficiencies and internal conflicts.",
    generalImbalanceRec: "Develop a comprehensive institutional strengthening plan that balances all capabilities.",
    
    insufficientCapabilities: "Insufficient institutional capabilities",
    insufficientCapabilitiesDesc: "General capabilities are below the minimum level required for effective transformation management.",
    insufficientCapabilitiesRec: "Implement a comprehensive institutional strengthening program as a strategic priority.",
    
    highAbsentElements: "High percentage of absent elements",
    highAbsentElementsDesc: "% of elements were marked as absent. This indicates important gaps in institutional capabilities.",
    highAbsentElementsRec: "Systematically review each absent element and develop specific plans to implement these missing capabilities.",
    
    mediumAbsentElements: "Important absent elements",
    mediumAbsentElementsDesc: "% of elements were marked as absent. Some key capabilities require development.",
    mediumAbsentElementsRec: "Prioritize the development of the most critical absent capabilities for institutional functioning.",
    
    weakProspectiveCapabilities: "Critical prospective capabilities",
    weakProspectiveCapabilitiesDesc: "Long-term planning and anticipation capabilities are severely weakened, compromising strategic sustainability.",
    weakProspectiveCapabilitiesRec: "Urgently implement strategic planning processes, scenario building and early warning systems.",
    
    weakTechnicalCapabilities: "Insufficient technical capabilities",
    weakTechnicalCapabilitiesDesc: "Technical competencies are below critical level, limiting the quality of diagnoses and proposals.",
    weakTechnicalCapabilitiesRec: "Strengthen technical teams through training, expertise hiring and information systems improvement.",
    
    politicalInstabilityRisk: "Political instability risk",
    politicalInstabilityRiskDesc: "Developed technical capabilities but weak political base may generate resistance and abrupt direction changes.",
    politicalInstabilityRiskRec: "Develop political communication strategies and consensus building to sustain technical proposals.",
    
    operationalBottlenecks: "Operational bottlenecks",
    operationalBottlenecksDesc: "Limited operational capabilities will prevent effective implementation of plans and policies.",
    operationalBottlenecksRec: "Review and strengthen processes, systems and organizational structures to improve execution capacity.",
    
    isolatedExcellence: "Excellent isolated capacity",
    isolatedExcellenceDesc: "capacity is excellent but isolated. Without support from other dimensions, its potential will not be fully realized.",
    isolatedExcellenceRec: "Leverage the strength in capacity to drive development of other dimensions through integrated programs.",
    
    moderateBalancedCapabilities: "Moderate but balanced capabilities",
    moderateBalancedCapabilitiesDesc: "Capabilities are balanced but at intermediate level. There is potential for coordinated growth.",
    moderateBalancedCapabilitiesRec: "Implement coordinated strengthening strategies to elevate all capabilities to the next level in a balanced manner.",
    
    // Structure editor
    structureEditor: "Structure Editor",
    addCriterion: "Add Criterion",
    addElement: "Add Element",
    editCriterion: "Edit Criterion",
    editElement: "Edit Element",
    deleteCriterion: "Delete Criterion",
    deleteElement: "Delete Element",
    save: "Save",
    cancel: "Cancel",
    
    // Custom alerts editor
    customAlertsEditor: "Custom Alerts Editor",
    alertTitle: "Alert Title",
    alertDescription: "Alert Description",
    alertSeverity: "Alert Severity",
    alertCriteria: "Alert Criteria",
    threshold: "Threshold",
    operator: "Operator",
    addAlert: "Add Alert",
    saveAlerts: "Save Alerts",
    
    // Language selector
    language: "Language",
    english: "English",
    spanish: "Spanish",
    
    // Common actions
    close: "Close",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    
    // Severity levels
    low: "Low",
    medium: "Medium",
    high: "High",
    
    // Operators
    lessThan: "Less than",
    greaterThan: "Greater than",
    equals: "Equals",
    
    // Messages
    evaluationNotComplete: "Complete the evaluation to view results and strategic alerts.",
    evaluationCompleteMessage: "Evaluation completed successfully!",
    noAlertsMessage: "No strategic alerts detected. The evaluation shows a favorable situation.",
    pdfExportSuccess: "PDF exported successfully", 
    pdfExportError: "Error exporting PDF",
    
    // Collaboration
    collaborativeWorkshop: "Collaborative Workshop",
    connected: "Connected",
    disconnected: "Disconnected",
    workshopId: "Workshop ID",
    enterWorkshopId: "Enter workshop ID",
    yourName: "Your Name",
    enterYourName: "Enter your name",
    joinWorkshop: "Join Workshop",
    leaveWorkshop: "Leave Workshop",
    connecting: "Connecting...",
    workshop: "Workshop",
    participants: "Participants",
    activeParticipants: "Active Participants",
    recentUpdates: "Recent Updates",
    viewing: "Viewing",
    noOtherParticipants: "No other participants",
    updated: "updated",
    joined: "joined",
    left: "left",
    savedEvaluation: "saved evaluation",
    noRecentUpdates: "No recent updates",
    workshopJoined: "Workshop Joined",
    connectionError: "Connection Error",
    websocketConnectionFailed: "Failed to connect to workshop",
    fillAllFields: "Please fill all fields",
    
    // Interpretation section
    interpretation: "Interpretation",
    excellentPerformance: "This dimension shows excellent performance",
    goodPerformance: "This dimension shows good performance",
    moderatePerformance: "This dimension shows moderate performance",
    poorPerformance: "This dimension shows poor performance and requires urgent attention",
    strongCriteria: "Strong criteria",
    weakCriteria: "Criteria requiring improvement",
    improvementRecommendation: "Priority should be given to strengthening the weakest criteria to achieve better balance.",
    leverageStrengthsRecommendation: "Leverage existing strengths to enhance moderate criteria and maintain current performance levels.",
    
    // Dimension-specific recommendations  
    technicalLowRecommendation: "Focus on building analytical capabilities, data systems, and technical expertise through training and technology investments.",
    technicalMediumRecommendation: "Strengthen diagnostic tools and analytical methodologies while maintaining current technical standards.",
    technicalHighRecommendation: "Maintain technical excellence and consider sharing expertise with other dimensions to achieve integrated planning.",
    operationalLowRecommendation: "Develop institutional processes, improve coordination mechanisms, and establish clear operational procedures.",
    operationalMediumRecommendation: "Enhance process efficiency and strengthen inter-institutional coordination mechanisms.",
    operationalHighRecommendation: "Optimize existing operational systems and support other dimensions with proven methodologies.",
    politicalLowRecommendation: "Build political support through stakeholder engagement, consensus building, and strategic communication initiatives.",
    politicalMediumRecommendation: "Strengthen political consensus and expand stakeholder participation in planning processes.",
    politicalHighRecommendation: "Leverage political support to advance planning initiatives and maintain sustainable political backing.",
    prospectiveLowRecommendation: "Develop future-oriented thinking, scenario planning capabilities, and long-term strategic vision.",
    prospectiveMediumRecommendation: "Enhance forecasting tools and strategic planning methodologies for better future preparedness.",
    prospectiveHighRecommendation: "Apply prospective capabilities to guide other dimensions and ensure long-term planning sustainability.",
  },
  
  es: {
    // Navigation and general
    appTitle: "Planbarómetro - Evaluación de Capacidades de Planificación Gubernamental",
    home: "Inicio",
    evaluation: "Evaluación",
    results: "Resultados",
    strategicAlerts: "Alertas Estratégicas",
    
    // Evaluation form
    selectModel: "Seleccionar Modelo de Evaluación",
    exerciseCode: "Código de Ejercicio",
    groupCode: "Código de Grupo",
    country: "País",
    territory: "Territorio", 
    exerciseCodePlaceholder: "Identificador opcional del ejercicio",
    groupCodePlaceholder: "Identificador opcional del grupo",
    countryPlaceholder: "País donde se realiza la evaluación",
    territoryPlaceholder: "Territorio o región específica",
    startEvaluation: "Iniciar Evaluación",
    continueEvaluation: "Continuar Evaluación",
    newEvaluation: "Nueva Evaluación",
    completeRandomly: "Completar Aleatoriamente",
    present: "Presente",
    absent: "Ausente",
    editStructure: "Editar Estructura",
    customAlerts: "Alertas Personalizadas",
    
    // Models
    toppModel: "Modelo de Capacidades TOPP",
    toppDescription: "Evalúa las capacidades Técnicas, Operativas, Políticas y Prospectivas de los sistemas de planificación",
    nationalModel: "Modelo Nivel Nacional",
    nationalDescription: "Marco de evaluación diseñado para instituciones de planificación a nivel nacional",
    subnationalModel: "Modelo Nivel Subnacional",
    subnationalDescription: "Marco de evaluación para organizaciones de planificación regional y local",
    
    // Dimensions
    technicalCapacity: "Capacidad Técnica",
    operationalCapacity: "Capacidad Operativa",
    politicalCapacity: "Capacidad Política",
    prospectiveCapacity: "Capacidad Prospectiva",
    
    // Results and charts
    evaluationResults: "Resultados de la Evaluación",
    overallScore: "Puntuación General",
    dimensionScores: "Puntuaciones por Dimensión",
    completion: "Completitud",
    exportPdf: "Exportar PDF",
    charts: "Gráficos",
    dimensionRadarCharts: "Gráficos Radar por Dimensión",
    dimensionRadarDescription: "Análisis individual de rendimiento para cada dimensión TOPP mostrando desglose de criterios",
    criteriaBreakdown: "Desglose de Criterios",
    
    // Strategic alerts
    strategicAlertsTitle: "Alertas Estratégicas",
    strategicAlertsDescription: "Identificación de riesgos y situaciones problemáticas basadas en los patrones de evaluación",
    generalRiskStatus: "Estado General de Riesgo",
    lowRisk: "BAJO",
    mediumRisk: "MEDIO",
    highRisk: "ALTO",
    riskLevel: "Nivel de Riesgo",
    impact: "Impacto",
    urgency: "Urgencia",
    generalRisk: "Riesgo General",
    stability: "Estabilidad",
    alertIndicators: "Indicadores de Alerta",
    favorableSituation: "Situación Favorable",
    favorableSituationText: "Los resultados de la evaluación indican un equilibrio adecuado entre las diferentes capacidades. Se recomienda mantener los niveles actuales y continuar con el monitoreo periódico para asegurar que se mantenga esta situación favorable.",
    criteriaInvolved: "Criterios involucrados",
    recommendation: "Recomendación",
    
    // Alert types
    implementationWithoutDirection: "Implementación sin dirección estratégica",
    implementationWithoutDirectionDesc: "Alta capacidad operativa pero sin visión prospectiva clara. Puede conducir a acciones fragmentadas sin coherencia estratégica.",
    implementationWithoutDirectionRec: "Desarrollar procesos de planificación estratégica y construcción de visión compartida a largo plazo.",
    
    governmentWithoutGovernance: "Gobierno sin gobierno",
    governmentWithoutGovernanceDesc: "Alta capacidad política formal pero sin capacidades técnicas ni operativas suficientes para transformar.",
    governmentWithoutGovernanceRec: "Invertir en fortalecimiento de capacidades técnicas y estructuras operativas para materializar el respaldo político.",
    
    generalImbalance: "Desequilibrio entre capacidades",
    generalImbalanceDesc: "Existe una gran disparidad entre las diferentes capacidades institucionales, lo que puede generar ineficiencias y conflictos internos.",
    generalImbalanceRec: "Desarrollar un plan integral de fortalecimiento institucional que equilibre todas las capacidades.",
    
    insufficientCapabilities: "Capacidades institucionales insuficientes",
    insufficientCapabilitiesDesc: "Las capacidades generales están por debajo del nivel mínimo requerido para una gestión efectiva de transformaciones.",
    insufficientCapabilitiesRec: "Implementar un programa integral de fortalecimiento institucional como prioridad estratégica.",
    
    highAbsentElements: "Alto porcentaje de elementos ausentes",
    highAbsentElementsDesc: "% de los elementos fueron marcados como ausentes. Esto indica importantes brechas en las capacidades institucionales.",
    highAbsentElementsRec: "Revisar sistemáticamente cada elemento ausente y desarrollar planes específicos para implementar estas capacidades faltantes.",
    
    mediumAbsentElements: "Elementos importantes ausentes",
    mediumAbsentElementsDesc: "% de los elementos fueron marcados como ausentes. Algunas capacidades clave requieren desarrollo.",
    mediumAbsentElementsRec: "Priorizar el desarrollo de las capacidades ausentes más críticas para el funcionamiento institucional.",
    
    weakProspectiveCapabilities: "Capacidades prospectivas críticas",
    weakProspectiveCapabilitiesDesc: "Las capacidades de planificación a largo plazo y anticipación están muy debilitadas, comprometiendo la sostenibilidad estratégica.",
    weakProspectiveCapabilitiesRec: "Implementar urgentemente procesos de planificación estratégica, construcción de escenarios y sistemas de alerta temprana.",
    
    weakTechnicalCapabilities: "Capacidades técnicas insuficientes",
    weakTechnicalCapabilitiesDesc: "Las competencias técnicas están por debajo del nivel crítico, limitando la calidad de diagnósticos y propuestas.",
    weakTechnicalCapabilitiesRec: "Fortalecer equipos técnicos mediante capacitación, contratación de experticia y mejora de sistemas de información.",
    
    politicalInstabilityRisk: "Riesgo de inestabilidad política",
    politicalInstabilityRiskDesc: "Capacidades técnicas desarrolladas pero base política débil puede generar resistencia y cambios abruptos de dirección.",
    politicalInstabilityRiskRec: "Desarrollar estrategias de comunicación política y construcción de consensos para sostener las propuestas técnicas.",
    
    operationalBottlenecks: "Cuellos de botella operativos",
    operationalBottlenecksDesc: "Las capacidades operativas limitadas impedirán la implementación efectiva de planes y políticas.",
    operationalBottlenecksRec: "Revisar y fortalecer procesos, sistemas y estructuras organizacionales para mejorar la capacidad de ejecución.",
    
    isolatedExcellence: "Capacidad excelente aislada",
    isolatedExcellenceDesc: "La capacidad % es excelente pero está aislada. Sin apoyo de otras dimensiones, su potencial no se realizará completamente.",
    isolatedExcellenceRec: "Aprovechar la fortaleza en capacidad % para impulsar el desarrollo de las otras dimensiones mediante programas integrados.",
    
    moderateBalancedCapabilities: "Capacidades moderadas pero equilibradas",
    moderateBalancedCapabilitiesDesc: "Las capacidades están equilibradas pero en nivel intermedio. Existe potencial de crecimiento coordinado.",
    moderateBalancedCapabilitiesRec: "Implementar estrategias de fortalecimiento coordinado para elevar todas las capacidades al siguiente nivel de manera equilibrada.",
    
    // Structure editor
    structureEditor: "Editor de Estructura",
    addCriterion: "Agregar Criterio",
    addElement: "Agregar Elemento",
    editCriterion: "Editar Criterio",
    editElement: "Editar Elemento",
    deleteCriterion: "Eliminar Criterio",
    deleteElement: "Eliminar Elemento",
    save: "Guardar",
    cancel: "Cancelar",
    
    // Custom alerts editor
    customAlertsEditor: "Editor de Alertas Personalizadas",
    alertTitle: "Título de Alerta",
    alertDescription: "Descripción de Alerta",
    alertSeverity: "Severidad de Alerta",
    alertCriteria: "Criterios de Alerta",
    threshold: "Umbral",
    operator: "Operador",
    addAlert: "Agregar Alerta",
    saveAlerts: "Guardar Alertas",
    
    // Language selector
    language: "Idioma",
    english: "Inglés",
    spanish: "Español",
    
    // Common actions
    close: "Cerrar",
    edit: "Editar",
    delete: "Eliminar",
    confirm: "Confirmar",
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    
    // Severity levels
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
    
    // Operators
    lessThan: "Menor que",
    greaterThan: "Mayor que",
    equals: "Igual a",
    
    // Messages
    evaluationNotComplete: "Complete la evaluación para ver los resultados y alertas estratégicas.",
    evaluationCompleteMessage: "¡Evaluación completada exitosamente!",
    noAlertsMessage: "No se detectaron alertas estratégicas. La evaluación muestra una situación favorable.",
    pdfExportSuccess: "PDF exportado exitosamente",
    pdfExportError: "Error al exportar PDF",
    
    // Collaboration
    collaborativeWorkshop: "Taller Colaborativo",
    connected: "Conectado",
    disconnected: "Desconectado",
    workshopId: "ID del Taller",
    enterWorkshopId: "Ingrese ID del taller",
    yourName: "Su Nombre",
    enterYourName: "Ingrese su nombre",
    joinWorkshop: "Unirse al Taller",
    leaveWorkshop: "Salir del Taller",
    connecting: "Conectando...",
    workshop: "Taller",
    participants: "Participantes",
    activeParticipants: "Participantes Activos",
    recentUpdates: "Actualizaciones Recientes",
    viewing: "Viendo",
    noOtherParticipants: "No hay otros participantes",
    updated: "actualizó",
    joined: "se unió",
    left: "salió",
    savedEvaluation: "guardó evaluación",
    noRecentUpdates: "No hay actualizaciones recientes", 
    workshopJoined: "Taller Unido",
    connectionError: "Error de Conexión",
    websocketConnectionFailed: "Error al conectar al taller",
    fillAllFields: "Por favor complete todos los campos",
    
    // Interpretation section
    interpretation: "Interpretación",
    excellentPerformance: "Esta dimensión muestra un rendimiento excelente",
    goodPerformance: "Esta dimensión muestra un buen rendimiento",
    moderatePerformance: "Esta dimensión muestra un rendimiento moderado",
    poorPerformance: "Esta dimensión muestra un rendimiento deficiente y requiere atención urgente",
    strongCriteria: "Criterios fortalecidos",
    weakCriteria: "Criterios que requieren mejora",
    improvementRecommendation: "Se debe priorizar el fortalecimiento de los criterios más débiles para lograr un mejor equilibrio.",
    leverageStrengthsRecommendation: "Aprovechar las fortalezas existentes para mejorar los criterios moderados y mantener los niveles actuales de rendimiento.",
    
    // Dimension-specific recommendations
    technicalLowRecommendation: "Enfocar en desarrollar capacidades analíticas, sistemas de datos y experticia técnica mediante capacitación e inversiones tecnológicas.",
    technicalMediumRecommendation: "Fortalecer herramientas de diagnóstico y metodologías analíticas manteniendo los estándares técnicos actuales.",
    technicalHighRecommendation: "Mantener la excelencia técnica y considerar compartir la experticia con otras dimensiones para lograr una planificación integrada.",
    operationalLowRecommendation: "Desarrollar procesos institucionales, mejorar mecanismos de coordinación y establecer procedimientos operativos claros.",
    operationalMediumRecommendation: "Mejorar la eficiencia de procesos y fortalecer mecanismos de coordinación interinstitucional.",
    operationalHighRecommendation: "Optimizar sistemas operativos existentes y apoyar otras dimensiones con metodologías probadas.",
    politicalLowRecommendation: "Construir apoyo político mediante participación de actores clave, construcción de consensos e iniciativas de comunicación estratégica.",
    politicalMediumRecommendation: "Fortalecer el consenso político y ampliar la participación de actores en los procesos de planificación.",
    politicalHighRecommendation: "Aprovechar el apoyo político para avanzar iniciativas de planificación y mantener respaldo político sostenible.",
    prospectiveLowRecommendation: "Desarrollar pensamiento orientado al futuro, capacidades de planificación por escenarios y visión estratégica de largo plazo.",
    prospectiveMediumRecommendation: "Mejorar herramientas de prospectiva y metodologías de planificación estratégica para mejor preparación futura.",
    prospectiveHighRecommendation: "Aplicar capacidades prospectivas para guiar otras dimensiones y asegurar sostenibilidad de la planificación a largo plazo.",
  }
};

// Language context and hooks
export let currentLanguage: Language = 'es'; // Default to Spanish for testing

export function setLanguage(lang: Language) {
  currentLanguage = lang;
  localStorage.setItem('planbarometer-language', lang);
}

export function getLanguage(): Language {
  const saved = localStorage.getItem('planbarometer-language');
  return (saved as Language) || 'es';
}

export function t(key: keyof Translations): string {
  return translations[currentLanguage][key];
}

// Initialize language from localStorage on app start
if (typeof window !== 'undefined') {
  currentLanguage = getLanguage();
  // Force update on language change
  window.addEventListener('storage', (e) => {
    if (e.key === 'planbarometer-language') {
      currentLanguage = getLanguage();
    }
  });
}