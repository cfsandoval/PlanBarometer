import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Target,
  Users,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Star,
  BarChart3,
  Eye,
  Save,
  Brain
} from 'lucide-react';
import { useLocation, Link, useParams } from 'wouter';

interface DelphiStudy {
  id: number;
  title: string;
  description: string;
  status: string;
  rounds: number;
  currentRound: number;
  groupId: number;
}

interface EvaluationCriterion {
  id: string;
  name: string;
  description: string;
  weight?: number;
}

interface ExpertResponse {
  id: string;
  expertId: number;
  criterionId: string;
  score: number;
  justification: string;
  round: number;
  submittedAt: string;
  expert: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

interface ConsensusMetrics {
  criterionId: string;
  meanScore: number;
  standardDeviation: number;
  consensusLevel: 'high' | 'medium' | 'low';
  responseCount: number;
}

const mockCriteria: EvaluationCriterion[] = [
  {
    id: 'crit1',
    name: 'Viabilidad Técnica',
    description: 'Evalúa la factibilidad técnica de implementación',
    weight: 0.25
  },
  {
    id: 'crit2', 
    name: 'Impacto Social',
    description: 'Mide el beneficio esperado para la sociedad',
    weight: 0.30
  },
  {
    id: 'crit3',
    name: 'Costo-Beneficio',
    description: 'Relación entre inversión requerida y retorno esperado',
    weight: 0.25
  },
  {
    id: 'crit4',
    name: 'Sostenibilidad',
    description: 'Capacidad de mantener los resultados a largo plazo',
    weight: 0.20
  }
];

export default function DelphiEvaluation() {
  const { user } = useAuth();
  const { studyId } = useParams<{ studyId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [responses, setResponses] = useState<{[key: string]: {score: number, justification: string}}>({});
  const [activeTab, setActiveTab] = useState('evaluate');

  // Fetch study details
  const { data: study, isLoading: studyLoading } = useQuery<DelphiStudy>({
    queryKey: ['/api/delphi/studies', studyId],
    queryFn: async () => {
      const response = await fetch(`/api/delphi/studies/${studyId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    enabled: !!studyId,
  });

  // Mock data for expert responses and consensus
  const mockExpertResponses: ExpertResponse[] = [
    {
      id: '1',
      expertId: 1,
      criterionId: 'crit1',
      score: 8,
      justification: 'La tecnología está madura y disponible',
      round: 1,
      submittedAt: '2025-01-30T10:00:00Z',
      expert: { id: 1, username: 'expert1', firstName: 'Ana', lastName: 'García' }
    },
    {
      id: '2',
      expertId: 2,
      criterionId: 'crit1',
      score: 7,
      justification: 'Requiere algunos ajustes pero es factible',
      round: 1,
      submittedAt: '2025-01-30T11:00:00Z',
      expert: { id: 2, username: 'expert2', firstName: 'Carlos', lastName: 'Ruiz' }
    },
    {
      id: '3',
      expertId: 1,
      criterionId: 'crit2',
      score: 9,
      justification: 'Alto impacto en comunidades vulnerables',
      round: 1,
      submittedAt: '2025-01-30T10:00:00Z',
      expert: { id: 1, username: 'expert1', firstName: 'Ana', lastName: 'García' }
    },
    {
      id: '4',
      expertId: 2,
      criterionId: 'crit2',
      score: 6,
      justification: 'Impacto moderado, necesita más análisis',
      round: 1,
      submittedAt: '2025-01-30T11:00:00Z',
      expert: { id: 2, username: 'expert2', firstName: 'Carlos', lastName: 'Ruiz' }
    }
  ];

  const calculateConsensus = (criterionId: string): ConsensusMetrics => {
    const criterionResponses = mockExpertResponses.filter(r => r.criterionId === criterionId);
    if (criterionResponses.length === 0) {
      return {
        criterionId,
        meanScore: 0,
        standardDeviation: 0,
        consensusLevel: 'low',
        responseCount: 0
      };
    }

    const scores = criterionResponses.map(r => r.score);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    let consensusLevel: 'high' | 'medium' | 'low';
    if (stdDev <= 1) consensusLevel = 'high';
    else if (stdDev <= 2) consensusLevel = 'medium';
    else consensusLevel = 'low';

    return {
      criterionId,
      meanScore: mean,
      standardDeviation: stdDev,
      consensusLevel,
      responseCount: criterionResponses.length
    };
  };

  const submitResponsesMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Evaluación enviada",
        description: "Tus respuestas han sido guardadas exitosamente.",
      });
      setActiveTab('consensus');
    },
    onError: (error: Error) => {
      toast({
        title: "Error al enviar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScoreChange = (criterionId: string, score: number) => {
    setResponses(prev => ({
      ...prev,
      [criterionId]: {
        score,
        justification: prev[criterionId]?.justification || ''
      }
    }));
  };

  const handleJustificationChange = (criterionId: string, justification: string) => {
    setResponses(prev => ({
      ...prev,
      [criterionId]: {
        score: prev[criterionId]?.score || 0,
        justification
      }
    }));
  };

  const handleSubmit = () => {
    const hasAllResponses = mockCriteria.every(criterion => 
      responses[criterion.id]?.score > 0 && responses[criterion.id]?.justification?.trim()
    );

    if (!hasAllResponses) {
      toast({
        title: "Evaluación incompleta",
        description: "Por favor, califica todos los criterios y proporciona justificaciones.",
        variant: "destructive",
      });
      return;
    }

    submitResponsesMutation.mutate(responses);
  };

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

  if (studyLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando evaluación...</p>
        </div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Estudio no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El estudio que buscas no existe o no tienes permisos para evaluarlo.
          </p>
          <Link href="/delphi">
            <Button>Volver al Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const completedCriteria = Object.keys(responses).filter(key => 
    responses[key]?.score > 0 && responses[key]?.justification?.trim()
  ).length;
  const progressPercentage = (completedCriteria / mockCriteria.length) * 100;

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
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Evaluación Delphi
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {study.title}
              </p>
              <div className="flex items-center space-x-4">
                <Badge variant="outline">Ronda {study.currentRound} de {study.rounds}</Badge>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Users className="h-4 w-4 mr-1" />
                  {mockExpertResponses.length} respuestas
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progreso de Evaluación
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {completedCriteria} de {mockCriteria.length} criterios
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="evaluate" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Evaluar</span>
            </TabsTrigger>
            <TabsTrigger value="consensus" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Consenso</span>
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Respuestas</span>
            </TabsTrigger>
          </TabsList>

          {/* Evaluation Tab */}
          <TabsContent value="evaluate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Criterios de Evaluación</CardTitle>
                <CardDescription>
                  Califica cada criterio del 1 al 10 y proporciona tu justificación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockCriteria.map((criterion, index) => (
                  <div key={criterion.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {index + 1}. {criterion.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {criterion.description}
                        </p>
                        {criterion.weight && (
                          <span className="text-sm text-blue-600 dark:text-blue-400">
                            Peso: {(criterion.weight * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score Selection */}
                    <div>
                      <Label className="text-sm font-medium">Puntuación (1-10)</Label>
                      <div className="flex space-x-2 mt-2">
                        {[...Array(10)].map((_, i) => {
                          const score = i + 1;
                          const isSelected = responses[criterion.id]?.score === score;
                          return (
                            <button
                              key={score}
                              onClick={() => handleScoreChange(criterion.id, score)}
                              className={`w-10 h-10 rounded-full border-2 text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
                              }`}
                            >
                              {score}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Justification */}
                    <div>
                      <Label htmlFor={`justification-${criterion.id}`} className="text-sm font-medium">
                        Justificación
                      </Label>
                      <Textarea
                        id={`justification-${criterion.id}`}
                        placeholder="Explica tu calificación y razonamiento..."
                        value={responses[criterion.id]?.justification || ''}
                        onChange={(e) => handleJustificationChange(criterion.id, e.target.value)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>

                    {responses[criterion.id]?.score > 0 && responses[criterion.id]?.justification?.trim() && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Completado
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
                    <Save className="h-4 w-4 mr-2" />
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
                <CardTitle>Análisis de Consenso</CardTitle>
                <CardDescription>
                  Visualización del nivel de acuerdo entre expertos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockCriteria.map((criterion) => {
                  const consensus = calculateConsensus(criterion.id);
                  return (
                    <div key={criterion.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {criterion.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {criterion.description}
                          </p>
                        </div>
                        <Badge 
                          variant={consensus.consensusLevel === 'high' ? 'default' : 
                                  consensus.consensusLevel === 'medium' ? 'secondary' : 'destructive'}
                        >
                          {getConsensusLabel(consensus.consensusLevel)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {consensus.meanScore.toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-500">Puntuación Media</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-600">
                            {consensus.standardDeviation.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">Desviación Estándar</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            {consensus.responseCount}
                          </div>
                          <div className="text-sm text-gray-500">Respuestas</div>
                        </div>
                      </div>

                      {consensus.consensusLevel === 'low' && (
                        <Alert className="mt-4">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Este criterio requiere una nueva ronda de evaluación debido al bajo consenso.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expert Responses Tab */}
          <TabsContent value="responses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Respuestas de Expertos</CardTitle>
                <CardDescription>
                  Detalles de las evaluaciones por criterio
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockCriteria.map((criterion) => {
                  const criterionResponses = mockExpertResponses.filter(r => r.criterionId === criterion.id);
                  return (
                    <div key={criterion.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-4">
                        {criterion.name}
                      </h3>
                      
                      <div className="space-y-3">
                        {criterionResponses.map((response) => (
                          <div key={response.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {response.expert.firstName} {response.expert.lastName}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {response.score}/10
                                </Badge>
                              </div>
                              <span className="text-xs text-gray-500">
                                {new Date(response.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">
                              {response.justification}
                            </p>
                          </div>
                        ))}
                        
                        {criterionResponses.length === 0 && (
                          <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                            No hay respuestas para este criterio aún.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}