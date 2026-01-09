
import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../index';

// Types & Defaults
interface AppSettings {
  weights: {
    tech: number;
    security: number;
    social: number;
  };
  thresholds: {
    minLiquidity: number;
    whaleBuy: number;
  };
  autoRefresh: boolean;
  refreshInterval: string;
  riskProfile: number; // 0: Conservative, 1: Balanced, 2: Aggressive
}

const DEFAULT_SETTINGS: AppSettings = {
  weights: { tech: 40, security: 35, social: 25 },
  thresholds: { minLiquidity: 50000, whaleBuy: 5000 },
  autoRefresh: true,
  refreshInterval: '1m',
  riskProfile: 1 // Balanced
};

const Settings: React.FC = () => {
  const { userProfile, updateUserProfile, t } = useAppContext();
  
  // Risk Presets defined inside component to use translations
  const RISK_PRESETS = [
    {
      label: t('settings.conservative'),
      weights: { tech: 20, security: 70, social: 10 },
      thresholds: { minLiquidity: 100000, whaleBuy: 10000 }
    },
    {
      label: t('settings.balanced'),
      weights: { tech: 40, security: 35, social: 25 },
      thresholds: { minLiquidity: 50000, whaleBuy: 5000 }
    },
    {
      label: t('settings.aggressive'),
      weights: { tech: 60, security: 10, social: 30 },
      thresholds: { minLiquidity: 10000, whaleBuy: 1000 }
    }
  ];

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isDirty, setIsDirty] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Profile Form State
  const [displayName, setDisplayName] = useState(userProfile.name);
  const [avatarPreview, setAvatarPreview] = useState(userProfile.avatar);

  // Sync state if context updates (e.g. from localstorage load)
  useEffect(() => {
    setDisplayName(userProfile.name);
    setAvatarPreview(userProfile.avatar);
  }, [userProfile]);

  // Load from LocalStorage on Mount
  useEffect(() => {
    const stored = localStorage.getItem('app_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        setSavedSettings(parsed);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  // Check for unsaved changes
  useEffect(() => {
    const dirty = JSON.stringify(settings) !== JSON.stringify(savedSettings);
    setIsDirty(dirty);
  }, [settings, savedSettings]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // --- Handlers ---

  const handleRiskProfileChange = (val: number) => {
    const preset = RISK_PRESETS[val];
    setSettings(prev => ({
      ...prev,
      riskProfile: val,
      weights: { ...preset.weights },
      thresholds: { ...preset.thresholds }
    }));
  };

  // Smart Weight Normalization Logic
  const handleWeightChange = (key: keyof AppSettings['weights'], newVal: number) => {
    setSettings(prev => {
      const oldVal = prev.weights[key];
      const delta = newVal - oldVal;
      
      const otherKeys = (Object.keys(prev.weights) as Array<keyof AppSettings['weights']>)
        .filter(k => k !== key);
      
      const remainingTotal = 100 - newVal;
      const otherTotal = prev.weights[otherKeys[0]] + prev.weights[otherKeys[1]];
      
      let newWeights = { ...prev.weights, [key]: newVal };

      if (otherTotal === 0) {
        // If others are 0, split remaining equally
        newWeights[otherKeys[0]] = remainingTotal / 2;
        newWeights[otherKeys[1]] = remainingTotal / 2;
      } else {
        // Distribute proportionally
        newWeights[otherKeys[0]] = Math.round((prev.weights[otherKeys[0]] / otherTotal) * remainingTotal);
        newWeights[otherKeys[1]] = remainingTotal - newWeights[otherKeys[0]]; // Ensure sum is exactly 100
      }

      // Manual fix to avoid negatives and ensure 100 sum in edge cases
      if (newWeights[otherKeys[0]] < 0) newWeights[otherKeys[0]] = 0;
      if (newWeights[otherKeys[1]] < 0) newWeights[otherKeys[1]] = 0;
      
      // Force custom risk profile if modified manually
      return { ...prev, weights: newWeights }; // Don't change riskProfile index yet, implies "Custom" effectively
    });
  };

  const handleThresholdChange = (key: keyof AppSettings['thresholds'], valStr: string) => {
    const cleanVal = parseInt(valStr.replace(/[^0-9]/g, '')) || 0;
    setSettings(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [key]: cleanVal
      }
    }));
  };

  const toggleAutoRefresh = () => {
    setSettings(prev => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  };

  const handleDiscard = () => {
    setSettings(savedSettings);
    showToast(t('settings.toastDiscard'));
  };

  const handleSave = () => {
    setSavedSettings(settings);
    localStorage.setItem('app_settings', JSON.stringify(settings));
    // Here you would trigger global app state updates if using context
    showToast(t('settings.toastSaved'));
  };

  // Profile Handlers
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!displayName.trim()) {
      alert("Display Name cannot be empty.");
      return;
    }
    updateUserProfile({
      ...userProfile,
      name: displayName,
      avatar: avatarPreview
    });
    showToast(t('settings.toastProfile'));
  };

  // Currency Formatter
  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString('en-US');
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('settings.title')}</h2>
          <p className="text-sm text-gray-500">{t('settings.subtitle')}</p>
        </div>
        {isDirty && (
            <span className="text-xs bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full font-bold border border-yellow-500/20 animate-pulse">
                {t('settings.unsaved')}
            </span>
        )}
      </div>

      <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl p-6 md:p-8 space-y-8">
        
        {/* Risk Profile Preset */}
        <div>
            <div className="flex justify-between items-center mb-6">
                <h4 className="text-sm font-bold uppercase tracking-widest">{t('settings.riskProfile')}</h4>
                <span className={`text-xs font-bold px-3 py-1 rounded border ${
                    settings.riskProfile === 0 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    settings.riskProfile === 2 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                }`}>
                    {RISK_PRESETS[settings.riskProfile].label} {t('settings.preset')}
                </span>
            </div>
            <input 
                type="range" 
                min="0" 
                max="2" 
                step="1"
                value={settings.riskProfile}
                onChange={(e) => handleRiskProfileChange(parseInt(e.target.value))}
                className="w-full h-2 bg-[#1E272E] rounded-lg appearance-none cursor-pointer accent-white" 
            />
            <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <span>{t('settings.conservative')}</span>
                <span>{t('settings.balanced')}</span>
                <span>{t('settings.aggressive')}</span>
            </div>
        </div>

        <div className="border-t border-[#1E272E] my-6"></div>

        {/* Weights */}
        <div>
           <h4 className="text-sm font-bold uppercase tracking-widest mb-6">{t('settings.algoWeights')} (Total: {settings.weights.tech + settings.weights.security + settings.weights.social}%)</h4>
           <div className="space-y-6">
             <div className="space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-gray-300">{t('settings.techAnalysis')}</span>
                   <span className="text-sm font-bold text-[#00FFA3]">{settings.weights.tech}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" max="100" 
                    value={settings.weights.tech}
                    onChange={(e) => handleWeightChange('tech', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1E272E] rounded-lg appearance-none cursor-pointer accent-[#00FFA3]" 
                 />
             </div>

             <div className="space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-gray-300">{t('settings.secAnalysis')}</span>
                   <span className="text-sm font-bold text-[#00FFA3]">{settings.weights.security}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" max="100" 
                    value={settings.weights.security}
                    onChange={(e) => handleWeightChange('security', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1E272E] rounded-lg appearance-none cursor-pointer accent-[#00FFA3]" 
                 />
             </div>

             <div className="space-y-3">
                 <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-gray-300">{t('settings.socMomentum')}</span>
                   <span className="text-sm font-bold text-[#00FFA3]">{settings.weights.social}%</span>
                 </div>
                 <input 
                    type="range" 
                    min="0" max="100" 
                    value={settings.weights.social}
                    onChange={(e) => handleWeightChange('social', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-[#1E272E] rounded-lg appearance-none cursor-pointer accent-[#00FFA3]" 
                 />
             </div>
           </div>
        </div>

        <div className="pt-8 border-t border-[#1E272E]">
           <h4 className="text-sm font-bold uppercase tracking-widest mb-6">{t('settings.globalThresholds')}</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                 <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('settings.minLiquidity')}</label>
                 <input 
                    type="text" 
                    value={formatCurrency(settings.thresholds.minLiquidity)}
                    onChange={(e) => handleThresholdChange('minLiquidity', e.target.value)}
                    className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]" 
                 />
              </div>
              <div className="space-y-3">
                 <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest">{t('settings.whaleBuy')}</label>
                 <input 
                    type="text" 
                    value={formatCurrency(settings.thresholds.whaleBuy)}
                    onChange={(e) => handleThresholdChange('whaleBuy', e.target.value)}
                    className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]" 
                 />
              </div>
           </div>
        </div>

        <div className="pt-8 border-t border-[#1E272E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
           <div>
              <h4 className="text-sm font-bold uppercase tracking-widest">{t('settings.autoRefresh')}</h4>
              <p className="text-xs text-gray-500">{t('settings.autoRefreshDesc')}</p>
           </div>
           <div className="flex items-center gap-6">
              <select 
                disabled={!settings.autoRefresh}
                value={settings.refreshInterval}
                onChange={(e) => setSettings(prev => ({...prev, refreshInterval: e.target.value}))}
                className={`bg-[#1E272E] border border-[#2D3942] rounded-lg px-3 py-2 text-xs font-bold focus:outline-none transition-opacity ${!settings.autoRefresh ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                 <option value="30s">Every 30s</option>
                 <option value="1m">Every 1m</option>
                 <option value="5m">Every 5m</option>
              </select>
              
              <div 
                onClick={toggleAutoRefresh}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-200 ${settings.autoRefresh ? 'bg-[#00FFA3]' : 'bg-[#1E272E]'}`}
              >
                 <div className={`absolute top-1 w-4 h-4 bg-[#0B0F12] rounded-full shadow-sm transition-all duration-200 ${settings.autoRefresh ? 'right-1' : 'left-1'}`}></div>
              </div>
           </div>
        </div>
      </div>

      {/* Account Profile Section */}
      <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl p-6 md:p-8 space-y-8">
        <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold uppercase tracking-widest">{t('settings.accountProfile')}</h4>
            <button 
                onClick={handleSaveProfile}
                className="bg-[#00FFA3] hover:bg-[#00E08F] text-[#0B0F12] px-4 py-2 rounded-lg text-xs font-bold shadow transition-all"
            >
                {t('settings.saveProfile')}
            </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full border-2 border-[#00FFA3] overflow-hidden bg-[#1E272E] relative group">
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        onChange={handleAvatarChange}
                    />
                </div>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{t('settings.clickChange')}</p>
            </div>
            {/* Fields */}
            <div className="flex-1 w-full space-y-6">
                <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{t('settings.displayName')}</label>
                    <input 
                        type="text" 
                        value={displayName} 
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]" 
                    />
                </div>
                <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{t('settings.planStatus')}</label>
                    <div className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm text-gray-400 flex justify-between items-center">
                        <span>{userProfile.plan}</span>
                        <span className="text-[10px] text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-0.5 rounded font-bold uppercase">{t('header.active')}</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-4 sticky bottom-6 md:bottom-0 z-10">
         <button 
            onClick={handleDiscard}
            disabled={!isDirty}
            className={`px-6 py-3 text-sm font-bold rounded-xl transition-colors order-2 sm:order-1 ${isDirty ? 'bg-[#1E272E] text-white hover:bg-[#2D3942] border border-[#2D3942]' : 'text-gray-600 cursor-not-allowed'}`}
         >
            {t('settings.discard')}
         </button>
         <button 
            onClick={handleSave}
            disabled={!isDirty}
            className={`px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all order-1 sm:order-2 ${isDirty ? 'bg-[#00FFA3] text-[#0B0F12] hover:bg-[#00E08F] shadow-[0_4px_20px_rgba(0,255,163,0.2)]' : 'bg-[#1E272E] text-gray-500 cursor-not-allowed'}`}
         >
            {t('settings.saveConfig')}
         </button>
      </div>

      {/* Toast */}
      {toastMsg && (
            <div className="fixed bottom-6 right-6 bg-[#00FFA3] text-[#0B0F12] px-6 py-3 rounded-xl font-bold text-sm shadow-2xl animate-in slide-in-from-bottom-5 fade-in z-50 transition-all duration-300">
                {toastMsg}
            </div>
      )}
    </div>
  );
};

export default Settings;
