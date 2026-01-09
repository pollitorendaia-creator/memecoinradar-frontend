
import React, { useState } from 'react';
import { useAppContext } from '../index';

interface Props {
    setCurrentPage: (page: string) => void;
}

const Support: React.FC<Props> = ({ setCurrentPage }) => {
  const { t } = useAppContext();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setSent(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 animate-in fade-in duration-500">
        <button onClick={() => setCurrentPage('landing')} className="text-sm text-gray-500 hover:text-white mb-8 flex items-center gap-2">
            ← {t('supportPage.back')}
        </button>

        <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t('supportPage.title')}</h1>
            <p className="text-gray-400">{t('supportPage.subtitle')}</p>
        </div>

        {sent ? (
            <div className="bg-[#151C21] border border-[#1E272E] rounded-3xl p-12 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-[#00FFA3]/10 text-[#00FFA3] rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{t('supportPage.sentTitle')}</h3>
                <p className="text-gray-500 mb-8">{t('supportPage.sentText')}</p>
                <button onClick={() => setSent(false)} className="text-[#00FFA3] font-bold hover:underline">{t('supportPage.sendAnother')}</button>
            </div>
        ) : (
            <div className="bg-[#151C21] border border-[#1E272E] rounded-3xl p-8 md:p-10 shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t('supportPage.name')}</label>
                        <input required type="text" className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]" placeholder={t('supportPage.namePlaceholder')} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t('supportPage.email')}</label>
                        <input required type="email" className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]" placeholder={t('supportPage.emailPlaceholder')} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t('supportPage.subject')}</label>
                        <select className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3] text-gray-300">
                            <option>{t('supportPage.optGeneral')}</option>
                            <option>{t('supportPage.optBug')}</option>
                            <option>{t('supportPage.optFeature')}</option>
                            <option>{t('supportPage.optAccount')}</option>
                            <option>{t('supportPage.optOther')}</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{t('supportPage.message')}</label>
                        <textarea required rows={5} className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]" placeholder={t('supportPage.msgPlaceholder')}></textarea>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-[#00FFA3] hover:bg-[#00E08F] text-[#0B0F12] font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#00FFA3]/20"
                    >
                        {t('supportPage.submit')}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-[#1E272E] text-center">
                    <p className="text-sm text-gray-500">{t('supportPage.directEmail')}</p>
                    <a href="mailto:contato@memecoinradar.com" className="text-white font-bold hover:text-[#00FFA3]">contato@memecoinradar.com</a>
                </div>
            </div>
        )}
    </div>
  );
};

export default Support;
