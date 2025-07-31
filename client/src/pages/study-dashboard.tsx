import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  Calendar,
  User,
  UserPlus,
  Trash2,
  Play,
  BookOpen,
  Target,
  Clock,
  BarChart3,
  Brain
} from 'lucide-react';
import { useLocation, Link, useParams } from 'wouter';

interface DelphiStudy {
  id: number;
  title: string;
  description: string;
  groupId: number;
  coordinatorId: number;
  status: string;
  rounds: number;
  currentRound: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  group?: {
    id: number;
    name: string;
    description: string;
    code: string;
  };
}

interface StudyParticipant {
  id: number;
  studyId: number;
  userId: number;
  status: string;
  role: string;
  expertise?: string;
  invitedAt: string;
  joinedAt?: string;
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role: string;
  };
}

export default function StudyDashboard() {
  const { user } = useAuth();
  const { studyId } = useParams<{ studyId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteExpertise, setInviteExpertise] = useState('');

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

  const { data: participants = [], isLoading: participantsLoading } = useQuery<StudyParticipant[]>({
    queryKey: ['/api/delphi/studies', studyId, 'participants'],
    queryFn: async () => {
      const response = await fetch(`/api/delphi/studies/${studyId}/participants`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    enabled: !!studyId,
  });

  const inviteParticipantMutation = useMutation({
    mutationFn: async (data: { email: string; expertise?: string }) => {
      const response = await fetch(`/api/delphi/studies/${studyId}/participants`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/delphi/studies', studyId, 'participants'] });
      setInviteEmail('');
      setInviteExpertise('');
      toast({
        title: "Participante invitado",
        description: "El experto ha sido agregado al estudio exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al invitar participante",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeParticipantMutation = useMutation({
    mutationFn: async (participantId: number) => {
      const response = await fetch(`/api/delphi/studies/${studyId}/participants/${participantId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/delphi/studies', studyId, 'participants'] });
      toast({
        title: "Participante removido",
        description: "El participante ha sido removido del estudio.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al remover participante",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleInviteParticipant = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa un email válido.",
        variant: "destructive",
      });
      return;
    }

    inviteParticipantMutation.mutate({
      email: inviteEmail.trim(),
      expertise: inviteExpertise.trim() || undefined,
    });
  };

  const handleRemoveParticipant = (participantId: number) => {
    if (confirm('¿Estás seguro de que quieres remover este participante del estudio?')) {
      removeParticipantMutation.mutate(participantId);
    }
  };

  const isCoordinator = user && (user.role === 'admin' || user.role === 'coordinator');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso requerido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Necesitas iniciar sesión para acceder al estudio
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
          <p className="text-gray-600 dark:text-gray-400">Cargando estudio...</p>
        </div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Estudio no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El estudio que buscas no existe o no tienes permisos para verlo.
          </p>
          <Link href="/delphi">
            <Button>Volver al Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { label: 'Borrador', variant: 'secondary' as const },
      'active': { label: 'Activo', variant: 'default' as const },
      'completed': { label: 'Completado', variant: 'outline' as const },
      'cancelled': { label: 'Cancelado', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRoleName = (role: string) => {
    const roles = {
      admin: 'Administrador',
      coordinator: 'Coordinador',
      user: 'Usuario'
    };
    return roles[role as keyof typeof roles] || 'Usuario';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href={`/delphi/groups/${study.groupId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Grupo
              </Button>
            </Link>
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {study.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {study.description || 'Sin descripción'}
              </p>
              <div className="flex items-center space-x-4">
                {getStatusBadge(study.status)}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Target className="h-4 w-4 mr-1" />
                  Ronda {study.currentRound} de {study.rounds}
                </div>
                {study.group && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    {study.group.name}
                  </div>
                )}
              </div>
            </div>
            
            {isCoordinator && (
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Ronda
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="participants">Participantes ({participants.length})</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluación</TabsTrigger>
            <TabsTrigger value="results">Resultados</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Participantes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {participants.length}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Expertos invitados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <span>Progreso</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round((study.currentRound / study.rounds) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ronda {study.currentRound} de {study.rounds}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <span>Estado</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2">
                    {getStatusBadge(study.status)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Creado el {new Date(study.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Información del Estudio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </Label>
                  <p className="text-gray-900 dark:text-white">
                    {study.description || 'Sin descripción disponible'}
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Número de Rondas
                    </Label>
                    <p className="text-gray-900 dark:text-white">{study.rounds}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ronda Actual
                    </Label>
                    <p className="text-gray-900 dark:text-white">{study.currentRound}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            {isCoordinator && (
              <Card>
                <CardHeader>
                  <CardTitle>Invitar Nuevo Participante</CardTitle>
                  <CardDescription>
                    Agrega expertos específicos a este estudio usando su email registrado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email del Experto</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="experto@ejemplo.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expertise">Área de Expertise (Opcional)</Label>
                      <Input
                        id="expertise"
                        placeholder="Ej: Planificación estratégica"
                        value={inviteExpertise}
                        onChange={(e) => setInviteExpertise(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={handleInviteParticipant}
                    disabled={inviteParticipantMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    {inviteParticipantMutation.isPending ? 'Invitando...' : 'Invitar Participante'}
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Participantes del Estudio</CardTitle>
                <CardDescription>
                  Expertos invitados a participar en este estudio Delphi
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participantsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando participantes...</p>
                  </div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No hay participantes
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      {isCoordinator 
                        ? 'Invita expertos para comenzar el estudio Delphi'
                        : 'Este estudio aún no tiene participantes invitados'
                      }
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {participants.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                            <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-900 dark:text-white">
                                {participant.user.firstName} {participant.user.lastName}
                              </p>
                              <Badge variant="secondary">
                                {getRoleName(participant.user.role)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {participant.user.email}
                            </p>
                            {participant.expertise && (
                              <p className="text-sm text-blue-600 dark:text-blue-400">
                                {participant.expertise}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={participant.status === 'active' ? 'default' : 'secondary'}>
                            {participant.status === 'active' ? 'Activo' : 'Invitado'}
                          </Badge>
                          {isCoordinator && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveParticipant(participant.id)}
                              disabled={removeParticipantMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evaluation Tab */}
          <TabsContent value="evaluation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Panel de Evaluación Delphi</CardTitle>
                <CardDescription>
                  Sistema colaborativo de evaluación y búsqueda de consenso entre expertos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-6 border rounded-lg">
                    <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Iniciar Evaluación
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Califica criterios del 1-10 con justificaciones detalladas
                    </p>
                    <Link href={`/delphi/studies/${studyId}/evaluate`}>
                      <Button className="w-full">
                        <Target className="h-4 w-4 mr-2" />
                        Comenzar Evaluación
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="text-center p-6 border rounded-lg">
                    <BarChart3 className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Análisis de Consenso
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Visualiza convergencia y divergencia entre expertos
                    </p>
                    <Link href={`/delphi/studies/${studyId}/feedback`}>
                      <Button variant="outline" className="w-full">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Ver Retroalimentación
                      </Button>
                    </Link>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Metodología Delphi - Ronda {study.currentRound} de {study.rounds}
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Evaluación anónima e independiente de criterios</li>
                    <li>• Justificación de puntuaciones para retroalimentación</li>
                    <li>• Análisis estadístico de consenso y divergencias</li>
                    <li>• Rondas iterativas hasta alcanzar convergencia</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resultados del Estudio</CardTitle>
                <CardDescription>
                  Análisis y resultados de las rondas Delphi
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Sin Resultados Disponibles
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Los resultados aparecerán una vez que se completen las rondas de evaluación
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}