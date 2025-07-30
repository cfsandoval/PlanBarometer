import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, ArrowLeft } from 'lucide-react';
import { useLocation, Link } from 'wouter';

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: { name: string; description: string }) => {
      const response = await fetch('/api/delphi/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create group');
      }
      
      return response.json();
    },
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setLocation('/delphi');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create group');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    createGroupMutation.mutate({
      name: name.trim(),
      description: description.trim(),
    });
  };

  if (!user || (user.role !== 'admin' && user.role !== 'coordinator')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Acceso Denegado
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Solo los administradores y coordinadores pueden crear grupos.
            </p>
            <Link href="/delphi">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/delphi">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Crear Nuevo Grupo
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configura un grupo de trabajo para estudios colaborativos
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Información del Grupo</CardTitle>
                <CardDescription>
                  Completa los datos básicos para crear el grupo de trabajo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Grupo *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ej: Comité de Planificación Regional"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={createGroupMutation.isPending}
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nombre descriptivo que identifique el propósito del grupo
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe el objetivo y alcance del grupo de trabajo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={createGroupMutation.isPending}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Información adicional sobre el grupo (opcional)
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  ¿Qué sucede después?
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Se generará un código único para que otros usuarios se unan</li>
                  <li>• Podrás crear estudios Delphi dentro de este grupo</li>
                  <li>• Los miembros podrán participar en evaluaciones colaborativas</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Link href="/delphi">
                  <Button type="button" variant="outline" disabled={createGroupMutation.isPending}>
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={createGroupMutation.isPending || !name.trim()}
                >
                  {createGroupMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Crear Grupo
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}