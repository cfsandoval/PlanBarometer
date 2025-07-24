import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { StrategicAlert, EvaluationScores, Model } from "@/types/planbarometro";
import { useToast } from "@/hooks/use-toast";

interface CustomAlertsEditorProps {
  customAlerts: StrategicAlert[];
  onUpdateCustomAlerts: (alerts: StrategicAlert[]) => void;
  scores: EvaluationScores;
  model: Model;
}

interface AlertFormData {
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
  criteriaThreshold: number;
  selectedCriteria: string[];
  riskLevel: number;
  impactLevel: number;
  urgencyLevel: number;
}

const initialFormData: AlertFormData = {
  title: '',
  description: '',
  severity: 'medium',
  recommendation: '',
  criteriaThreshold: 50,
  selectedCriteria: [],
  riskLevel: 50,
  impactLevel: 50,
  urgencyLevel: 50
};

export default function CustomAlertsEditor({ customAlerts, onUpdateCustomAlerts, scores, model }: CustomAlertsEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<StrategicAlert | null>(null);
  const [formData, setFormData] = useState<AlertFormData>(initialFormData);
  const { toast } = useToast();

  // Get all available criteria with their current scores
  const availableCriteria = model.dimensions.flatMap((dimension, dimIndex) =>
    dimension.criteria.map((criterion, critIndex) => ({
      id: `${dimIndex}-${critIndex}`,
      name: `${dimension.name}: ${criterion.name}`,
      score: scores.dimensions[dimIndex]?.criteria[critIndex]?.percentage || 0
    }))
  );

  const handleOpenDialog = (alert?: StrategicAlert) => {
    if (alert) {
      setEditingAlert(alert);
      setFormData({
        title: alert.title,
        description: alert.description,
        severity: alert.severity,
        recommendation: alert.recommendation || '',
        criteriaThreshold: 50, // Default threshold
        selectedCriteria: alert.criteria,
        riskLevel: alert.metrics?.riskLevel || 50,
        impactLevel: alert.metrics?.impactLevel || 50,
        urgencyLevel: alert.metrics?.urgencyLevel || 50
      });
    } else {
      setEditingAlert(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAlert(null);
    setFormData(initialFormData);
  };

  const handleSaveAlert = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Error",
        description: "El título y la descripción son obligatorios",
        variant: "destructive"
      });
      return;
    }

    if (formData.selectedCriteria.length === 0) {
      toast({
        title: "Error", 
        description: "Debe seleccionar al menos un criterio",
        variant: "destructive"
      });
      return;
    }

    const newAlert: StrategicAlert = {
      id: editingAlert?.id || `custom-${Date.now()}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      severity: formData.severity,
      criteria: formData.selectedCriteria,
      recommendation: formData.recommendation.trim(),
      metrics: {
        riskLevel: formData.riskLevel,
        impactLevel: formData.impactLevel,
        urgencyLevel: formData.urgencyLevel
      }
    };

    let updatedAlerts: StrategicAlert[];
    if (editingAlert) {
      updatedAlerts = customAlerts.map(alert => 
        alert.id === editingAlert.id ? newAlert : alert
      );
    } else {
      updatedAlerts = [...customAlerts, newAlert];
    }

    onUpdateCustomAlerts(updatedAlerts);
    handleCloseDialog();
    
    toast({
      title: editingAlert ? "Alerta actualizada" : "Alerta creada",
      description: "La alerta personalizada ha sido guardada correctamente"
    });
  };

  const handleDeleteAlert = (alertId: string) => {
    const updatedAlerts = customAlerts.filter(alert => alert.id !== alertId);
    onUpdateCustomAlerts(updatedAlerts);
    toast({
      title: "Alerta eliminada",
      description: "La alerta personalizada ha sido eliminada"
    });
  };

  const handleCriteriaToggle = (criteriaName: string) => {
    const isSelected = formData.selectedCriteria.includes(criteriaName);
    const newSelectedCriteria = isSelected
      ? formData.selectedCriteria.filter(c => c !== criteriaName)
      : [...formData.selectedCriteria, criteriaName];
    
    setFormData({ ...formData, selectedCriteria: newSelectedCriteria });
  };

  // Check if alert conditions are met based on current scores
  const isAlertTriggered = (alert: StrategicAlert) => {
    return alert.criteria.some(criteriaName => {
      const criteria = availableCriteria.find(c => c.name === criteriaName);
      return criteria && criteria.score < 50; // Default threshold
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Alertas Personalizadas</h3>
          <p className="text-sm text-gray-600">Cree alertas basadas en niveles específicos de criterios</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => handleOpenDialog()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Alerta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAlert ? 'Editar Alerta Personalizada' : 'Crear Nueva Alerta'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título de la Alerta</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Baja capacidad técnica en áreas críticas"
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describa el problema o situación que identifica esta alerta..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="severity">Nivel de Severidad</Label>
                <Select 
                  value={formData.severity} 
                  onValueChange={(value: 'high' | 'medium' | 'low') => 
                    setFormData({...formData, severity: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alto Riesgo</SelectItem>
                    <SelectItem value="medium">Riesgo Medio</SelectItem>
                    <SelectItem value="low">Bajo Riesgo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Criterios Involucrados</Label>
                <div className="max-h-40 overflow-y-auto border rounded p-3 space-y-2">
                  {availableCriteria.map((criteria) => (
                    <div key={criteria.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={criteria.id}
                          checked={formData.selectedCriteria.includes(criteria.name)}
                          onChange={() => handleCriteriaToggle(criteria.name)}
                          className="rounded"
                        />
                        <label htmlFor={criteria.id} className="text-sm">
                          {criteria.name}
                        </label>
                      </div>
                      <span className="text-xs text-gray-500">({criteria.score}%)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="recommendation">Recomendación</Label>
                <Textarea
                  id="recommendation"
                  value={formData.recommendation}
                  onChange={(e) => setFormData({...formData, recommendation: e.target.value})}
                  placeholder="Qué acciones se recomiendan para abordar esta situación..."
                  className="min-h-[60px]"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="riskLevel">Nivel de Riesgo (0-100)</Label>
                  <Input
                    id="riskLevel"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({...formData, riskLevel: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="impactLevel">Nivel de Impacto (0-100)</Label>
                  <Input
                    id="impactLevel"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.impactLevel}
                    onChange={(e) => setFormData({...formData, impactLevel: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label htmlFor="urgencyLevel">Nivel de Urgencia (0-100)</Label>
                  <Input
                    id="urgencyLevel"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.urgencyLevel}
                    onChange={(e) => setFormData({...formData, urgencyLevel: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleCloseDialog}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveAlert}>
                  <Save className="h-4 w-4 mr-2" />
                  {editingAlert ? 'Actualizar' : 'Crear'} Alerta
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {customAlerts.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">No hay alertas personalizadas configuradas.</p>
            <p className="text-sm text-gray-500 mt-2">
              Cree alertas basadas en criterios específicos para identificar situaciones particulares.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {customAlerts.map((alert) => {
            const isTriggered = isAlertTriggered(alert);
            return (
              <Card key={alert.id} className={`border-l-4 ${
                isTriggered ? 'border-l-red-500 bg-red-50' : 'border-l-gray-300'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800">{alert.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {alert.severity === 'high' ? 'Alto' : 
                           alert.severity === 'medium' ? 'Medio' : 'Bajo'}
                        </span>
                        {isTriggered && (
                          <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                            ACTIVADA
                          </span>
                        )}
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{alert.description}</p>
                      <div className="text-xs text-gray-600">
                        <strong>Criterios:</strong> {alert.criteria.join(', ')}
                      </div>
                      {alert.recommendation && (
                        <div className="text-xs text-gray-600 mt-1">
                          <strong>Recomendación:</strong> {alert.recommendation}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Button
                        onClick={() => handleOpenDialog(alert)}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteAlert(alert.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}