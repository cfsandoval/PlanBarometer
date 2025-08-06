import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, ExternalLink, Edit, Trash2, BookOpen, Filter, Search } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { BestPractice } from '@shared/schema';

const bestPracticeFormSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().min(1, "Descripción requerida"),
  country: z.string().min(1, "País requerido"),
  institution: z.string().optional(),
  year: z.number().min(1900).max(2030).optional(),
  sourceUrl: z.string().url("URL válida requerida").optional(),
  sourceType: z.enum(["pdf", "web", "academic", "case_study"]),
  targetCriteria: z.array(z.string()).min(1, "Al menos un criterio requerido"),
  results: z.string().optional(),
  keyLessons: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

type BestPracticeFormData = z.infer<typeof bestPracticeFormSchema>;

export default function BestPracticesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: practices = [], isLoading, error } = useQuery<BestPractice[]>({
    queryKey: ['/api/best-practices'],
  });

  console.log('Best Practices Debug:', { practices, isLoading, error, practicesLength: practices?.length });

  const createMutation = useMutation({
    mutationFn: async (data: BestPracticeFormData) => {
      const response = await fetch('/api/best-practices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/best-practices'] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/best-practices/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/best-practices'] });
    },
  });

  const form = useForm<BestPracticeFormData>({
    resolver: zodResolver(bestPracticeFormSchema),
    defaultValues: {
      title: '',
      description: '',
      country: '',
      institution: '',
      sourceType: 'web',
      targetCriteria: [],
      keyLessons: [],
      tags: [],
    },
  });

  const onSubmit = (data: BestPracticeFormData) => {
    createMutation.mutate(data);
  };

  const filteredPractices = (practices as BestPractice[]).filter((practice) => {
    const matchesSearch = practice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         practice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         practice.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || practice.sourceType === filterType;
    const matchesCountry = filterCountry === 'all' || practice.country === filterCountry;
    
    return matchesSearch && matchesType && matchesCountry;
  });

  const uniqueCountries = Array.from(new Set((practices as BestPractice[]).map((p) => p.country)));

  const getSourceTypeLabel = (type: string) => {
    const labels = {
      pdf: 'PDF',
      web: 'Web',
      academic: 'Académico',
      case_study: 'Caso de Estudio'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Repositorio de Buenas Prácticas
          </h2>
          <p className="text-muted-foreground mt-1">
            Gestiona el repositorio de políticas públicas y mejores prácticas documentadas
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Práctica
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Buena Práctica</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nombre de la política, programa o estrategia" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción *</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descripción concisa de la práctica" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="País donde se implementó" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Institución</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Institución responsable" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Año</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Año de implementación" 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sourceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Fuente *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="web">Web</SelectItem>
                            <SelectItem value="academic">Académico</SelectItem>
                            <SelectItem value="case_study">Caso de Estudio</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="sourceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de la Fuente</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetCriteria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criterios Objetivo *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Separar con comas: coordinación, innovación, participación" 
                          onChange={(e) => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="results"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resultados</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Resultados específicos y medibles obtenidos" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? 'Guardando...' : 'Guardar Práctica'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, descripción o país..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="w-48">
              <label className="text-sm font-medium">Tipo de Fuente</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                  <SelectItem value="academic">Académico</SelectItem>
                  <SelectItem value="case_study">Caso de Estudio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-48">
              <label className="text-sm font-medium">País</label>
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los países</SelectItem>
                  {uniqueCountries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="text-sm text-muted-foreground mb-4">
        Mostrando {filteredPractices.length} de {(practices as BestPractice[]).length} prácticas
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">Cargando repositorio de buenas prácticas...</h3>
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <h3 className="text-lg font-semibold mb-2">Error cargando buenas prácticas</h3>
            <p className="text-sm">Error: {error.message}</p>
          </div>
        ) : filteredPractices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron prácticas</h3>
            <p className="text-sm">
              {practices.length === 0 
                ? "No hay buenas prácticas en el repositorio aún."
                : "No se encontraron prácticas que coincidan con los filtros."
              }
            </p>
          </div>
        ) : (
          filteredPractices.map((practice) => (
            <Card key={practice.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{practice.title}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{practice.country}</span>
                      {practice.institution && (
                        <>
                          <span>•</span>
                          <span>{practice.institution}</span>
                        </>
                      )}
                      {practice.year && (
                        <>
                          <span>•</span>
                          <span>{practice.year}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getSourceTypeLabel(practice.sourceType)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(practice.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {practice.description}
                </p>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium">Criterios objetivo:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {practice.targetCriteria?.map((criterion, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {criterion}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {practice.results && (
                    <div>
                      <span className="text-sm font-medium">Resultados:</span>
                      <p className="text-sm text-muted-foreground mt-1">{practice.results}</p>
                    </div>
                  )}
                  
                  {practice.sourceUrl && (
                    <div className="flex items-center gap-2">
                      <a
                        href={practice.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Ver documento original
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}