import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Settings, 
  Save,
  BookOpen,
  Users,
  Calendar,
  Target,
  AlertTriangle,
  Trash2
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

export default function StudySettings() {
  const { user } = useAuth();
  const { studyId } = useParams<{ studyId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft',
    rounds: 3,
    currentRound: 1,
    startDate: '',
    endDate: '',
  });

  const { data: study, isLoading: studyLoading } = useQuery<DelphiStudy>({
    queryKey: ['/api/delphi/studies', studyId],
    queryFn: async () => {
      const response = await fetch(`/api/delphi/studies/${studyId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      const data = await response.json();
      
      // Update form data when study loads
      setFormData({
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'draft',
        rounds: data.rounds || 3,
        currentRound: data.currentRound || 1,
        startDate: data.startDate ? data.startDate.split('T')[0] : '',
        endDate: data.endDate ? data.endDate.split('T')[0] : '',
      });
      
      return data;
    },
    enabled: !!studyId,
  });

  const updateStudyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/delphi/studies/${studyId}`, {
        method: 'PATCH',
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
      queryClient.invalidateQueries({ queryKey: ['/api/delphi/studies', studyId] });
      toast({
        title: "Configuración guardada",
        description: "Los cambios del estudio han sido guardados exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al guardar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteStudyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/delphi/studies/${studyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Estudio eliminado",
        description: "El estudio ha sido eliminado exitosamente.",
      });
      setLocation(`/delphi/groups/${study?.groupId}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateStudyMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (confirm('¿Estás seguro de que quieres eliminar este estudio? Esta acción no se puede deshacer.')) {
      deleteStudyMutation.mutate();
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
            Necesitas iniciar sesión para acceder a la configuración
          </p>
          <Link href="/login">
            <Button>Iniciar Sesión</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isCoordinator) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acceso restringido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Solo los coordinadores pueden acceder a la configuración del estudio
          </p>
          <Link href={`/delphi/studies/${studyId}`}>
            <Button>Volver al Estudio</Button>
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
          <p className="text-gray-600 dark:text-gray-400">Cargando configuración...</p>
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
            El estudio que buscas no existe o no tienes permisos para configurarlo.
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Configuración del Estudio
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Configura los parámetros y ajustes del estudio Delphi
              </p>
              <div className="flex items-center space-x-4">
                {getStatusBadge(study.status)}
                {study.group && (
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    {study.group.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Configura el título, descripción y estado del estudio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del Estudio</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej: Evaluación de políticas públicas"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe el objetivo y alcance del estudio Delphi"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="status">Estado del Estudio</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Borrador</SelectItem>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Delphi Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración Delphi</CardTitle>
              <CardDescription>
                Ajusta los parámetros específicos del método Delphi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rounds">Número de Rondas</Label>
                  <Input
                    id="rounds"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.rounds}
                    onChange={(e) => setFormData({...formData, rounds: parseInt(e.target.value) || 3})}
                  />
                  <p className="text-sm text-gray-500 mt-1">Típicamente 2-4 rondas</p>
                </div>
                
                <div>
                  <Label htmlFor="currentRound">Ronda Actual</Label>
                  <Input
                    id="currentRound"
                    type="number"
                    min="1"
                    max={formData.rounds}
                    value={formData.currentRound}
                    onChange={(e) => setFormData({...formData, currentRound: parseInt(e.target.value) || 1})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Cronograma</CardTitle>
              <CardDescription>
                Define las fechas de inicio y finalización del estudio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Fecha de Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">Fecha de Finalización</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>
                Guarda los cambios o elimina el estudio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleSave}
                    disabled={updateStudyMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateStudyMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
                
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleteStudyMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteStudyMutation.isPending ? 'Eliminando...' : 'Eliminar Estudio'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {study.status !== 'draft' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Algunos cambios pueden no ser aplicables una vez que el estudio está activo.
                Revisa cuidadosamente antes de guardar.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}