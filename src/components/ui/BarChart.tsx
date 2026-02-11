// src/components/ui/BarChart.tsx
import React from 'react';

interface BarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title?: string;
  height?: string;
  width?: string;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data, 
  title, 
  height = 'h-64', 
  width = 'w-full' 
}) => {
  // Find the maximum value to scale the bars
  const maxValue = Math.max(...data.map(item => item.value), 0);
  
  return (
    <div className={`${width}`}>
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className={`${height} flex items-end space-x-2`}>
        {data.map((item, index) => {
          // Calculate bar height as a percentage of the container
          const barHeight = maxValue > 0 ? `${(item.value / maxValue) * 90}%` : '0%';
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex flex-col items-center flex-1 w-full">
                <div 
                  className={`w-4/5 ${item.color || 'bg-blue-500'} rounded-t-md transition-all duration-500 ease-in-out`}
                  style={{ height: barHeight }}
                ></div>
                <div className="mt-2 text-xs text-gray-600 text-center truncate w-full">
                  {item.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { BarChart };