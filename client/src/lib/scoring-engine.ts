import { EvaluationResponse, EvaluationScores, Model, CriterionScore, DimensionScore } from "@/types/planbarometro";

export function calculateScores(responses: EvaluationResponse, model: Model): EvaluationScores {
  const dimensionScores: DimensionScore[] = [];
  let totalElements = 0;
  let totalScore = 0;

  model.dimensions.forEach(dimension => {
    const criteriaScores: CriterionScore[] = [];
    let dimensionTotalElements = 0;
    let dimensionTotalScore = 0;

    dimension.criteria.forEach(criterion => {
      let criterionScore = 0;
      let criterionElements = 0;

      criterion.elements.forEach(element => {
        const response = responses[element.id];
        if (response !== undefined) {
          criterionScore += response;
          criterionElements++;
          dimensionTotalElements++;
          totalElements++;
          dimensionTotalScore += response;
          totalScore += response;
        }
      });

      const criterionPercentage = criterionElements > 0 ? Math.round((criterionScore / criterionElements) * 100) : 0;
      criteriaScores.push({
        criterionId: criterion.id,
        score: criterionScore,
        percentage: criterionPercentage
      });
    });

    const dimensionPercentage = dimensionTotalElements > 0 ? Math.round((dimensionTotalScore / dimensionTotalElements) * 100) : 0;
    dimensionScores.push({
      dimensionId: dimension.id,
      score: dimensionTotalScore,
      percentage: dimensionPercentage,
      criteria: criteriaScores
    });
  });

  const overallPercentage = totalElements > 0 ? Math.round((totalScore / totalElements) * 100) : 0;

  return {
    overall: overallPercentage,
    dimensions: dimensionScores
  };
}

export function getScoreStatus(percentage: number): string {
  if (percentage >= 75) return "Excelente";
  if (percentage >= 50) return "Bueno";
  if (percentage >= 25) return "Regular";
  return "Deficiente";
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 75) return "text-green-600";
  if (percentage >= 50) return "text-blue-600";
  if (percentage >= 25) return "text-yellow-600";
  return "text-red-600";
}
