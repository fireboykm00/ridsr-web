// src/components/ui/PieChart.tsx
import React from 'react';

interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  size = 'md'
}) => {
  // Calculate total for percentage calculation
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate cumulative percentages for positioning
  const cumulativeData = data.reduce((acc, item, index) => {
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const cumulative = index > 0 ? acc[index - 1].cumulative + acc[index - 1].percentage : 0;
    acc.push({
      ...item,
      percentage,
      cumulative
    });
    return acc;
  }, [] as Array<{ name: string; value: number; color: string; percentage: number; cumulative: number }>);

  const sizeClasses = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64'
  };

  return (
    <div className="flex flex-col items-center">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="relative inline-block">
        <svg className={`${sizeClasses[size]} transform -rotate-90`} viewBox="0 0 100 100">
          {cumulativeData.map((item, index) => {
            const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
            const strokeDashoffset = -item.cumulative;

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke={item.color}
                strokeWidth="10"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500 ease-in-out"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{total}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 w-full">
        {cumulativeData.map((item, index) => {
          const percentage = total > 0 ? item.percentage.toFixed(1) : '0.0';
          return (
            <div key={index} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs text-gray-700 truncate">{item.name}</span>
              <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export { PieChart };