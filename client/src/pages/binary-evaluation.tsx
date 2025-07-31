import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  ArrowLeft,
  Target,
  CheckCircle,
  XCircle,
  BarChart3,
  Users,
  Brain,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { useLocation, Link, useParams } from 'wouter';

interface BinaryCriterion {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface BinaryResponse {
  [criterionId: string]: {
    value: 'present' | 'absent';
    justification?: string;
  };
}

interface ConsensusData {
  criterionId: string;
  criterionName: string;
  presentCount: number;
  absentCount: number;
  consensus: number; // 0-1
  level: 'high' | 'medium' | 'low';
}

const mockCriteria: BinaryCriterion[] = [
  {
    id: 'planning_capacity',
    name: 'Capacidad de Planificación',
    description: 'Existencia de sistemas y procesos formales de planificación estratégica',
    category: 'Técnico'
  },
  {
    id: 'monitoring_systems',
    name: 'Sistemas de Monitoreo',
    description: 'Presencia de mecanismos de seguimiento y evaluación de políticas',
    category: 'Operativo'
  },
  {
    id: 'stakeholder_participation',
    name: 'Participación de Actores',
    description: 'Involucramiento activo de diferentes sectores en la planificación',
    category: 'Político'
  },
  {
    id: 'future_vision',
    name: 'Visión de Futuro',
    description: 'Desarrollo de escenarios y planificación a largo plazo',
    category: 'Prospectivo'
  },
  {
    id: 'coordination_mechanisms',
    name: 'Mecanismos de Coordinación',
    description: 'Estructuras para articular diferentes niveles de gobierno',
    category: 'Operativo'
  }
];

export default function BinaryEvaluation() {
  const { user } = useAuth();
  const { studyId } = useParams<{ studyId: string }>();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [responses, setResponses] = useState<BinaryResponse>({});

  // Mock consensus data
  const mockConsensusData: ConsensusData[] = [
    {
      criterionId: 'planning_capacity',
      criterionName: 'Capacidad de Planificación',
      presentCount: 8,
      absentCount: 2,
      consensus: 0.8,
      level: 'high'
    },
    {
      criterionId: 'monitoring_systems',
      criterionName: 'Sistemas de Monitoreo',
      presentCount: 5,
      absentCount: 5,
      consensus: 0.5,
      level: 'low'
    },
    {
      criterionId: 'stakeholder_participation',
      criterionName: 'Participación de Actores',
      presentCount: 7,
      absentCount: 3,
      consensus: 0.7,
      level: 'medium'
    },
    {
      criterionId: 'future_vision',
      criterionName: 'Visión de Futuro',
      presentCount: 6,
      absentCount: 4,
      consensus: 0.6,
      level: 'medium'
    },
    {
      criterionId: 'coordination_mechanisms',
      criterionName: 'Mecanismos de Coordinación',
      presentCount: 9,
      absentCount: 1,
      consensus: 0.9,
      level: 'high'
    }
  ];

  const submitResponsesMutation = useMutation({
    mutationFn: async (data: BinaryResponse) => {
      await apiRequest('POST', `/api/delphi/studies/${studyId}/responses`, data);
    },
    onSuccess: () => {
      toast({
        title: "Evaluación enviada",
        description: "Tu evaluación ha sido registrada exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/delphi/studies/${studyId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error al enviar evaluación",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Generate random responses for testing
  const fillRandomly = () => {
    const randomResponses: BinaryResponse = {};
    mockCriteria.forEach(criterion => {
      const isPresent = Math.random() > 0.3; // 70% chance of being present
      randomResponses[criterion.id] = {
        value: isPresent ? 'present' : 'absent',
        justification: isPresent ? 
          'Se observan evidencias claras de implementación efectiva.' :
          'No se encontraron evidencias suficientes de implementación.'
      };
    });
    setResponses(randomResponses);
    toast({
      title: "Evaluación completada aleatoriamente",
      description: "Se han generado respuestas aleatorias para pruebas.",
    });
  };

  const handleResponseChange = (criterionId: string, value: 'present' | 'absent') => {
    setResponses(prev => ({
      ...prev,
      [criterionId]: {
        ...prev[criterionId],
        value
      }
    }));
  };

  const handleSubmit = () => {
    const completedResponses = mockCriteria.filter(criterion => 
      responses[criterion.id]?.value
    );

    if (completedResponses.length !== mockCriteria.length) {
      toast({
        title: "Evaluación incompleta",
        description: "Por favor, evalúa todos los criterios.",
        variant: "destructive",
      });
      return;
    }

    submitResponsesMutation.mutate(responses);
  };

  const progressPercentage = (Object.keys(responses).length / mockCriteria.length) * 100;

  const getConsensusColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConsensusLabel = (level: string) => {
    switch (level) {
      case 'high': return 'Alto Consenso';
      case 'medium': return 'Consenso Moderado';
      case 'low': return 'Bajo Consenso';
      default: return 'Sin Datos';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso requerido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Necesitas iniciar sesión para participar en la evaluación
          </p>
          <Link href="/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href={`/delphi/studies/${studyId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Estudio
              </Button>
            </Link>
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Evaluación Delphi - Presente/Ausente
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Evalúa cada criterio como presente o ausente en el contexto analizado
          </p>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progreso de evaluación</span>
              <span>{Object.keys(responses).length} / {mockCriteria.length}</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        <Tabs defaultValue="evaluate" className="space-y-6">
          <TabsList>
            <TabsTrigger value="evaluate">Evaluar</TabsTrigger>
            <TabsTrigger value="consensus">Consenso</TabsTrigger>
            <TabsTrigger value="analysis">Análisis</TabsTrigger>
          </TabsList>

          {/* Evaluation Tab */}
          <TabsContent value="evaluate" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Criterios de Evaluación</CardTitle>
                    <CardDescription>
                      Selecciona "Presente" si existe evidencia del criterio, "Ausente" si no
                    </CardDescription>
                  </div>
                  <Button onClick={fillRandomly} variant="outline" size="sm">
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Llenar Aleatoriamente
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockCriteria.map((criterion, index) => (
                  <div key={criterion.id} className="border rounded-lg p-6 space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg flex-shrink-0">
                        <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {index + 1}. {criterion.name}
                          </h3>
                          <Badge variant="outline">{criterion.category}</Badge>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">
                          {criterion.description}
                        </p>
                      </div>
                    </div>

                    {/* Binary Choice */}
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleResponseChange(criterion.id, 'present')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                          responses[criterion.id]?.value === 'present'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-300'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-green-400'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <CheckCircle className="h-5 w-5" />
                          <span className="font-medium">PRESENTE</span>
                        </div>
                        <p className="text-sm mt-2 opacity-75">
                          Existe evidencia clara del criterio
                        </p>
                      </button>

                      <button
                        onClick={() => handleResponseChange(criterion.id, 'absent')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                          responses[criterion.id]?.value === 'absent'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-300'
                            : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-red-400'
                        }`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <XCircle className="h-5 w-5" />
                          <span className="font-medium">AUSENTE</span>
                        </div>
                        <p className="text-sm mt-2 opacity-75">
                          No hay evidencia suficiente
                        </p>
                      </button>
                    </div>

                    {responses[criterion.id]?.value && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Evaluado como: {responses[criterion.id].value === 'present' ? 'PRESENTE' : 'AUSENTE'}
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-between pt-6">
                  <Link href={`/delphi/studies/${studyId}/feedback`}>
                    <Button variant="outline" size="lg">
                      <Brain className="h-4 w-4 mr-2" />
                      Ver Mi Retroalimentación
                    </Button>
                  </Link>
                  <Button 
                    onClick={handleSubmit}
                    disabled={submitResponsesMutation.isPending || progressPercentage < 100}
                    size="lg"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    {submitResponsesMutation.isPending ? 'Enviando...' : 'Enviar Evaluación'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Consensus Tab */}
          <TabsContent value="consensus" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Análisis de Consenso por Criterio</CardTitle>
                <CardDescription>
                  Nivel de acuerdo entre expertos en evaluaciones presente/ausente
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockConsensusData.map((consensus) => (
                  <div key={consensus.criterionId} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {consensus.criterionName}
                        </h3>
                        <div className={`flex items-center space-x-2 ${getConsensusColor(consensus.level)}`}>
                          <BarChart3 className="h-4 w-4" />
                          <span className="font-medium">{getConsensusLabel(consensus.level)}</span>
                        </div>
                      </div>
                      <Badge variant={consensus.level === 'high' ? 'default' : consensus.level === 'medium' ? 'secondary' : 'destructive'}>
                        {Math.round(consensus.consensus * 100)}% consenso
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-700 dark:text-green-300">PRESENTE</span>
                          </div>
                          <span className="text-2xl font-bold text-green-600">
                            {consensus.presentCount}
                          </span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                          {Math.round((consensus.presentCount / (consensus.presentCount + consensus.absentCount)) * 100)}% de expertos
                        </p>
                      </div>

                      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-700 dark:text-red-300">AUSENTE</span>
                          </div>
                          <span className="text-2xl font-bold text-red-600">
                            {consensus.absentCount}
                          </span>
                        </div>
                        <p className="text-sm text-red-600 mt-1">
                          {Math.round((consensus.absentCount / (consensus.presentCount + consensus.absentCount)) * 100)}% de expertos
                        </p>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-red-500 h-2 rounded-full"
                        style={{
                          background: `linear-gradient(to right, #10b981 ${(consensus.presentCount / (consensus.presentCount + consensus.absentCount)) * 100}%, #ef4444 ${(consensus.presentCount / (consensus.presentCount + consensus.absentCount)) * 100}%)`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Participantes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">10</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Expertos evaluando
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span>Consenso Promedio</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">72%</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Nivel de acuerdo general
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span>Criterios Evaluados</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{mockCriteria.length}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total de elementos
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Resumen de Evaluación</CardTitle>
                <CardDescription>
                  Distribución general de respuestas presente/ausente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Criterios con Alto Consenso</span>
                    <Badge variant="default">
                      {mockConsensusData.filter(c => c.level === 'high').length} / {mockConsensusData.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Criterios con Bajo Consenso</span>
                    <Badge variant="destructive">
                      {mockConsensusData.filter(c => c.level === 'low').length} / {mockConsensusData.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">Promedio "Presente"</span>
                    <span className="font-semibold text-green-600">
                      {Math.round((mockConsensusData.reduce((acc, c) => acc + c.presentCount, 0) / 
                        mockConsensusData.reduce((acc, c) => acc + c.presentCount + c.absentCount, 0)) * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}