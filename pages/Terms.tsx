
import React from 'react';
import { useAppContext } from '../index';

interface Props {
    setCurrentPage: (page: string) => void;
}

const Terms: React.FC<Props> = ({ setCurrentPage }) => {
  const { t } = useAppContext();

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-500">
        <button onClick={() => setCurrentPage('landing')} className="text-sm text-gray-500 hover:text-white mb-8 flex items-center gap-2">
            ← {t('terms.back')}
        </button>
        
        <h1 className="text-4xl font-bold mb-2">{t('terms.title')}</h1>
        <p className="text-gray-500 mb-12">{t('terms.lastUpdated')}</p>

        <div className="space-y-12 text-gray-300 leading-relaxed">
            <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('terms.s1_title')}</h2>
                <p>{t('terms.s1_text')}</p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('terms.s2_title')}</h2>
                <p>{t('terms.s2_text')}</p>
                <p className="mt-4 p-4 bg-[#151C21] border border-[#1E272E] rounded-lg text-sm text-gray-400">
                    <strong className="text-white block mb-1">{t('terms.s2_important')}</strong>
                    {t('terms.s2_note')}
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('terms.s3_title')}</h2>
                <p>{t('terms.s3_text')}</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('terms.s3_li1')}</li>
                    <li>{t('terms.s3_li2')}</li>
                    <li>{t('terms.s3_li3')}</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('terms.s4_title')}</h2>
                <p>{t('terms.s4_text')}</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('terms.s4_li1')}</li>
                    <li>{t('terms.s4_li2')}</li>
                    <li>{t('terms.s4_li3')}</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('terms.s5_title')}</h2>
                <p>{t('terms.s5_text')}</p>
            </section>

             <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('terms.s6_title')}</h2>
                <p>{t('terms.s6_text')}</p>
            </section>
        </div>

        <div className="mt-20 pt-10 border-t border-[#1E272E] text-center">
            <p className="text-gray-500 mb-4">{t('terms.questions')}</p>
            <button onClick={() => setCurrentPage('support')} className="text-[#00FFA3] font-bold hover:underline">{t('terms.contactSupport')}</button>
        </div>
    </div>
  );
};

export default Terms;
