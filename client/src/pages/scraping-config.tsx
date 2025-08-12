import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Settings, Globe, Play, Trash2, Edit, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { ScrapingConfig, ExternalApi } from '@shared/schema';

const scrapingConfigSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  baseUrl: z.string().url('URL válida requerida'),
  selectors: z.object({
    titleSelector: z.string().min(1, 'Selector de título requerido'),
    descriptionSelector: z.string().min(1, 'Selector de descripción requerido'),
    linkSelector: z.string().optional(),
    categorySelector: z.string().optional(),
    dateSelector: z.string().optional(),
  }),
});

const externalApiSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  endpoint: z.string().url('Endpoint válido requerido'),
  apiType: z.enum(['openai', 'perplexity', 'custom']),
  authType: z.enum(['bearer', 'api_key', 'basic', 'none']),
  headers: z.record(z.string()).optional(),
  rateLimitPerMinute: z.number().min(1).max(1000).default(60),
});

type ScrapingConfigForm = z.infer<typeof scrapingConfigSchema>;
type ExternalApiForm = z.infer<typeof externalApiSchema>;

export default function ScrapingConfigPage() {
  const [isScrapingDialogOpen, setIsScrapingDialogOpen] = useState(false);
  const [isApiDialogOpen, setIsApiDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<ScrapingConfig | null>(null);
  const [editingApi, setEditingApi] = useState<ExternalApi | null>(null);
  const queryClient = useQueryClient();

  const scrapingForm = useForm<ScrapingConfigForm>({
    resolver: zodResolver(scrapingConfigSchema),
    defaultValues: {
      name: '',
      baseUrl: '',
      selectors: {
        titleSelector: '',
        descriptionSelector: '',
        linkSelector: '',
        categorySelector: '',
        dateSelector: '',
      },
    },
  });

  const apiForm = useForm<ExternalApiForm>({
    resolver: zodResolver(externalApiSchema),
    defaultValues: {
      name: '',
      endpoint: '',
      apiType: 'custom',
      authType: 'bearer',
      headers: {},
      rateLimitPerMinute: 60,
    },
  });

  // Queries
  const { data: scrapingConfigs = [], isLoading: loadingConfigs } = useQuery({
    queryKey: ['/api/scraping-configs'],
  });

  const { data: externalApis = [], isLoading: loadingApis } = useQuery({
    queryKey: ['/api/external-apis'],
  });

  // Mutations
  const createScrapingConfigMutation = useMutation({
    mutationFn: async (data: ScrapingConfigForm) => {
      return await apiRequest('/api/scraping-configs', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scraping-configs'] });
      setIsScrapingDialogOpen(false);
      scrapingForm.reset();
    },
  });

  const updateScrapingConfigMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ScrapingConfigForm> }) => {
      return await apiRequest(`/api/scraping-configs/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scraping-configs'] });
      setEditingConfig(null);
      setIsScrapingDialogOpen(false);
      scrapingForm.reset();
    },
  });

  const deleteScrapingConfigMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/scraping-configs/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/scraping-configs'] });
    },
  });

  const createExternalApiMutation = useMutation({
    mutationFn: async (data: ExternalApiForm) => {
      return await apiRequest('/api/external-apis', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/external-apis'] });
      setIsApiDialogOpen(false);
      apiForm.reset();
    },
  });

  const updateExternalApiMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<ExternalApiForm> }) => {
      return await apiRequest(`/api/external-apis/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/external-apis'] });
      setEditingApi(null);
      setIsApiDialogOpen(false);
      apiForm.reset();
    },
  });

  const deleteExternalApiMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/external-apis/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/external-apis'] });
    },
  });

  // Handle form submissions
  const onSubmitScrapingConfig = (data: ScrapingConfigForm) => {
    if (editingConfig) {
      updateScrapingConfigMutation.mutate({ id: editingConfig.id, data });
    } else {
      createScrapingConfigMutation.mutate(data);
    }
  };

  const onSubmitExternalApi = (data: ExternalApiForm) => {
    if (editingApi) {
      updateExternalApiMutation.mutate({ id: editingApi.id, data });
    } else {
      createExternalApiMutation.mutate(data);
    }
  };

  const handleEditScrapingConfig = (config: ScrapingConfig) => {
    setEditingConfig(config);
    scrapingForm.reset({
      name: config.name,
      baseUrl: config.baseUrl,
      selectors: config.selectors,
    });
    setIsScrapingDialogOpen(true);
  };

  const handleEditExternalApi = (api: ExternalApi) => {
    setEditingApi(api);
    apiForm.reset({
      name: api.name,
      endpoint: api.endpoint,
      apiType: api.apiType as 'openai' | 'perplexity' | 'custom',
      authType: api.authType as 'bearer' | 'api_key' | 'basic' | 'none',
      headers: api.headers || {},
      rateLimitPerMinute: api.rateLimitPerMinute || 60,
    });
    setIsApiDialogOpen(true);
  };

  if (loadingConfigs || loadingApis) {
    return <div className="p-6">Cargando configuraciones...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Configuración de Scraping y APIs
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona las fuentes de datos y conexiones a APIs externas para el sistema de buenas prácticas
        </p>
      </div>

      {/* Scraping Configurations */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Configuraciones de Scraping
            </CardTitle>
            <Dialog open={isScrapingDialogOpen} onOpenChange={setIsScrapingDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingConfig(null);
                  scrapingForm.reset();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Configuración
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingConfig ? 'Editar' : 'Nueva'} Configuración de Scraping
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...scrapingForm}>
                  <form onSubmit={scrapingForm.handleSubmit(onSubmitScrapingConfig)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={scrapingForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Chile - Banco de Buenas Prácticas" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={scrapingForm.control}
                        name="baseUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>URL Base</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://ejemplo.com/buenas-practicas" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Selectores CSS</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={scrapingForm.control}
                          name="selectors.titleSelector"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Selector de Título</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder=".title, h2, .practice-title" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={scrapingForm.control}
                          name="selectors.descriptionSelector"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Selector de Descripción</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder=".description, .summary, p" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <FormField
                          control={scrapingForm.control}
                          name="selectors.linkSelector"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Selector de Enlaces (opcional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="a, .link" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={scrapingForm.control}
                          name="selectors.categorySelector"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Selector de Categoría (opcional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder=".category, .tag" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={scrapingForm.control}
                          name="selectors.dateSelector"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Selector de Fecha (opcional)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder=".date, time" />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={createScrapingConfigMutation.isPending || updateScrapingConfigMutation.isPending}>
                        {editingConfig ? 'Actualizar' : 'Crear'} Configuración
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setIsScrapingDialogOpen(false);
                        setEditingConfig(null);
                        scrapingForm.reset();
                      }}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            {scrapingConfigs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay configuraciones de scraping. Crea una nueva para comenzar.
              </p>
            ) : (
              scrapingConfigs.map((config: ScrapingConfig) => (
                <Card key={config.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{config.name}</h3>
                          <Badge variant={config.isActive ? "default" : "secondary"}>
                            {config.isActive ? 'Activa' : 'Inactiva'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{config.baseUrl}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {config.successCount || 0} éxitos
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-500" />
                            {config.errorCount || 0} errores
                          </span>
                          {config.lastScrapedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Último: {new Date(config.lastScrapedAt).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditScrapingConfig(config)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteScrapingConfigMutation.mutate(config.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* External APIs */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              APIs Externas
            </CardTitle>
            <Dialog open={isApiDialogOpen} onOpenChange={setIsApiDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingApi(null);
                  apiForm.reset();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva API
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingApi ? 'Editar' : 'Nueva'} API Externa
                  </DialogTitle>
                </DialogHeader>
                
                <Form {...apiForm}>
                  <form onSubmit={apiForm.handleSubmit(onSubmitExternalApi)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={apiForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="OpenAI GPT-4" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={apiForm.control}
                        name="endpoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endpoint</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://api.openai.com/v1/chat/completions" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={apiForm.control}
                        name="apiType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de API</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="openai">OpenAI</SelectItem>
                                <SelectItem value="perplexity">Perplexity</SelectItem>
                                <SelectItem value="custom">Personalizada</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={apiForm.control}
                        name="authType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Autenticación</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="bearer">Bearer Token</SelectItem>
                                <SelectItem value="api_key">API Key</SelectItem>
                                <SelectItem value="basic">Basic Auth</SelectItem>
                                <SelectItem value="none">Sin autenticación</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={apiForm.control}
                        name="rateLimitPerMinute"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Límite por minuto</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                placeholder="60"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={createExternalApiMutation.isPending || updateExternalApiMutation.isPending}>
                        {editingApi ? 'Actualizar' : 'Crear'} API
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setIsApiDialogOpen(false);
                        setEditingApi(null);
                        apiForm.reset();
                      }}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid gap-4">
            {externalApis.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay APIs externas configuradas. Agrega una nueva para conectar con servicios externos.
              </p>
            ) : (
              externalApis.map((api: ExternalApi) => (
                <Card key={api.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{api.name}</h3>
                          <Badge variant={api.isActive ? "default" : "secondary"}>
                            {api.isActive ? 'Activa' : 'Inactiva'}
                          </Badge>
                          <Badge variant="outline">{api.apiType}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{api.endpoint}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {api.successCount || 0} éxitos
                          </span>
                          <span className="flex items-center gap-1">
                            <XCircle className="h-3 w-3 text-red-500" />
                            {api.errorCount || 0} errores
                          </span>
                          <span>{api.rateLimitPerMinute}/min</span>
                          {api.lastUsedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Último: {new Date(api.lastUsedAt).toLocaleDateString('es-ES')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditExternalApi(api)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteExternalApiMutation.mutate(api.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}