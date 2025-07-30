import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BookOpen, Users, Calendar, Target } from 'lucide-react';
import { useLocation, Link, useParams } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

const createStudySchema = z.object({
  title: z.string().min(1, "El título es requerido").max(255, "El título es muy largo"),
  description: z.string().min(1, "La descripción es requerida").max(1000, "La descripción es muy larga"),
  methodology: z.enum(['classical', 'fuzzy', 'hybrid'], {
    required_error: "Selecciona la metodología"
  }),
  rounds: z.number().min(1, "Mínimo 1 ronda").max(10, "Máximo 10 rondas"),
  participantLimit: z.number().min(2, "Mínimo 2 participantes").max(100, "Máximo 100 participantes").optional(),
  anonymousResults: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

type CreateStudyData = z.infer<typeof createStudySchema>;

export default function CreateStudy() {
  const { id: groupId } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateStudyData>({
    resolver: zodResolver(createStudySchema),
    defaultValues: {
      title: '',
      description: '',
      methodology: 'classical',
      rounds: 2,
      participantLimit: undefined,
      anonymousResults: true,
      isActive: true,
    },
  });

  const createStudyMutation = useMutation({
    mutationFn: async (data: CreateStudyData) => {
      const response = await apiRequest(`/api/delphi/groups/${groupId}/studies`, {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          groupId: parseInt(groupId || '0'),
        }),
      });
      return response;
    },
    onSuccess: (study) => {
      toast({
        title: "Estudio creado exitosamente",
        description: `El estudio "${study.title}" ha sido creado.`,
      });
      queryClient.invalidateQueries({ queryKey: [`/api/delphi/groups/${groupId}/studies`] });
      setLocation(`/delphi/groups/${groupId}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear estudio",
        description: error.message || "Ocurrió un error inesperado",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateStudyData) => {
    createStudyMutation.mutate(data);
  };

  if (!user) {
    return null;
  }

  const methodologyOptions = [
    { value: 'classical', label: 'Clásico', description: 'Metodología Delphi tradicional con rondas secuenciales' },
    { value: 'fuzzy', label: 'Difuso', description: 'Utiliza lógica difusa para mayor flexibilidad' },
    { value: 'hybrid', label: 'Híbrido', description: 'Combina elementos clásicos y difusos' },
  ];

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={`/delphi/groups/${groupId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Grupo
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Crear Nuevo Estudio Delphi</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configura un nuevo estudio colaborativo para el grupo
            </p>
          </div>
        </div>

        {/* Main Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Información del Estudio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información Básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Información Básica</h3>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título del Estudio</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Evaluación de políticas públicas 2025"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe el objetivo y alcance del estudio..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Explica claramente qué se va a evaluar y por qué
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Configuración Metodológica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Configuración</h3>

                    <FormField
                      control={form.control}
                      name="methodology"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Metodología</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona la metodología" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {methodologyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{option.label}</span>
                                    <span className="text-sm text-gray-500">{option.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="rounds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Rondas</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="10"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormDescription>
                              Rondas de evaluación (recomendado: 2-3)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="participantLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Límite de Participantes</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="2" 
                                max="100"
                                placeholder="Sin límite"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormDescription>
                              Opcional, déjalo vacío para sin límite
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Opciones Adicionales */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Opciones Adicionales</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Configuraciones avanzadas para el estudio
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <FormField
                      control={form.control}
                      name="anonymousResults"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-gray-300"
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-normal">
                              Resultados Anónimos
                            </FormLabel>
                            <FormDescription>
                              Los participantes no verán quién respondió qué
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="rounded border-gray-300"
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="font-normal">
                              Activar Inmediatamente
                            </FormLabel>
                            <FormDescription>
                              El estudio estará disponible para participantes
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Botones de Acción */}
                <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                  <Link href={`/delphi/groups/${groupId}`}>
                    <Button variant="outline">
                      Cancelar
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={createStudyMutation.isPending}
                    className="min-w-[120px]"
                  >
                    {createStudyMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creando...
                      </>
                    ) : (
                      <>
                        <Target className="mr-2 h-4 w-4" />
                        Crear Estudio
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  ¿Qué es un Estudio Delphi?
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Un estudio Delphi es un método de investigación que utiliza un panel de expertos para llegar a un consenso sobre un tema específico. Los participantes evalúan alternativas contra criterios predefinidos a través de múltiples rondas, refinando sus opiniones basándose en el feedback del grupo.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}