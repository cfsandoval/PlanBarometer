import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Model, EvaluationResponse, EvaluationJustifications } from "@/types/planbarometro";
import { calculateScores } from "@/lib/scoring-engine";
import { useMemo, useState } from "react";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

interface EvaluationFormProps {
  model: Model;
  responses: EvaluationResponse;
  justifications: EvaluationJustifications;
  onResponseChange: (elementId: string, value: 0 | 1) => void;
  onJustificationChange: (elementId: string, justification: string) => void;
}

export default function EvaluationForm({ model, responses, justifications, onResponseChange, onJustificationChange }: EvaluationFormProps) {
  const scores = useMemo(() => calculateScores(responses, model), [responses, model]);
  const [expandedJustifications, setExpandedJustifications] = useState<Set<string>>(new Set());
  
  const totalElements = model.dimensions.reduce((acc, dim) => 
    acc + dim.criteria.reduce((critAcc, crit) => critAcc + crit.elements.length, 0), 0
  );
  
  const answeredElements = Object.keys(responses).length;
  const progress = totalElements > 0 ? (answeredElements / totalElements) * 100 : 0;

  const getDimensionIcon = (icon: string) => {
    const icons: { [key: string]: string } = {
      cog: "⚙️",
      tools: "🛠️", 
      handshake: "🤝",
      eye: "👁️"
    };
    return icons[icon] || "📊";
  };

  const getDimensionColor = (color: string) => {
    const colors: { [key: string]: string } = {
      "bg-blue-500": "bg-blue-50 border-blue-200",
      "bg-green-500": "bg-green-50 border-green-200", 
      "bg-purple-500": "bg-purple-50 border-purple-200",
      "bg-orange-500": "bg-orange-50 border-orange-200"
    };
    return colors[color] || "bg-gray-50 border-gray-200";
  };

  const getCriterionScore = (dimensionIndex: number, criterionIndex: number) => {
    return scores.dimensions[dimensionIndex]?.criteria[criterionIndex]?.percentage || 0;
  };

  const getDimensionScore = (dimensionIndex: number) => {
    return scores.dimensions[dimensionIndex]?.percentage || 0;
  };

  const toggleJustification = (elementId: string) => {
    setExpandedJustifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(elementId)) {
        newSet.delete(elementId);
      } else {
        newSet.add(elementId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Formulario de Evaluación</h2>
        <p className="text-gray-600">Evalúe cada elemento marcando Presente (P) o Ausente (A) según la realidad institucional.</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Label>Progreso de evaluación</Label>
          <span className="text-sm text-gray-600">{answeredElements}/{totalElements} elementos</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="space-y-6">
        {model.dimensions.map((dimension, dimIndex) => (
          <Card key={dimension.id} className={`border ${getDimensionColor(dimension.color)}`}>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className="mr-2">{getDimensionIcon(dimension.icon)}</span>
                {dimension.name}
              </h3>
              <p className="text-gray-600 mb-4">{dimension.description}</p>
              
              <div className="space-y-4">
                {dimension.criteria.map((criterion, critIndex) => (
                  <Card key={criterion.id} className="bg-white shadow-sm">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        {dimIndex + 1}.{critIndex + 1} {criterion.name}
                      </h4>
                      
                      <div className="space-y-3">
                        {criterion.elements.map((element) => (
                          <div key={element.id} className="bg-gray-50 rounded">
                            <div className="flex items-center justify-between p-3">
                              <span className="text-sm flex-1 mr-4">{element.text}</span>
                              <div className="flex items-center space-x-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleJustification(element.id)}
                                  className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
                                  title="Agregar justificación"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <div className="flex space-x-2">
                                  <Label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      name={element.id}
                                      value="1"
                                      checked={responses[element.id] === 1}
                                      onChange={() => onResponseChange(element.id, 1)}
                                      className="mr-2"
                                    />
                                    <span className="text-green-600 font-medium">P</span>
                                  </Label>
                                  <Label className="flex items-center cursor-pointer">
                                    <input
                                      type="radio"
                                      name={element.id}
                                      value="0"
                                      checked={responses[element.id] === 0}
                                      onChange={() => onResponseChange(element.id, 0)}
                                      className="mr-2"
                                    />
                                    <span className="text-red-600 font-medium">A</span>
                                  </Label>
                                </div>
                              </div>
                            </div>
                            
                            {expandedJustifications.has(element.id) && (
                              <div className="px-3 pb-3 border-t border-gray-200">
                                <Label className="text-sm text-gray-600 mb-2 block">
                                  Justificación de la respuesta:
                                </Label>
                                <Textarea
                                  value={justifications[element.id] || ""}
                                  onChange={(e) => onJustificationChange(element.id, e.target.value)}
                                  placeholder="Describa la evidencia o razones que justifican su respuesta..."
                                  className="min-h-[80px]"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="mt-3 p-2 bg-blue-100 rounded text-center">
                        <span className="text-sm font-medium text-blue-700">
                          Puntuación del criterio: {getCriterionScore(dimIndex, critIndex)}%
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-4 p-4 bg-gray-800 text-white rounded-lg text-center">
                <h4 className="font-semibold">
                  Puntuación {dimension.name}: {getDimensionScore(dimIndex)}%
                </h4>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {model.id === "topp" && (
        <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 text-center">Resumen General de Evaluación</h3>
            <div className="grid md:grid-cols-4 gap-4">
              {["Técnica", "Operativa", "Política", "Prospectiva"].map((name, index) => (
                <div key={name} className="text-center">
                  <div className="text-2xl font-bold">{getDimensionScore(index)}%</div>
                  <div className="text-sm">{name}</div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4 pt-4 border-t border-blue-400">
              <div className="text-3xl font-bold">{scores.overall}%</div>
              <div className="text-sm">Puntuación Total</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
