
import React, { useMemo, useState } from 'react';
import KPICard from '../components/KPICard';
import { mockTokens } from '../mockData';
import { useAppContext } from '../index';
import { Position, ExitStrategyId } from '../types';

interface WatchlistProps {
    setCurrentPage?: (page: string) => void;
}

// Strategy Definitions for UI Logic
const STRATEGIES: Record<ExitStrategyId, { label: string; description: string; timeline: string[] }> = {
    conservative: {
        label: 'Conservative',
        description: 'Low risk. Focus on securing capital early and protecting against downside.',
        timeline: ['Sell 25% @ 1.5x', 'Sell 50% @ 2x (Profit)', 'Stop Loss @ -10%']
    },
    standard: {
        label: 'Standard',
        description: 'Balanced. Sell 50% at 2x to break even, then hold the rest as a "Moonbag" (risk-free position).',
        timeline: ['Sell 50% @ 2x (Breakeven)', 'Sell 25% @ 5x', 'Hold 25% (Moonbag)']
    },
    moonshot: {
        label: 'Moonshot',
        description: 'Aggressive. Aiming for "Valhalla" (life-changing gains). Willing to hold through volatility.',
        timeline: ['Sell 15% @ 3x', 'Sell 35% @ 10x', 'Hold 50% for Valhalla']
    }
};

