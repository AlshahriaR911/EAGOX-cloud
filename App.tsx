import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { ThemeContext } from './contexts/ThemeContext';
import AuthPage from './pages/AuthPage';
import FileBrowser from './pages/FileBrowser';
import ProfilePage from './pages/ProfilePage';
import { Icon } from './components/Icon';
import { Logo } from './components/Logo';
import AiAssistantModal from './components/AiAssistantModal';
import { FileItemData } from './types';
import FilePreviewModal from './components/FilePreviewModal';
import { getServerUrl, setServerUrl } from './services/serverConfig';

type Page = 'auth' | 'files' | 'profile';

const App: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [currentPage, setCurrentPage] = useState<Page>(user ? 'files' : 'auth');
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  // Fix: Changed previewItem state to store both item and its path for the preview modal.
  const [previewItem, setPreviewItem] = useState<{ item: FileItemData; path: string } | null>(null);
  const [serverUrlInput, setServerUrlInput] = useState('');

  useEffect(() => {
    setServerUrlInput(getServerUrl());
  }, []);

  const handleSaveSettings = () => {
    setServerUrl(serverUrlInput);
    setShowSettings(false);
    // Optional: alert user that a refresh might be needed
    alert("Server URL updated. You may need to refresh the page for changes to apply everywhere.");
  };

  const navigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    const pageProps = {
      onNavigate: navigate,
      onShowAbout: () => setShowAbout(true),
      onShowSettings: () => setShowSettings(true),
      onShowAiAssistant: () => setShowAiAssistant(true),
      // Fix: Updated onPreviewItem to accept path along with the item.
      onPreviewItem: (item: FileItemData, path: string) => setPreviewItem({ item, path }),
    };
    switch (currentPage) {
      case 'files':
        return <FileBrowser {...pageProps} />;
      case 'profile':
        return <ProfilePage {...pageProps} />;
      case 'auth':
      default:
        return <AuthPage onAuthSuccess={() => navigate('files')} />;
    }
  };
  
  return (
    <div className="min-h-screen font-sans">
      {user ? renderPage() : <AuthPage onAuthSuccess={() => navigate('files')} />}

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p>Theme</p>
                <button onClick={toggleTheme} className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-md">
                  {theme === 'light' ? <Icon name="moon" className="w-5 h-5"/> : <Icon name="sun" className="w-5 h-5"/>}
                  <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
                </button>
              </div>
               <div>
                  <label htmlFor="server-url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Server URL</label>
                  <input
                    type="text"
                    id="server-url"
                    value={serverUrlInput}
                    onChange={(e) => setServerUrlInput(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="http://192.168.0.102:8000"
                  />
               </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
               <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showAbout && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl w-full max-w-sm text-center">
            <Logo className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-xl font-semibold mb-2">EAGOX CLOUD</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Version 1.2.0</p>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="font-semibold">Developed by:</p>
              <p>Md. Al Shahriar Sayon</p>
              <a href="mailto:alshahriarsayon425@gmail.com" className="text-blue-500 hover:underline">
                alshahriarsayon425@gmail.com
              </a>
            </div>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAbout(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAiAssistant && user && (
        <AiAssistantModal onClose={() => setShowAiAssistant(false)} />
      )}

      {previewItem && (
        // Fix: Pass item and path from the previewItem state object to the modal. This resolves the 'currentPath is not defined' error.
        <FilePreviewModal item={previewItem.item} currentPath={previewItem.path} onClose={() => setPreviewItem(null)} />
      )}
    </div>
  );
};

export default App;
