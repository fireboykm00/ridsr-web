// src/components/layout/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import RIDSRLogo from '../ui/RIDSRLogo';

interface SidebarItem {
  name: string;
  href?: string;
  icon?: React.ReactNode;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarItemComponent: React.FC<{
  item: SidebarItem;
  level?: number;
}> = ({ item, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const paddingLeft = level === 0 ? 'pl-3' : `pl-${6 + level * 2}`;
  
  if (item.children && item.children.length > 0) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${paddingLeft}`}
        >
          {item.icon && <span>{item.icon}</span>}
          <span className="flex-1 text-left">{item.name}</span>
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </button>
        {isExpanded && (
          <div className="ml-4 border-l border-gray-200 pl-2">
            {item.children.map((child, idx) => (
              <SidebarItemComponent key={idx} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Link
      href={item.href || '#'}
      className={`flex items-center gap-3 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${paddingLeft}`}
    >
      {item.icon && <span>{item.icon}</span>}
      <span>{item.name}</span>
    </Link>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ items, collapsed = false, onToggleCollapse }) => {
  return (
    <aside 
      className={`bg-white h-full border-r border-gray-200 flex flex-col ${
        collapsed ? 'w-20' : 'w-64'
      } transition-all duration-300`}
    >
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <RIDSRLogo size={32} showText={true} textSize={16} textColor="#1f2937" />
            </div>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {collapsed ? (
                <ChevronRightIcon className="h-5 w-5" />
              ) : (
                <ChevronDownIcon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {items.map((item, index) => (
            <SidebarItemComponent key={index} item={item} />
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        {!collapsed && (
          <div className="text-xs text-gray-500">
            © {new Date().getFullYear()} RIDSR Platform
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;