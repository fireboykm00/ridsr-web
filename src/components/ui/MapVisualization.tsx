import React from 'react';

interface MapVisualizationProps {
  data: Array<{
    district: string;
    value: number;
  }>;
  title?: string;
  height?: number;
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({ data, title, height = 400 }) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div 
        className="bg-gray-100 rounded-lg flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-gray-500 text-center">
          <div className="text-2xl mb-2">🗺️</div>
          <p>Map Visualization</p>
          <p className="text-sm">({data.length} districts)</p>
        </div>
      </div>
    </div>
  );
};