import { StrategicAlert, EvaluationScores } from "@/types/planbarometro";
import { t } from "./i18n";

interface AlertMetrics {
  riskLevel: number; // 0-100, where 100 is highest risk
  impactLevel: number; // 0-100, impact on planning effectiveness
  urgencyLevel: number; // 0-100, how urgent is attention needed
}

export function generateStrategicAlerts(scores: EvaluationScores, modelId: string, responses?: Record<string, 0 | 1>): StrategicAlert[] {
  if (modelId !== "topp" || scores.dimensions.length < 4) {
    return [];
  }

  const alerts: StrategicAlert[] = [];
  const [technical, operational, political, prospective] = scores.dimensions.map(d => d.percentage);
  
  // Debug logging
  console.log("Generating alerts with scores:", { technical, operational, political, prospective });
  
  // Check for unanswered elements if responses are provided
  let unansweredCount = 0;
  let totalElements = 0;
  if (responses) {
    const responseEntries = Object.entries(responses);
    totalElements = responseEntries.length;
    unansweredCount = responseEntries.filter(([_, value]) => value === 0).length;
  }

  // "Diseño sin tracción política"
  if (technical >= 60 && political < 40) {
    const riskLevel = Math.min(100, (technical - political) * 1.5); // Higher when gap is larger
    alerts.push({
      id: "design_without_political_traction",
      title: "Diseño sin tracción política",
      description: "Alta capacidad técnica pero sin apoyo político suficiente. Esto puede generar planes sofisticados que no se implementan efectivamente.",
      severity: "high",
      criteria: ["Capacidad técnica", "Liderazgo político"],
      recommendation: "Fortalecer mecanismos de diálogo político y construcción de alianzas para respaldar las propuestas técnicas.",
      metrics: {
        riskLevel: riskLevel,
        impactLevel: 85, // High impact - plans won't be implemented
        urgencyLevel: 75 // High urgency - without political support, technical work is wasted
      }
    });
  }

  // "Implementación sin dirección estratégica"
  if (operational >= 50 && prospective < 50) {
    const riskLevel = Math.min(100, (operational - prospective) * 1.2);
    alerts.push({
      id: "implementation_without_strategic_direction",
      title: t('implementationWithoutDirection'),
      description: t('implementationWithoutDirectionDesc'),
      severity: "medium",
      criteria: [t('operationalCapacity'), t('prospectiveCapacity')],
      recommendation: t('implementationWithoutDirectionRec'),
      metrics: {
        riskLevel: riskLevel,
        impactLevel: 70, // Medium-high impact - inefficient resource use
        urgencyLevel: 60 // Medium urgency - can continue short-term but needs strategic direction
      }
    });
  }

  // "Gobierno sin gobierno"
  if (political >= 60 && technical < 40 && operational < 40) {
    const riskLevel = Math.min(100, political - Math.max(technical, operational));
    alerts.push({
      id: "government_without_governance",
      title: t('governmentWithoutGovernance'),
      description: t('governmentWithoutGovernanceDesc'),
      severity: "high",
      criteria: [t('politicalCapacity'), t('technicalCapacity'), t('operationalCapacity')],
      recommendation: t('governmentWithoutGovernanceRec'),
      metrics: {
        riskLevel: riskLevel,
        impactLevel: 90, // Very high impact - political capital wasted
        urgencyLevel: 80 // High urgency - political windows are time-limited
      }
    });
  }

  // "Desequilibrio general"
  const maxDiff = Math.max(technical, operational, political, prospective) - Math.min(technical, operational, political, prospective);
  if (maxDiff > 30) {
    alerts.push({
      id: "general_imbalance", 
      title: t('generalImbalance'),
      description: t('generalImbalanceDesc'),
      severity: "medium",
      criteria: ["All dimensions"],
      recommendation: t('generalImbalanceRec'),
      metrics: {
        riskLevel: Math.min(100, maxDiff * 1.5),
        impactLevel: 65, // Medium impact - creates inefficiencies
        urgencyLevel: 50 // Medium urgency - long-term sustainability issue
      }
    });
  }

  // "Capacidades insuficientes"
  const averageScore = (technical + operational + political + prospective) / 4;
  if (averageScore < 30) {
    alerts.push({
      id: "insufficient_capabilities",
      title: "Capacidades institucionales insuficientes",
      description: "Las capacidades generales están por debajo del nivel mínimo requerido para una gestión efectiva de transformaciones.",
      severity: "high",
      criteria: ["Todas las dimensiones"],
      recommendation: "Implementar un programa integral de fortalecimiento institucional como prioridad estratégica.",
      metrics: {
        riskLevel: Math.max(50, 100 - averageScore * 2), // Higher risk when capabilities are lower
        impactLevel: 95, // Very high impact - fundamental capability gaps
        urgencyLevel: 90 // Very urgent - basic functioning at risk
      }
    });
  }

  // Alert for high percentage of unanswered elements
  if (responses && totalElements > 0) {
    const unansweredPercentage = (unansweredCount / totalElements) * 100;
    if (unansweredPercentage > 50) {
      alerts.push({
        id: "high_unanswered_elements",
        title: "Alto porcentaje de elementos ausentes",
        description: `${unansweredPercentage.toFixed(1)}% de los elementos fueron marcados como ausentes. Esto indica importantes brechas en las capacidades institucionales.`,
        severity: "high",
        criteria: ["Evaluación general"],
        recommendation: "Revisar sistemáticamente cada elemento ausente y desarrollar planes específicos para implementar estas capacidades faltantes.",
        metrics: {
          riskLevel: Math.min(100, unansweredPercentage * 1.5),
          impactLevel: 85,
          urgencyLevel: 70
        }
      });
    } else if (unansweredPercentage > 25) {
      alerts.push({
        id: "medium_unanswered_elements", 
        title: "Elementos importantes ausentes",
        description: `${unansweredPercentage.toFixed(1)}% de los elementos fueron marcados como ausentes. Algunas capacidades clave requieren desarrollo.`,
        severity: "medium",
        criteria: ["Evaluación general"],
        recommendation: "Priorizar el desarrollo de las capacidades ausentes más críticas para el funcionamiento institucional.",
        metrics: {
          riskLevel: unansweredPercentage * 1.2,
          impactLevel: 60,
          urgencyLevel: 50
        }
      });
    }
  }

  // Alert for weak prospective capabilities
  if (prospective < 45) {
    alerts.push({
      id: "weak_prospective_capabilities",
      title: "Capacidades prospectivas críticas",
      description: "Las capacidades de planificación a largo plazo y anticipación están muy debilitadas, comprometiendo la sostenibilidad estratégica.",
      severity: "high",
      criteria: ["Capacidad prospectiva"],
      recommendation: "Implementar urgentemente procesos de planificación estratégica, construcción de escenarios y sistemas de alerta temprana.",
      metrics: {
        riskLevel: 100 - prospective,
        impactLevel: 90,
        urgencyLevel: 85
      }
    });
  }

  // Alert for weak technical capabilities
  if (technical < 25) {
    alerts.push({
      id: "weak_technical_capabilities",
      title: "Capacidades técnicas insuficientes",
      description: "Las competencias técnicas están por debajo del nivel crítico, limitando la calidad de diagnósticos y propuestas.",
      severity: "high", 
      criteria: ["Capacidad técnica"],
      recommendation: "Fortalecer equipos técnicos mediante capacitación, contratación de experticia y mejora de sistemas de información.",
      metrics: {
        riskLevel: 100 - technical,
        impactLevel: 80,
        urgencyLevel: 75
      }
    });
  }

  // Alert for political instability risk
  if (political < 30 && technical > 50) {
    alerts.push({
      id: "political_instability_risk",
      title: "Riesgo de inestabilidad política",
      description: "Capacidades técnicas desarrolladas pero base política débil puede generar resistencia y cambios abruptos de dirección.",
      severity: "medium",
      criteria: ["Capacidad política", "Capacidad técnica"],
      recommendation: "Desarrollar estrategias de comunicación política y construcción de consensos para sostener las propuestas técnicas.",
      metrics: {
        riskLevel: technical - political,
        impactLevel: 70,
        urgencyLevel: 60
      }
    });
  }

  // Alert for operational bottlenecks
  if (operational < 30) {
    alerts.push({
      id: "operational_bottlenecks",
      title: "Cuellos de botella operativos",
      description: "Las capacidades operativas limitadas impedirán la implementación efectiva de planes y políticas.",
      severity: "high",
      criteria: ["Capacidad operativa"],
      recommendation: "Revisar y fortalecer procesos, sistemas y estructuras organizacionales para mejorar la capacidad de ejecución.",
      metrics: {
        riskLevel: 100 - operational,
        impactLevel: 85,
        urgencyLevel: 80
      }
    });
  }

  // Alert for excellent isolated capacity
  const maxCapacity = Math.max(technical, operational, political, prospective);
  const avgOthers = (technical + operational + political + prospective - maxCapacity) / 3;
  if (maxCapacity > 75 && avgOthers < 50) {
    const excellentDimension = 
      technical === maxCapacity ? "técnica" :
      operational === maxCapacity ? "operativa" :
      political === maxCapacity ? "política" : "prospectiva";
    
    alerts.push({
      id: "isolated_excellence",
      title: "Capacidad excelente aislada",
      description: `La capacidad ${excellentDimension} es excelente pero está aislada. Sin apoyo de otras dimensiones, su potencial no se realizará completamente.`,
      severity: "medium",
      criteria: ["Todas las dimensiones"],
      recommendation: `Aprovechar la fortaleza en capacidad ${excellentDimension} para impulsar el desarrollo de las otras dimensiones mediante programas integrados.`,
      metrics: {
        riskLevel: maxCapacity - avgOthers,
        impactLevel: 65,
        urgencyLevel: 45
      }
    });
  }

  // Alert for moderate but balanced capabilities
  if (averageScore >= 40 && averageScore < 60 && maxDiff < 25) {
    alerts.push({
      id: "moderate_balanced_capabilities",
      title: "Capacidades moderadas pero equilibradas",
      description: "Las capacidades están equilibradas pero en nivel intermedio. Existe potencial de crecimiento coordinado.",
      severity: "low",
      criteria: ["Todas las dimensiones"],
      recommendation: "Implementar estrategias de fortalecimiento coordinado para elevar todas las capacidades al siguiente nivel de manera equilibrada.",
      metrics: {
        riskLevel: 25,
        impactLevel: 40,
        urgencyLevel: 30
      }
    });
  }

  return alerts;
}

export function getAlertSeverityColor(severity: StrategicAlert['severity']): string {
  switch (severity) {
    case 'high': return 'border-red-500 text-red-700';
    case 'medium': return 'border-yellow-500 text-yellow-700';
    case 'low': return 'border-green-500 text-green-700';
    default: return 'border-gray-500 text-gray-700';
  }
}

export function getAlertIcon(severity: StrategicAlert['severity']): string {
  switch (severity) {
    case 'high': return 'AlertTriangle';
    case 'medium': return 'AlertCircle';
    case 'low': return 'Info';
    default: return 'Info';
  }
}
