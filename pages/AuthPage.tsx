import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Logo } from '../components/Logo';
import { Spinner } from '../components/Spinner';

interface AuthPageProps {
    onAuthSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<'login' | 'signup' | 'admin'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isIncognito, setIsIncognito] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'signup' && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      if (view === 'login') {
        await login(email, password, isIncognito);
      } else if (view === 'signup') {
        await signup(email, password, isIncognito);
      } else if (view === 'admin') {
        // Admin login uses a special email and the code as password
        await login('admin@eagox.cloud', adminCode, isIncognito);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch(view) {
        case 'signup': return 'Create a new account';
        case 'admin': return 'Administrator Login';
        case 'login':
        default: return 'Sign in to your account';
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <div className="text-center">
            <Logo className="w-12 h-12 mx-auto" />
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                {getTitle()}
            </h2>
             {view !== 'admin' && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Or{' '}
                    <button onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError('')}} className="font-medium text-blue-600 hover:text-blue-500">
                        {view === 'login' ? 'create an account' : 'sign in instead'}
                    </button>
                </p>
             )}
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {view === 'admin' ? (
             <div>
               <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">Enter the administrator code to access the admin panel.</p>
              <input
                id="admin-code"
                name="admin-code"
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Admin Code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
              />
            </div>
          ) : (
            <div className="rounded-md shadow-sm -space-y-px">
                <div>
                <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </div>
                <div>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={view === 'login' ? "current-password" : "new-password"}
                    required
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 ${view === 'login' ? 'rounded-b-md' : ''} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm`}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </div>
                {view === 'signup' && (
                <div>
                    <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                )}
            </div>
          )}

          <div className="flex items-center">
            <input
              id="incognito-checkbox"
              name="incognito"
              type="checkbox"
              checked={isIncognito}
              onChange={(e) => setIsIncognito(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="incognito-checkbox" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
              Incognito Session (won't be remembered)
            </label>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoading && <Spinner />}
              {isLoading ? 'Processing...' : (view === 'signup' ? 'Sign up' : 'Sign in')}
            </button>
          </div>
        </form>
         <div className="text-center">
            <button onClick={() => { setView(view === 'admin' ? 'login' : 'admin'); setError('')}} className="text-xs font-medium text-gray-500 hover:text-blue-500">
                {view === 'admin' ? 'Return to User Login' : 'Login as Admin'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
