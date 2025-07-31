import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  BookOpen, 
  Settings, 
  LogOut, 
  Plus,
  Crown,
  Shield,
  User as UserIcon,
  Grid3X3
} from 'lucide-react';
import { Link } from 'wouter';
import type { Group, DelphiStudy } from '@shared/schema';

export default function DelphiDashboard() {
  const { user, logout } = useAuth();

  const { data: groups = [] } = useQuery({
    queryKey: ['/api/delphi/groups'],
  }) as { data: Group[] };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'coordinator':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'coordinator':
        return 'Coordinador';
      default:
        return 'Usuario';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
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
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Planbarómetro RT Delphi
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sistema de evaluación colaborativa
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon(user.role)}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user.firstName} {user.lastName}
                </span>
                <Badge variant="outline">
                  {getRoleName(user.role)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                {user.role === 'admin' && (
                  <Link href="/delphi/admin/users">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Salir</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ¡Bienvenido, {user.firstName}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Aquí puedes gestionar tus grupos de trabajo y estudios Delphi para evaluaciones colaborativas.
            </p>
          </div>

          <Tabs defaultValue="groups" className="space-y-6">
            <TabsList className={`grid w-full max-w-md ${user.role === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <TabsTrigger value="groups">Grupos</TabsTrigger>
              <TabsTrigger value="studies">Estudios</TabsTrigger>
              {user.role === 'admin' && (
                <TabsTrigger value="admin">Admin</TabsTrigger>
              )}
            </TabsList>

            {/* Groups Tab */}
            <TabsContent value="groups" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Mis Grupos de Trabajo
                </h3>
                {user.role !== 'user' && (
                  <Link href="/delphi/groups/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Grupo
                    </Button>
                  </Link>
                )}
              </div>

              {groups.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No hay grupos disponibles
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {user.role === 'user' 
                        ? 'Solicita a un coordinador que te agregue a un grupo o únete usando un código.'
                        : 'Crea tu primer grupo para comenzar a organizar estudios colaborativos.'
                      }
                    </p>
                    {user.role === 'user' && (
                      <Link href="/delphi/groups/join">
                        <Button variant="outline">
                          <Users className="h-4 w-4 mr-2" />
                          Unirse a Grupo
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {groups.map((group: Group) => (
                    <Card key={group.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="truncate">{group.name}</span>
                          <Badge variant="secondary">{group.code}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {group.description || 'Sin descripción'}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Users className="h-4 w-4" />
                            <span>Grupo de trabajo</span>
                          </div>
                          <Link href={`/delphi/groups/${group.id}`}>
                            <Button size="sm" variant="outline">
                              Ver Detalles
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {user.role === 'user' && groups.length > 0 && (
                <div className="flex justify-center">
                  <Link href="/delphi/groups/join">
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Unirse a Otro Grupo
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* Studies Tab */}
            <TabsContent value="studies" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Estudios Delphi Recientes
                </h3>
              </div>

              <Card>
                <CardContent className="p-6 text-center">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No hay estudios activos
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Los estudios Delphi se crean dentro de los grupos de trabajo.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Admin Tab */}
            {user.role === 'admin' && (
              <TabsContent value="admin" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Gestión de Usuarios
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Administra usuarios del sistema, roles y permisos.
                      </p>
                      <Link href="/delphi/admin/users">
                        <Button className="w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          Administrar Usuarios
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Grid3X3 className="mr-2 h-5 w-5" />
                        Análisis de Membresías
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Vista visual de membresías de usuarios en grupos.
                      </p>
                      <Link href="/delphi/membership-heatmap">
                        <Button variant="outline" className="w-full">
                          <Grid3X3 className="mr-2 h-4 w-4" />
                          Ver Mapa de Calor
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}