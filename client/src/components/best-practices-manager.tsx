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
import { Plus, ExternalLink, Edit, Trash2, BookOpen, Filter, Search, Download, Globe } from 'lucide-react';
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

  const scrapeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/best-practices/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to scrape');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/best-practices'] });
      console.log(`Successfully scraped ${data.practices?.length || 0} new practices`);
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
    const matchesSearch = 
      practice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      practice.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || practice.sourceType === filterType;
    const matchesCountry = filterCountry === 'all' || practice.country === filterCountry;
    
    return matchesSearch && matchesType && matchesCountry;
  });

  const uniqueCountries = Array.from(new Set((practices as BestPractice[]).map(p => p.country))).sort();

  if (isLoading) {
    return <div className="p-6">Cargando repositorio...</div>;
  }

  if (error) {
    return <div className="p-6">Error al cargar las buenas prácticas</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Banco de Buenas Prácticas ILPES-CEPAL
            <span className="text-lg font-normal text-blue-600">
              ({practices.length} registradas)
            </span>
          </h2>
          <p className="text-muted-foreground mt-1">
            Instituto Latinoamericano y del Caribe de Planificación Económica y Social
          </p>
          <p className="text-sm text-muted-foreground">
            Repositorio de políticas públicas y mejores prácticas documentadas para América Latina
          </p>
          {!isLoading && practices.length > 0 && (
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">{practices.length} prácticas documentadas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{uniqueCountries.length} países representados</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
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
                            <Input {...field} placeholder="Organización responsable" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

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
          
          <Button 
            variant="outline" 
            onClick={() => scrapeMutation.mutate()}
            disabled={scrapeMutation.isPending}
          >
            {scrapeMutation.isPending ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin" />
                Extrayendo...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Extraer de Repositorios
              </>
            )}
          </Button>
        </div>
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
      <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
        <span>
          Mostrando {filteredPractices.length} de {(practices as BestPractice[]).length} prácticas
        </span>
        <span className="font-medium">
          Total en repositorio: {practices.length} buenas prácticas documentadas
        </span>
      </div>

      <div className="grid gap-4">
        {filteredPractices.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No se encontraron prácticas que coincidan con los filtros</p>
            </CardContent>
          </Card>
        ) : (
          filteredPractices.map((practice) => (
            <Card key={practice.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{practice.title}</h3>
                      <p className="text-muted-foreground mb-3">{practice.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">País:</span>
                      <span>{practice.country}</span>
                    </div>
                    {practice.institution && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Institución:</span>
                        <span>{practice.institution}</span>
                      </div>
                    )}
                    {practice.year && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Año:</span>
                        <span>{practice.year}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Criterios objetivo:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {practice.targetCriteria.map((criterion, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
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