import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EvaluationScores, Model } from "@/types/planbarometro";
import { getScoreStatus, getScoreColor } from "@/lib/scoring-engine";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface ResultsChartsProps {
  scores: EvaluationScores;
  model: Model;
}

export default function ResultsCharts({ scores, model }: ResultsChartsProps) {
  const radarData = model.dimensions.map((dimension, index) => ({
    dimension: dimension.name,
    score: scores.dimensions[index]?.percentage || 0
  }));

  const barData = model.dimensions.flatMap((dimension, dimIndex) =>
    dimension.criteria.map((criterion, critIndex) => ({
      name: `${dimension.name.slice(0, 1)}${dimIndex + 1}.${critIndex + 1}`,
      score: scores.dimensions[dimIndex]?.criteria[critIndex]?.percentage || 0,
      fullName: criterion.name
    }))
  );

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Resultados y Visualización</h2>
        <p className="text-gray-600">Análisis gráfico de las capacidades evaluadas y comparativa entre dimensiones.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">📊</span>
              Gráfico Radar por Dimensiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="dimension" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
                <Radar
                  name="Puntuación"
                  dataKey="score"
                  stroke="hsl(207, 90%, 54%)"
                  fill="hsl(207, 90%, 54%)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">📊</span>
              Puntuación por Criterios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => [
                    `${value}%`, 
                    props.payload.fullName
                  ]}
                />
                <Bar dataKey="score" fill="hsl(207, 90%, 54%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Scores Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">📋</span>
            Tabla Detallada de Puntuaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dimensión</TableHead>
                <TableHead>Criterio</TableHead>
                <TableHead>Puntuación</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {model.dimensions.map((dimension, dimIndex) =>
                dimension.criteria.map((criterion, critIndex) => {
                  const score = scores.dimensions[dimIndex]?.criteria[critIndex]?.percentage || 0;
                  const status = getScoreStatus(score);
                  const statusColor = getScoreColor(score);
                  
                  return (
                    <TableRow key={`${dimension.id}-${criterion.id}`}>
                      <TableCell className="font-medium">{dimension.name}</TableCell>
                      <TableCell>{criterion.name}</TableCell>
                      <TableCell>{score}%</TableCell>
                      <TableCell className={statusColor}>{status}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
