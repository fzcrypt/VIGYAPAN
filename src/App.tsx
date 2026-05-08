import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';

export type User = {
  name: string;
  email: string;
  credits: number;
  plan: string;
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'register' | 'app'>('landing');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('va_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setCurrentPage('app');
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('va_user', JSON.stringify(user));
    setCurrentPage('app');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('va_user');
    setCurrentPage('landing');
  };

  return (
    <>
      {currentPage === 'landing' && <LandingPage navigate={setCurrentPage} user={user} onLogout={handleLogout} />}
      {(currentPage === 'login' || currentPage === 'register') && (
        <AuthPage 
          mode={currentPage} 
          navigate={setCurrentPage} 
          onAuth={handleLogin} 
        />
      )}
      {currentPage === 'app' && user && (
        <DashboardPage 
          user={user} 
          setUser={setUser} 
          onLogout={handleLogout} 
          navigate={setCurrentPage} 
        />
      )}
    </>
  );
}
