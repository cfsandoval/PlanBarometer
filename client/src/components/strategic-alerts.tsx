import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StrategicAlert } from "@/types/planbarometro";
import { generateStrategicAlerts, getAlertSeverityColor, getAlertIcon } from "@/lib/alerts-engine";
import { AlertTriangle, AlertCircle, Info, CheckCircle } from "lucide-react";
import GaugeChart from "./gauge-chart";
import { t } from "@/lib/i18n";

interface StrategicAlertsProps {
  alerts: StrategicAlert[];
}

export default function StrategicAlerts({ alerts }: StrategicAlertsProps) {
  const getIcon = (severity: StrategicAlert['severity']) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-6 w-6" />;
      case 'medium': return <AlertCircle className="h-6 w-6" />;
      case 'low': return <Info className="h-6 w-6" />;
      default: return <Info className="h-6 w-6" />;
    }
  };

  const getSeverityBadge = (severity: StrategicAlert['severity']) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800', 
      low: 'bg-green-100 text-green-800'
    };
    
    const labels = {
      high: t('highRisk'),
      medium: t('mediumRisk'),
      low: t('lowRisk')
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[severity]}`}>
        {labels[severity]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{t('strategicAlertsTitle')}</h2>
        <p className="text-gray-600">{t('strategicAlertsTitle')}</p>
      </div>

      {alerts.length === 0 ? (
        <div className="space-y-6">
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">{t('noAlertsMessage')}</h3>
              <p className="text-green-700">{t('favorableSituationText')}</p>
            </CardContent>
          </Card>
          
          {/* Gráfico de bajo riesgo general */}
          <Card>
            <CardContent className="p-6">
              <h4 className="text-lg font-semibold text-green-800 mb-4 text-center">
                Estado General de Riesgo: BAJO
              </h4>
              <div className="flex justify-center items-center space-x-8">
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-2">
                    <GaugeChart
                      value={20}
                      label="Riesgo General"
                      severity="low"
                      size={128}
                    />
                  </div>
                  <p className="text-sm text-gray-600">Riesgo General: 20%</p>
                </div>
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-2">
                    <GaugeChart
                      value={90}
                      label="Estabilidad"
                      severity="low"
                      size={128}
                    />
                  </div>
                  <p className="text-sm text-gray-600">Estabilidad: 90%</p>
                </div>
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-2">
                    <GaugeChart
                      value={15}
                      label="Urgencia"
                      severity="low"
                      size={128}
                    />
                  </div>
                  <p className="text-sm text-gray-600">Urgencia: 15%</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-100 rounded-lg">
                <h5 className="font-semibold text-green-800 mb-2">Situación Favorable</h5>
                <p className="text-green-700 text-sm">
                  Los resultados de la evaluación indican un equilibrio adecuado entre las diferentes capacidades. 
                  Se recomienda mantener los niveles actuales y continuar con el monitoreo periódico para 
                  asegurar que se mantenga esta situación favorable.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${getAlertSeverityColor(alert.severity).split(' ')[0]} shadow-md`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className={`flex-shrink-0 ${getAlertSeverityColor(alert.severity).split(' ')[1]}`}>
                    {getIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-lg font-semibold ${getAlertSeverityColor(alert.severity).split(' ')[1]}`}>
                        {alert.title}
                      </h3>
                      {getSeverityBadge(alert.severity)}
                    </div>
                    <p className="text-gray-700 mb-3">{alert.description}</p>
                    <div className="text-sm text-gray-600 mb-3">
                      <strong>Criterios involucrados:</strong> {alert.criteria.join(', ')}
                    </div>
                    {alert.recommendation && (
                      <Alert className="mt-3">
                        <AlertDescription>
                          <strong>Recomendación:</strong> {alert.recommendation}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  {/* Gauge Charts Section */}
                  {alert.metrics && (
                    <div className="flex-shrink-0">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Indicadores de Alerta</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <GaugeChart
                            value={alert.metrics.riskLevel}
                            label="Nivel de Riesgo"
                            size={100}
                            severity={alert.severity}
                          />
                          <GaugeChart
                            value={alert.metrics.impactLevel}
                            label="Impacto"
                            size={100}
                            severity={alert.severity}
                          />
                          <GaugeChart
                            value={alert.metrics.urgencyLevel}
                            label="Urgencia"
                            size={100}
                            severity={alert.severity}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Methodology Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-700 flex items-center">
            <Info className="mr-2 h-5 w-5" />
            Sobre las Alertas Estratégicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            Las alertas estratégicas identifican patrones que pueden señalar problemas potenciales en el sistema de planificación. 
            Estas alertas se basan en la metodología del Planbarómetro y buscan anticipar situaciones que podrían comprometer 
            la efectividad de las políticas públicas.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded p-3">
              <div className="font-medium text-red-600 mb-1">Alto Riesgo</div>
              <div className="text-gray-600">Requiere atención inmediata</div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="font-medium text-yellow-600 mb-1">Riesgo Medio</div>
              <div className="text-gray-600">Monitoreo recomendado</div>
            </div>
            <div className="bg-white rounded p-3">
              <div className="font-medium text-green-600 mb-1">Bajo Riesgo</div>
              <div className="text-gray-600">Situación favorable</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
