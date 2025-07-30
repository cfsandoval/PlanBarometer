import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, MapPin, Calendar, Building, Lightbulb, RefreshCw } from "lucide-react";
import { PolicyExample, fetchPolicyExamples, fallbackExamples } from "@/lib/policy-examples";
import { t } from "@/lib/i18n";

interface PolicyExamplesSectionProps {
  dimensionId: string;
  dimensionName: string;
  percentage: number;
  criteria: any[];
  isVisible: boolean;
}

export default function PolicyExamplesSection({ 
  dimensionId, 
  dimensionName, 
  percentage, 
  criteria,
  isVisible 
}: PolicyExamplesSectionProps) {
  const [examples, setExamples] = useState<PolicyExample[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (isVisible && percentage < 50 && criteria.length > 0) {
      loadPolicyExamples();
    }
  }, [isVisible, percentage, dimensionId]);

  const loadPolicyExamples = async () => {
    setLoading(true);
    setError(null);
    setShowFallback(false);

    try {
      const fetchedExamples = await fetchPolicyExamples(dimensionId, dimensionName, criteria);
      setExamples(fetchedExamples);
    } catch (err) {
      console.error('Error fetching policy examples:', err);
      setError('No se pudieron cargar ejemplos de políticas públicas');
      
      // Show fallback examples
      const fallback = fallbackExamples[dimensionId as keyof typeof fallbackExamples] || [];
      if (fallback.length > 0) {
        setExamples(fallback);
        setShowFallback(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    loadPolicyExamples();
  };

  if (!isVisible || percentage >= 50) {
    return null;
  }

  return (
    <Card className="mt-6 border-l-4 border-l-blue-500 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Lightbulb className="h-5 w-5" />
          Ejemplos de Políticas Públicas Exitosas
          <Badge variant="secondary" className="ml-auto">
            {percentage}% - Oportunidad de Mejora
          </Badge>
        </CardTitle>
        <p className="text-sm text-blue-700">
          Casos documentados de América Latina que fortalecieron esta dimensión
        </p>
      </CardHeader>
      
      <CardContent>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-blue-700">Buscando ejemplos relevantes...</span>
          </div>
        )}

        {error && !showFallback && (
          <div className="text-center py-6">
            <p className="text-red-600 mb-4">{error}</p>
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              size="sm"
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        )}

        {showFallback && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Nota:</span> Mostrando ejemplos de referencia. 
              La búsqueda en tiempo real no está disponible.
            </p>
          </div>
        )}

        {examples.length > 0 && !loading && (
          <div className="space-y-4">
            {examples.map((example, index) => (
              <div 
                key={index}
                className="bg-white border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="font-semibold text-blue-900">{example.country}</span>
                    {example.year && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {example.year}
                      </Badge>
                    )}
                  </div>
                </div>

                <h4 className="font-medium text-gray-900 mb-2">
                  {example.policy}
                </h4>

                <p className="text-sm text-gray-700 mb-3">
                  {example.description}
                </p>

                <div className="bg-green-50 border-l-4 border-green-400 p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <div className="text-green-600 mt-0.5">✓</div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Resultados obtenidos:</p>
                      <p className="text-sm text-green-700">{example.results}</p>
                    </div>
                  </div>
                </div>

                {example.source && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Building className="h-3 w-3" />
                    <span>Fuente: {example.source}</span>
                  </div>
                )}
              </div>
            ))}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">
                    Aplicación a tu contexto
                  </h4>
                  <p className="text-sm text-blue-800 mb-3">
                    Estos ejemplos muestran enfoques exitosos para fortalecer la {dimensionName.toLowerCase()}. 
                    Considera adaptar estas estrategias a tu contexto institucional:
                  </p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Analiza qué elementos de estas políticas son aplicables en tu institución</li>
                    <li>• Identifica recursos y capacidades necesarias para implementación</li>
                    <li>• Busca alianzas con instituciones que hayan tenido experiencias similares</li>
                    <li>• Adapta las metodologías a tu marco normativo y presupuestario</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {!loading && examples.length === 0 && !error && (
          <div className="text-center py-6 text-gray-500">
            <p>No se encontraron ejemplos para esta dimensión.</p>
            <Button 
              onClick={handleRetry} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Buscar nuevamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}