import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface GaugeChartProps {
  value: number; // 0-100
  label?: string;
  size?: number;
  severity?: 'high' | 'medium' | 'low';
}

export default function GaugeChart({ value, label, size = 120, severity = 'medium' }: GaugeChartProps) {
  // Create data for a semi-circle gauge
  const data = [
    { name: 'value', value: value },
    { name: 'remaining', value: 100 - value }
  ];

  // Colors based on severity
  const getColors = () => {
    switch (severity) {
      case 'high':
        return {
          value: '#dc2626', // red-600
          remaining: '#fee2e2', // red-100
          text: '#dc2626'
        };
      case 'medium':
        return {
          value: '#d97706', // amber-600
          remaining: '#fef3c7', // amber-100
          text: '#d97706'
        };
      case 'low':
        return {
          value: '#059669', // emerald-600
          remaining: '#d1fae5', // emerald-100
          text: '#059669'
        };
      default:
        return {
          value: '#6b7280', // gray-500
          remaining: '#f3f4f6', // gray-100
          text: '#6b7280'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size * 0.7 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="85%"
              startAngle={180}
              endAngle={0}
              innerRadius={size * 0.25}
              outerRadius={size * 0.45}
              dataKey="value"
              stroke="none"
            >
              <Cell fill={colors.value} />
              <Cell fill={colors.remaining} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center value display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span 
            className="text-2xl font-bold" 
            style={{ color: colors.text }}
          >
            {Math.round(value)}%
          </span>
        </div>
      </div>
      
      {label && (
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
      )}
    </div>
  );
}