import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  ArrowLeft, 
  Plus, 
  Settings, 
  Calendar,
  User,
  Copy,
  Check
} from 'lucide-react';
import { useLocation, Link, useParams } from 'wouter';

interface Group {
  id: number;
  name: string;
  description: string;
  code: string;
  coordinatorId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GroupMember {
  id: number;
  groupId: number;
  userId: number;
  role: string;
  joinedAt: string;
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
}

export default function GroupDetails() {
  const { id } = useParams();
  const [codeCopied, setCodeCopied] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const groupId = parseInt(id || '0');

  const { data: group, isLoading: groupLoading, error: groupError } = useQuery({
    queryKey: [`/api/delphi/groups/${groupId}`],
    enabled: !!groupId,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: [`/api/delphi/groups/${groupId}/members`],
    enabled: !!groupId,
  });

  const { data: studies = [], isLoading: studiesLoading } = useQuery({
    queryKey: [`/api/delphi/groups/${groupId}/studies`],
    enabled: !!groupId,
  });

  const handleCopyCode = async () => {
    if (group?.code) {
      await navigator.clipboard.writeText(group.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  if (!user) {
    return null;
  }

  if (groupLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            Grupo no encontrado o no tienes permisos para verlo.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/delphi">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isCoordinator = user.role === 'admin' || user.id === group.coordinatorId;
  const memberCount = members.length;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/delphi">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {group.description}
            </p>
          </div>
        </div>
        {isCoordinator && (
          <Button>
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Group Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Información del Grupo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Código de Acceso
                  </p>
                  <p className="text-2xl font-mono font-bold tracking-wider">
                    {group.code}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyCode}
                  className="flex items-center"
                >
                  {codeCopied ? (
                    <>
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Miembros</p>
                  <p className="font-semibold">{memberCount}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Estudios</p>
                  <p className="font-semibold">{studies.length}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Creado</p>
                  <p className="font-semibold">
                    {new Date(group.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Estado</p>
                  <Badge variant={group.isActive ? "default" : "secondary"}>
                    {group.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Studies Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Estudios Delphi</CardTitle>
              {isCoordinator && (
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Estudio
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {studiesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                    </div>
                  ))}
                </div>
              ) : studies.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Calendar className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No hay estudios creados aún</p>
                  {isCoordinator && (
                    <p className="text-sm mt-2">
                      Crea el primer estudio Delphi para este grupo
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {studies.map((study: any) => (
                    <div
                      key={study.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{study.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {study.description}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {study.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Members */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Miembros ({memberCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No hay miembros en este grupo
                </p>
              ) : (
                <div className="space-y-3">
                  {members.map((member: GroupMember) => (
                    <div key={member.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {member.user.firstName && member.user.lastName
                            ? `${member.user.firstName} ${member.user.lastName}`
                            : member.user.username}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={member.user.role === 'admin' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {member.user.role}
                          </Badge>
                          {member.userId === group.coordinatorId && (
                            <Badge variant="outline" className="text-xs">
                              Coordinador
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleCopyCode}
              >
                <Copy className="mr-2 h-4 w-4" />
                Compartir Código
              </Button>
              {isCoordinator && (
                <>
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Estudio
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Gestionar Miembros
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}