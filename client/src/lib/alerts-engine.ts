import { StrategicAlert, EvaluationScores } from "@/types/planbarometro";

interface AlertMetrics {
  riskLevel: number; // 0-100, where 100 is highest risk
  impactLevel: number; // 0-100, impact on planning effectiveness
  urgencyLevel: number; // 0-100, how urgent is attention needed
}

export function generateStrategicAlerts(scores: EvaluationScores, modelId: string): StrategicAlert[] {
  if (modelId !== "topp" || scores.dimensions.length < 4) {
    return [];
  }

  const alerts: StrategicAlert[] = [];
  const [technical, operational, political, prospective] = scores.dimensions.map(d => d.percentage);

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
  if (operational >= 60 && prospective < 40) {
    const riskLevel = Math.min(100, (operational - prospective) * 1.2);
    alerts.push({
      id: "implementation_without_strategic_direction",
      title: "Implementación sin dirección estratégica",
      description: "Alta capacidad operativa pero sin visión prospectiva clara. Puede conducir a acciones fragmentadas sin coherencia estratégica.",
      severity: "medium",
      criteria: ["Capacidad operativa", "Visión prospectiva"],
      recommendation: "Desarrollar procesos de planificación estratégica y construcción de visión compartida a largo plazo.",
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
      title: "Gobierno sin gobierno",
      description: "Alta capacidad política formal pero sin capacidades técnicas ni operativas suficientes para transformar.",
      severity: "high",
      criteria: ["Capacidad política", "Capacidad técnica", "Capacidad operativa"],
      recommendation: "Invertir en fortalecimiento de capacidades técnicas y estructuras operativas para materializar el respaldo político.",
      metrics: {
        riskLevel: riskLevel,
        impactLevel: 90, // Very high impact - political capital wasted
        urgencyLevel: 80 // High urgency - political windows are time-limited
      }
    });
  }

  // "Desequilibrio general"
  const maxDiff = Math.max(technical, operational, political, prospective) - Math.min(technical, operational, political, prospective);
  if (maxDiff > 50) {
    alerts.push({
      id: "general_imbalance",
      title: "Desequilibrio entre capacidades",
      description: "Existe una gran disparidad entre las diferentes capacidades institucionales, lo que puede generar ineficiencias y conflictos internos.",
      severity: "medium",
      criteria: ["Todas las dimensiones"],
      recommendation: "Desarrollar un plan integral de fortalecimiento institucional que equilibre todas las capacidades.",
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
