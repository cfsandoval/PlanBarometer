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
  Lightbulb,
  Brain,
  Award,
  BookOpen,
  User
} from 'lucide-react';
import { useLocation, Link, useParams } from 'wouter';

interface PersonalizedFeedback {
  expertId: number;
  criterionId: string;
  personalScore: number;
  groupMean: number;
  deviation: number;
  deviationType: 'aligned' | 'optimistic' | 'conservative' | 'outlier';
  confidenceLevel: number;
  recommendations: string[];
  strengths: string[];
  improvementAreas: string[];
}

interface ExpertProfile {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  expertiseAreas: string[];
  evaluationHistory: {
    totalEvaluations: number;
    averageAccuracy: number;
    consensusAlignment: number;
  };
}

interface LearningInsight {
  id: string;
  title: string;
  description: string;
  category: 'methodology' | 'domain_knowledge' | 'consensus_building' | 'critical_thinking';
  priority: 'high' | 'medium' | 'low';
  resources: Array<{
    title: string;
    type: 'article' | 'video' | 'course' | 'practice';
    url: string;
  }>;
}

const mockFeedbackData: PersonalizedFeedback[] = [
  {
    expertId: 1,
    criterionId: 'crit1',
    personalScore: 8,
    groupMean: 7.5,
    deviation: 0.5,
    deviationType: 'optimistic',
    confidenceLevel: 85,
    recommendations: [
      'Tu evaluación está ligeramente por encima del promedio grupal',
      'Considera revisar aspectos técnicos que otros expertos pueden haber identificado como limitantes',
      'Profundiza en el análisis de riesgos técnicos'
    ],
    strengths: [
      'Identificación clara de oportunidades técnicas',
      'Justificación bien fundamentada',
      'Perspectiva innovadora'
    ],
    improvementAreas: [
      'Análisis de limitaciones técnicas',
      'Evaluación de riesgos operacionales'
    ]
  },
  {
    expertId: 1,
    criterionId: 'crit2',
    personalScore: 9,
    groupMean: 6.5,
    deviation: 2.5,
    deviationType: 'outlier',
    confidenceLevel: 60,
    recommendations: [
      'Tu evaluación difiere significativamente del consenso grupal',
      'Considera participar en la siguiente ronda para compartir tu perspectiva',
      'Revisa los comentarios de otros expertos para entender diferentes enfoques'
    ],
    strengths: [
      'Visión única del impacto social',
      'Identificación de beneficiarios no considerados',
      'Análisis profundo de efectos secundarios positivos'
    ],
    improvementAreas: [
      'Calibración con perspectivas alternativas',
      'Consideración de limitaciones en la implementación'
    ]
  }
];

const mockLearningInsights: LearningInsight[] = [
  {
    id: 'insight1',
    title: 'Calibración de Evaluaciones con Consenso Grupal',
    description: 'Aprende técnicas para alinear mejor tus evaluaciones con el consenso sin perder tu perspectiva única',
    category: 'consensus_building',
    priority: 'high',
    resources: [
      {
        title: 'Técnicas de Calibración en Evaluación Delphi',
        type: 'article',
        url: '#'
      },
      {
        title: 'Workshop: Construyendo Consenso Efectivo',
        type: 'course',
        url: '#'
      }
    ]
  },
  {
    id: 'insight2',
    title: 'Análisis de Riesgos en Evaluación Técnica',
    description: 'Desarrolla habilidades para identificar y evaluar riesgos técnicos de manera más completa',
    category: 'domain_knowledge',
    priority: 'medium',
    resources: [
      {
        title: 'Framework de Análisis de Riesgos Técnicos',
        type: 'article',
        url: '#'
      },
      {
        title: 'Casos de Estudio: Evaluaciones Técnicas Exitosas',
        type: 'practice',
        url: '#'
      }
    ]
  }
];

