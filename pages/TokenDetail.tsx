
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../index';
import { mockTokens } from '../mockData';
import { Alert, ExitStrategyId, Position } from '../types';

// Strategy Definitions (Wrapped in component to use translations would be better, but doing inline translation for simplicity)
const getStrategies = (t: (k: string) => string) => ({
    conservative: {
        label: t('strategies.conservative.label'),
        description: t('strategies.conservative.desc'),
        timeline: [t('strategies.conservative.step1'), t('strategies.conservative.step2'), t('strategies.conservative.step3')]
    },
    standard: {
        label: t('strategies.standard.label'),
        description: t('strategies.standard.desc'),
        timeline: [t('strategies.standard.step1'), t('strategies.standard.step2'), t('strategies.standard.step3')]
    },
    moonshot: {
        label: t('strategies.moonshot.label'),
        description: t('strategies.moonshot.desc'),
        timeline: [t('strategies.moonshot.step1'), t('strategies.moonshot.step2'), t('strategies.moonshot.step3')]
    }
});

const TokenDetail: React.FC = () => {
  const { selectedTokenId, watchlist, toggleWatchlist, addAlert, addPosition, positions, removePosition, t } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showAlertModal, setShowAlertModal] = useState(false);
  
  // Manual Entry Modal State
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [formInvest, setFormInvest] = useState('');
  const [formExecutionPrice, setFormExecutionPrice] = useState('');
  const [formStrategy, setFormStrategy] = useState<ExitStrategyId>('standard');
  
  // Alert Form State
  const [alertType, setAlertType] = useState('Price Action');
  const [alertFreq, setAlertFreq] = useState('Real-time');
  const [alertThresholdVal, setAlertThresholdVal] = useState('');

  // Find token or fallback
  const token = mockTokens.find(t => t.id === selectedTokenId) || mockTokens[0];
  const isWatched = watchlist.includes(token.id);
  const existingPosition = positions.find(p => p.tokenId === token.id);
  
  const strategies = getStrategies(t);

  // Mock Event Logs Data
  const eventLogs = [
    { time: '14:25:32', event: 'Liquidity Add', desc: 'Added 500 SOL to Raydium Pool', icon: '💧', color: 'text-blue-400' },
    { time: '14:22:10', event: 'Whale Buy', desc: 'Wallet 0x...a1 bought 12,000,000 $PEPE', icon: '🐋', color: 'text-[#00FFA3]' },
    { time: '14:15:00', event: 'Contract Call', desc: 'Owner disabled buy taxes', icon: '📝', color: 'text-purple-400' },
    { time: '14:02:44', event: 'Score Alert', desc: 'Token Score surged from 85 to 98', icon: '🚀', color: 'text-yellow-400' },
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.address);
      showToast('Contract Address Copied');
    } catch (err) {
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = token.address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showToast('Contract Address Copied');
    }
  };

  const handleToggleWatchlist = () => {
    toggleWatchlist(token.id);
    showToast(isWatched ? 'Removed from Watchlist' : 'Added to Watchlist');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate Fetch
    setTimeout(() => {
        setIsLoading(false);
        showToast('Data Refreshed');
    }, 1500);
  };

  const handleCreateAlert = () => {
      const thresholdNum = parseFloat(alertThresholdVal);
      const newAlert: Alert = {
          id: Date.now().toString(),
          tokenId: token.id,
          tokenName: token.name,
          tokenSymbol: token.symbol,
          tokenAddress: token.address,
          chain: token.network,
          type: alertType,
          frequency: alertFreq,
          operator: '>', // Default
          threshold: isNaN(thresholdNum) ? 0 : thresholdNum,
          isEnabled: true,
          createdAtIso: new Date().toISOString()
      };
      addAlert(newAlert);
      setShowAlertModal(false);
      showToast('Alert Created Successfully');
  };

  const handleOpenEntry = () => {
      // Pre-fill if editing
      if (existingPosition) {
          setFormInvest(existingPosition.investmentUsd.toString());
          setFormExecutionPrice(existingPosition.entryPriceUsd.toString());
          setFormStrategy(existingPosition.exitStrategyId);
      } else {
          setFormInvest('');
          setFormExecutionPrice(token?.price?.toString() || '');
          setFormStrategy('standard');
      }
      setShowEntryModal(true);
  };

  const calculatedQuantity = useMemo(() => {
      const invest = parseFloat(formInvest);
      const price = parseFloat(formExecutionPrice);
      if (invest && price && price > 0) {
          return invest / price;
      }
      return 0;
  }, [formInvest, formExecutionPrice]);

  const handleSavePosition = () => {
      if (!formInvest || !formExecutionPrice) {
          alert("Please fill in all fields");
          return;
      }

      const investUsd = parseFloat(formInvest);
      const entryPrice = parseFloat(formExecutionPrice);
      
      if (isNaN(investUsd) || isNaN(entryPrice) || entryPrice === 0) return;

      const quantity = investUsd / entryPrice;

      const currentPrice = token.price || 0;
      const currentValue = quantity * currentPrice;
      const pnlUsd = currentValue - investUsd;
      const pnlPct = (pnlUsd / investUsd) * 100;

      const newPos: Position = {
          id: existingPosition ? existingPosition.id : Date.now().toString(),
          tokenId: token.id,
          tokenName: token.name,
          tokenSymbol: token.symbol,
          chain: token.network,
          entryType: 'investment_and_entryPrice',
          investmentUsd: investUsd,
          entryPriceUsd: entryPrice,
          quantity: quantity,
          entryDateIso: new Date().toISOString(),
          currentPriceUsd: currentPrice,
          pnlUsd,
          pnlPct,
          exitStrategyId: formStrategy,
          history: existingPosition ? existingPosition.history : [{
              id: Date.now().toString(),
              dateIso: new Date().toISOString(),
              type: 'OPEN',
              priceUsd: entryPrice,
              quantity: quantity,
              valueUsd: investUsd
          }]
      };

      if (existingPosition) {
          // If overwriting from detail view, add ADJUST history
          newPos.history = [{
              id: Date.now().toString(),
              dateIso: new Date().toISOString(),
              type: 'ADJUST',
              priceUsd: entryPrice,
              quantity: quantity,
              valueUsd: investUsd
          }, ...existingPosition.history];
          
          removePosition(existingPosition.id);
          addPosition(newPos);
          showToast("Position Updated");
      } else {
          addPosition(newPos);
          if (isWatched) toggleWatchlist(token.id);
          showToast("Position Opened - Removed from Favorites");
      }
      
      setShowEntryModal(false);
  };

  const handleDownloadCSV = () => {
      // CSV Header
      const headers = ['Timestamp', 'Event Type', 'Description'];
      
      // CSV Rows
      const rows = eventLogs.map(log => [
          `"${log.time}"`,
          `"${log.event}"`,
          `"${log.desc}"`
      ]);

      // Combine to CSV String
      const csvContent = [
          headers.join(','), 
          ...rows.map(r => r.join(','))
      ].join('\n');

      // Create Blob and Link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const dateStr = new Date().toISOString().split('T')[0];
      const fileName = `${token.name.replace(/\s+/g, '_')}_event_log_${dateStr}.csv`;
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Downloading CSV...');
  };

  const securityItems = [
    { label: t('tokenDetail.mintDisabled'), status: 'pass' },
    { label: t('tokenDetail.honeypotCheck'), status: 'pass' },
    { label: t('tokenDetail.topHolders'), status: 'pass' },
    { label: t('tokenDetail.contractVerified'), status: 'fail' },
    { label: t('tokenDetail.lpBurned'), status: 'pass' },
  ];

  const exitSignals = [
    { label: 'Whale Exit Detected', active: true, color: 'text-red-400' },
    { label: 'Liquidity Deceleration', active: false, color: 'text-gray-500' },
    { label: 'Volume/Price Divergence', active: true, color: 'text-yellow-400' },
  ];

  const isFormValid = useMemo(() => {
    return formInvest !== '' && formExecutionPrice !== '' && !isNaN(Number(formInvest)) && !isNaN(Number(formExecutionPrice)) && parseFloat(formExecutionPrice) > 0;
  }, [formInvest, formExecutionPrice]);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Info Card */}
      <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl p-6 md:p-8 flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="w-20 h-20 bg-[#1E272E] border-2 border-[#00FFA3] rounded-2xl flex items-center justify-center p-2 shadow-[0_0_20px_rgba(0,255,163,0.1)] shrink-0">
             <img src={`https://picsum.photos/seed/${token.id}/100`} className="w-full h-full rounded-lg object-cover" alt="" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-1">
              <h2 className="text-3xl font-bold">{token.name}</h2>
              <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20 uppercase">{token.network}</span>
            </div>
            <div 
                onClick={handleCopyAddress}
                className="flex items-center justify-center sm:justify-start gap-2 group cursor-pointer hover:bg-[#1E272E] px-2 py-1 -ml-2 rounded-lg transition-colors"
            >
              <p className="text-gray-500 font-mono text-sm break-all">{token.address}</p>
              <svg className="w-3.5 h-3.5 text-gray-500 group-hover:text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"/></svg>
            </div>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">{t('tokenDetail.contractAddress')}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 w-full lg:w-auto">
          {!existingPosition && (
            <button 
                onClick={handleToggleWatchlist}
                className={`text-sm font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 border transition-colors grow lg:grow-0 justify-center ${
                    isWatched 
                    ? 'bg-[#1E272E] text-[#00FFA3] border-[#00FFA3]' 
                    : 'bg-[#1E272E] hover:bg-[#2D3942] text-white border-[#2D3942]'
                }`}
            >
                <svg className="w-4 h-4" fill={isWatched ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                {isWatched ? 'Watched' : t('sidebar.favorites')}
            </button>
          )}
          
          <button 
             onClick={handleOpenEntry}
             className="bg-[#00FFA3] text-[#0B0F12] text-sm font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-[0_4px_12px_rgba(0,255,163,0.3)] hover:bg-[#00E08F] transition-all grow lg:grow-0 justify-center"
          >
             {existingPosition ? (
                 <>
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                   {t('tokenDetail.managePosition')}
                 </>
             ) : (
                 <>
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                   {t('tokenDetail.openPosition')}
                 </>
             )}
          </button>

          <button 
            onClick={() => setShowAlertModal(true)}
            className="bg-[#1E272E] hover:bg-[#2D3942] text-sm font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 border border-[#2D3942] transition-colors grow lg:grow-0 justify-center"
          >
            <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            {t('tokenDetail.alert')}
          </button>
          <button 
            onClick={handleRefresh}
            disabled={isLoading}
            className={`bg-[#1E272E] text-white text-sm font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 border border-[#2D3942] transition-colors grow lg:grow-0 justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#2D3942]'}`}
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
            {isLoading ? 'Refreshing' : t('tokenDetail.refresh')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Price', val: '$0.0000123', sub: '+12.5%' }, // Mocked for now, in real app needs price field in token
          { label: 'Market Cap', val: token.mktCap, sub: '+5.2%' },
          { label: 'Liquidity', val: token.liquidity, sub: '+1.0%' },
          { label: 'Holders', val: token.holders, sub: '+0.5%' },
          { label: 'LP Lock %', val: '98%', sub: 'Locked Forever', isProgress: true },
        ].map((stat, i) => (
          <div key={i} className="bg-[#151C21] border border-[#1E272E] p-5 rounded-xl">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">{stat.label}</p>
            <h4 className="text-xl font-bold mb-1">{stat.val}</h4>
            {stat.isProgress ? (
               <div className="w-full h-1.5 bg-[#1E272E] rounded-full overflow-hidden mt-3 border border-cyan-500/20 shadow-[0_0_10px_rgba(0,255,255,0.1)]">
                 <div className="h-full bg-cyan-400 w-[98%]"></div>
               </div>
            ) : (
              <p className="text-[10px] font-bold text-green-500">{stat.sub}</p>
            )}
            {stat.isProgress && <p className="text-[10px] font-bold text-cyan-400 mt-1">{stat.sub}</p>}
          </div>
        ))}
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security Checklist */}
        <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              <h4 className="font-bold text-sm uppercase tracking-widest">{t('tokenDetail.securityChecklist')}</h4>
            </div>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase ${token.status === 'VERIFIED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                {token.status === 'VERIFIED' ? t('tokenDetail.clean') : t('tokenDetail.risky')}
            </span>
          </div>
          <div className="space-y-4">
            {securityItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${item.status === 'pass' ? 'bg-green-500 text-[#0B0F12]' : 'bg-red-500 text-white'}`}>
                    {item.status === 'pass' ? (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                    ) : (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-300">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Confirmation Triggers */}
        <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl p-6">
          <h4 className="font-bold text-sm uppercase tracking-widest mb-6">{t('tokenDetail.confirmationTriggers')}</h4>
          <div className="mb-6">
            <div className="flex items-end justify-between mb-2">
              <h5 className="text-4xl font-bold text-cyan-400">3/5</h5>
              <span className="text-[10px] text-gray-500 font-bold uppercase mb-1">{t('tokenDetail.thresholdsMet')}</span>
            </div>
            <div className="w-full h-2 bg-[#1E272E] rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400 w-[60%] shadow-[0_0_10px_rgba(0,255,255,0.4)]"></div>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Volume > 2x Avg', ok: true },
              { label: 'New Whales > 5', ok: true },
              { label: 'Social Engagement +50%', ok: false },
              { label: 'Liquidity Depth +20%', ok: true },
              { label: 'Low Sell Pressure', ok: false },
            ].map((trigger, i) => (
              <div key={i} className={`p-3 rounded-lg border flex items-center justify-between ${trigger.ok ? 'border-cyan-500/20 bg-cyan-500/5' : 'border-gray-500/10 bg-gray-500/5'}`}>
                <span className={`text-xs font-medium ${trigger.ok ? 'text-cyan-400' : 'text-gray-500'}`}>{trigger.label}</span>
                {trigger.ok && <svg className="w-3.5 h-3.5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L9 10.586l3.293-3.293a1 1 0 011.414 1.414z"/></svg>}
              </div>
            ))}
          </div>
        </div>

        {/* Exit Signals */}
        <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl p-6">
          <h4 className="font-bold text-sm uppercase tracking-widest mb-6">{t('tokenDetail.exitSignals')}</h4>
          <div className="space-y-4">
            {exitSignals.map((sig, i) => (
              <div key={i} className={`p-4 rounded-xl border flex flex-col gap-2 ${sig.active ? 'border-red-500/20 bg-red-500/5' : 'border-[#1E272E] bg-[#1E272E]/20'}`}>
                <div className="flex items-center justify-between">
                   <h5 className={`text-sm font-bold ${sig.active ? 'text-red-400' : 'text-gray-500'}`}>{sig.label}</h5>
                   {sig.active && <span className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></span>}
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">System detected unusual outbound transactions from top holder wallets. High probability of distribution.</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Data Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Score Evolution (Mock Chart) */}
        <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl p-6">
           <h4 className="font-bold text-sm uppercase tracking-widest mb-6">{t('tokenDetail.scoreEvo')}</h4>
           <div className="h-48 w-full flex items-end gap-1">
             {[40, 45, 38, 52, 60, 58, 70, 85, 92, 98, 95, 98].map((h, i) => (
               <div key={i} className="flex-1 bg-gradient-to-t from-[#00FFA3]/20 to-[#00FFA3] rounded-t-sm" style={{ height: `${h}%` }}></div>
             ))}
           </div>
           <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-bold">
             <span>24h Ago</span>
             <span>Current</span>
           </div>
        </div>

        {/* Volume Heatmap */}
        <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl p-6">
           <h4 className="font-bold text-sm uppercase tracking-widest mb-6">{t('tokenDetail.volHeatmap')}</h4>
           <div className="grid grid-cols-8 gap-2 h-48">
              {Array.from({ length: 32 }).map((_, i) => {
                const intensities = ['bg-green-500/10', 'bg-green-500/30', 'bg-green-500/60', 'bg-green-500/90'];
                const intensity = intensities[Math.floor(Math.random() * intensities.length)];
                return <div key={i} className={`${intensity} rounded-md border border-white/5`}></div>;
              })}
           </div>
        </div>
      </div>

      {/* Position History (New Block) */}
      {existingPosition && existingPosition.history && existingPosition.history.length > 0 && (
        <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1E272E] flex items-center justify-between">
            <h4 className="font-bold text-sm uppercase tracking-widest text-[#00FFA3]">{t('tokenDetail.posActivity')}</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="border-b border-[#1E272E] bg-[#1E272E]/10">
                <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3 text-right">Value (USD)</th>
                  <th className="px-6 py-3 text-right">Quantity</th>
                  <th className="px-6 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E272E]">
                {existingPosition.history.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1E272E]/20 transition-colors">
                    <td className="px-6 py-4 text-xs font-mono text-gray-500">
                      {new Date(item.dateIso).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                        item.type === 'OPEN' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        item.type === 'ADD' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        item.type === 'REDUCE' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        item.type === 'ADJUST' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                      ${item.valueUsd.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-300">
                      {item.quantity.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-mono text-gray-500">
                      ${item.priceUsd.toFixed(8)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Event Log */}
      <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1E272E] flex items-center justify-between">
          <h4 className="font-bold text-sm uppercase tracking-widest">{t('tokenDetail.eventLog')}</h4>
          <button 
              onClick={handleDownloadCSV}
              className="text-[10px] font-bold text-[#00FFA3] uppercase tracking-wider hover:underline"
          >
              {t('tokenDetail.downloadCsv')}
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <div className="min-w-[600px]">
          {eventLogs.map((log, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-6 border-b border-[#1E272E] last:border-0 hover:bg-[#1E272E]/20 transition-colors">
              <span className="text-xs font-mono text-gray-500">{log.time}</span>
              <div className="flex items-center gap-3 min-w-[140px]">
                <span className="text-lg">{log.icon}</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${log.color}`}>{log.event}</span>
              </div>
              <p className="text-sm text-gray-300 font-medium">{log.desc}</p>
            </div>
          ))}
          </div>
        </div>
      </div>

      {/* Alert Modal */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
           <div className="absolute inset-0 bg-[#0B0F12]/80 backdrop-blur-sm" onClick={() => setShowAlertModal(false)}></div>
           <div className="bg-[#151C21] border border-[#1E272E] w-full max-w-xl rounded-3xl relative p-6 sm:p-10 animate-in zoom-in-95 duration-200 m-auto">
              <h3 className="text-2xl font-bold mb-8">{t('tokenDetail.createAlert')}</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Token Address or Symbol</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3] text-gray-400" 
                    value={`${token.name} (${token.symbol})`} 
                    disabled 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{t('tokenDetail.metricType')}</label>
                    <select 
                        value={alertType}
                        onChange={(e) => setAlertType(e.target.value)}
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
                        value={alertFreq}
                        onChange={(e) => setAlertFreq(e.target.value)}
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
                  <div className="flex gap-4">
                     <select className="bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]">
                       <option>{t('common.greaterThan')}</option>
                       <option>{t('common.lessThan')}</option>
                       <option>{t('common.changePct')}</option>
                     </select>
                     <input 
                        type="text" 
                        value={alertThresholdVal}
                        onChange={(e) => setAlertThresholdVal(e.target.value)}
                        className="flex-1 bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]" 
                        placeholder="e.g. 5%" 
                     />
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                  <button onClick={() => setShowAlertModal(false)} className="flex-1 px-6 py-3 border border-[#1E272E] rounded-xl font-bold text-sm hover:bg-[#1E272E] transition-colors order-2 sm:order-1">{t('tokenDetail.cancel')}</button>
                  <button onClick={handleCreateAlert} className="flex-1 px-6 py-3 bg-[#00FFA3] text-[#0B0F12] rounded-xl font-bold text-sm hover:bg-[#00E08F] transition-colors shadow-[0_4px_20px_rgba(0,255,163,0.3)] order-1 sm:order-2">{t('tokenDetail.createRule')}</button>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
           <div className="absolute inset-0 bg-[#0B0F12]/80 backdrop-blur-sm" onClick={() => setShowEntryModal(false)}></div>
           <div className="bg-[#151C21] border border-[#1E272E] w-full max-w-lg rounded-3xl relative p-6 sm:p-10 animate-in zoom-in-95 duration-200 m-auto">
              <h3 className="text-2xl font-bold mb-6">{existingPosition ? t('tokenDetail.managePos') : t('tokenDetail.createOpenPos')}</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Token</label>
                  <input 
                    type="text" 
                    value={`${token.name} (${token.symbol})`} 
                    disabled 
                    className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none text-gray-400"
                  />
                </div>

                <div>
                   <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{t('tokenDetail.totalInvest')}</label>
                   <input 
                      type="number" 
                      value={formInvest}
                      onChange={(e) => setFormInvest(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]"
                   />
                </div>

                <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{t('tokenDetail.execPrice')}</label>
                    <input 
                    type="number" 
                    value={formExecutionPrice}
                    onChange={(e) => setFormExecutionPrice(e.target.value)}
                    className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]"
                    />
                </div>

                <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">{t('tokenDetail.qtyCalc')}</label>
                    <input 
                        type="text" 
                        value={calculatedQuantity > 0 ? calculatedQuantity.toFixed(2) : '0.00'}
                        readOnly
                        className="w-full bg-[#1E272E]/50 border border-[#1E272E] rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">{t('tokenDetail.exitPlan')}</label>
                    <div className="space-y-3">
                        {(Object.keys(strategies) as ExitStrategyId[]).map((stratId) => (
                            <label key={stratId} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formStrategy === stratId ? 'bg-[#00FFA3]/10 border-[#00FFA3]' : 'bg-[#0B0F12] border-[#1E272E] hover:border-gray-600'}`}>
                                <input 
                                    type="radio" 
                                    name="strategy" 
                                    checked={formStrategy === stratId} 
                                    onChange={() => setFormStrategy(stratId)}
                                    className="mt-1 accent-[#00FFA3] shrink-0" 
                                />
                                <div className="w-full">
                                    <span className={`block text-sm font-bold ${formStrategy === stratId ? 'text-[#00FFA3]' : 'text-gray-300'}`}>{strategies[stratId].label}</span>
                                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{strategies[stratId].description}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {strategies[stratId].timeline.map((b, i) => (
                                            <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded border whitespace-nowrap ${formStrategy === stratId ? 'bg-[#00FFA3]/20 text-[#00FFA3] border-[#00FFA3]/30' : 'bg-[#1E272E] text-gray-500 border-[#2D3942]'}`}>
                                                {b}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                   <button 
                      onClick={() => setShowEntryModal(false)}
                      className="flex-1 px-6 py-3 border border-[#1E272E] rounded-xl font-bold text-sm hover:bg-[#1E272E] transition-colors"
                   >
                       {t('tokenDetail.cancel')}
                   </button>
                   <button 
                      onClick={handleSavePosition}
                      disabled={!isFormValid}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-[0_4px_20px_rgba(0,255,163,0.3)] ${!isFormValid ? 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#00FFA3] text-[#0B0F12] hover:bg-[#00E08F]'}`}
                   >
                       {existingPosition ? t('tokenDetail.updatePos') : t('tokenDetail.openPosition')}
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

export default TokenDetail;
