import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Save, Download, Upload, BarChart3, Shuffle, Edit, Copy } from "lucide-react";

import ModelSelector from "@/components/model-selector";
import EvaluationForm from "@/components/evaluation-form";
import ResultsCharts from "@/components/results-charts";
import StrategicAlerts from "@/components/strategic-alerts";
import CustomAlertsEditor from "@/components/custom-alerts-editor";
import DimensionRadarCharts from "@/components/dimension-radar-charts";
import WorkshopCollaboration from "@/components/workshop-collaboration";

import { MODELS } from "@/lib/planbarometro-data";
import { calculateScores } from "@/lib/scoring-engine";
import { generateStrategicAlerts } from "@/lib/alerts-engine";
import { apiRequest } from "@/lib/queryClient";
import { EvaluationResponse, EvaluationJustifications, EvaluationData, StrategicAlert, Model } from "@/types/planbarometro";
import { t } from "@/lib/i18n";

export default function Home() {
  const [selectedModel, setSelectedModel] = useState("topp");
  const [responses, setResponses] = useState<EvaluationResponse>({});
  const [justifications, setJustifications] = useState<EvaluationJustifications>({});
  const [evaluationTitle, setEvaluationTitle] = useState("");
  const [exerciseCode, setExerciseCode] = useState("");
  const [groupCode, setGroupCode] = useState("");
  const [country, setCountry] = useState("");
  const [territory, setTerritory] = useState("");
  const [activeTab, setActiveTab] = useState("evaluation");
  const [isEditMode, setIsEditMode] = useState(false);
  const [customModel, setCustomModel] = useState<any>(null);
  const [customAlerts, setCustomAlerts] = useState<StrategicAlert[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current model data
  const currentModel = customModel || MODELS.find(m => m.id === selectedModel);
  
  // Check if evaluation is complete
  const totalElements = useMemo(() => {
    if (!currentModel) return 0;
    return currentModel.dimensions.reduce((total: number, dim: any) => 
      total + dim.criteria.reduce((critTotal: number, crit: any) => critTotal + crit.elements.length, 0), 0
    );
  }, [currentModel]);
  
  const answeredElements = Object.keys(responses).length;
  const isEvaluationComplete = answeredElements === totalElements && totalElements > 0;
  
  // Calculate scores
  const scores = useMemo(() => {
    if (!currentModel) return { overall: 0, dimensions: [] };
    return calculateScores(responses, currentModel);
  }, [responses, currentModel]);

  // Generate alerts (automatic + custom)
  const alerts = useMemo(() => {
    if (!isEvaluationComplete) return [];
    const automaticAlerts = generateStrategicAlerts(scores, selectedModel, responses);
    return [...automaticAlerts, ...customAlerts];
  }, [scores, selectedModel, responses, isEvaluationComplete, customAlerts]);

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
    const codeInfo = exerciseCode ? ` - Ejercicio ${exerciseCode}` : '';
    const groupInfo = groupCode ? ` - Grupo ${groupCode}` : '';
    return `Evaluación ${modelName}${codeInfo}${groupInfo} - ${timestamp}`;
  };

  // Complete evaluation randomly for testing
  const handleRandomComplete = () => {
    if (!currentModel) return;
    
    const newResponses: EvaluationResponse = {};
    currentModel.dimensions.forEach((dimension: any, dimIndex: number) => {
      dimension.criteria.forEach((criterion: any, critIndex: number) => {
        criterion.elements.forEach((element: any, elemIndex: number) => {
          // Use the actual element ID from the data structure
          const elementId = element.id;
          // Random response: 70% chance of 1, 30% chance of 0
          newResponses[elementId] = Math.random() > 0.3 ? 1 : 0;
        });
      });
    });
    
    setResponses(newResponses);
    toast({
      title: "Evaluación completada",
      description: "Se han generado respuestas aleatorias para testing",
    });
  };

  // Auto-complete evaluation randomly when page loads
  useEffect(() => {
    if (currentModel && Object.keys(responses).length === 0) {
      // Auto-complete only if no responses exist yet
      handleRandomComplete();
    }
  }, [currentModel]); // Re-run when model changes

  // Toggle edit mode and create custom model copy
  const handleToggleEditMode = () => {
    if (!isEditMode && currentModel) {
      // Create a deep copy for editing
      setCustomModel(JSON.parse(JSON.stringify(currentModel)));
    }
    setIsEditMode(!isEditMode);
  };

  // Save custom model changes
  const handleSaveCustomModel = () => {
    setIsEditMode(false);
    toast({
      title: "Cambios guardados",
      description: "La estructura personalizada ha sido guardada",
    });
  };

  // Save evaluation mutation
  const saveEvaluationMutation = useMutation({
    mutationFn: async (data: { 
      title: string; 
      model: string; 
      exerciseCode?: string;
      groupCode?: string;
      country?: string;
      territory?: string;
      responses: EvaluationResponse; 
      justifications: EvaluationJustifications; 
      scores: any;
      customStructure?: any;
      customAlerts?: StrategicAlert[];
    }) => {
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
    
    // Broadcast change to workshop participants
    if ((window as any).workshopCollaboration) {
      (window as any).workshopCollaboration.broadcastResponseUpdate(elementId, value);
    }
  };

  const handleJustificationChange = (elementId: string, justification: string) => {
    setJustifications(prev => ({
      ...prev,
      [elementId]: justification
    }));
  };

  const handleCollaborativeResponseUpdate = (elementId: string, value: number) => {
    setResponses(prev => ({ ...prev, [elementId]: value as 0 | 1 }));
  };

  const handleCollaborativeEvaluationUpdate = (data: any) => {
    if (data.title) setEvaluationTitle(data.title);
    if (data.responses) setResponses(data.responses);
    if (data.justifications) setJustifications(data.justifications);
  };

  const handleSaveEvaluation = () => {
    const finalTitle = evaluationTitle.trim() || generateAutomaticTitle();

    saveEvaluationMutation.mutate({
      title: finalTitle,
      model: selectedModel,
      exerciseCode: exerciseCode || undefined,
      groupCode: groupCode || undefined,
      country: country || undefined,
      territory: territory || undefined,
      responses,
      justifications,
      scores,
      customStructure: customModel || undefined,
      customAlerts: customAlerts
    });

    // Broadcast evaluation save to workshop participants
    if ((window as any).workshopCollaboration) {
      (window as any).workshopCollaboration.broadcastEvaluationUpdate({
        title: finalTitle,
        model: selectedModel,
        responses,
        justifications,
        scores
      });
    }
  };

  const handleExportPDF = async () => {
    if (!isEvaluationComplete) {
      toast({
        title: t('evaluationNotComplete'),
        description: t('evaluationNotComplete'),
        variant: "destructive"
      });
      return;
    }
    
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
      pdf.text(t('appTitle'), pageWidth / 2, 30, { align: 'center' });
      pdf.text(`${t('selectModel')}: ${currentModel?.name}`, pageWidth / 2, 40, { align: 'center' });
      if (exerciseCode) pdf.text(`${t('exerciseCode')}: ${exerciseCode}`, pageWidth / 2, 50, { align: 'center' });
      if (groupCode) pdf.text(`${t('groupCode')}: ${groupCode}`, pageWidth / 2, 60, { align: 'center' });
      pdf.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, pageWidth / 2, 70, { align: 'center' });
      
      let yPosition = 80;
      
      // Summary scores
      pdf.setFontSize(14);
      pdf.text(t('evaluationResults'), 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.text(`${t('overallScore')}: ${scores.overall}%`, 20, yPosition);
      yPosition += 8;
      
      scores.dimensions.forEach((dim, index) => {
        pdf.text(`${currentModel?.dimensions[index]?.name}: ${dim.percentage}%`, 20, yPosition);
        yPosition += 6;
      });
      
      yPosition += 10;
      
      // Capture charts if evaluation is complete
      if (isEvaluationComplete) {
        try {
          // Wait for charts to render completely
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const chartContainer = document.querySelector('[data-chart-container]') as HTMLElement;
          if (chartContainer) {
            const canvas = await html2canvas(chartContainer, {
              scale: 2,
              backgroundColor: '#ffffff',
              useCORS: true,
              allowTaint: true,
              logging: false,
              width: chartContainer.scrollWidth,
              height: chartContainer.scrollHeight
            });
            
            const imgData = canvas.toDataURL('image/png', 1.0);
            const imgWidth = pageWidth - 40;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add new page if needed
            if (yPosition + imgHeight + 20 > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }
            
            pdf.setFontSize(14);
            pdf.text(t('charts'), 20, yPosition);
            yPosition += 15;
            
            pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
            yPosition += imgHeight + 15;
          }
        } catch (chartError) {
          console.warn('Error capturing charts:', chartError);
          pdf.setFontSize(12);
          pdf.text('(Los gráficos no pudieron ser incluidos en esta exportación)', 20, yPosition);
          yPosition += 15;
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
      
      toast({ title: t('pdfExportSuccess') });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({ title: t('pdfExportError'), variant: "destructive" });
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
            setExerciseCode(data.exerciseCode || "");
            setGroupCode(data.groupCode || "");
            setCountry(data.country || "");
            setTerritory(data.territory || "");
            if (data.customStructure) {
              setCustomModel(data.customStructure);
            }
            if (data.customAlerts) {
              setCustomAlerts(data.customAlerts);
            }
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
              {/* Navigation Links */}
              <nav className="flex items-center space-x-6">
                <a href="/" className="text-white hover:text-blue-200 text-sm font-medium transition-colors">
                  Inicio
                </a>
                <a href="/best-practices" className="text-white hover:text-blue-200 text-sm font-medium transition-colors">
                  Buenas Prácticas
                </a>
                <a href="/delphi" className="text-white hover:text-blue-200 text-sm font-medium transition-colors">
                  Sistema RT Delphi
                </a>
              </nav>
              
              {/* Form fields */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Label htmlFor="country-field" className="text-white text-sm">{t('country')}:</Label>
                <Input
                  id="country-field"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t('countryPlaceholder')}
                  className="bg-white text-gray-900 w-24 text-sm"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <Label htmlFor="territory-field" className="text-white text-sm">{t('territory')}:</Label>
                <Input
                  id="territory-field"
                  value={territory}
                  onChange={(e) => setTerritory(e.target.value)}
                  placeholder={t('territoryPlaceholder')}
                  className="bg-white text-gray-900 w-24 text-sm"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <Label htmlFor="exercise-code" className="text-white text-sm">{t('exerciseCode')}:</Label>
                <Input
                  id="exercise-code"
                  value={exerciseCode}
                  onChange={(e) => setExerciseCode(e.target.value)}
                  placeholder={t('exerciseCodePlaceholder')}
                  className="bg-white text-gray-900 w-24 text-sm"
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <Label htmlFor="group-code" className="text-white text-sm">{t('groupCode')}:</Label>
                <Input
                  id="group-code"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value)}
                  placeholder={t('groupCodePlaceholder')}
                  className="bg-white text-gray-900 w-24 text-sm"
                  />
                </div>
                <Button 
                onClick={handleSaveEvaluation}
                disabled={saveEvaluationMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {t('save')}
              </Button>
              <Button 
                onClick={handleExportPDF}
                variant="outline"
                className="bg-white text-blue-600 border-white hover:bg-blue-50"
              >
                <Download className="mr-2 h-4 w-4" />
                {t('exportPdf')}
              </Button>
              <Button 
                onClick={handleImportData}
                variant="outline"
                className="bg-white text-blue-600 border-white hover:bg-blue-50"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Collaborative Workshop */}
        <div className="mb-6">
          <WorkshopCollaboration
            onResponseUpdate={handleCollaborativeResponseUpdate}
            onEvaluationUpdate={handleCollaborativeEvaluationUpdate}
            currentResponses={responses}
            evaluationData={{ title: evaluationTitle, model: selectedModel, responses, justifications, scores }}
          />
        </div>

        {/* Model Selection */}
        <ModelSelector selectedModel={selectedModel} onModelSelect={handleModelSelect} />

        {/* Evaluation Title - Centered */}
        {evaluationTitle && (
          <Card className="mb-4">
            <CardContent className="py-4">
              <h2 className="text-xl font-bold text-center text-gray-800">{evaluationTitle}</h2>
            </CardContent>
          </Card>
        )}

        {/* Main Content with Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="evaluation" className="flex items-center space-x-2">
                  <span>📝</span>
                  <span>{t('evaluation')}</span>
                </TabsTrigger>
                <TabsTrigger value="results" className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>{t('results')}</span>
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>{t('strategicAlerts')}</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="evaluation" className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <Button
                    onClick={handleToggleEditMode}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>{isEditMode ? "View Mode" : t('editStructure')}</span>
                  </Button>
                  {isEditMode && (
                    <Button
                      onClick={handleSaveCustomModel}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {t('save')}
                    </Button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleRandomComplete}
                    variant="outline"
                    className="flex items-center space-x-2 bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                  >
                    <Shuffle className="h-4 w-4" />
                    <span>{t('completeRandomly')}</span>
                  </Button>
                </div>
              </div>
              <EvaluationForm
                model={currentModel}
                responses={responses}
                justifications={justifications}
                onResponseChange={handleResponseChange}
                onJustificationChange={handleJustificationChange}
                isEditMode={isEditMode}
                onModelChange={setCustomModel}
              />
            </TabsContent>

            <TabsContent value="results" className="p-6">
              {!isEvaluationComplete ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 max-w-md">
                    <div className="text-amber-600 text-4xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">
                      {t('evaluationNotComplete')}
                    </h3>
                    <p className="text-amber-700 mb-4">
                      {t('evaluationNotComplete')}
                    </p>
                    <div className="text-sm text-amber-600">
                      {t('completion')}: {answeredElements}/{totalElements}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div data-chart-container id="dimension-radar-charts">
                    <DimensionRadarCharts 
                      scores={scores} 
                      model={currentModel as Model} 
                      responses={responses}
                    />
                  </div>
                  <div data-chart-container id="results-charts">
                    <ResultsCharts scores={scores} model={currentModel} />
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="alerts" className="p-6">
              {!isEvaluationComplete ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md">
                    <div className="text-blue-600 text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      {t('strategicAlertsTitle')}
                    </h3>
                    <p className="text-blue-700 mb-4">
                      {t('evaluationNotComplete')}
                    </p>
                    <div className="text-sm text-blue-600">
                      {t('completion')}: {answeredElements}/{totalElements}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <StrategicAlerts alerts={alerts} />
                  <CustomAlertsEditor 
                    customAlerts={customAlerts}
                    onUpdateCustomAlerts={setCustomAlerts}
                    scores={scores}
                    model={currentModel as Model}
                  />
                </div>
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
