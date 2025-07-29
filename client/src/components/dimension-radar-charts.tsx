import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Model } from "@/types/planbarometro";
import { t } from "@/lib/i18n";

interface DimensionRadarChartsProps {
  model: Model;
  scores: Record<string, number>;
  responses: Record<string, number>;
}

export default function DimensionRadarCharts({ model, scores, responses }: DimensionRadarChartsProps) {
  // Calculate criterion score based on individual element responses  
  const calculateCriterionScore = (criterion: any) => {
    let totalScore = 0;
    let totalElements = 0;
    
    criterion.elements.forEach((element: any) => {
      const response = responses[element.id];
      if (response !== undefined) {
        totalScore += response;
        totalElements++;
      }
    });
    
    return totalElements > 0 ? (totalScore / totalElements) * 100 : 0;
  };

  // Generate data for each dimension's radar chart
  const generateDimensionData = (dimensionId: string) => {
    const dimension = model.dimensions.find(d => d.id === dimensionId);
    if (!dimension) return [];

    return dimension.criteria.map(criterion => {
      const criterionScore = calculateCriterionScore(criterion);
      return {
        criterion: criterion.name,
        score: criterionScore, // Already as percentage
        fullMark: 100
      };
    });
  };

  const getDimensionColor = (dimensionId: string) => {
    const colors = {
      technical: "#3b82f6", // blue
      operational: "#10b981", // green
      political: "#8b5cf6", // purple
      prospective: "#f59e0b" // orange
    };
    return colors[dimensionId as keyof typeof colors] || "#6b7280";
  };

  const getDimensionTitle = (dimensionId: string) => {
    const titles = {
      technical: t('technicalCapacity'),
      operational: t('operationalCapacity'),
      political: t('politicalCapacity'),
      prospective: t('prospectiveCapacity')
    };
    return titles[dimensionId as keyof typeof titles] || dimensionId;
  };

  const dimensionIds = ['technical', 'operational', 'political', 'prospective'];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('dimensionRadarCharts')}</h2>
        <p className="text-gray-600">{t('dimensionRadarDescription')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dimensionIds.map(dimensionId => {
          const dimension = model.dimensions.find(d => d.id === dimensionId);
          if (!dimension) return null;

          const data = generateDimensionData(dimensionId);
          
          // Calculate dimension score as average of all criterion scores
          let dimensionTotalScore = 0;
          let dimensionTotalElements = 0;
          
          dimension.criteria.forEach(criterion => {
            criterion.elements.forEach((element: any) => {
              const response = responses[element.id];
              if (response !== undefined) {
                dimensionTotalScore += response;
                dimensionTotalElements++;
              }
            });
          });
          
          const dimensionScore = dimensionTotalElements > 0 ? dimensionTotalScore / dimensionTotalElements : 0;
          const color = getDimensionColor(dimensionId);

          return (
            <Card key={dimensionId} className="bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">
                    {getDimensionTitle(dimensionId)}
                  </span>
                  <span 
                    className="text-2xl font-bold px-3 py-1 rounded-lg text-white"
                    style={{ backgroundColor: color }}
                  >
                    {Math.round(dimensionScore * 100)}%
                  </span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  {dimension.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                      <PolarGrid />
                      <PolarAngleAxis 
                        dataKey="criterion" 
                        tick={{ fontSize: 12, fill: '#6b7280' }}
                        className="text-xs"
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#9ca3af' }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke={color}
                        fill={color}
                        fillOpacity={0.2}
                        strokeWidth={2}
                        dot={{ fill: color, strokeWidth: 2, r: 4 }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Criteria breakdown */}
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium text-gray-800 text-sm">{t('criteriaBreakdown')}:</h4>
                  <div className="grid gap-2">
                    {dimension.criteria.map(criterion => {
                      const criterionScore = calculateCriterionScore(criterion);
                      return (
                        <div key={criterion.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 flex-1 mr-2">{criterion.name}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${criterionScore}%`,
                                  backgroundColor: color 
                                }}
                              />
                            </div>
                            <span className="font-medium text-gray-800 w-12 text-right">
                              {Math.round(criterionScore)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Interpretation Section */}
                <div className="mt-6 bg-gray-50 rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="mr-2">💡</span>
                    {t('interpretation')}
                  </h4>
                  <div className="text-sm text-gray-700 leading-relaxed">
                    {generateInterpretation(dimension, data, dimensionScore)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // Generate interpretation based on dimension data and scores
  function generateInterpretation(dimension: any, criteriaData: any[], dimensionScore: number) {
    const scorePercentage = Math.round(dimensionScore * 100);
    const strongCriteria = criteriaData.filter(c => c.score >= 75);
    const weakCriteria = criteriaData.filter(c => c.score < 50);
    const moderateCriteria = criteriaData.filter(c => c.score >= 50 && c.score < 75);

    let interpretation = "";

    // Overall performance assessment
    if (scorePercentage >= 75) {
      interpretation += `${t('excellentPerformance')} (${scorePercentage}%). `;
    } else if (scorePercentage >= 50) {
      interpretation += `${t('goodPerformance')} (${scorePercentage}%). `;
    } else if (scorePercentage >= 25) {
      interpretation += `${t('moderatePerformance')} (${scorePercentage}%). `;
    } else {
      interpretation += `${t('poorPerformance')} (${scorePercentage}%). `;
    }

    // Criteria analysis
    if (strongCriteria.length > 0) {
      interpretation += `${t('strongCriteria')}: ${strongCriteria.map(c => c.criterion).join(', ')}. `;
    }

    if (weakCriteria.length > 0) {
      interpretation += `${t('weakCriteria')}: ${weakCriteria.map(c => c.criterion).join(', ')}. `;
    }

    // Recommendations based on performance pattern
    if (weakCriteria.length > strongCriteria.length) {
      interpretation += `${t('improvementRecommendation')} `;
    } else if (strongCriteria.length > 0 && moderateCriteria.length > 0) {
      interpretation += `${t('leverageStrengthsRecommendation')} `;
    }

    // Specific dimension recommendations
    const dimensionRecommendations = getDimensionSpecificRecommendations(dimension.id, scorePercentage);
    if (dimensionRecommendations) {
      interpretation += dimensionRecommendations;
    }

    return interpretation;
  }

  function getDimensionSpecificRecommendations(dimensionId: string, score: number): string {
    const recommendations: Record<string, Record<string, string>> = {
      technical: {
        low: t('technicalLowRecommendation'),
        medium: t('technicalMediumRecommendation'),
        high: t('technicalHighRecommendation')
      },
      operational: {
        low: t('operationalLowRecommendation'),
        medium: t('operationalMediumRecommendation'),
        high: t('operationalHighRecommendation')
      },
      political: {
        low: t('politicalLowRecommendation'),
        medium: t('politicalMediumRecommendation'),
        high: t('politicalHighRecommendation')
      },
      prospective: {
        low: t('prospectiveLowRecommendation'),
        medium: t('prospectiveMediumRecommendation'),
        high: t('prospectiveHighRecommendation')
      }
    };

    const level = score < 50 ? 'low' : score < 75 ? 'medium' : 'high';
    return recommendations[dimensionId]?.[level] || '';
  }
}