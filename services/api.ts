import { getServerUrl } from './serverConfig';
import { FileItemData, FileItemType, User } from '../types';

// --- MOCK AUTH & USERS ---
const MOCK_DELAY = 500;
let mockUsers: { [email: string]: { pass: string, profile: Omit<User, 'email'> } } = {
  'test@example.com': { 
    pass: 'password123', 
    profile: {
      displayName: 'Test User',
      bio: 'Just a regular user trying out EAGOX CLOUD.',
      profilePictureUrl: 'https://i.pravatar.cc/150?u=test@example.com'
    }
  },
  'admin@eagox.cloud': {
    pass: '2K4FF',
    profile: {
      displayName: 'Cloud Admin',
      bio: 'System Administrator with full privileges.',
      isAdmin: true,
      profilePictureUrl: 'https://i.pravatar.cc/150?u=admin@eagox.cloud'
    }
  }
};

export const login = async (email: string, pass: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const lowerEmail = email.toLowerCase();
  
  if (mockUsers[lowerEmail] && mockUsers[lowerEmail].pass === pass) {
    return { email: lowerEmail, ...mockUsers[lowerEmail].profile };
  }
  throw new Error("Invalid email or password");
};

export const signup = async (email: string, pass: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  const lowerEmail = email.toLowerCase();
  if (mockUsers[lowerEmail]) {
    throw new Error("User with this email already exists");
  }
  const newUserProfile = {
      displayName: lowerEmail.split('@')[0],
      bio: '',
      isAdmin: false,
      profilePictureUrl: `https://i.pravatar.cc/150?u=${lowerEmail}`
  };
  mockUsers[lowerEmail] = { pass, profile: newUserProfile };
  return { email: lowerEmail, ...newUserProfile };
};

export const updateUserProfile = async (email: string, profileData: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const lowerEmail = email.toLowerCase();
    if (mockUsers[lowerEmail]) {
        mockUsers[lowerEmail].profile = { ...mockUsers[lowerEmail].profile, ...profileData };
        return { email: lowerEmail, ...mockUsers[lowerEmail].profile };
    }
    throw new Error("User not found");
};


// --- MOCK FILE SYSTEM ---
let mockFileSystem: { [path: string]: FileItemData[] } = {
  '/': [
    { name: 'Documents', type: 'folder', lastModified: '2023-10-26', owner: 'test@example.com' },
    { name: 'Photos', type: 'folder', lastModified: '2023-10-25', owner: 'test@example.com' },
    { name: 'videos', type: 'folder', lastModified: '2023-10-24', owner: 'test@example.com' },
    { name: 'annual_report.pdf', type: 'file', size: 1024 * 512, lastModified: '2023-10-20', owner: 'test@example.com' },
    { name: 'project_plan.docx', type: 'file', size: 1024 * 128, lastModified: '2023-10-19', owner: 'test@example.com', isLocked: true },
    { name: 'readme.md', type: 'file', size: 1024 * 2, lastModified: '2023-10-27', owner: 'test@example.com' },
  ],
  '/Documents': [
    { name: 'Work', type: 'folder', lastModified: '2023-10-26', owner: 'test@example.com' },
    { name: 'Personal', type: 'folder', lastModified: '2023-10-26', owner: 'test@example.com' },
    { name: 'notes.txt', type: 'file', size: 1024 * 1, lastModified: '2023-10-27', owner: 'test@example.com' },
  ],
  '/Documents/Work': [
    { name: 'quarterly_results.xlsx', type: 'file', size: 1024 * 800, lastModified: '2023-10-15', owner: 'test@example.com' },
  ],
  '/Documents/Personal': [],
  '/Photos': [
    { name: 'vacation_2023.jpg', type: 'file', size: 1024 * 2048, lastModified: '2023-09-01', owner: 'test@example.com' },
    { name: 'family_gathering.png', type: 'file', size: 1024 * 3072, lastModified: '2023-08-15', owner: 'test@example.com' },
    { name: 'logo.svg', type: 'file', size: 1024 * 15, lastModified: '2023-08-10', owner: 'test@example.com' },
  ],
  '/videos': [
      { name: 'promo.mp4', type: 'file', size: 1024 * 1024 * 15, lastModified: '2023-10-01', owner: 'test@example.com' },
  ]
};
// --- END MOCK FILE SYSTEM ---

