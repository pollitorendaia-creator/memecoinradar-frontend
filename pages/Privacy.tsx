
import React from 'react';
import { useAppContext } from '../index';

interface Props {
    setCurrentPage: (page: string) => void;
}

const Privacy: React.FC<Props> = ({ setCurrentPage }) => {
  const { t } = useAppContext();

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 animate-in fade-in duration-500">
        <button onClick={() => setCurrentPage('landing')} className="text-sm text-gray-500 hover:text-white mb-8 flex items-center gap-2">
            ← {t('privacy.back')}
        </button>
        
        <h1 className="text-4xl font-bold mb-2">{t('privacy.title')}</h1>
        <p className="text-gray-500 mb-12">{t('privacy.subtitle')}</p>

        <div className="space-y-12 text-gray-300 leading-relaxed">
            <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('privacy.s1_title')}</h2>
                <p>{t('privacy.s1_text')}</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('privacy.s1_li1')}</li>
                    <li>{t('privacy.s1_li2')}</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('privacy.s2_title')}</h2>
                <p>{t('privacy.s2_text')}</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('privacy.s2_li1')}</li>
                    <li>{t('privacy.s2_li2')}</li>
                    <li>{t('privacy.s2_li3')}</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('privacy.s3_title')}</h2>
                <p className="p-4 bg-[#151C21] border border-[#1E272E] rounded-lg">
                    {t('privacy.s3_text')}
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('privacy.s4_title')}</h2>
                <p>{t('privacy.s4_text')}</p>
                <ul className="list-disc pl-6 mt-2 space-y-2">
                    <li>{t('privacy.s4_li1')}</li>
                    <li>{t('privacy.s4_li2')}</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('privacy.s5_title')}</h2>
                <p>{t('privacy.s5_text')}</p>
            </section>

             <section>
                <h2 className="text-xl font-bold text-white mb-4">{t('privacy.s6_title')}</h2>
                <p>{t('privacy.s6_text')}</p>
            </section>
        </div>

        <div className="mt-20 pt-10 border-t border-[#1E272E] text-center">
            <p className="text-gray-500 mb-4">{t('privacy.questions')}</p>
            <button onClick={() => setCurrentPage('support')} className="text-[#00FFA3] font-bold hover:underline">{t('privacy.contact')}</button>
        </div>
    </div>
  );
};

export default Privacy;
