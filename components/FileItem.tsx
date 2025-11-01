import React, { useContext } from 'react';
import { FileItemData } from '../types';
import { Icon } from './Icon';
import { AuthContext } from '../contexts/AuthContext';
import * as api from '../services/api';

interface FileItemProps {
  item: FileItemData;
  onClick: () => void;
  onPreview: () => void;
  onDelete: () => void;
  onToggleLock: () => void;
}

const formatSize = (bytes?: number): string => {
  if (bytes === undefined || bytes === 0) return '-';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))), 10);
  if (i === 0) return `${bytes} ${sizes[i]}`;
  return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
};

export const FileItem: React.FC<FileItemProps> = ({ item, onClick, onPreview, onDelete, onToggleLock }) => {
  const { user } = useContext(AuthContext);
  const isFolder = item.type === 'folder';

  const handleItemClick = () => {
    if (isFolder) {
      onClick(); // For folders, this is navigation
    } else {
      onPreview(); // For files, this opens the preview modal
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Assuming 'currentPath' needs to be sourced. This is a simplification.
    // In a real app, the path would be passed down or available in a context.
    // For the mock, we can hardcode '/' as the path.
    api.downloadFile('/', item.name);
  };

  return (
    <tr className="hover:bg-gray-100 dark:hover:bg-gray-700 group transition-colors duration-150">
      <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:w-auto sm:max-w-none sm:pl-0">
        <button onClick={handleItemClick} className="flex items-center w-full text-left space-x-3 group">
          <Icon name={isFolder ? 'folder' : 'file'} className={`w-6 h-6 ${isFolder ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}`} />
          <span className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">{item.name}</span>
        </button>
      </td>
      <td className="hidden px-3 py-4 text-sm text-gray-500 dark:text-gray-400 sm:table-cell">
        {isFolder ? '-' : formatSize(item.size)}
      </td>
      <td className="hidden px-3 py-4 text-sm text-gray-500 dark:text-gray-400 lg:table-cell">
        {item.lastModified || '-'}
      </td>
      <td className="py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
        <div className="flex justify-end items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isFolder && (
             <>
              <button onClick={(e) => { e.stopPropagation(); onPreview(); }} className="text-gray-400 hover:text-green-500 p-1 rounded-full transition-colors" title="Preview File">
                  <Icon name="view" className="w-5 h-5" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onToggleLock(); }} className="text-gray-400 hover:text-yellow-500 p-1 rounded-full transition-colors" title={item.isLocked ? "Unlock File" : "Lock File"}>
                  <Icon name={item.isLocked ? 'lock' : 'unlock'} className="w-5 h-5" />
              </button>
              <button onClick={handleDownload} className="text-gray-400 hover:text-blue-500 p-1 rounded-full transition-colors" title="Download">
                  <Icon name="download" className="w-5 h-5" />
              </button>
             </>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }} 
            className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors disabled:text-gray-600 disabled:hover:text-gray-600 disabled:cursor-not-allowed" 
            title={item.isLocked ? (user?.isAdmin ? "Delete (Admin Override)" : "File is locked") : "Delete"}
            disabled={item.isLocked && !user?.isAdmin}
          >
            <Icon name="trash" className="w-5 h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};
