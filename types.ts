export type FileItemType = 'file' | 'folder';

export interface FileItemData {
  name: string;
  type: FileItemType;
  size?: number;
  lastModified?: string;
  isLocked?: boolean;
  owner?: string; // e.g., user's email
}

export interface User {
  email: string;
  isAdmin?: boolean;
  displayName?: string;
  bio?: string;
  profilePictureUrl?: string;
}