const Watchlist: React.FC<WatchlistProps> = ({ setCurrentPage }) => {
  const { watchlist, toggleWatchlist, positions, addPosition, removePosition, setSelectedTokenId } = useAppContext();
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [formTokenId, setFormTokenId] = useState('');
  const [formInvest, setFormInvest] = useState('');
  const [formExecutionPrice, setFormExecutionPrice] = useState('');
  const [formStrategy, setFormStrategy] = useState<ExitStrategyId>('standard');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Helper to format currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(val);
  };

  // Helper to get current price (mock)
  const getCurrentPrice = (tokenId: string) => {
     const t = mockTokens.find(t => t.id === tokenId);
     return t?.price || 0;
  };

  // Combine Positions and Watchlist with strict separation
  const displayItems = useMemo(() => {
    const items: any[] = [];
    const processedIds = new Set();

    // 1. Process Active Positions (Portfolio)
    positions.forEach(pos => {
        processedIds.add(pos.tokenId);
        const currentPrice = getCurrentPrice(pos.tokenId);
        const currentValue = pos.quantity * currentPrice;
        const pnlUsd = currentValue - pos.investmentUsd;
        const pnlPct = pos.investmentUsd > 0 ? (pnlUsd / pos.investmentUsd) * 100 : 0;
        
        items.push({
            uniqueId: pos.id,
            ...pos,
            isPosition: true,
            currentPriceUsd: currentPrice,
            pnlUsd,
            pnlPct
        });
    });

    // 2. Process Watchlist Only (No Position)
    watchlist.forEach(id => {
        if (!processedIds.has(id)) {
            const token = mockTokens.find(t => t.id === id);
            if (token) {
                items.push({
                    uniqueId: `watch-${id}`,
                    id: `watch-pos-${id}`,
                    tokenId: token.id,
                    tokenName: token.name,
                    tokenSymbol: token.symbol,
                    chain: token.network,
                    isPosition: false,
                    investmentUsd: 0,
                    entryPriceUsd: 0,
                    quantity: 0,
                    currentPriceUsd: token.price || 0,
                    pnlPct: 0,
                    exitStrategyId: null
                });
            }
        }
    });

    // Sort: Positions first, then Watchlist
    return items.sort((a, b) => (a.isPosition === b.isPosition ? 0 : a.isPosition ? -1 : 1));
  }, [positions, watchlist]);

  // Top Metrics Calculation (Only Active Positions)
  const metrics = useMemo(() => {
    let totalInvest = 0;
    let totalValue = 0;

    displayItems.forEach(item => {
        if (item.isPosition) {
            totalInvest += item.investmentUsd;
            totalValue += (item.quantity * item.currentPriceUsd);
        }
    });

    const unrealizedPnL = totalValue - totalInvest;
    const pnlPct = totalInvest > 0 ? (unrealizedPnL / totalInvest) * 100 : 0;
    
    // Mock daily change logic
    const dailyChange = totalValue * 0.023 * (unrealizedPnL >= 0 ? 1 : -1); 
    const dailyChangePct = 2.3;

    return {
        totalInvest,
        unrealizedPnL,
        pnlPct,
        dailyChange,
        dailyChangePct
    };
  }, [displayItems]);

  // Handlers
  const handleView = (tokenId: string) => {
    setSelectedTokenId(tokenId);
    if (setCurrentPage) setCurrentPage('token-detail');
  };

  const handleRemove = (item: any) => {
      if (item.isPosition) {
          if (window.confirm("Remove this position from Portfolio? It will revert to Watch Only.")) {
              removePosition(item.uniqueId); // uniqueId is pos.id for positions
              // Ensure it stays in watchlist if desired, currently store logic keeps it separate.
              // We want to ensure the ID remains in 'watchlist' array context.
              if (!watchlist.includes(item.tokenId)) {
                  toggleWatchlist(item.tokenId); // Re-add to watchlist if it was missing
              }
              showToast("Position removed (Watching)");
          }
      } else {
          // Remove from Watchlist
          toggleWatchlist(item.tokenId);
          showToast("Removed from Watchlist");
      }
  };

  const handleManualEntry = () => {
    // Default to first token in watchlist or first mock
    const defaultTokenId = watchlist.length > 0 ? watchlist[0] : mockTokens[0].id;
    const token = mockTokens.find(t => t.id === defaultTokenId);
    
    setFormTokenId(defaultTokenId);
    setFormInvest('');
    setFormExecutionPrice(token?.price?.toString() || '');
    setFormStrategy('standard');
    setShowModal(true);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newTokenId = e.target.value;
      setFormTokenId(newTokenId);
      const token = mockTokens.find(t => t.id === newTokenId);
      if (token && token.price) {
          setFormExecutionPrice(token.price.toString());
      }
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
      if (!formTokenId || !formInvest || !formExecutionPrice) {
          alert("Please fill in all fields");
          return;
      }

      const token = mockTokens.find(t => t.id === formTokenId);
      if (!token) return;

      const investUsd = parseFloat(formInvest);
      const entryPrice = parseFloat(formExecutionPrice);
      
      if (isNaN(investUsd) || isNaN(entryPrice) || entryPrice === 0) return;

      const quantity = investUsd / entryPrice;

      const currentPrice = token.price || 0;
      const currentValue = quantity * currentPrice;
      const pnlUsd = currentValue - investUsd;
      const pnlPct = (pnlUsd / investUsd) * 100;
      const dateIso = new Date().toISOString();

      const newPos: Position = {
          id: Date.now().toString(),
          tokenId: token.id,
          tokenName: token.name,
          tokenSymbol: token.symbol,
          chain: token.network,
          entryType: 'investment_and_entryPrice',
          investmentUsd: investUsd,
          entryPriceUsd: entryPrice,
          quantity: quantity,
          entryDateIso: dateIso,
          currentPriceUsd: currentPrice,
          pnlUsd,
          pnlPct,
          exitStrategyId: formStrategy,
          history: [{
              id: Date.now().toString(),
              dateIso: dateIso,
              type: 'OPEN',
              priceUsd: entryPrice,
              quantity: quantity,
              valueUsd: investUsd
          }]
      };

      addPosition(newPos);
      
      // Ensure it is in watchlist visually (state logic handles displayItems)
      if (!watchlist.includes(token.id)) {
          toggleWatchlist(token.id);
      }

      setShowModal(false);
      showToast("Position Opened & Strategy Active");
  };

  const handleExport = () => {
    const headers = ['Token', 'Type', 'Strategy', 'Invested', 'Entry Price', 'PnL %'];
    
    const rows = displayItems
        .filter(item => item.isPosition)
        .map(item => [
            item.tokenSymbol,
            'Portfolio',
            item.exitStrategyId,
            item.investmentUsd.toFixed(2),
            item.entryPriceUsd.toFixed(8),
            item.pnlPct.toFixed(2)
        ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `portfolio_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Exporting Report...");
  };

  const isFormValid = useMemo(() => {
    return formTokenId && formInvest !== '' && formExecutionPrice !== '' && !isNaN(Number(formInvest)) && !isNaN(Number(formExecutionPrice)) && parseFloat(formExecutionPrice) > 0;
  }, [formTokenId, formInvest, formExecutionPrice]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Portfolio & Watchlist</h2>
          <p className="text-sm text-gray-500">Track your simulated entries and manage multi-layered exit strategies.</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
           <button 
                onClick={handleExport}
                className="flex-1 sm:flex-none bg-[#1E272E] px-6 py-3 rounded-xl font-bold text-sm border border-[#2D3942] hover:bg-[#2D3942] transition-colors whitespace-nowrap"
           >
                Export Report
           </button>
           <button 
                onClick={handleManualEntry}
                className="flex-1 sm:flex-none bg-[#00D1FF] text-[#0B0F12] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#00B8E6] transition-all shadow-[0_4px_20px_rgba(0,209,255,0.2)] whitespace-nowrap"
           >
                Manual Entry
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
            label="Total Investment (Sim)" 
            value={formatCurrency(metrics.totalInvest)} 
            change={`${metrics.dailyChangePct > 0 ? '+' : ''}${metrics.dailyChangePct}%`} 
        />
        <KPICard 
            label="Unrealized P&L" 
            value={formatCurrency(metrics.unrealizedPnL)} 
            change={`${metrics.pnlPct.toFixed(2)}%`}
            isPositive={metrics.unrealizedPnL >= 0}
        />
        <KPICard 
            label="Daily Change" 
            value={formatCurrency(metrics.dailyChange)} 
            change="-2.4%" 
            isPositive={false} 
        />
      </div>

      <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="border-b border-[#1E272E]">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <th className="px-6 py-4">Position / Token</th>
                <th className="px-6 py-4 text-right">Investment</th>
                <th className="px-6 py-4 text-right">Entry Price</th>
                <th className="px-6 py-4 text-right">Current Price</th>
                <th className="px-6 py-4 text-right">P&L (%)</th>
                <th className="px-6 py-4 text-center">Exit Strategy</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E272E]">
              {displayItems.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                     <div className="flex flex-col items-center gap-2">
                       <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                       <span className="text-sm font-medium">Your portfolio is empty</span>
                     </div>
                   </td>
                 </tr>
              ) : (
                displayItems.map(item => (
                  <tr key={item.uniqueId} className={`transition-colors group ${item.isPosition ? 'hover:bg-[#1E272E]/30' : 'bg-[#1E272E]/10 hover:bg-[#1E272E]/20'}`}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${item.isPosition ? 'bg-[#1E272E] border-[#2D3942]' : 'bg-transparent border-[#1E272E] opacity-50'}`}>
                           <img src={`https://picsum.photos/seed/${item.tokenId}/32`} className="w-full h-full rounded-lg object-cover" alt="" />
                        </div>
                        <div>
                          <h5 className={`text-sm font-bold ${item.isPosition ? 'text-white' : 'text-gray-400'}`}>{item.tokenName}</h5>
                          <div className="flex items-center gap-2">
                              <p className="text-[10px] text-gray-500 font-bold uppercase">{item.tokenSymbol}</p>
                              {!item.isPosition && <span className="text-[9px] bg-gray-700 px-1.5 rounded text-gray-300">WATCH ONLY</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-sm text-gray-300">
                        {item.isPosition ? formatCurrency(item.investmentUsd) : <span className="text-gray-600">-</span>}
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-sm text-gray-500">
                        {item.isPosition ? `$${item.entryPriceUsd.toFixed(8)}` : <span className="text-gray-600">-</span>}
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-sm text-gray-300">
                        ${item.currentPriceUsd.toFixed(8)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      {item.isPosition ? (
                          <span className={`text-sm font-bold ${item.pnlPct >= 0 ? 'text-[#00FFA3]' : 'text-red-400'}`}>
                            {item.pnlPct >= 0 ? '+' : ''}{item.pnlPct.toFixed(2)}%
                          </span>
                      ) : (
                          <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center flex-wrap gap-1 max-w-[200px] mx-auto">
                         {item.isPosition && item.exitStrategyId ? (
                           <>
                             {STRATEGIES[item.exitStrategyId as ExitStrategyId].timeline.map((badge, idx) => (
                                 <span key={idx} className="px-2 py-0.5 rounded bg-[#1E272E] text-[9px] font-bold text-gray-400 border border-[#2D3942] whitespace-nowrap">
                                     {badge}
                                 </span>
                             ))}
                           </>
                         ) : (
                             <span className="text-xs text-gray-600">-</span>
                         )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-3 text-gray-500">
                         <button 
                            onClick={() => handleView(item.tokenId)}
                            className="hover:text-white transition-colors"
                            title="View Token"
                         >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                         </button>
                         {item.isPosition ? (
                            <button 
                                onClick={() => handleRemove(item)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                                title="Close Position (Revert to Watch)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                         ) : (
                            <button 
                                onClick={() => handleRemove(item)}
                                className="text-gray-600 hover:text-red-400 transition-colors"
                                title="Remove from Watchlist"
                            >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                            </button>
                         )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
           <div className="absolute inset-0 bg-[#0B0F12]/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
           <div className="bg-[#151C21] border border-[#1E272E] w-full max-w-lg rounded-3xl relative p-6 sm:p-10 animate-in zoom-in-95 duration-200 m-auto">
              <h3 className="text-2xl font-bold mb-6">Manual Position Entry</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Select Token</label>
                  <select 
                     value={formTokenId}
                     onChange={handleTokenChange}
                     className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]"
                  >
                      {mockTokens.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.symbol})</option>
                      ))}
                  </select>
                </div>

                <div>
                   <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Total Investment (USD)</label>
                   <input 
                      type="number" 
                      value={formInvest}
                      onChange={(e) => setFormInvest(e.target.value)}
                      placeholder="e.g. 1000"
                      className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]"
                   />
                </div>

                <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Execution Price (USD)</label>
                    <input 
                    type="number" 
                    value={formExecutionPrice}
                    onChange={(e) => setFormExecutionPrice(e.target.value)}
                    className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3]"
                    />
                </div>

                <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Quantity (Calculated)</label>
                    <input 
                        type="text" 
                        value={calculatedQuantity > 0 ? calculatedQuantity.toFixed(2) : '0.00'}
                        readOnly
                        className="w-full bg-[#1E272E]/50 border border-[#1E272E] rounded-xl px-4 py-3 text-sm text-gray-400 cursor-not-allowed"
                    />
                </div>

                <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-3">Exit Strategy Plan (Required)</label>
                    <div className="space-y-3">
                        {(Object.keys(STRATEGIES) as ExitStrategyId[]).map((stratId) => (
                            <label key={stratId} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${formStrategy === stratId ? 'bg-[#00FFA3]/10 border-[#00FFA3]' : 'bg-[#0B0F12] border-[#1E272E] hover:border-gray-600'}`}>
                                <input 
                                    type="radio" 
                                    name="strategy" 
                                    checked={formStrategy === stratId} 
                                    onChange={() => setFormStrategy(stratId)}
                                    className="mt-1 accent-[#00FFA3] shrink-0" 
                                />
                                <div className="w-full">
                                    <span className={`block text-sm font-bold ${formStrategy === stratId ? 'text-[#00FFA3]' : 'text-gray-300'}`}>{STRATEGIES[stratId].label}</span>
                                    <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">{STRATEGIES[stratId].description}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {STRATEGIES[stratId].timeline.map((b, i) => (
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
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-6 py-3 border border-[#1E272E] rounded-xl font-bold text-sm hover:bg-[#1E272E] transition-colors"
                   >
                       Cancel
                   </button>
                   <button 
                      onClick={handleSavePosition}
                      disabled={!isFormValid}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-[0_4px_20px_rgba(0,255,163,0.3)] ${!isFormValid ? 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#00FFA3] text-[#0B0F12] hover:bg-[#00E08F]'}`}
                   >
                       Open Position
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

export default Watchlist;
