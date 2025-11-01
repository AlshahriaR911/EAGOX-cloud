import React, { useState, useRef, useCallback } from 'react';
import { Header } from '../components/Header';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FileList } from '../components/FileList';
import { Spinner } from '../components/Spinner';
import { useFileBrowser } from '../hooks/useFileBrowser';
import { FileItemData } from '../types';
import { Icon } from '../components/Icon';

interface FileBrowserProps {
  onNavigate: (page: 'auth' | 'files' | 'profile') => void;
  onShowSettings: () => void;
  onShowAbout: () => void;
  onShowAiAssistant: () => void;
  // Fix: Update onPreviewItem signature to accept path.
  onPreviewItem: (item: FileItemData, path: string) => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({ onNavigate, onShowAbout, onShowSettings, onShowAiAssistant, onPreviewItem }) => {
  const {
    items,
    currentPath,
    isLoading,
    error,
    navigate,
    navigateToPath,
    uploadFile,
    deleteItem,
    createFolder,
    toggleLock,
  } = useFileBrowser();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await handleFileUploads(files);
    }
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleFileUploads = async (files: FileList | File[]) => {
    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadFile(file);
      }
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (item: FileItemData) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      await deleteItem(item);
    }
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setIsCreatingFolder(false);
      setNewFolderName('');
    }
  };

  const handleDragEvents = (e: React.DragEvent<HTMLElement>, action: 'enter' | 'leave' | 'over' | 'drop') => {
    e.preventDefault();
    e.stopPropagation();
    if (action === 'enter' || action === 'over') {
      setIsDragging(true);
    } else if (action === 'leave' || action === 'drop') {
      setIsDragging(false);
    }
    if (action === 'drop') {
      handleFileUploads(e.dataTransfer.files);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <Header 
        onUploadClick={handleUploadClick}
        onNewFolderClick={() => setIsCreatingFolder(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigate={onNavigate}
        onShowAbout={onShowAbout}
        onShowSettings={onShowSettings}
        onShowAiAssistant={onShowAiAssistant}
      />

      <main 
        className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6 relative"
        onDragEnter={(e) => handleDragEvents(e, 'enter')}
        onDragLeave={(e) => handleDragEvents(e, 'leave')}
        onDragOver={(e) => handleDragEvents(e, 'over')}
        onDrop={(e) => handleDragEvents(e, 'drop')}
      >
        <Breadcrumbs path={currentPath} onNavigate={navigateToPath} />
        
        <div className="mt-4 min-h-[50vh] relative">
          {isDragging && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-20 dark:bg-opacity-30 border-4 border-dashed border-blue-500 rounded-lg z-20 pointer-events-none">
              <div className="text-center text-blue-800 dark:text-blue-200">
                <Icon name="upload" className="w-16 h-16 mx-auto" />
                <p className="mt-2 text-xl font-semibold">Drop files to upload</p>
              </div>
            </div>
          )}
          {isLoading || isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 z-10 rounded-lg">
              <div className="text-center">
                <Spinner />
                <p className="mt-2 text-lg">{isUploading ? 'Uploading files...' : 'Loading files...'}</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            <FileList
              items={filteredItems}
              onItemClick={navigate}
              // Fix: Pass currentPath along with the item to the onPreviewItem handler.
              onItemPreview={(item) => onPreviewItem(item, currentPath)}
              onDeleteItem={handleDelete}
              onToggleLock={toggleLock}
            />
          )}
        </div>
      </main>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />

      {isCreatingFolder && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-sm">
            <h3 className="text-xl font-semibold mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => { setIsCreatingFolder(false); setNewFolderName(''); }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileBrowser;
