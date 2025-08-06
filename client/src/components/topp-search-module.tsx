import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BestPractice } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Target, Zap, Users, TrendingUp, X } from "lucide-react";

interface TOPPSearchFilters {
  dimension: string;
  country: string;
  institution: string;
  year: string;
  keyword: string;
  targetCriterion: string;
}

interface TOPPSearchModuleProps {
  onSearch: (filters: TOPPSearchFilters) => void;
  onClear: () => void;
}

export default function TOPPSearchModule({ onSearch, onClear }: TOPPSearchModuleProps) {
  const [filters, setFilters] = useState<TOPPSearchFilters>({
    dimension: '',
    country: '',
    institution: '',
    year: '',
    keyword: '',
    targetCriterion: ''
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const { data: practices } = useQuery({
    queryKey: ['/api/best-practices'],
  });

  // Extract unique values for dropdowns
  const countries = Array.from(new Set(practices?.map((p: any) => p.country) || []));
  const institutions = Array.from(new Set(practices?.map((p: any) => p.institution) || []));
  const years = Array.from(new Set(practices?.map((p: any) => p.year) || [])).sort((a: number, b: number) => b - a);

  const toppDimensions = [
    { value: 'technical', label: '🔧 Técnica', icon: Zap },
    { value: 'operational', label: '⚙️ Operativa', icon: Target },
    { value: 'political', label: '🏛️ Política', icon: Users },
    { value: 'prospective', label: '🔮 Prospectiva', icon: TrendingUp }
  ];

  const targetCriteria = [
    'Gobierno digital',
    'Servicios ciudadanos',
    'Interoperabilidad',
    'Gestión por resultados',
    'Planificación estratégica',
    'Control de gestión',
    'Racionalización de trámites',
    'Transparencia',
    'Simplificación administrativa',
    'Mejora regulatoria',
    'Competitividad',
    'Capacidades institucionales',
    'Efectividad institucional',
    'Políticas basadas en evidencia'
  ];

  const handleFilterChange = (key: keyof TOPPSearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      dimension: '',
      country: '',
      institution: '',
      year: '',
      keyword: '',
      targetCriterion: ''
    });
    onClear();
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg text-orange-800">Búsqueda Especializada TOPP</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                {activeFiltersCount} filtros activos
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-orange-600 hover:text-orange-800"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Dimensión TOPP */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Label className="col-span-full text-sm font-medium text-orange-800 mb-2">
              Dimensión TOPP
            </Label>
            {toppDimensions.map((dim) => (
              <Button
                key={dim.value}
                variant={filters.dimension === dim.value ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterChange('dimension', 
                  filters.dimension === dim.value ? '' : dim.value
                )}
                className={filters.dimension === dim.value 
                  ? "bg-orange-600 hover:bg-orange-700" 
                  : "border-orange-200 hover:bg-orange-50"
                }
              >
                <dim.icon className="h-3 w-3 mr-1" />
                {dim.label}
              </Button>
            ))}
          </div>

          {/* Filtros principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-orange-800">País</Label>
              <Select value={filters.country} onValueChange={(value) => handleFilterChange('country', value)}>
                <SelectTrigger className="border-orange-200">
                  <SelectValue placeholder="Seleccionar país" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los países</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-orange-800">Institución</Label>
              <Select value={filters.institution} onValueChange={(value) => handleFilterChange('institution', value)}>
                <SelectTrigger className="border-orange-200">
                  <SelectValue placeholder="Seleccionar institución" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas las instituciones</SelectItem>
                  {institutions.map((inst) => (
                    <SelectItem key={inst} value={inst}>{inst}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-orange-800">Año</Label>
              <Select value={filters.year} onValueChange={(value) => handleFilterChange('year', value)}>
                <SelectTrigger className="border-orange-200">
                  <SelectValue placeholder="Seleccionar año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los años</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Criterio objetivo */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-orange-800">Criterio Objetivo</Label>
            <Select value={filters.targetCriterion} onValueChange={(value) => handleFilterChange('targetCriterion', value)}>
              <SelectTrigger className="border-orange-200">
                <SelectValue placeholder="Seleccionar criterio objetivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los criterios</SelectItem>
                {targetCriteria.map((criterion) => (
                  <SelectItem key={criterion} value={criterion}>{criterion}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Búsqueda por palabra clave */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-orange-800">Palabra Clave</Label>
            <Input
              placeholder="Buscar en título, descripción o resultados..."
              value={filters.keyword}
              onChange={(e) => handleFilterChange('keyword', e.target.value)}
              className="border-orange-200 focus:border-orange-400"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleSearch}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar Prácticas
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
              className="border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}