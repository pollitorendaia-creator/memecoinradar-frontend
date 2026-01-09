
import React from 'react';
import { useAppContext } from '../index';

interface LandingProps {
    setCurrentPage: (page: string) => void;
}

const Landing: React.FC<LandingProps> = ({ setCurrentPage }) => {
  const { t, language, setLanguage } = useAppContext();
  
  const scrollToFeatures = () => {
      const el = document.getElementById('features');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00FFA3] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F12]/80 backdrop-blur-md border-b border-[#1E272E]">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                {/* Logo */}
                <div 
                    onClick={() => setCurrentPage('landing')}
                    className="flex items-center gap-3 cursor-pointer group"
                >
                    <div className="w-10 h-10 bg-[#00FFA3] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.3)] transition-transform group-hover:scale-105">
                        <svg className="w-6 h-6 text-[#0B0F12]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                    </div>
                    <span className="font-bold text-xl tracking-tight">MemeCoin Radar</span>
                </div>

                {/* Nav */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    <button onClick={scrollToFeatures} className="hover:text-white transition-colors">{t('landing.resources')}</button>
                    <button className="hover:text-white transition-colors">{t('landing.pricing')}</button>
                    <button className="hover:text-white transition-colors">{t('landing.security')}</button>
                </nav>

                {/* Actions & Lang */}
                <div className="flex items-center gap-4">
                     {/* Language Selector Public */}
                     <div className="flex bg-[#151C21] rounded-lg p-0.5 border border-[#1E272E]">
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

                    <button 
                        onClick={() => setCurrentPage('login')}
                        className="text-sm font-bold text-white hover:text-[#00FFA3] transition-colors"
                    >
                        {t('landing.login')}
                    </button>
                    <button 
                        onClick={() => setCurrentPage('signup')}
                        className="bg-[#00FFA3] hover:bg-[#00E08F] text-[#0B0F12] px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-[#00FFA3]/20 transition-all hover:-translate-y-0.5"
                    >
                        {t('landing.createAccount')}
                    </button>
                </div>
            </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                
                {/* Left Content */}
                <div className="space-y-8 animate-in slide-in-from-left-4 fade-in duration-700">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E272E] border border-[#2D3942]">
                        <span className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FFA3]">{t('landing.liveMonitoring')}</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                        {language === 'pt' ? (
                            <>Domine o mercado de <span className="text-[#00FFA3]">MemeCoins</span> com inteligência de dados</>
                        ) : (
                            <>Master the <span className="text-[#00FFA3]">MemeCoin</span> market with data intelligence</>
                        )}
                    </h1>
                    
                    <p className="text-lg text-gray-400 max-w-xl leading-relaxed">
                        {t('landing.heroSubtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button 
                            onClick={() => setCurrentPage('signup')}
                            className="bg-[#00FFA3] hover:bg-[#00E08F] text-[#0B0F12] px-8 py-4 rounded-xl text-base font-bold shadow-[0_4px_20px_rgba(0,255,163,0.3)] transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            {t('landing.startFree')}
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                        </button>
                        <button 
                            onClick={scrollToFeatures}
                            className="bg-[#151C21] border border-[#2D3942] hover:bg-[#1E272E] text-white px-8 py-4 rounded-xl text-base font-bold transition-all flex items-center justify-center"
                        >
                            {t('landing.viewDemo')}
                        </button>
                    </div>

                    <div className="pt-8 flex items-center gap-8 border-t border-[#1E272E]">
                        <div>
                            <p className="text-2xl font-bold text-white">5,000+</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('landing.stats.assets')}</p>
                        </div>
                        <div className="w-px h-10 bg-[#1E272E]"></div>
                        <div>
                            <p className="text-2xl font-bold text-white">10k+</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('landing.stats.traders')}</p>
                        </div>
                        <div className="w-px h-10 bg-[#1E272E]"></div>
                        <div>
                            <p className="text-2xl font-bold text-[#00FFA3] flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                                24/7
                            </p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('landing.stats.alerts')}</p>
                        </div>
                    </div>
                </div>

                {/* Right Content - Demo Card */}
                <div className="relative animate-in slide-in-from-right-4 fade-in duration-700 delay-200">
                    <div className="absolute inset-0 bg-[#00FFA3] opacity-10 blur-[80px] rounded-full pointer-events-none"></div>
                    
                    <div className="relative bg-[#0B0F12] border border-[#1E272E] rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#1E272E] rounded-full border border-[#2D3942] flex items-center justify-center text-[#00FFA3]">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">{t('landing.demoCard.title')}</h3>
                                    <p className="text-xs text-gray-500">{t('landing.demoCard.scanner')}</p>
                                </div>
                            </div>
                            <span className="bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/20 px-3 py-1 rounded text-xs font-bold uppercase">{t('landing.demoCard.safe')}</span>
                        </div>

                        {/* Analysis Items */}
                        <div className="space-y-4">
                            <div className="bg-[#151C21] p-4 rounded-xl border border-[#1E272E] flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-300">{t('landing.demoCard.liquidityLocked')}</span>
                                <div className="w-6 h-6 rounded-full bg-[#00FFA3] flex items-center justify-center text-[#0B0F12]">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                </div>
                            </div>

                            <div className="bg-[#151C21] p-4 rounded-xl border border-[#1E272E] flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-300">{t('landing.demoCard.tax')}</span>
                                <span className="text-sm font-bold text-[#00FFA3]">0% / 0%</span>
                            </div>

                            <div className="bg-[#151C21] p-4 rounded-xl border border-[#1E272E] flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-300">{t('landing.demoCard.honeypot')}</span>
                                <span className="text-sm font-bold text-[#00FFA3] uppercase">{t('landing.demoCard.low')}</span>
                            </div>
                        </div>

                        <div className="my-6 border-t border-[#1E272E]"></div>

                        {/* Score */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">{t('landing.demoCard.trustScore')}</span>
                                <span className="text-xl font-bold text-[#00FFA3]">98<span className="text-sm text-gray-500">/100</span></span>
                            </div>
                            <div className="w-full h-2 bg-[#1E272E] rounded-full overflow-hidden">
                                <div className="h-full bg-[#00FFA3] w-[98%] shadow-[0_0_10px_rgba(0,255,163,0.5)]"></div>
                            </div>
                        </div>

                        {/* Floating Notification */}
                        <div className="absolute -bottom-6 -right-6 bg-[#151C21] border border-[#2D3942] p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-bounce">
                            <div className="w-10 h-10 bg-[#00FFA3] rounded-full flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-[#0B0F12]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('landing.demoCard.newOpp')}</p>
                                <p className="text-xs font-bold text-white">{t('landing.demoCard.detected')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        {/* Feature/Network Section (Anchored) */}
        <section id="features" className="py-20 border-t border-[#1E272E] bg-[#0B0F12]">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-8">{t('landing.footer.connected')}</p>
                <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <h3 className="text-2xl font-black text-white hover:text-[#00FFA3] cursor-default transition-colors">SOLANA</h3>
                    <h3 className="text-2xl font-black text-white hover:text-[#00FFA3] cursor-default transition-colors">ETHEREUM</h3>
                    <h3 className="text-2xl font-black text-white hover:text-[#00FFA3] cursor-default transition-colors">BASE</h3>
                    <h3 className="text-2xl font-black text-white hover:text-[#00FFA3] cursor-default transition-colors">BINANCE</h3>
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-[#1E272E] bg-[#080B0D]">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#00FFA3] rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#0B0F12]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                    </div>
                    <span className="font-bold text-white">MemeCoin Radar</span>
                </div>
                
                <div className="flex gap-8 text-sm font-medium text-gray-500">
                    <button onClick={() => setCurrentPage('terms')} className="hover:text-white transition-colors">{t('landing.footer.terms')}</button>
                    <button onClick={() => setCurrentPage('privacy')} className="hover:text-white transition-colors">{t('landing.footer.privacy')}</button>
                    <button onClick={() => setCurrentPage('support')} className="hover:text-white transition-colors">{t('landing.footer.support')}</button>
                </div>

                <div className="flex gap-4">
                     {/* Social Icons Mock */}
                     <div className="w-8 h-8 rounded-full bg-[#1E272E] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2D3942] cursor-pointer transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                     </div>
                     <div className="w-8 h-8 rounded-full bg-[#1E272E] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2D3942] cursor-pointer transition-colors">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm-1-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 7h-2v-6h2v6z"/></svg>
                     </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-8 pt-8 border-t border-[#1E272E] text-center">
                <p className="text-xs text-gray-600">{t('landing.footer.copy')}</p>
            </div>
        </footer>
    </div>
  );
};

export default Landing;
