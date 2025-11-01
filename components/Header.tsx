import React, { useContext, useState, useRef, useEffect } from 'react';
import { Icon } from './Icon';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { Logo } from './Logo';

interface HeaderProps {
  onUploadClick: () => void;
  onNewFolderClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigate: (page: 'files' | 'profile' | 'auth') => void;
  onShowSettings: () => void;
  onShowAbout: () => void;
  onShowAiAssistant: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onUploadClick, 
  onNewFolderClick,
  searchQuery,
  setSearchQuery,
  onNavigate,
  onShowSettings,
  onShowAbout,
  onShowAiAssistant
}) => {
  const { user, logout, isIncognito } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    onNavigate('auth');
    setIsDropdownOpen(false);
  }
  
  return (
    <header className="flex flex-col md:flex-row items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 gap-4">
      <button 
        onClick={() => onNavigate('files')} 
        className="flex items-center space-x-3 text-left hover:opacity-80 transition-opacity"
        aria-label="Go to home page"
      >
        <Logo className="w-8 h-8" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          EAGOX CLOUD
        </h1>
      </button>
      
      {user && (
        <div className="relative w-full md:w-auto md:flex-grow max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name="search" className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-10 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="flex items-center space-x-3">
        {user ? (
          <>
            <button
              onClick={onShowAiAssistant}
              className="flex items-center space-x-2 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/60 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              title="Open AI Assistant"
            >
              <Icon name="sparkles" className="w-5 h-5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
            <button
              onClick={onNewFolderClick}
              className="hidden sm:flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              <Icon name="newFolder" className="w-5 h-5" />
              <span>New Folder</span>
            </button>
            <button
              onClick={onUploadClick}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              <Icon name="upload" className="w-5 h-5" />
              <span>Upload</span>
            </button>

            {isIncognito && (
              <div title="Incognito Session Active">
                <Icon name="incognito" className="w-6 h-6 text-gray-500 dark:text-gray-400" />
              </div>
            )}
            
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-600 overflow-hidden">
                {user.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="user" className="w-6 h-6" />
                )}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                      <p className="font-semibold flex items-center gap-2">
                        <span>{user.displayName || 'Signed in as'}</span>
                        {user.isAdmin && <span className="text-xs font-bold text-white bg-indigo-500 px-2 py-0.5 rounded-full">Admin</span>}
                      </p>
                      <p className="truncate">{user.email}</p>
                    </div>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile'); setIsDropdownOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Icon name="user" className="w-5 h-5" /> My Profile
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('files'); setIsDropdownOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Icon name="folder" className="w-5 h-5" /> All Files
                    </a>
                     <button onClick={() => { toggleTheme(); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      {theme === 'light' ? <Icon name="moon" className="w-5 h-5" /> : <Icon name="sun" className="w-5 h-5" />}
                      {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </button>
                    <a href="#" onClick={(e) => { e.preventDefault(); onShowSettings(); setIsDropdownOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Icon name="cog" className="w-5 h-5" /> Settings
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onShowAbout(); setIsDropdownOpen(false); }} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Icon name="info" className="w-5 h-5" /> About
                    </a>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Icon name="logout" className="w-5 h-5" /> Logout
                    </a>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <button onClick={() => onNavigate('auth')} className="font-semibold py-2 px-4 rounded-lg">Log In</button>
            <button onClick={() => onNavigate('auth')} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">Sign Up</button>
          </div>
        )}
      </div>
    </header>
  );
};