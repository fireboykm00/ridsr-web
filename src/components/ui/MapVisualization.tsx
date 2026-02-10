// src/components/ui/MapVisualization.tsx
import React from 'react';

interface RegionData {
  name: string;
  value: number;
  colorIntensity: number; // 0 to 1 scale for color intensity
}

interface MapVisualizationProps {
  regions: RegionData[];
  title?: string;
  onRegionClick?: (region: RegionData) => void;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ 
  regions, 
  title,
  onRegionClick 
}) => {
  // Simple SVG map of Rwanda with 5 provinces represented as rectangles
  // In a real implementation, this would be replaced with actual geographic SVG paths
  
  const provincePositions = [
    { id: 'kigali', name: 'Kigali City', x: 40, y: 30, width: 20, height: 15 },
    { id: 'north', name: 'Northern Province', x: 30, y: 10, width: 40, height: 15 },
    { id: 'south', name: 'Southern Province', x: 30, y: 50, width: 40, height: 20 },
    { id: 'east', name: 'Eastern Province', x: 65, y: 30, width: 25, height: 25 },
    { id: 'west', name: 'Western Province', x: 10, y: 25, width: 25, height: 30 },
  ];
  
  // Find min and max values for color scaling
  const values = regions.map(r => r.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  
  const getColor = (value: number) => {
    // Normalize value to 0-1 scale
    const normalized = (value - minValue) / range;
    // Convert to hex color from light yellow to dark red
    const intensity = Math.floor(normalized * 255);
    return `rgb(${255}, ${255 - intensity}, ${255 - intensity})`;
  };
  
  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <div className="relative w-full h-64">
          <svg 
            viewBox="0 0 100 80" 
            className="w-full h-full"
          >
            {provincePositions.map((province, index) => {
              const regionData = regions.find(r => 
                r.name.toLowerCase().includes(province.name.toLowerCase())
              );
              
              return (
                <rect
                  key={index}
                  x={province.x}
                  y={province.y}
                  width={province.width}
                  height={province.height}
                  rx="2"
                  ry="2"
                  fill={regionData ? getColor(regionData.value) : "#E5E7EB"}
                  stroke="#9CA3AF"
                  strokeWidth="0.5"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => regionData && onRegionClick?.(regionData)}
                >
                  {regionData && (
                    <title>{`${province.name}: ${regionData.value}`}</title>
                  )}
                </rect>
              );
            })}
            
            {/* Province labels */}
            {provincePositions.map((province, index) => (
              <text
                key={`label-${index}`}
                x={province.x + province.width / 2}
                y={province.y + province.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="2"
                fontWeight="bold"
                fill="#4B5563"
                className="pointer-events-none"
              >
                {province.name.split(' ')[0]}
              </text>
            ))}
          </svg>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex items-center justify-center">
          <div className="flex items-center">
            <div className="text-xs text-gray-600 mr-2">Low</div>
            <div className="w-16 h-2 bg-gradient-to-r from-yellow-200 to-red-500 rounded"></div>
            <div className="text-xs text-gray-600 ml-2">High</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapVisualization;