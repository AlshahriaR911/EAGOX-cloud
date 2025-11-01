import React from 'react';
import { FileItemData } from '../types';
import { FileItem } from './FileItem';
import { Icon } from './Icon';

interface FileListProps {
  items: FileItemData[];
  onItemClick: (item: FileItemData) => void;
  onItemPreview: (item: FileItemData) => void;
  onDeleteItem: (item: FileItemData) => void;
  onToggleLock: (item: FileItemData) => void;
}

export const FileList: React.FC<FileListProps> = ({ items, onItemClick, onItemPreview, onDeleteItem, onToggleLock }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <Icon name="empty" className="w-16 h-16 mx-auto mb-4" />
        <h3 className="text-xl font-semibold">This folder is empty</h3>
        <p>Upload a file to get started.</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-600 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 sm:pl-0">Name</th>
                  <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 sm:table-cell">Size</th>
                  <th scope="col" className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-gray-300 lg:table-cell">Last Modified</th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {items.map((item) => (
                  <FileItem
                    key={item.name + item.type}
                    item={item}
                    onClick={() => onItemClick(item)}
                    onPreview={() => onItemPreview(item)}
                    onDelete={() => onDeleteItem(item)}
                    onToggleLock={() => onToggleLock(item)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
