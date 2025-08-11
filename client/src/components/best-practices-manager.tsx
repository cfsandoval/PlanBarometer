import React, { useState, useMemo } from 'react';
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
import { Plus, ExternalLink, Edit, Trash2, BookOpen, Filter, Search, Download, Globe, Terminal, Sparkles, Calendar, FileText } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { BestPractice } from '@shared/schema';
import TerminalWindow from "./terminal-window";
import TOPPSearchModule from "./topp-search-module";

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

interface TerminalEntry {
  id: string;
  timestamp: string;
  command: string;
  output: string;
  status: 'running' | 'success' | 'error';
}

export default function BestPracticesManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCountry, setFilterCountry] = useState<string>('all');
  const [terminalEntries, setTerminalEntries] = useState<TerminalEntry[]>([]);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [toppFilters, setToppFilters] = useState<any>({});
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
      const count = data.practices?.length || 0;
      alert(`🎉 Extracción exitosa!\n\n📋 ${count} nuevas prácticas agregadas al repositorio\n🌐 Datos extraídos de repositorios oficiales\n✅ Información verificada y actualizada`);
    },
  });

  const addTerminalEntry = (command: string, output: string, status: 'running' | 'success' | 'error' = 'success') => {
    const entry: TerminalEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      command,
      output,
      status
    };
    setTerminalEntries(prev => [...prev, entry]);
  };

  const toppScrapeMutation = useMutation({
    mutationFn: async () => {
      const startTime = Date.now();
      addTerminalEntry('scrape-topp --repositories=6 --dimensions=TOPP', 'Iniciando extracción especializada TOPP...', 'running');
      
      const response = await fetch('/api/best-practices/scrape-topp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to scrape TOPP');
      
      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      addTerminalEntry(
        'scrape-topp --completed', 
        `✓ Extracción completada en ${duration}s\n✓ ${data.count} prácticas TOPP agregadas\n✓ Dimensiones: Técnicas, Operativas, Políticas, Prospectivas\n✓ Repositorios: CEPAL, BID, Chile, Colombia, México, Perú`, 
        'success'
      );
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/best-practices'] });
      const count = data.practices?.length || 0;
      alert(`🎯 Extracción TOPP exitosa!\n\n📊 ${count} prácticas de capacidades institucionales agregadas\n🔍 Enfoque en dimensiones Técnicas, Operativas, Políticas y Prospectivas\n✅ Datos especializados en fortalecimiento institucional`);
    },
    onError: (error) => {
      addTerminalEntry('scrape-topp --error', `✗ Error: ${error.message}`, 'error');
    }
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

  const filteredPractices = useMemo(() => {
    return (practices as BestPractice[]).filter((practice) => {
      const matchesSearch = 
        practice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practice.country.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === 'all' || practice.sourceType === filterType;
      const matchesCountry = filterCountry === 'all' || practice.country === filterCountry;
      
      // TOPP Filters
      const matchesToppFilters = Object.entries(toppFilters).every(([key, value]) => {
        if (!value || value === '') return true;
        
        switch (key) {
          case 'dimension':
            return practice.tags?.some(tag => 
              tag.toLowerCase().includes(value.toLowerCase())
            );
          case 'country':
            return practice.country.toLowerCase().includes(value.toLowerCase());
          case 'institution':
            return practice.institution?.toLowerCase().includes(value.toLowerCase());
          case 'year':
            return practice.year?.toString() === value;
          case 'keyword':
            return practice.title.toLowerCase().includes(value.toLowerCase()) ||
                   practice.description.toLowerCase().includes(value.toLowerCase()) ||
                   practice.results?.toLowerCase().includes(value.toLowerCase());
          case 'targetCriterion':
            return practice.targetCriteria?.some(criteria => 
              criteria.toLowerCase().includes(value.toLowerCase())
            );
          default:
            return true;
        }
      });
      
      return matchesSearch && matchesType && matchesCountry && matchesToppFilters;
    });
  }, [practices, searchTerm, filterType, filterCountry, toppFilters]);

  const handleToppSearch = (filters: any) => {
    setToppFilters(filters);
    const activeFilters = Object.entries(filters).filter(([k,v]) => v);
    addTerminalEntry(
      'filter-topp --criteria=' + activeFilters.map(([k]) => k).join(','),
      `Aplicando filtros TOPP:\n${activeFilters.map(([k,v]) => `• ${k}: ${v}`).join('\n')}\nResultados: ${filteredPractices.length} prácticas encontradas`,
      'success'
    );
  };

  const handleToppClear = () => {
    setToppFilters({});
    addTerminalEntry('clear-filters', 'Filtros TOPP limpiados. Mostrando todas las prácticas.', 'success');
  };

  const exportLinksToTxt = () => {
    const practicesWithLinks = filteredPractices.filter(practice => practice.sourceUrl);
    
    if (practicesWithLinks.length === 0) {
      alert('No hay prácticas con enlaces para exportar en los resultados filtrados.');
      return;
    }

    const txtContent = [
      '# Enlaces del Banco de Buenas Prácticas ILPES-CEPAL',
      `# Exportado el: ${new Date().toLocaleDateString('es-ES')} a las ${new Date().toLocaleTimeString('es-ES')}`,
      `# Total de enlaces: ${practicesWithLinks.length}`,
      '',
      ...practicesWithLinks.map((practice, index) => [
        `${index + 1}. ${practice.title}`,
        `   País: ${practice.country}`,
        `   Institución: ${practice.institution || 'N/A'}`,
        `   Año: ${practice.year || 'N/A'}`,
        `   Tipo: ${practice.sourceType}`,
        `   Criterios objetivo: ${practice.targetCriteria?.join(', ') || 'N/A'}`,
        `   Enlace: ${practice.sourceUrl}`,
        `   Incorporada: ${practice.incorporatedAt ? new Date(practice.incorporatedAt).toLocaleDateString('es-ES') : 'N/A'}`,
        ''
      ]).flat()
    ].join('\n');

    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `enlaces-buenas-practicas-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addTerminalEntry(
      'export-links --format=txt',
      `✓ Enlaces exportados exitosamente\n✓ ${practicesWithLinks.length} prácticas con enlaces\n✓ Archivo: enlaces-buenas-practicas-${new Date().toISOString().split('T')[0]}.txt`,
      'success'
    );
  };

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
            <span className="text-lg font-normal text-blue-600 flex items-center gap-1">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
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
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">📊 {practices.length} prácticas documentadas</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>🌎 {uniqueCountries.length} países representados</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className="border-gray-300 hover:bg-gray-50"
          >
            <Terminal className="h-4 w-4 mr-2" />
            Terminal TOPP
          </Button>
          
          <Button 
            variant="outline" 
            onClick={exportLinksToTxt}
            className="border-blue-300 hover:bg-blue-50"
          >
            <FileText className="h-4 w-4 mr-2" />
            Exportar Enlaces TXT
          </Button>
          
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
            className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 hover:from-blue-100 hover:to-green-100"
          >
            {scrapeMutation.isPending ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin text-blue-600" />
                <span className="text-blue-700">Extrayendo datos...</span>
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-gray-700 font-medium">🌐 Extraer Repositorios Generales</span>
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={() => toppScrapeMutation.mutate()}
            disabled={toppScrapeMutation.isPending}
            className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 hover:from-orange-100 hover:to-red-100"
          >
            {toppScrapeMutation.isPending ? (
              <>
                <Download className="h-4 w-4 mr-2 animate-spin text-orange-600" />
                <span className="text-orange-700">Extrayendo TOPP...</span>
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2 text-red-600" />
                <span className="text-gray-700 font-medium">🎯 Extraer Capacidades TOPP</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* TOPP Search Module */}
      <TOPPSearchModule onSearch={handleToppSearch} onClear={handleToppClear} />

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
          {filteredPractices.filter(p => p.sourceUrl).length > 0 && (
            <span className="ml-2 text-blue-600">
              ({filteredPractices.filter(p => p.sourceUrl).length} con enlaces)
            </span>
          )}
        </span>
        <span className="font-medium flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full"></span>
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
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{practice.title}</h3>
                        {practice.isNew && (
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-4 w-4 text-yellow-500" />
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                              NUEVA
                            </Badge>
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{practice.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        Incorporada: {practice.incorporatedAt ? new Date(practice.incorporatedAt).toLocaleDateString('es-ES') : 'N/A'}
                      </span>
                    </div>
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

      {/* Terminal Window */}
      <TerminalWindow 
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        entries={terminalEntries}
      />
    </div>
  );
}