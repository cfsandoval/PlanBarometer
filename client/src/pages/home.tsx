import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Upload, BarChart3 } from "lucide-react";

import ModelSelector from "@/components/model-selector";
import EvaluationForm from "@/components/evaluation-form";
import ResultsCharts from "@/components/results-charts";
import StrategicAlerts from "@/components/strategic-alerts";

import { MODELS } from "@/lib/planbarometro-data";
import { calculateScores } from "@/lib/scoring-engine";
import { generateStrategicAlerts } from "@/lib/alerts-engine";
import { apiRequest } from "@/lib/queryClient";
import { EvaluationResponse, EvaluationData } from "@/types/planbarometro";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("topp");
  const [responses, setResponses] = useState<EvaluationResponse>({});
  const [evaluationTitle, setEvaluationTitle] = useState("");
  const [activeTab, setActiveTab] = useState("evaluation");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current model data
  const currentModel = MODELS.find(m => m.id === selectedModel);
  
  // Calculate scores
  const scores = useMemo(() => {
    if (!currentModel) return { overall: 0, dimensions: [] };
    return calculateScores(responses, currentModel);
  }, [responses, currentModel]);

  // Generate alerts
  const alerts = useMemo(() => {
    return generateStrategicAlerts(scores, selectedModel);
  }, [scores, selectedModel]);

  // Fetch evaluations
  const { data: evaluations } = useQuery({
    queryKey: ["/api/evaluations"],
  });

  // Save evaluation mutation
  const saveEvaluationMutation = useMutation({
    mutationFn: async (data: { title: string; model: string; responses: EvaluationResponse; scores: any }) => {
      return apiRequest("POST", "/api/evaluations", data);
    },
    onSuccess: () => {
      toast({ title: "Evaluación guardada exitosamente" });
      queryClient.invalidateQueries({ queryKey: ["/api/evaluations"] });
    },
    onError: () => {
      toast({ title: "Error al guardar la evaluación", variant: "destructive" });
    }
  });

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setResponses({});
  };

  const handleResponseChange = (elementId: string, value: 0 | 1) => {
    setResponses(prev => ({
      ...prev,
      [elementId]: value
    }));
  };

  const handleSaveEvaluation = () => {
    if (!evaluationTitle.trim()) {
      toast({ title: "Por favor ingrese un título para la evaluación", variant: "destructive" });
      return;
    }

    saveEvaluationMutation.mutate({
      title: evaluationTitle,
      model: selectedModel,
      responses,
      scores
    });
  };

  const handleExportData = () => {
    const data = {
      title: evaluationTitle || `Evaluación ${selectedModel}`,
      model: selectedModel,
      timestamp: new Date().toISOString(),
      responses,
      scores
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planbarometro_${selectedModel}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Datos exportados exitosamente" });
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            setSelectedModel(data.model);
            setResponses(data.responses);
            setEvaluationTitle(data.title || "");
            toast({ title: "Datos importados exitosamente" });
          } catch (error) {
            toast({ title: "Error al importar el archivo", variant: "destructive" });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (!currentModel) {
    return <div>Modelo no encontrado</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-cepal-blue text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8" />
              <div>
                <h1 className="text-2xl font-bold">Planbarómetro</h1>
                <p className="text-blue-100 text-sm">Herramienta de Evaluación ILPES-CEPAL</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="title" className="text-white">Título:</Label>
                <Input
                  id="title"
                  value={evaluationTitle}
                  onChange={(e) => setEvaluationTitle(e.target.value)}
                  placeholder="Nombre de la evaluación"
                  className="bg-white text-gray-900"
                />
              </div>
              <Button 
                onClick={handleSaveEvaluation}
                disabled={saveEvaluationMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
              <Button 
                onClick={handleExportData}
                variant="outline"
                className="bg-white text-blue-600 border-white hover:bg-blue-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button 
                onClick={handleImportData}
                variant="outline"
                className="bg-white text-blue-600 border-white hover:bg-blue-50"
              >
                <Upload className="mr-2 h-4 w-4" />
                Importar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Model Selection */}
        <ModelSelector selectedModel={selectedModel} onModelSelect={handleModelSelect} />

        {/* Main Content with Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="evaluation" className="flex items-center space-x-2">
                  <span>📝</span>
                  <span>Evaluación</span>
                </TabsTrigger>
                <TabsTrigger value="results" className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Resultados y Gráficos</span>
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>Alertas Estratégicas</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="evaluation" className="p-6">
              <EvaluationForm
                model={currentModel}
                responses={responses}
                onResponseChange={handleResponseChange}
              />
            </TabsContent>

            <TabsContent value="results" className="p-6">
              <ResultsCharts scores={scores} model={currentModel} />
            </TabsContent>

            <TabsContent value="alerts" className="p-6">
              <StrategicAlerts alerts={alerts} />
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">ILPES-CEPAL</h3>
              <p className="text-gray-300 text-sm">
                Instituto Latinoamericano y del Caribe de Planificación Económica y Social
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Planbarómetro</h3>
              <p className="text-gray-300 text-sm">
                Herramienta de evaluación participativa para mejorar la calidad de la planificación para el desarrollo.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Metodología</h3>
              <p className="text-gray-300 text-sm">
                Basada en criterios de calidad validados por el Consejo Regional de Planificación.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 CEPAL-ILPES. Planbarómetro - Metodología de Evaluación de la Planificación para el Desarrollo</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
