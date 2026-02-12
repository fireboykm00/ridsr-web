import React from 'react';

interface BarChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title, height = 300 }) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-gray-500 text-center">
          <div className="text-2xl mb-2">📊</div>
          <p>Bar Chart</p>
          <p className="text-sm">({data.length} data points)</p>
        </div>
      </div>
    </div>
  );
};