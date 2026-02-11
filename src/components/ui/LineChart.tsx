// src/components/ui/LineChart.tsx
import React from 'react';

interface LineChartProps {
  data: Array<{ name: string; value: number }>;
  title?: string;
  height?: string;
  width?: string;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  title, 
  height = 'h-64', 
  width = 'w-full',
  color = 'blue'
}) => {
  if (data.length < 2) {
    return (
      <div className={`${width} ${height} flex items-center justify-center text-gray-500`}>
        Insufficient data to display chart
      </div>
    );
  }
  
  // Find min and max values for scaling
  const values = data.map(item => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1; // Avoid division by zero
  
  // Calculate coordinates for the line
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    // Invert y-axis (SVG coordinates start from top)
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  // Generate coordinates for the area under the line
  const areaPoints = `0,100 ${points} 100,100`;
  
  const colorClasses = {
    blue: 'stroke-blue-500 fill-blue-100',
    green: 'stroke-green-500 fill-green-100',
    red: 'stroke-red-500 fill-red-100',
    yellow: 'stroke-yellow-500 fill-yellow-100',
    purple: 'stroke-purple-500 fill-purple-100',
  };
  
  const selectedColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;
  
  return (
    <div className={`${width}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className={`${height} relative`}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
          {/* Area under the line */}
          <polygon 
            points={areaPoints} 
            className={`${selectedColor} opacity-30`} 
          />
          {/* Line */}
          <polyline 
            points={points} 
            fill="none" 
            strokeWidth="2" 
            strokeLinejoin="round"
            strokeLinecap="round"
            className={`${selectedColor.split(' ')[0]}`}
          />
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1.5"
                className={`${selectedColor.split(' ')[0]}`}
              />
            );
          })}
        </svg>
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="text-xs text-gray-600 transform -translate-x-1/2"
              style={{ left: `${(index / (data.length - 1)) * 100}%` }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { LineChart };