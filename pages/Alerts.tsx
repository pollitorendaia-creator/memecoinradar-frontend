
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../index';
import { Alert, Token } from '../types';
import { mockTokens } from '../mockData';

const Alerts: React.FC = () => {
  const { alerts, addAlert, updateAlert, toggleAlert, removeAlert, t } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Form State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);

  const [formType, setFormType] = useState('Price Action');
  const [formFreq, setFormFreq] = useState('Real-time');
  const [formOperator, setFormOperator] = useState('Greater than');
  const [formThreshold, setFormThreshold] = useState('');
  const [thresholdError, setThresholdError] = useState('');

  // Dropdown ref for outside click
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Filter tokens based on search query
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const results = mockTokens.filter(t => 
            t.name.toLowerCase().includes(query) || 
            t.symbol.toLowerCase().includes(query) ||
            t.address.toLowerCase().includes(query)
        );
        setFilteredTokens(results);
    } else {
        setFilteredTokens(mockTokens);
    }
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsDropdownOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setSearchQuery('');
    setSelectedToken(null);
    setFormType(t('common.priceAction'));
    setFormFreq(t('common.realTime'));
    setFormOperator(t('common.greaterThan'));
    setFormThreshold('');
    setThresholdError('');
    setShowModal(true);
  };

  const handleOpenEdit = (alert: Alert) => {
    setEditingId(alert.id);
    const token = mockTokens.find(t => t.id === alert.tokenId);
    if (token) {
        setSelectedToken(token);
        setSearchQuery(`${token.name} (${token.symbol})`);
    } else {
        setSearchQuery(`${alert.tokenName} (${alert.tokenSymbol})`);
        setSelectedToken({ id: alert.tokenId, name: alert.tokenName, symbol: alert.tokenSymbol, address: alert.tokenAddress } as Token);
    }
    
    setFormType(alert.type);
    setFormFreq(alert.frequency);
    setFormOperator(alert.operator === '>' ? t('common.greaterThan') : alert.operator === '<' ? t('common.lessThan') : t('common.changePct'));
    setFormThreshold(alert.threshold.toString());
    setThresholdError('');
    setShowModal(true);
  };

  const handleSelectToken = (token: Token) => {
      setSelectedToken(token);
      setSearchQuery(`${token.name} (${token.symbol})`);
      setIsDropdownOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setSelectedToken(null); // Reset selection on user type
      setIsDropdownOpen(true);
  };

  const handleThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setFormThreshold(val);
      if (val.trim() === '' || isNaN(Number(val))) {
          setThresholdError('Digite um número válido');
      } else {
          setThresholdError('');
      }
  };

  const handleSave = () => {
    if (!selectedToken) {
      alert("Selecione um token válido");
      return;
    }
    if (thresholdError || !formThreshold) {
        setThresholdError('Digite um número válido');
        return;
    }

    const numThreshold = parseFloat(formThreshold);
    const opSymbol = formOperator === t('common.greaterThan') ? '>' : formOperator === t('common.lessThan') ? '<' : '%';

    if (editingId) {
      // Update existing
      const existing = alerts.find(a => a.id === editingId);
      if (existing) {
        const updated: Alert = {
          ...existing,
          tokenId: selectedToken.id,
          tokenName: selectedToken.name,
          tokenSymbol: selectedToken.symbol,
          tokenAddress: selectedToken.address,
          chain: selectedToken.network || existing.chain, // Default or preserve
          type: formType,
          frequency: formFreq,
          operator: opSymbol,
          threshold: numThreshold,
        };
        updateAlert(updated);
        showToast('Alerta atualizado');
      }
    } else {
      // Create new
      const newAlert: Alert = {
        id: Date.now().toString(),
        tokenId: selectedToken.id,
        tokenName: selectedToken.name,
        tokenSymbol: selectedToken.symbol,
        tokenAddress: selectedToken.address,
        chain: selectedToken.network || 'SOL',
        type: formType,
        frequency: formFreq,
        operator: opSymbol,
        threshold: numThreshold,
        isEnabled: true,
        createdAtIso: new Date().toISOString()
      };
      addAlert(newAlert);
      showToast('Alerta criado');
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this alert rule?")) {
      removeAlert(id);
      showToast('Alerta removido');
    }
  };

  const isFormValid = !!selectedToken && !thresholdError && formThreshold !== '';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('alerts.title')}</h2>
          <p className="text-sm text-gray-500">{t('alerts.subtitle')}</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-[#00FFA3] hover:bg-[#00E08F] text-[#0B0F12] px-6 py-3 rounded-xl font-bold text-sm shadow-[0_4px_20px_rgba(0,255,163,0.2)] transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
          {t('alerts.newRule')}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.length === 0 ? (
           <div className="p-12 text-center border border-[#1E272E] rounded-2xl bg-[#151C21]">
             <p className="text-gray-500 font-medium">{t('alerts.noAlerts')}</p>
           </div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className="bg-[#151C21] border border-[#1E272E] p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between hover:border-[#2D3942] transition-all group gap-4">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-12 h-12 bg-[#1E272E] rounded-xl flex items-center justify-center text-[#00FFA3] border border-[#2D3942] shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-lg mb-0.5 truncate">{alert.tokenName} <span className="text-xs text-gray-500 font-mono ml-2">{alert.tokenAddress}</span></h4>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest whitespace-nowrap">{alert.type}</span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap">Freq: {alert.frequency}</span>
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap">Threshold: {alert.operator} {alert.threshold}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-6 md:justify-end">
                <div className="flex items-center gap-3">
                   <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{alert.isEnabled ? t('alerts.active') : t('alerts.paused')}</span>
                   <div 
                      onClick={() => toggleAlert(alert.id)}
                      className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${alert.isEnabled ? 'bg-[#00FFA3]' : 'bg-[#1E272E]'}`}
                   >
                      <div className={`absolute top-1 w-3 h-3 bg-[#0B0F12] rounded-full transition-all ${alert.isEnabled ? 'right-1' : 'left-1'}`}></div>
                   </div>
                </div>
                <div className="flex items-center gap-3 md:ml-6 md:opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                      onClick={() => handleOpenEdit(alert)}
                      className="text-gray-500 hover:text-white"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                   </button>
                   <button 
                      onClick={() => handleDelete(alert.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                   >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                   </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
           <div className="absolute inset-0 bg-[#0B0F12]/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
           <div className="bg-[#151C21] border border-[#1E272E] w-full max-w-xl rounded-3xl relative p-6 sm:p-10 animate-in zoom-in-95 duration-200 m-auto">
              <h3 className="text-2xl font-bold mb-8">{editingId ? 'Edit Alert Rule' : t('tokenDetail.createAlert')}</h3>
              
              <div className="space-y-6">
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Token Address or Symbol</label>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setIsDropdownOpen(true)}
                    className={`w-full bg-[#0B0F12] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3] ${!selectedToken && searchQuery ? 'border-red-500/50' : 'border-[#1E272E]'}`}
                    placeholder={t('alerts.searchToken')} 
                  />
                  {/* Validation Error */}
                  {searchQuery && !selectedToken && (
                      <p className="text-red-500 text-xs mt-1 ml-1 font-bold">Selecione um token válido</p>
                  )}

                  {/* Dropdown */}
                  {isDropdownOpen && filteredTokens.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#151C21] border border-[#1E272E] rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                          {filteredTokens.map(token => (
                              <div 
                                key={token.id}
                                onClick={() => handleSelectToken(token)}
                                className="px-4 py-3 hover:bg-[#1E272E] cursor-pointer flex items-center justify-between border-b border-[#1E272E] last:border-0"
                              >
                                  <div className="flex flex-col">
                                      <span className="text-sm font-bold text-white">{token.name}</span>
                                      <span className="text-xs text-gray-500">{token.address.substring(0,6)}...</span>
                                  </div>
                                  <span className="text-xs font-bold text-[#00FFA3] bg-[#00FFA3]/10 px-2 py-1 rounded">{token.symbol}</span>
                              </div>
                          ))}
                      </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{t('tokenDetail.metricType')}</label>
                    <select 
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]"
                    >
                      <option>{t('common.priceAction')}</option>
                      <option>{t('common.volumeSpike')}</option>
                      <option>{t('common.liquidityChange')}</option>
                      <option>{t('common.whaleMovement')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{t('tokenDetail.frequency')}</label>
                    <select 
                      value={formFreq}
                      onChange={(e) => setFormFreq(e.target.value)}
                      className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]"
                    >
                      <option>{t('common.realTime')}</option>
                      <option>5 Minutes</option>
                      <option>1 Hour</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{t('tokenDetail.condition')}</label>
                  <div className="flex flex-col gap-1">
                    <div className="flex gap-4">
                        <select 
                            value={formOperator}
                            onChange={(e) => setFormOperator(e.target.value)}
                            className="bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]"
                        >
                        <option>{t('common.greaterThan')}</option>
                        <option>{t('common.lessThan')}</option>
                        <option>{t('common.changePct')}</option>
                        </select>
                        <input 
                        type="text" 
                        value={formThreshold}
                        onChange={handleThresholdChange}
                        className={`flex-1 bg-[#0B0F12] border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3] ${thresholdError ? 'border-red-500/50' : 'border-[#1E272E]'}`}
                        placeholder="Value (number)..." 
                        />
                    </div>
                    {thresholdError && <p className="text-red-500 text-xs ml-1 font-bold">{thresholdError}</p>}
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-[#1E272E] rounded-xl font-bold text-sm hover:bg-[#1E272E] transition-colors order-2 sm:order-1">{t('tokenDetail.cancel')}</button>
                  <button 
                    onClick={handleSave} 
                    disabled={!isFormValid}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-[0_4px_20px_rgba(0,255,163,0.3)] order-1 sm:order-2 ${!isFormValid ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-none' : 'bg-[#00FFA3] text-[#0B0F12] hover:bg-[#00E08F]'}`}
                  >
                    {editingId ? 'Update Rule' : t('tokenDetail.createRule')}
                  </button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
            <div className="fixed bottom-6 right-6 bg-[#00FFA3] text-[#0B0F12] px-6 py-3 rounded-xl font-bold text-sm shadow-2xl animate-in slide-in-from-bottom-5 fade-in z-50 transition-all duration-300">
                {toastMsg}
            </div>
      )}
    </div>
  );
};

export default Alerts;
