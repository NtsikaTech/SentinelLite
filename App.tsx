
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LogAnalysis from './components/LogAnalysis';
import ThreatCenter from './components/ThreatCenter';
import Settings from './components/Settings';
import Support from './components/Support';
import Login from './components/Login';
import { ViewType, User } from './types';
import { apiService } from './services/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check for existing session
    const currentUser = apiService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setActiveView('dashboard');
  };

  const handleLogout = async () => {
    await apiService.logout();
    setUser(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onViewChange={setActiveView} />;
      case 'logs':
        return <LogAnalysis />;
      case 'alerts':
        return <ThreatCenter />;
      case 'settings':
        return <Settings />;
      case 'support':
        return <Support />;
      default:
        return <Dashboard onViewChange={setActiveView} />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onViewChange={setActiveView} 
      user={user} 
      onLogout={handleLogout}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
