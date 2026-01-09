
import React, { useState, useContext, createContext, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TokenDetail from './pages/TokenDetail';
import Alerts from './pages/Alerts';
import Portfolio from './pages/Portfolio';
import Favorites from './pages/Favorites';
import Settings from './pages/Settings';
import SystemLogs from './pages/SystemLogs';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Support from './pages/Support';
import { Alert, Position } from './types';
import { mockAlerts } from './mockData';
import { translations, Language } from './translations';

// --- Types ---
interface UserProfile {
  name: string;
  avatar: string;
  plan: string;
}

// --- Global Context ---
interface AppContextType {
  activeChain: string | null;
  setActiveChain: (chain: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  watchlist: string[];
  toggleWatchlist: (tokenId: string) => void;
  notifications: string[];
  clearNotifications: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  selectedTokenId: string | null;
  setSelectedTokenId: (id: string | null) => void;
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  updateAlert: (updatedAlert: Alert) => void;
  toggleAlert: (id: string) => void;
  removeAlert: (id: string) => void;
  // Position Store
  positions: Position[];
  addPosition: (pos: Position) => void;
  removePosition: (id: string) => void;
  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeChain, setActiveChain] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<string[]>(['Alert: PEPE Volume Spike', 'Warning: WOJAK Liquidity Drain']);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [language, setLanguageState] = useState<Language>('pt');
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Trader',
    avatar: 'https://picsum.photos/seed/alex/40',
    plan: 'Pro Plan'
  });

  // Initialize from localStorage
  useEffect(() => {
    // Language
    const savedLang = localStorage.getItem('app_language');
    if (savedLang === 'en' || savedLang === 'pt') {
      setLanguageState(savedLang);
    }

    // Sidebar
    const savedSidebar = localStorage.getItem('sidebarCollapsed');
    if (savedSidebar) setSidebarCollapsed(JSON.parse(savedSidebar));

    // Watchlist
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (e) {
        console.error("Error parsing watchlist", e);
      }
    } else {
      setWatchlist(['1', 'p2', 'p3']);
    }

    // Alerts
    const savedAlerts = localStorage.getItem('alerts');
    if (savedAlerts) {
      try {
        setAlerts(JSON.parse(savedAlerts));
      } catch (e) {
        console.error("Error parsing alerts", e);
      }
    } else {
        setAlerts(mockAlerts);
    }

    // Positions
    const savedPositions = localStorage.getItem('positions');
    if (savedPositions) {
      try {
        setPositions(JSON.parse(savedPositions));
      } catch (e) {
        console.error("Error parsing positions", e);
      }
    }

    // User Profile
    const savedProfile = localStorage.getItem('user_profile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Error parsing profile", e);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    let fallback: any = translations['en'];

    for (const k of keys) {
      value = value?.[k];
      fallback = fallback?.[k];
    }

    return value || fallback || key;
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  const toggleWatchlist = (tokenId: string) => {
    setWatchlist(prev => {
      const newList = prev.includes(tokenId) 
        ? prev.filter(id => id !== tokenId) 
        : [...prev, tokenId];
      localStorage.setItem('watchlist', JSON.stringify(newList));
      return newList;
    });
  };

  const addAlert = (newAlert: Alert) => {
    setAlerts(prev => {
      const newList = [newAlert, ...prev];
      localStorage.setItem('alerts', JSON.stringify(newList));
      return newList;
    });
  };

  const updateAlert = (updatedAlert: Alert) => {
    setAlerts(prev => {
      const newList = prev.map(alert => alert.id === updatedAlert.id ? updatedAlert : alert);
      localStorage.setItem('alerts', JSON.stringify(newList));
      return newList;
    });
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => {
      const newList = prev.map(alert => 
        alert.id === id ? { ...alert, isEnabled: !alert.isEnabled } : alert
      );
      localStorage.setItem('alerts', JSON.stringify(newList));
      return newList;
    });
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => {
      const newList = prev.filter(alert => alert.id !== id);
      localStorage.setItem('alerts', JSON.stringify(newList));
      return newList;
    });
  };

  const addPosition = (pos: Position) => {
    setPositions(prev => {
      const newList = [pos, ...prev];
      localStorage.setItem('positions', JSON.stringify(newList));
      return newList;
    });
  };

  const removePosition = (id: string) => {
    setPositions(prev => {
      const newList = prev.filter(p => p.id !== id);
      localStorage.setItem('positions', JSON.stringify(newList));
      return newList;
    });
  };

  const updateUserProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('user_profile', JSON.stringify(profile));
  };

  const clearNotifications = () => setNotifications([]);

  return (
    <AppContext.Provider value={{
      activeChain, setActiveChain,
      searchQuery, setSearchQuery,
      watchlist, toggleWatchlist,
      notifications, clearNotifications,
      sidebarCollapsed, toggleSidebar,
      selectedTokenId, setSelectedTokenId,
      alerts, addAlert, updateAlert, toggleAlert, removeAlert,
      positions, addPosition, removePosition,
      userProfile, updateUserProfile,
      language, setLanguage, t
    }}>
      {children}
    </AppContext.Provider>
  );
};

// --- Main App ---
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('landing');

  const renderPage = () => {
    switch (currentPage) {
      // Private Routes
      case 'dashboard': return <Dashboard setCurrentPage={setCurrentPage} />;
      case 'token-detail': return <TokenDetail />;
      case 'alerts': return <Alerts />;
      case 'portfolio': return <Portfolio setCurrentPage={setCurrentPage} />;
      case 'favorites': return <Favorites setCurrentPage={setCurrentPage} />;
      case 'settings': return <Settings />;
      case 'logs': return <SystemLogs />;
      
      // Public Routes
      case 'landing': return <Landing setCurrentPage={setCurrentPage} />;
      case 'login': return <Login setCurrentPage={setCurrentPage} />;
      case 'signup': return <Signup setCurrentPage={setCurrentPage} />;
      case 'terms': return <Terms setCurrentPage={setCurrentPage} />;
      case 'privacy': return <Privacy setCurrentPage={setCurrentPage} />;
      case 'support': return <Support setCurrentPage={setCurrentPage} />;
      
      default: return <Landing setCurrentPage={setCurrentPage} />;
    }
  };

  const isPublicRoute = ['landing', 'login', 'signup', 'terms', 'privacy', 'support'].includes(currentPage);

  return (
    <AppProvider>
      {isPublicRoute ? (
         // Public Layout (No Sidebar/Header) - We pass setCurrentPage to render language selector in landing header
         <div className="min-h-screen bg-[#0B0F12] text-white font-sans antialiased selection:bg-[#00FFA3] selection:text-[#0B0F12]">
            {renderPage()}
         </div>
      ) : (
         // Private Layout (With Sidebar & Header)
         <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
            {renderPage()}
         </Layout>
      )}
    </AppProvider>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
