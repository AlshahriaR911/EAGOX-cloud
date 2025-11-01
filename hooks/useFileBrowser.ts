import { useState, useEffect, useCallback, useContext } from 'react';
import { FileItemData } from '../types';
import * as api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export const useFileBrowser = (isProfilePage = false) => {
  const [items, setItems] = useState<FileItemData[]>([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useContext(AuthContext);

  const fetchFiles = useCallback(async (path: string) => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const fetchedItems = isProfilePage 
        ? await api.getMyFiles(user.email)
        : await api.getFiles(path);

      // Sort so folders appear before files
      fetchedItems.sort((a, b) => {
        if (a.type === 'folder' && b.type === 'file') return -1;
        if (a.type === 'file' && b.type === 'folder') return 1;
        return a.name.localeCompare(b.name);
      });
      setItems(fetchedItems);
    } catch (err) {
      setError('Failed to fetch files. Please ensure the server is running and accessible.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isProfilePage]);

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath, fetchFiles]);

  const navigate = (item: FileItemData) => {
    if (item.type === 'folder') {
      const newPath = currentPath === '/' ? `/${item.name}` : `${currentPath}/${item.name}`;
      setCurrentPath(newPath);
    } else {
      api.downloadFile(currentPath, item.name);
    }
  };
  
  const navigateToPath = (path: string) => {
    setCurrentPath(path);
  };
  
  const uploadFile = async (file: File) => {
    if (!user) throw new Error("User not authenticated");
    try {
      await api.uploadFile(currentPath, file, user.email);
      await fetchFiles(currentPath); // Refresh list after upload
    } catch (err) {
      setError('Failed to upload file.');
      console.error(err);
      throw err;
    }
  };

  const deleteItem = async (item: FileItemData) => {
    try {
      await api.deleteItem(currentPath, item.name, item.type);
      await fetchFiles(currentPath); // Refresh list after deletion
    } catch (err) {
      setError('Failed to delete item.');
      console.error(err);
    }
  };
  
  const createFolder = async (folderName: string) => {
    if(!user) throw new Error("User not authenticated");
    try {
      await api.createFolder(currentPath, folderName, user.email);
      await fetchFiles(currentPath); // Refresh list after creation
    } catch (err) {
      setError('Failed to create folder.');
      console.error(err);
    }
  };

  const toggleLock = async (item: FileItemData) => {
    try {
        await api.toggleLock(currentPath, item.name);
        await fetchFiles(currentPath);
    } catch (err) {
        setError('Failed to update lock status.');
        console.error(err);
    }
  };

  return { items, currentPath, isLoading, error, navigate, navigateToPath, uploadFile, deleteItem, createFolder, toggleLock };
};