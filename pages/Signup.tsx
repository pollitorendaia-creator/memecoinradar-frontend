
import React from 'react';
import { useAppContext } from '../index';

interface SignupProps {
    setCurrentPage: (page: string) => void;
}

const Signup: React.FC<SignupProps> = ({ setCurrentPage }) => {
  const { t } = useAppContext();
  
  const handleSignup = (e: React.FormEvent) => {
      e.preventDefault();
      // Simulate creation logic
      setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FFA3] opacity-[0.02] blur-[120px] rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 max-w-5xl w-full bg-[#151C21] border border-[#1E272E] rounded-3xl overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Left: Info/Promo */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-[#0B0F12] border-r border-[#1E272E] relative">
               <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 bg-[#00FFA3] rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-[#0B0F12]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                        </div>
                        <span className="font-bold text-lg">MemeCoin Radar</span>
                   </div>
                   <h2 className="text-4xl font-bold mb-4 leading-tight">{t('auth.startJourney')}</h2>
                   <p className="text-gray-400 leading-relaxed">
                       {t('auth.createFree')}
                   </p>
               </div>
               
               <div className="mt-12 relative z-10">
                   <div className="bg-[#151C21] border border-[#1E272E] p-4 rounded-xl flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                       </div>
                       <div>
                           <p className="text-sm font-bold text-white">{t('auth.setupReady')}</p>
                           <p className="text-xs text-gray-500">{t('auth.setupDesc')}</p>
                       </div>
                   </div>
               </div>

               {/* Decor */}
               <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#00FFA3] opacity-5 blur-[60px] rounded-full pointer-events-none"></div>
          </div>

          {/* Right: Form */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-6">{t('auth.createOne')} 🚀</h3>
              <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t('auth.fullName')}</label>
                      <input type="text" className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]" placeholder={t('auth.namePlaceholder')} />
                  </div>
                  <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t('auth.email')}</label>
                      <input type="email" className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]" placeholder="exemplo@email.com" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t('auth.password')}</label>
                          <input type="password" className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]" placeholder="••••••••" />
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t('auth.confirmPassword')}</label>
                          <input type="password" className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]" placeholder="••••••••" />
                      </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                      <input type="checkbox" id="terms" className="accent-[#00FFA3] w-4 h-4 rounded" />
                      <label htmlFor="terms" className="text-xs text-gray-400">{t('auth.acceptTerms')} <button type="button" onClick={() => setCurrentPage('terms')} className="text-[#00FFA3] hover:underline">{t('landing.footer.terms')}</button> {t('auth.and')} <button type="button" onClick={() => setCurrentPage('privacy')} className="text-[#00FFA3] hover:underline">{t('landing.footer.privacy')}</button>.</label>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-[#00FFA3] hover:bg-[#00E08F] text-[#0B0F12] font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#00FFA3]/20 mt-4"
                  >
                      {t('auth.createButton')}
                  </button>
              </form>
              
              <div className="mt-8 text-center border-t border-[#1E272E] pt-6">
                  <p className="text-sm text-gray-500">
                      {t('auth.alreadyAccount')}{' '}
                      <button onClick={() => setCurrentPage('login')} className="text-white font-bold hover:text-[#00FFA3]">{t('auth.login')}</button>
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Signup;
