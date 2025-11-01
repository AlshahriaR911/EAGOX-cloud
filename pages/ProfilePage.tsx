import React, { useState, useContext, useRef } from 'react';
import { Header } from '../components/Header';
import { FileList } from '../components/FileList';
import { Spinner } from '../components/Spinner';
import { useFileBrowser } from '../hooks/useFileBrowser';
import { FileItemData, User } from '../types';
import { AuthContext } from '../contexts/AuthContext';
import { Icon } from '../components/Icon';

interface ProfilePageProps {
  onNavigate: (page: 'auth' | 'files' | 'profile') => void;
  onShowSettings: () => void;
  onShowAbout: () => void;
  onShowAiAssistant: () => void;
  // Fix: Update onPreviewItem signature to accept path.
  onPreviewItem: (item: FileItemData, path: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, onShowAbout, onShowSettings, onShowAiAssistant, onPreviewItem }) => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const {
    items,
    // Fix: Destructure currentPath to be available for previewing items.
    currentPath,
    isLoading: filesLoading,
    error: filesError,
    deleteItem,
    toggleLock,
  } = useFileBrowser(true); // true to fetch only user's files
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(formData);
      setIsEditing(false);
    } catch(err) {
      console.error("Failed to update profile", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUserProfile({ profilePictureUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (item: FileItemData) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      await deleteItem(item);
    }
  };
  
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <Header 
        onUploadClick={() => {}}
        onNewFolderClick={() => {}}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onNavigate={onNavigate}
        onShowAbout={onShowAbout}
        onShowSettings={onShowSettings}
        onShowAiAssistant={onShowAiAssistant}
      />

      <main className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sticky top-6">
              <div className="relative w-32 h-32 mx-auto">
                <img src={user?.profilePictureUrl || `https://i.pravatar.cc/150?u=${user?.email}`} alt="Profile" className="w-32 h-32 rounded-full object-cover ring-4 ring-blue-500/50" />
                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-500 transition-transform duration-200 hover:scale-110">
                  <Icon name="upload" className="w-5 h-5"/>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleProfilePicChange} className="hidden" accept="image/*" />
              </div>
              <div className="text-center mt-4">
                {isEditing ? (
                  <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} className="text-2xl font-bold text-center bg-gray-100 dark:bg-gray-700 rounded-md w-full py-1"/>
                ) : (
                  <h2 className="text-2xl font-bold">{user?.displayName}</h2>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
              <div className="mt-4">
                {isEditing ? (
                   <textarea name="bio" value={formData.bio} onChange={handleInputChange} className="text-center text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md w-full p-2 h-24" placeholder="Your bio..."></textarea>
                ) : (
                  <p className="text-center text-sm text-gray-600 dark:text-gray-300">{user?.bio || 'No bio set.'}</p>
                )}
              </div>
              <div className="mt-6 flex gap-3">
                {isEditing ? (
                  <>
                  <button onClick={() => setIsEditing(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">Cancel</button>
                  <button onClick={handleSave} disabled={isSaving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors disabled:bg-blue-400">
                    {isSaving ? <Spinner /> : 'Save'}
                  </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditing(true)} className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors">Edit Profile</button>
                )}
              </div>
          </div>
        </div>
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 md:p-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h2 className="text-xl font-semibold">My Uploaded Files</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              A list of all files and folders you have personally uploaded.
            </p>
          </div>
          
          <div className="mt-4 min-h-[50vh] relative">
            {filesLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75 z-10 rounded-lg">
                <div className="text-center">
                  <Spinner />
                  <p className="mt-2 text-lg">Loading your files...</p>
                </div>
              </div>
            ) : filesError ? (
              <div className="flex items-center justify-center h-full text-red-500">
                <p>{filesError}</p>
              </div>
            ) : (
              <FileList
                items={filteredItems}
                // Fix: Pass currentPath along with the item to the onPreviewItem handler.
                onItemClick={(item) => onPreviewItem(item, currentPath)} // Click on file shows preview
                onItemPreview={(item) => onPreviewItem(item, currentPath)}
                onDeleteItem={handleDelete}
                onToggleLock={toggleLock}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
