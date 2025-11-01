import React, { useState, useEffect } from 'react';
import { FileItemData } from '../types';
import { Icon } from './Icon';
import { Spinner } from './Spinner';
import * as api from '../services/api';

interface FilePreviewModalProps {
  item: FileItemData;
  currentPath: string;
  onClose: () => void;
}

const isImage = (filename: string) => /\.(jpe?g|png|gif)$/i.test(filename);
const isText = (filename: string) => /\.(txt|md)$/i.test(filename);

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ item, currentPath, onClose }) => {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;

    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      setContent(null);
      try {
        if (isImage(item.name) || isText(item.name)) {
          const blob = await api.getFileContentAsBlob(currentPath, item.name);
          if (isText(item.name)) {
            setContent(await blob.text());
          } else {
            setContent(URL.createObjectURL(blob));
          }
        } else {
          // Unsupported type for preview
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setError('Failed to load file preview.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();

    // Cleanup object URL
    return () => {
      if (content && content.startsWith('blob:')) {
        URL.revokeObjectURL(content);
      }
    };
  }, [item, currentPath]);
  
  const handleDownload = () => {
      api.downloadFile(currentPath, item.name);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 min-w-0">
            <Icon name={isImage(item.name) ? 'file' : 'file'} className="w-6 h-6 text-blue-500 flex-shrink-0" />
            <h3 className="text-lg font-semibold truncate" title={item.name}>{item.name}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors text-sm">
                <Icon name="download" className="w-4 h-4" />
                Download
            </button>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                <Icon name="close" className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 flex items-center justify-center">
          {isLoading ? (
            <div className="text-center">
                <Spinner />
                <p className="mt-2">Loading preview...</p>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : content ? (
            isImage(item.name) ? (
              <img src={content} alt={item.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <pre className="whitespace-pre-wrap text-left w-full h-full text-sm font-mono">{content}</pre>
            )
          ) : (
            <div className="text-center text-gray-500">
                <Icon name="file" className="w-24 h-24 mx-auto mb-4" />
                <h3 className="text-xl font-semibold">Preview not available</h3>
                <p>This file type cannot be displayed directly.</p>
                <button onClick={handleDownload} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500">
                    Download File
                </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default FilePreviewModal;
