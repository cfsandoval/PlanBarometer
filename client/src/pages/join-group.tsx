import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Users, ArrowLeft, Key } from 'lucide-react';
import { useLocation, Link } from 'wouter';

export default function JoinGroup() {
  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const joinGroupMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('/api/delphi/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join group');
      }
      
      return response.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['/api/groups'] });
      setSuccess(`Te has unido exitosamente al grupo: ${result.group.name}`);
      setError('');
      setTimeout(() => {
        setLocation('/delphi');
      }, 2000);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to join group');
      setSuccess('');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!groupCode.trim()) {
      setError('El código del grupo es requerido');
      return;
    }

    joinGroupMutation.mutate(groupCode.trim().toUpperCase());
  };

  if (!user) {
    return null;
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
                  Unirse a Grupo
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ingresa el código del grupo para unirte
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
              <div className="bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                <Key className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Código de Acceso</CardTitle>
                <CardDescription>
                  Ingresa el código proporcionado por el coordinador del grupo
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

              {success && (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {success}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="groupCode">Código del Grupo *</Label>
                <Input
                  id="groupCode"
                  type="text"
                  placeholder="Ej: ABC123"
                  value={groupCode}
                  onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                  required
                  disabled={joinGroupMutation.isPending}
                  maxLength={10}
                  className="text-center text-lg font-mono tracking-wider"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Código único de 6 caracteres proporcionado por el coordinador
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  ¿Cómo obtener un código?
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Solicita el código al coordinador o administrador del grupo</li>
                  <li>• El código se genera automáticamente al crear un nuevo grupo</li>
                  <li>• Cada grupo tiene un código único e irrepetible</li>
                </ul>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Link href="/delphi">
                  <Button type="button" variant="outline" disabled={joinGroupMutation.isPending}>
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={joinGroupMutation.isPending || !groupCode.trim()}
                >
                  {joinGroupMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uniéndose...
                    </>
                  ) : (
                    <>
                      <Users className="mr-2 h-4 w-4" />
                      Unirse al Grupo
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