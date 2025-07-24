import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Download, Upload, BarChart3 } from "lucide-react";

import ModelSelector from "@/components/model-selector";
import EvaluationForm from "@/components/evaluation-form";
import ResultsCharts from "@/components/results-charts";
import StrategicAlerts from "@/components/strategic-alerts";

import { MODELS } from "@/lib/planbarometro-data";
import { calculateScores } from "@/lib/scoring-engine";
import { generateStrategicAlerts } from "@/lib/alerts-engine";
import { apiRequest } from "@/lib/queryClient";
import { EvaluationResponse, EvaluationJustifications, EvaluationData } from "@/types/planbarometro";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("topp");
  const [responses, setResponses] = useState<EvaluationResponse>({});
  const [justifications, setJustifications] = useState<EvaluationJustifications>({});
  const [evaluationTitle, setEvaluationTitle] = useState("");
  const [activeTab, setActiveTab] = useState("evaluation");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current model data
  const currentModel = MODELS.find(m => m.id === selectedModel);
  
  // Check if evaluation is complete
  const totalElements = useMemo(() => {
    if (!currentModel) return 0;
    return currentModel.dimensions.reduce((total, dim) => 
      total + dim.criteria.reduce((critTotal, crit) => critTotal + crit.elements.length, 0), 0
    );
  }, [currentModel]);
  
  const answeredElements = Object.keys(responses).length;
  const isEvaluationComplete = answeredElements === totalElements && totalElements > 0;
  
  // Calculate scores
  const scores = useMemo(() => {
    if (!currentModel) return { overall: 0, dimensions: [] };
    return calculateScores(responses, currentModel);
  }, [responses, currentModel]);

  // Generate alerts
  const alerts = useMemo(() => {
    if (!isEvaluationComplete) return [];
    return generateStrategicAlerts(scores, selectedModel, responses);
  }, [scores, selectedModel, responses, isEvaluationComplete]);

  // Fetch evaluations
  const { data: evaluations } = useQuery({
    queryKey: ["/api/evaluations"],
  });

  // Generate automatic title
  const generateAutomaticTitle = () => {
    const modelName = MODELS.find(m => m.id === selectedModel)?.name || selectedModel;
    const timestamp = new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `Evaluación ${modelName} - ${timestamp}`;
  };

  // Save evaluation mutation
  const saveEvaluationMutation = useMutation({
    mutationFn: async (data: { title: string; model: string; responses: EvaluationResponse; justifications: EvaluationJustifications; scores: any }) => {
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
    setJustifications({});
  };

  const handleResponseChange = (elementId: string, value: 0 | 1) => {
    setResponses(prev => ({
      ...prev,
      [elementId]: value
    }));
  };

  const handleJustificationChange = (elementId: string, justification: string) => {
    setJustifications(prev => ({
      ...prev,
      [elementId]: justification
    }));
  };

  const handleSaveEvaluation = () => {
    const finalTitle = evaluationTitle.trim() || generateAutomaticTitle();

    saveEvaluationMutation.mutate({
      title: finalTitle,
      model: selectedModel,
      responses,
      justifications,
      scores
    });
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Title
      const title = evaluationTitle || generateAutomaticTitle();
      pdf.setFontSize(16);
      pdf.text(title, pageWidth / 2, 20, { align: 'center' });
      
      // Subtitle
      pdf.setFontSize(12);
      pdf.text('Reporte de Evaluación Planbarómetro', pageWidth / 2, 30, { align: 'center' });
      pdf.text(`Modelo: ${currentModel?.name}`, pageWidth / 2, 40, { align: 'center' });
      pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 50, { align: 'center' });
      
      let yPosition = 60;
      
      // Summary scores
      pdf.setFontSize(14);
      pdf.text('Resumen de Puntuaciones', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.text(`Puntuación General: ${scores.overall}%`, 20, yPosition);
      yPosition += 8;
      
      scores.dimensions.forEach((dim, index) => {
        pdf.text(`${currentModel?.dimensions[index]?.name}: ${dim.percentage}%`, 20, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
      
      // Try to capture charts if available
      const chartsElement = document.querySelector('[data-chart-container]');
      if (chartsElement) {
        try {
          const canvas = await html2canvas(chartsElement as HTMLElement, {
            scale: 1,
            useCORS: true
          });
          
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.log('Could not capture charts:', error);
        }
      }
      
      // Detailed scores by criteria
      if (yPosition + 60 > pageHeight - 20) {
        pdf.addPage();
        yPosition = 20;
      }
      
      pdf.setFontSize(14);
      pdf.text('Detalle por Criterios', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(9);
      scores.dimensions.forEach((dim, dimIndex) => {
        if (yPosition + 30 > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(11);
        pdf.text(`${currentModel?.dimensions[dimIndex]?.name} (${dim.percentage}%)`, 20, yPosition);
        yPosition += 8;
        
        pdf.setFontSize(9);
        dim.criteria.forEach((crit, critIndex) => {
          if (yPosition + 6 > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }
          
          const criterionName = currentModel?.dimensions[dimIndex]?.criteria[critIndex]?.name || `Criterio ${critIndex + 1}`;
          pdf.text(`  ${dimIndex + 1}.${critIndex + 1} ${criterionName}: ${crit.percentage}%`, 25, yPosition);
          yPosition += 6;
        });
        yPosition += 5;
      });
      
      // Save PDF
      const fileName = `planbarometro_${selectedModel}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({ title: "PDF exportado exitosamente" });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ title: "Error al generar el PDF", variant: "destructive" });
    }
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
            setJustifications(data.justifications || {});
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
                  placeholder="Opcional - Se generará automáticamente"
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
                onClick={handleExportPDF}
                variant="outline"
                className="bg-white text-blue-600 border-white hover:bg-blue-50"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
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
                justifications={justifications}
                onResponseChange={handleResponseChange}
                onJustificationChange={handleJustificationChange}
              />
            </TabsContent>

            <TabsContent value="results" className="p-6">
              {!isEvaluationComplete ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 max-w-md">
                    <div className="text-amber-600 text-4xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">
                      Evaluación Incompleta
                    </h3>
                    <p className="text-amber-700 mb-4">
                      Los gráficos y análisis se mostrarán cuando haya completado la evaluación de todos los elementos.
                    </p>
                    <div className="text-sm text-amber-600">
                      Progreso: {answeredElements}/{totalElements} elementos respondidos
                    </div>
                  </div>
                </div>
              ) : (
                <div data-chart-container>
                  <ResultsCharts scores={scores} model={currentModel} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="p-6">
              {!isEvaluationComplete ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md">
                    <div className="text-blue-600 text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Alertas No Disponibles
                    </h3>
                    <p className="text-blue-700 mb-4">
                      Las alertas estratégicas se generarán automáticamente cuando complete la evaluación de todos los elementos.
                    </p>
                    <div className="text-sm text-blue-600">
                      Progreso: {answeredElements}/{totalElements} elementos respondidos
                    </div>
                  </div>
                </div>
              ) : (
                <StrategicAlerts alerts={alerts} />
              )}
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