export default function ExpertFeedback() {
  const { user } = useAuth();
  const { studyId } = useParams<{ studyId: string }>();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Mock expert profile
  const expertProfile: ExpertProfile = {
    id: user?.id || 1,
    username: user?.username || 'expert',
    firstName: user?.firstName || 'Ana',
    lastName: user?.lastName || 'García',
    expertiseAreas: ['Planificación Estratégica', 'Políticas Públicas', 'Desarrollo Sostenible'],
    evaluationHistory: {
      totalEvaluations: 15,
      averageAccuracy: 87,
      consensusAlignment: 75
    }
  };

  const getDeviationColor = (type: string) => {
    switch (type) {
      case 'aligned': return 'text-green-600';
      case 'optimistic': return 'text-blue-600';
      case 'conservative': return 'text-yellow-600';
      case 'outlier': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getDeviationLabel = (type: string) => {
    switch (type) {
      case 'aligned': return 'Alineado';
      case 'optimistic': return 'Optimista';
      case 'conservative': return 'Conservador';
      case 'outlier': return 'Atípico';
      default: return 'Normal';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'methodology': return <Target className="h-4 w-4" />;
      case 'domain_knowledge': return <BookOpen className="h-4 w-4" />;
      case 'consensus_building': return <Users className="h-4 w-4" />;
      case 'critical_thinking': return <Brain className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso requerido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Necesitas iniciar sesión para ver tu retroalimentación personalizada
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
            <Link href={`/delphi/studies/${studyId}/evaluate`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Evaluación
              </Button>
            </Link>
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Retroalimentación Personalizada
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Análisis personalizado de tu desempeño y recomendaciones para mejorar
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Award className="h-4 w-4 mr-1" />
                  Nivel: Experto Avanzado
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Target className="h-4 w-4 mr-1" />
                  {expertProfile.evaluationHistory.consensusAlignment}% Alineación
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Desempeño</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
          </TabsList>

          {/* Performance Analysis Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span>Precisión Promedio</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {expertProfile.evaluationHistory.averageAccuracy}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    En {expertProfile.evaluationHistory.totalEvaluations} evaluaciones
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-600" />
                    <span>Alineación</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {expertProfile.evaluationHistory.consensusAlignment}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Consenso con grupo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    <span>Nivel de Experto</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    Avanzado
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Top 20% de evaluadores
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Feedback by Criterion */}
            <Card>
              <CardHeader>
                <CardTitle>Análisis Detallado por Criterio</CardTitle>
                <CardDescription>
                  Tu desempeño comparado con el consenso grupal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockFeedbackData.map((feedback, index) => (
                  <div key={feedback.criterionId} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          Criterio {index + 1}: {feedback.criterionId === 'crit1' ? 'Viabilidad Técnica' : 'Impacto Social'}
                        </h3>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Tu puntuación: <strong>{feedback.personalScore}/10</strong>
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Promedio grupal: <strong>{feedback.groupMean}/10</strong>
                          </span>
                          <Badge 
                            variant="outline"
                            className={getDeviationColor(feedback.deviationType)}
                          >
                            {getDeviationLabel(feedback.deviationType)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {feedback.confidenceLevel}%
                        </div>
                        <div className="text-sm text-gray-500">Confianza</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-green-700 dark:text-green-300 mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Fortalezas Identificadas
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {feedback.strengths.map((strength, i) => (
                            <li key={i} className="text-gray-700 dark:text-gray-300">
                              • {strength}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-orange-700 dark:text-orange-300 mb-2 flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Áreas de Mejora
                        </h4>
                        <ul className="space-y-1 text-sm">
                          {feedback.improvementAreas.map((area, i) => (
                            <li key={i} className="text-gray-700 dark:text-gray-300">
                              • {area}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        Recomendaciones Personalizadas
                      </h4>
                      <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                        {feedback.recommendations.map((rec, i) => (
                          <li key={i}>• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Learning Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Insights de Aprendizaje Personalizados</CardTitle>
                <CardDescription>
                  Recomendaciones específicas para desarrollar tus habilidades de evaluación
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {mockLearningInsights.map((insight) => (
                  <div key={insight.id} className={`border rounded-lg p-4 ${getPriorityColor(insight.priority)}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(insight.category)}
                        <h3 className="font-semibold text-lg">
                          {insight.title}
                        </h3>
                      </div>
                      <Badge variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'secondary' : 'default'}>
                        Prioridad {insight.priority === 'high' ? 'Alta' : insight.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm mb-4">
                      {insight.description}
                    </p>

                    <div>
                      <h4 className="font-medium mb-2">Recursos Recomendados:</h4>
                      <div className="space-y-2">
                        {insight.resources.map((resource, i) => (
                          <div key={i} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded p-2">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">{resource.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {resource.type === 'article' ? 'Artículo' : 
                                 resource.type === 'video' ? 'Video' :
                                 resource.type === 'course' ? 'Curso' : 'Práctica'}
                              </Badge>
                            </div>
                            <Button size="sm" variant="outline">
                              Acceder
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expert Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Perfil de Experto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombre Completo
                    </Label>
                    <p className="text-gray-900 dark:text-white">
                      {expertProfile.firstName} {expertProfile.lastName}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Áreas de Expertise
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {expertProfile.expertiseAreas.map((area, i) => (
                        <Badge key={i} variant="secondary">{area}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Historial de Evaluaciones
                    </Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total de evaluaciones:</span>
                        <span className="font-medium">{expertProfile.evaluationHistory.totalEvaluations}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Precisión promedio:</span>
                        <span className="font-medium">{expertProfile.evaluationHistory.averageAccuracy}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Alineación con consenso:</span>
                        <span className="font-medium">{expertProfile.evaluationHistory.consensusAlignment}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progreso de Desarrollo</CardTitle>
                  <CardDescription>
                    Tu evolución como evaluador experto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Precisión de Evaluación</span>
                      <span className="text-sm text-gray-500">87/100</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Construcción de Consenso</span>
                      <span className="text-sm text-gray-500">75/100</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Pensamiento Crítico</span>
                      <span className="text-sm text-gray-500">92/100</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Conocimiento del Dominio</span>
                      <span className="text-sm text-gray-500">80/100</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>

                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800 dark:text-green-200">
                        Nivel Actual: Experto Avanzado
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Estás en el top 20% de evaluadores. Continúa desarrollando tus habilidades 
                      de construcción de consenso para alcanzar el nivel de Experto Maestro.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}