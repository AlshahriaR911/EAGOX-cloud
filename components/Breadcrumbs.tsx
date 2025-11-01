
import React from 'react';
import { Icon } from './Icon';

interface BreadcrumbsProps {
  path: string;
  onNavigate: (path: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path, onNavigate }) => {
  const pathSegments = path === '/' ? ['Home'] : ['Home', ...path.split('/').filter(Boolean)];

  const handleNavigate = (index: number) => {
    if (index === 0) {
      onNavigate('/');
    } else {
      const newPath = '/' + path.split('/').filter(Boolean).slice(0, index).join('/');
      onNavigate(newPath);
    }
  };

  return (
    <nav className="flex items-center space-x-2 text-gray-400 text-sm md:text-base" aria-label="Breadcrumb">
      {pathSegments.map((segment, index) => (
        <React.Fragment key={index}>
          {index > 0 && <Icon name="chevronRight" className="w-4 h-4 text-gray-500" />}
          <button
            onClick={() => handleNavigate(index)}
            className={`font-medium ${index === pathSegments.length - 1 ? 'text-white' : 'hover:text-blue-400'}`}
            disabled={index === pathSegments.length - 1}
          >
            {segment}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};
