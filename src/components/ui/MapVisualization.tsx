// src/components/ui/MapVisualization.tsx
'use client';

import { useState, useEffect } from 'react';

interface Region {
  name: string;
  value: number;
  colorIntensity: number;
}

interface MapVisualizationProps {
  regions: Region[];
  onRegionClick?: (region: Region) => void;
}

const MapVisualization = ({ regions, onRegionClick }: MapVisualizationProps) => {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<Region | null>(null);

  // Find min and max values for color scaling
  const values = regions.map(region => region.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Function to get color based on value
  const getColor = (value: number) => {
    // Normalize the value between 0 and 1
    const normalizedValue = (value - minValue) / (maxValue - minValue || 1);
    
    // Create a gradient from light yellow to dark red
    const r = Math.floor(255);
    const g = Math.floor(255 - normalizedValue * 200);
    const b = Math.floor(200 - normalizedValue * 200);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Mock Rwanda map data - simplified SVG paths for provinces
  const mapData = [
    { id: 'kigali', name: 'Kigali City', path: 'M100,50 L150,60 L140,100 L90,90 Z', value: 0 },
    { id: 'north', name: 'Northern Province', path: 'M50,20 L150,30 L140,80 L40,70 Z', value: 0 },
    { id: 'south', name: 'Southern Province', path: 'M50,100 L140,110 L130,160 L40,150 Z', value: 0 },
    { id: 'east', name: 'Eastern Province', path: 'M150,80 L200,90 L190,140 L140,130 Z', value: 0 },
    { id: 'west', name: 'Western Province', path: 'M0,80 L60,90 L50,140 L-10,130 Z', value: 0 },
  ];

  // Update map data with actual values
  const updatedMapData = mapData.map(mapRegion => {
    const regionData = regions.find(r => 
      r.name.toLowerCase().includes(mapRegion.name.toLowerCase().split(' ')[0])
    );
    return {
      ...mapRegion,
      value: regionData?.value || 0,
      color: getColor(regionData?.value || 0)
    };
  });

  const handleRegionClick = (region: { name: string; path: string; value: number; color?: string }) => {
    const regionData = regions.find(r =>
      r.name.toLowerCase().includes(region.name.toLowerCase().split(' ')[0])
    );
    if (regionData) {
      setSelectedRegion(regionData);
      if (onRegionClick) {
        onRegionClick(regionData);
      }
    }
  };

  const handleRegionHover = (region: { name: string; path: string; value: number; color?: string }) => {
    const regionData = regions.find(r =>
      r.name.toLowerCase().includes(region.name.toLowerCase().split(' ')[0])
    );
    setHoveredRegion(regionData || null);
  };

  return (
    <div className="relative">
      <svg 
        viewBox="0 0 200 180" 
        className="w-full h-64 md:h-80 lg:h-96 border border-gray-200 rounded-lg bg-gray-50"
      >
        {updatedMapData.map((region, index) => (
          <path
            key={index}
            d={region.path}
            fill={region.color}
            stroke="#94a3b8"
            strokeWidth="0.5"
            className="cursor-pointer transition-all duration-200 hover:opacity-90"
            onClick={() => handleRegionClick(region)}
            onMouseEnter={() => handleRegionHover(region)}
            onMouseLeave={() => setHoveredRegion(null)}
          />
        ))}
        
        {/* Labels for regions */}
        {updatedMapData.map((region, index) => (
          <text
            key={`label-${index}`}
            x={region.path.split(' ')[1].replace('M', '').split(',')[0]}
            y={parseInt(region.path.split(' ')[1].replace('M', '').split(',')[1]) + 25}
            fontSize="4"
            textAnchor="middle"
            fill="#1e293b"
            fontWeight="bold"
            className="pointer-events-none"
          >
            {region.name.split(' ')[0]}
          </text>
        ))}
      </svg>
      
      {/* Tooltip for hovered region */}
      {hoveredRegion && (
        <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <h4 className="font-semibold text-gray-900">{hoveredRegion.name}</h4>
          <p className="text-sm text-gray-600">{hoveredRegion.value} cases</p>
        </div>
      )}
      
      {/* Legend */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-[#FFC878]"></div>
          <span className="text-xs text-gray-600">Low</span>
          <div className="flex-1 h-2 bg-gradient-to-r from-[#FFC878] via-[#FF6B6B] to-[#AD0000] rounded"></div>
          <span className="text-xs text-gray-600">High</span>
          <div className="w-4 h-4 bg-[#AD0000]"></div>
        </div>
      </div>
    </div>
  );
};

export { MapVisualization };