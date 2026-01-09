
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../index';
import { mockTokens } from '../mockData';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick, collapsed }) => (
  <div 
    onClick={onClick}
    title={collapsed ? label : ''}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
      active ? 'bg-[#151C21] text-[#00FFA3]' : 'text-gray-400 hover:bg-[#151C21] hover:text-white'
    } ${collapsed ? 'justify-center px-2' : ''}`}
  >
    <span className="w-5 h-5 flex items-center justify-center shrink-0">{icon}</span>
    {!collapsed && <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{label}</span>}
  </div>
);

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, setCurrentPage }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchResults, setSearchResults] = useState<typeof mockTokens>([]);
  
  const { 
    activeChain, setActiveChain, 
    searchQuery, setSearchQuery,
    notifications, sidebarCollapsed, toggleSidebar,
    userProfile, language, setLanguage, t
  } = useAppContext();

  // Search Debounce Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery && currentPage !== 'dashboard') {
        const results = mockTokens.filter(t => 
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.address.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, currentPage]);

  const handleChainClick = (chain: string) => {
    setActiveChain(activeChain === chain ? null : chain);
  };

  const handleQuickAction = (page: string) => {
    setCurrentPage(page);
  };

  const SidebarContent = () => (
    <>
      <div className={`flex items-center gap-3 mb-10 px-2 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
        <div 
            onClick={toggleSidebar}
            className="w-8 h-8 bg-[#00FFA3] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#00E08F] transition-colors shrink-0"
        >
          <svg className="w-5 h-5 text-[#0B0F12]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg leading-tight whitespace-nowrap">MemeCoin Radar</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase whitespace-nowrap">{t('sidebar.financialMonitor')}</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        <SidebarItem 
          label={t('sidebar.dashboard')}
          active={currentPage === 'dashboard'} 
          onClick={() => { setCurrentPage('dashboard'); setMobileMenuOpen(false); }}
          collapsed={sidebarCollapsed}
          icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>}
        />
        
        <SidebarItem 
          label={t('sidebar.portfolio')}
          active={currentPage === 'portfolio'} 
          onClick={() => { setCurrentPage('portfolio'); setMobileMenuOpen(false); }}
          collapsed={sidebarCollapsed}
          icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />

        <SidebarItem 
          label={t('sidebar.favorites')}
          active={currentPage === 'favorites'} 
          onClick={() => { setCurrentPage('favorites'); setMobileMenuOpen(false); }}
          collapsed={sidebarCollapsed}
          icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>}
        />

        <SidebarItem 
          label={t('sidebar.alerts')}
          active={currentPage === 'alerts'} 
          onClick={() => { setCurrentPage('alerts'); setMobileMenuOpen(false); }}
          collapsed={sidebarCollapsed}
          icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>}
        />
        
        <div className="pt-8 pb-4">
          {!sidebarCollapsed && <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase px-4 mb-2 whitespace-nowrap">{t('sidebar.system')}</p>}
          <SidebarItem 
            label={t('sidebar.settings')}
            active={currentPage === 'settings'} 
            onClick={() => { setCurrentPage('settings'); setMobileMenuOpen(false); }}
            collapsed={sidebarCollapsed}
            icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
          />
          <SidebarItem 
            label={t('sidebar.liveLogs')}
            active={currentPage === 'logs'} 
            onClick={() => { setCurrentPage('logs'); setMobileMenuOpen(false); }}
            collapsed={sidebarCollapsed}
            icon={<svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>}
          />
        </div>
      </nav>

      <div className="mt-auto pt-6 border-t border-[#1E272E]">
        <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <img src={userProfile.avatar} className="w-10 h-10 rounded-full border border-[#00FFA3] object-cover" alt="Avatar" />
          {!sidebarCollapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-bold whitespace-nowrap">{userProfile.name}</p>
              <p className="text-xs text-[#00FFA3] whitespace-nowrap">{userProfile.plan}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#0B0F12] text-white overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex border-r border-[#1E272E] flex-col p-6 shrink-0 transition-all duration-300 ${sidebarCollapsed ? 'w-[80px]' : 'w-[260px]'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 lg:hidden backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}>
          <aside className="w-[260px] h-full bg-[#0B0F12] border-r border-[#1E272E] flex flex-col p-6 absolute left-0 top-0 shadow-2xl" onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        {/* Header */}
        <header className="h-16 border-b border-[#1E272E] px-4 md:px-8 flex items-center justify-between sticky top-0 bg-[#0B0F12] z-10 shrink-0">
          <div className="flex items-center gap-3 flex-1">
             <div className="flex items-center gap-2">
                 <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-white">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                 </button>
                 {/* Desktop Toggle Button in Header (Optional, mostly handled by logo) */}
                 <button onClick={toggleSidebar} className="hidden lg:block p-2 text-gray-400 hover:text-white">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                 </button>
             </div>
             
             <div className="flex-1 max-w-xl relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
                  placeholder={t('header.searchPlaceholder')}
                  className="w-full bg-[#151C21] border border-[#1E272E] rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#00FFA3] transition-colors"
                />
             </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 ml-4">
            <div className="hidden md:flex bg-[#151C21] rounded-lg p-1">
              {['ETH', 'SOL', 'BASE', 'BSC'].map(chain => (
                <button 
                    key={chain} 
                    onClick={() => handleChainClick(chain)}
                    className={`px-4 py-1 text-xs font-bold rounded-md transition-colors ${activeChain === chain ? 'bg-[#1E272E] text-white shadow-sm ring-1 ring-[#00FFA3]/20' : 'text-gray-500 hover:text-white'}`}
                >
                  {chain}
                </button>
              ))}
            </div>
            <button 
                onClick={() => handleQuickAction('favorites')}
                className="hidden sm:flex bg-[#1E272E] hover:bg-[#2D3942] text-white border border-[#2D3942] px-4 py-2 rounded-lg text-sm font-bold items-center gap-2 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
              {t('sidebar.favorites')}
            </button>
            <div className="relative">
                <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="w-10 h-10 flex items-center justify-center bg-[#151C21] border border-[#1E272E] rounded-lg relative shrink-0 hover:bg-[#1E272E]/80 transition-colors"
                >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
                {/* Notification Dropdown */}
                {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-[#151C21] border border-[#1E272E] rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="px-4 py-3 border-b border-[#1E272E] flex justify-between items-center">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('header.notifications')}</h4>
                            <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded font-bold">{notifications.length}</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">{t('header.noNotifications')}</div>
                            ) : (
                                notifications.map((n, i) => (
                                    <div key={i} className="px-4 py-3 border-b border-[#1E272E] hover:bg-[#1E272E] text-sm text-gray-300">
                                        {n}
                                    </div>
                                ))
                            )}
                        </div>
                        <div 
                            onClick={() => { setShowNotifications(false); setCurrentPage('alerts'); }}
                            className="px-4 py-3 bg-[#1E272E]/50 text-center text-xs font-bold text-[#00FFA3] cursor-pointer hover:bg-[#1E272E]"
                        >
                            {t('header.viewAll')}
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Header (Top Right) & Language Selector */}
            <div className="hidden sm:flex items-center gap-4 ml-2 border-l border-[#1E272E] pl-4">
                {/* Language Selector */}
                <div className="flex bg-[#151C21] rounded-lg p-0.5">
                   <button 
                     onClick={() => setLanguage('pt')}
                     className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'pt' ? 'bg-[#1E272E] text-[#00FFA3]' : 'text-gray-500 hover:text-white'}`}
                   >
                     PT
                   </button>
                   <button 
                     onClick={() => setLanguage('en')}
                     className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${language === 'en' ? 'bg-[#1E272E] text-[#00FFA3]' : 'text-gray-500 hover:text-white'}`}
                   >
                     EN
                   </button>
                </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
