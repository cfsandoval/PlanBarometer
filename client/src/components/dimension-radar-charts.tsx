import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Model } from "@/types/planbarometro";
import { t } from "@/lib/i18n";

interface DimensionRadarChartsProps {
  model: Model;
  scores: Record<string, number>;
}

export default function DimensionRadarCharts({ model, scores }: DimensionRadarChartsProps) {
  // Generate data for each dimension's radar chart
  const generateDimensionData = (dimensionId: string) => {
    const dimension = model.dimensions.find(d => d.id === dimensionId);
    if (!dimension) return [];

    return dimension.criteria.map(criterion => {
      const criterionScore = scores[criterion.id] || 0;
      return {
        criterion: criterion.name,
        score: criterionScore * 100, // Convert to percentage
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
          const dimensionScore = scores[dimensionId] || 0;
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
                      const criterionScore = scores[criterion.id] || 0;
                      return (
                        <div key={criterion.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600 flex-1 mr-2">{criterion.name}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  width: `${criterionScore * 100}%`,
                                  backgroundColor: color 
                                }}
                              />
                            </div>
                            <span className="font-medium text-gray-800 w-12 text-right">
                              {Math.round(criterionScore * 100)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}