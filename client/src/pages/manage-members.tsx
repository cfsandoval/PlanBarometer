import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  Trash2, 
  Shield, 
  Crown, 
  User as UserIcon,
  Mail,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { useLocation, Link, useParams } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

const addMemberSchema = z.object({
  email: z.string().email("Email inválido"),
  role: z.enum(['user', 'coordinator'], {
    required_error: "Selecciona un rol"
  }),
});

const updateRoleSchema = z.object({
  role: z.enum(['user', 'coordinator'], {
    required_error: "Selecciona un rol"
  }),
});

type AddMemberData = z.infer<typeof addMemberSchema>;
type UpdateRoleData = z.infer<typeof updateRoleSchema>;

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
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
  };
}

export default function ManageMembers() {
  const { id: groupId } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [removingMember, setRemovingMember] = useState<number | null>(null);

  const form = useForm<AddMemberData>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      email: '',
      role: 'user',
    },
  });

  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: [`/api/delphi/groups/${groupId}`],
    enabled: !!groupId,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: [`/api/delphi/groups/${groupId}/members`],
    enabled: !!groupId,
  });

  const addMemberMutation = useMutation({
    mutationFn: async (data: AddMemberData) => {
      const response = await apiRequest('POST', `/api/delphi/groups/${groupId}/members`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Miembro agregado exitosamente",
        description: "El usuario ha sido invitado al grupo.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: [`/api/delphi/groups/${groupId}/members`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al agregar miembro",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: number; role: string }) => {
      const response = await apiRequest('PATCH', `/api/delphi/groups/${groupId}/members/${memberId}`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Rol actualizado",
        description: "El rol del miembro ha sido cambiado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/delphi/groups/${groupId}/members`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar rol",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: number) => {
      await apiRequest('DELETE', `/api/delphi/groups/${groupId}/members/${memberId}`);
    },
    onSuccess: () => {
      toast({
        title: "Miembro removido",
        description: "El usuario ha sido removido del grupo.",
      });
      setRemovingMember(null);
      queryClient.invalidateQueries({ queryKey: [`/api/delphi/groups/${groupId}/members`] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al remover miembro",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
      setRemovingMember(null);
    },
  });

  if (!user) {
    return null;
  }

  if (groupLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            Grupo no encontrado o no tienes permisos para gestionarlo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isCoordinator = user.role === 'admin' || user.id === group.coordinatorId;

  if (!isCoordinator) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <AlertDescription className="text-red-800 dark:text-red-200">
            Solo los coordinadores pueden gestionar miembros del grupo.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const onSubmit = (data: AddMemberData) => {
    addMemberMutation.mutate(data);
  };

  const handleRoleChange = (memberId: number, newRole: string) => {
    updateRoleMutation.mutate({ memberId, role: newRole });
  };

  const handleRemoveMember = (memberId: number) => {
    removeMemberMutation.mutate(memberId);
  };

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

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href={`/delphi/groups/${groupId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Grupo
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Gestión de Miembros</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Grupo: {group.name}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Member Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="mr-2 h-5 w-5" />
                Agregar Miembro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email del Usuario</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="usuario@ejemplo.com"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el rol" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="user">Usuario</SelectItem>
                            <SelectItem value="coordinator">Coordinador</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={addMemberMutation.isPending}
                    className="w-full"
                  >
                    {addMemberMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Invitando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invitar Usuario
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Miembros del Grupo ({members.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {membersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No hay miembros en este grupo</p>
                  <p className="text-sm mt-2">
                    Invita usuarios usando el formulario
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member: GroupMember) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          {getRoleIcon(member.user.role)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">
                              {member.user.firstName && member.user.lastName
                                ? `${member.user.firstName} ${member.user.lastName}`
                                : member.user.username}
                            </p>
                            {member.userId === group.coordinatorId && (
                              <Badge variant="outline" className="text-xs">
                                Coordinador Principal
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.user.email}
                          </p>
                          <p className="text-xs text-gray-500">
                            Se unió: {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Role Selector */}
                        {member.userId !== group.coordinatorId && (
                          <Select
                            value={member.role}
                            onValueChange={(newRole) => handleRoleChange(member.id, newRole)}
                            disabled={updateRoleMutation.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuario</SelectItem>
                              <SelectItem value="coordinator">Coordinador</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        {/* Remove Button */}
                        {member.userId !== group.coordinatorId && member.userId !== user.id && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="flex items-center">
                                  <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                                  Remover Miembro
                                </DialogTitle>
                                <DialogDescription>
                                  ¿Estás seguro de que quieres remover a{' '}
                                  <strong>
                                    {member.user.firstName && member.user.lastName
                                      ? `${member.user.firstName} ${member.user.lastName}`
                                      : member.user.username}
                                  </strong>{' '}
                                  del grupo? Esta acción no se puede deshacer.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline">
                                  Cancelar
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRemoveMember(member.id)}
                                  disabled={removeMemberMutation.isPending}
                                >
                                  {removeMemberMutation.isPending ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Removiendo...
                                    </>
                                  ) : (
                                    <>
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Remover
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Gestión de Miembros
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• <strong>Usuarios:</strong> Pueden participar en estudios y ver resultados</li>
                <li>• <strong>Coordinadores:</strong> Pueden crear estudios y gestionar participantes</li>
                <li>• <strong>Administradores:</strong> Tienen acceso completo a todas las funciones</li>
                <li>• El coordinador principal del grupo no puede ser removido</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}