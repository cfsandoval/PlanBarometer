import { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ConsensusGaugeProps {
  value: number; // 0-1
  title: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  thresholds?: {
    high: number;
    medium: number;
  };
}

export function ConsensusGauge({
  value,
  title,
  description,
  size = 'md',
  showDetails = false,
  thresholds = { high: 0.7, medium: 0.5 }
}: ConsensusGaugeProps) {
  const { level, color, icon: Icon, label } = useMemo(() => {
    if (value >= thresholds.high) {
      return {
        level: 'high',
        color: 'text-green-600',
        icon: TrendingUp,
        label: 'Alto Consenso'
      };
    } else if (value >= thresholds.medium) {
      return {
        level: 'medium',
        color: 'text-yellow-600',
        icon: Minus,
        label: 'Consenso Moderado'
      };
    } else {
      return {
        level: 'low',
        color: 'text-red-600',
        icon: TrendingDown,
        label: 'Bajo Consenso'
      };
    }
  }, [value, thresholds]);

  const sizeConfig = {
    sm: {
      gauge: 'w-16 h-16',
      stroke: '4',
      text: 'text-xs',
      titleText: 'text-sm'
    },
    md: {
      gauge: 'w-24 h-24',
      stroke: '6',
      text: 'text-sm',
      titleText: 'text-base'
    },
    lg: {
      gauge: 'w-32 h-32',
      stroke: '8',
      text: 'text-base',
      titleText: 'text-lg'
    }
  };

  const config = sizeConfig[size];
  const radius = size === 'sm' ? 28 : size === 'md' ? 42 : 56;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (value * circumference);
  const percentage = Math.round(value * 100);

  const getStrokeColor = () => {
    if (value >= thresholds.high) return '#10b981'; // green-500
    if (value >= thresholds.medium) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className={`${config.titleText} font-semibold text-gray-900 dark:text-white`}>
          {title}
        </CardTitle>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {/* Circular Gauge */}
        <div className="relative">
          <svg className={config.gauge} viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="currentColor"
              strokeWidth={config.stroke}
              fill="none"
              className="text-gray-200 dark:text-gray-700"
            />
            
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke={getStrokeColor()}
              strokeWidth={config.stroke}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              className="transition-all duration-1000 ease-out"
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%'
              }}
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`${config.text} font-bold ${color}`}>
              {percentage}%
            </div>
            <Icon className={`w-3 h-3 ${color} mt-1`} />
          </div>
        </div>

        {/* Label and details */}
        <div className="text-center">
          <Badge 
            variant={level === 'high' ? 'default' : level === 'medium' ? 'secondary' : 'destructive'}
            className="text-xs"
          >
            {label}
          </Badge>
          
          {showDetails && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-center space-x-1 text-xs text-gray-600 dark:text-gray-400">
                <BarChart3 className="w-3 h-3" />
                <span>Nivel de Acuerdo</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className={`font-medium ${value >= thresholds.high ? 'text-green-600' : 'text-gray-400'}`}>
                    Alto
                  </div>
                  <div className="text-gray-500">
                    ≥{Math.round(thresholds.high * 100)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${value >= thresholds.medium && value < thresholds.high ? 'text-yellow-600' : 'text-gray-400'}`}>
                    Medio
                  </div>
                  <div className="text-gray-500">
                    {Math.round(thresholds.medium * 100)}-{Math.round(thresholds.high * 100 - 1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className={`font-medium ${value < thresholds.medium ? 'text-red-600' : 'text-gray-400'}`}>
                    Bajo
                  </div>
                  <div className="text-gray-500">
                    &lt;{Math.round(thresholds.medium * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Component for multiple gauges in a grid
interface ConsensusGaugeGridProps {
  gauges: Array<{
    id: string;
    title: string;
    value: number;
    description?: string;
  }>;
  columns?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
}

export function ConsensusGaugeGrid({ 
  gauges, 
  columns = 3, 
  size = 'md' 
}: ConsensusGaugeGridProps) {
  const gridClass = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClass[columns]} gap-4`}>
      {gauges.map((gauge) => (
        <ConsensusGauge
          key={gauge.id}
          title={gauge.title}
          value={gauge.value}
          description={gauge.description}
          size={size}
          showDetails={size !== 'sm'}
        />
      ))}
    </div>
  );
}