export const getMyFiles = async (ownerEmail: string): Promise<FileItemData[]> => {
    console.log(`Fetching files for owner: ${ownerEmail} from ${getServerUrl()}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    
    const userFiles: FileItemData[] = [];
    const addedItems = new Set<string>();

    Object.values(mockFileSystem).forEach(directory => {
        directory.forEach(item => {
            if (item.owner === ownerEmail) {
                const uniqueKey = `${item.name}|${item.type}`;
                if (!addedItems.has(uniqueKey)) {
                    userFiles.push(item);
                    addedItems.add(uniqueKey);
                }
            }
        });
    });
    return Promise.resolve(userFiles);
};

export const getFiles = async (path: string): Promise<FileItemData[]> => {
  console.log(`Fetching files for path: ${path} from ${getServerUrl()}`);
  
  // MOCK IMPLEMENTATION
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  if (mockFileSystem[path]) {
    return Promise.resolve([...mockFileSystem[path]]);
  }
  return Promise.resolve([]);
};

export const getFileContentAsBlob = async (path: string, filename: string): Promise<Blob> => {
    console.log(`Fetching content for ${filename} from ${path}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const ext = filename.split('.').pop()?.toLowerCase();
    let blob: Blob;
    switch(ext) {
        case 'txt':
        case 'md':
            blob = new Blob([`# Mock Content for ${filename}\n\nThis is sample text content for previewing files.`], { type: 'text/plain' });
            break;
        case 'jpg':
        case 'jpeg':
            // Using a placeholder image service
            const jpgResponse = await fetch(`https://via.placeholder.com/800x600.jpg?text=${encodeURIComponent(filename)}`);
            blob = await jpgResponse.blob();
            break;
        case 'png':
             const pngResponse = await fetch(`https://via.placeholder.com/800x600.png?text=${encodeURIComponent(filename)}`);
             blob = await pngResponse.blob();
            break;
        case 'gif':
             const gifResponse = await fetch(`https://via.placeholder.com/800x600.gif?text=${encodeURIComponent(filename)}`);
             blob = await gifResponse.blob();
             break;
        default:
            throw new Error('Unsupported file type for preview');
    }
    return blob;
}

export const uploadFile = async (path: string, file: File, ownerEmail: string): Promise<void> => {
  console.log(`Uploading file "${file.name}" to path: ${path} by ${ownerEmail} to ${getServerUrl()}`);
  
  // MOCK IMPLEMENTATION
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY * 2));
  if (!mockFileSystem[path]) {
    mockFileSystem[path] = [];
  }
  const existingIndex = mockFileSystem[path].findIndex(item => item.name === file.name && item.type === 'file');
  const newFile: FileItemData = {
    name: file.name,
    type: 'file',
    size: file.size,
    lastModified: new Date().toISOString().split('T')[0],
    owner: ownerEmail,
  };
  if (existingIndex !== -1) {
    mockFileSystem[path][existingIndex] = newFile;
  } else {
    mockFileSystem[path].push(newFile);
  }
  return Promise.resolve();
};

export const downloadFile = (path: string, filename: string): void => {
    console.log(`Downloading file "${filename}" from path: ${path} from ${getServerUrl()}`);
  
    // MOCK IMPLEMENTATION (Simulates a download link click)
    const fileData = mockFileSystem[path]?.find(f => f.name === filename);
    if(fileData && fileData.size) {
        const mockContent = new Blob([`Mock content for ${filename}`], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(mockContent);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
    }
};

export const deleteItem = async (path: string, itemName: string, itemType: FileItemType): Promise<void> => {
  console.log(`Deleting ${itemType} "${itemName}" from path: ${path} at ${getServerUrl()}`);
  
  // MOCK IMPLEMENTATION
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
  if (mockFileSystem[path]) {
    mockFileSystem[path] = mockFileSystem[path].filter(item => item.name !== itemName);
    if(itemType === 'folder') {
        const folderPath = path === '/' ? `/${itemName}` : `${path}/${itemName}`;
        Object.keys(mockFileSystem).forEach(p => {
            if(p.startsWith(folderPath)) {
                delete mockFileSystem[p];
            }
        });
    }
  }
  return Promise.resolve();
};

export const createFolder = async (path: string, folderName: string, ownerEmail: string): Promise<void> => {
    console.log(`Creating folder "${folderName}" in path: ${path} by ${ownerEmail} at ${getServerUrl()}`);

    // MOCK IMPLEMENTATION
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    if (!mockFileSystem[path]) {
        return Promise.reject(new Error("Parent path does not exist"));
    }
    if (mockFileSystem[path].some(item => item.name === folderName && item.type === 'folder')) {
        return Promise.reject(new Error("Folder already exists"));
    }
    mockFileSystem[path].push({
        name: folderName,
        type: 'folder',
        lastModified: new Date().toISOString().split('T')[0],
        owner: ownerEmail,
    });
    const newFolderPath = path === '/' ? `/${folderName}` : `${path}/${folderName}`;
    mockFileSystem[newFolderPath] = [];
    return Promise.resolve();
};

export const toggleLock = async (path: string, itemName: string): Promise<void> => {
    console.log(`Toggling lock for "${itemName}" in path: ${path} at ${getServerUrl()}`);
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));

    const item = mockFileSystem[path]?.find(i => i.name === itemName);

    if (item) {
        if (item.type === 'file') {
            item.isLocked = !item.isLocked;
        } else {
            return Promise.reject(new Error("Folders cannot be locked."));
        }
    } else {
        return Promise.reject(new Error("Item not found in the specified path."));
    }
    return Promise.resolve();
};
