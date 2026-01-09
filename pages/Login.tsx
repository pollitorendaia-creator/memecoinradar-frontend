
import React, { useState } from 'react';
import { useAppContext } from '../index';

interface LoginProps {
    setCurrentPage: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ setCurrentPage }) => {
  const { t } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if(email && password) {
          setCurrentPage('dashboard');
      } else {
          setError('Credenciais inválidas. Tente admin@email.com / admin');
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      {/* Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00FFA3] opacity-[0.02] blur-[100px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#00FFA3] opacity-[0.02] blur-[100px] rounded-full"></div>
      </div>

      <div className="w-full max-w-md bg-[#151C21] border border-[#1E272E] p-8 md:p-10 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
          <div 
            onClick={() => setCurrentPage('landing')}
            className="flex items-center gap-3 justify-center mb-8 cursor-pointer"
          >
              <div className="w-8 h-8 bg-[#00FFA3] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0B0F12]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
              </div>
              <span className="font-bold text-lg">MemeCoin Radar</span>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">{t('auth.welcomeBack')}</h2>
          <p className="text-sm text-gray-500 text-center mb-8">{t('auth.enterDashboard')}</p>

          <form onSubmit={handleLogin} className="space-y-4">
              <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t('auth.email')}</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3] transition-colors"
                    placeholder="exemplo@email.com"
                  />
              </div>
              <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500">{t('auth.password')}</label>
                    <a href="#" className="text-[10px] text-[#00FFA3] hover:underline">{t('auth.forgotPassword')}</a>
                  </div>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3] transition-colors"
                    placeholder="••••••••"
                  />
              </div>

              {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}

              <button 
                type="submit"
                className="w-full bg-[#00FFA3] hover:bg-[#00E08F] text-[#0B0F12] font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#00FFA3]/20 mt-2"
              >
                  {t('auth.login')}
              </button>
          </form>

          {/* Dev Access Button */}
          <button 
            type="button"
            onClick={() => setCurrentPage('dashboard')}
            className="w-full mt-4 bg-[#1E272E] hover:bg-[#2D3942] text-gray-500 hover:text-white font-bold py-2 rounded-xl text-xs transition-colors border border-[#2D3942] border-dashed"
          >
              {t('auth.devAccess')}
          </button>

          <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                  {t('auth.noAccount')}{' '}
                  <button 
                    onClick={() => setCurrentPage('signup')}
                    className="text-[#00FFA3] font-bold hover:underline"
                  >
                      {t('auth.createOne')}
                  </button>
              </p>
          </div>
      </div>
    </div>
  );
};

export default Login;
