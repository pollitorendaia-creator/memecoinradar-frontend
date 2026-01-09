
import React, { useMemo, useState } from 'react';
import KPICard from '../components/KPICard';
import { mockTokens } from '../mockData';
import { useAppContext } from '../index';
import { Position, ExitStrategyId, PositionHistoryItem, PositionActionType } from '../types';

interface PortfolioProps {
    setCurrentPage?: (page: string) => void;
}

// Strategy Definitions
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

const Portfolio: React.FC<PortfolioProps> = ({ setCurrentPage }) => {
  const { positions, addPosition, removePosition, setSelectedTokenId, t } = useAppContext();
  const strategies = getStrategies(t);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPositionId, setEditingPositionId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'add' | 'reduce' | 'adjust'>('create');
  
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

  // Process Active Positions
  const displayItems = useMemo(() => {
    return positions.map(pos => {
        const currentPrice = getCurrentPrice(pos.tokenId);
        const currentValue = pos.quantity * currentPrice;
        const pnlUsd = currentValue - pos.investmentUsd;
        const pnlPct = pos.investmentUsd > 0 ? (pnlUsd / pos.investmentUsd) * 100 : 0;
        
        return {
            ...pos,
            currentPriceUsd: currentPrice,
            pnlUsd,
            pnlPct
        };
    });
  }, [positions]);

  // Top Metrics Calculation
  const metrics = useMemo(() => {
    let totalInvest = 0;
    let totalValue = 0;

    displayItems.forEach(item => {
        totalInvest += item.investmentUsd;
        totalValue += (item.quantity * item.currentPriceUsd);
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

  const handleClosePosition = (id: string) => {
      if (window.confirm("Are you sure you want to close this position? This action cannot be undone.")) {
          removePosition(id);
          showToast("Position Closed");
      }
  };

  const handleUpdatePosition = (pos: any, mode: 'add' | 'reduce' | 'adjust') => {
    setEditingPositionId(pos.id);
    setModalMode(mode);
    setFormTokenId(pos.tokenId);
    setFormStrategy(pos.exitStrategyId);

    if (mode === 'adjust') {
        // Pre-fill with current totals for adjustment
        setFormInvest(pos.investmentUsd.toString());
        setFormExecutionPrice(pos.entryPriceUsd.toString());
    } else if (mode === 'reduce') {
        // Pre-fill empty for user to input reduction
        setFormInvest('');
        setFormExecutionPrice(pos.currentPriceUsd.toString()); // Suggest current price
    } else {
        // Add mode: Pre-fill empty
        setFormInvest('');
        setFormExecutionPrice(pos.currentPriceUsd.toString()); // Suggest current price
    }
    
    setShowModal(true);
  };

  const handleManualEntry = () => {
    setEditingPositionId(null);
    setModalMode('create');
    setFormTokenId(mockTokens[0].id); // Default to first
    setFormInvest('');
    // Default to current price of first token
    const t = mockTokens[0];
    setFormExecutionPrice(t.price ? t.price.toString() : '');
    setFormStrategy('standard');
    setShowModal(true);
  };

  // Update default price when token changes in create mode
  const handleTokenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newTokenId = e.target.value;
      setFormTokenId(newTokenId);
      if (!editingPositionId) {
          const t = mockTokens.find(token => token.id === newTokenId);
          if (t && t.price) {
              setFormExecutionPrice(t.price.toString());
          }
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
      if (!formTokenId) return;
      
      const token = mockTokens.find(t => t.id === formTokenId);
      if (!token) return;

      const inputInvestUsd = parseFloat(formInvest);
      const inputExecutionPrice = parseFloat(formExecutionPrice);

      if (isNaN(inputInvestUsd) || isNaN(inputExecutionPrice) || inputExecutionPrice === 0) return;

      // Calculated values
      const transactionPrice = inputExecutionPrice;
      const transactionInvest = inputInvestUsd;
      const transactionQty = transactionInvest / transactionPrice;

      const currentPrice = token.price || 0;
      const historyId = Date.now().toString();
      const dateIso = new Date().toISOString();

      if (editingPositionId) {
          // Modifying existing position
          const existingPos = positions.find(p => p.id === editingPositionId);
          if (!existingPos) return;

          let newPos: Position = { ...existingPos };
          let actionType: PositionActionType = 'ADJUST';

          if (modalMode === 'add') {
              actionType = 'ADD';
              // 1. Update Totals
              const newTotalQty = existingPos.quantity + transactionQty;
              const newTotalInvest = existingPos.investmentUsd + transactionInvest;
              
              // 2. Weighted Average Entry Price
              const newEntryPrice = newTotalInvest / newTotalQty;

              newPos.quantity = newTotalQty;
              newPos.investmentUsd = newTotalInvest;
              newPos.entryPriceUsd = newEntryPrice;
          
          } else if (modalMode === 'reduce') {
              actionType = 'REDUCE';
              // 1. Update Totals
              const newTotalQty = existingPos.quantity - transactionQty;
              if (newTotalQty < 0) {
                  alert("Cannot sell more than you own.");
                  return;
              }

              // 2. Reduce Cost Basis (Proportional)
              // Cost basis of sold tokens = Qty Sold * Avg Entry Price
              const costBasisRemoved = transactionQty * existingPos.entryPriceUsd;
              const newTotalInvest = existingPos.investmentUsd - costBasisRemoved;

              // Entry Price DOES NOT CHANGE on sell
              newPos.quantity = newTotalQty;
              newPos.investmentUsd = newTotalInvest > 0 ? newTotalInvest : 0;
              // newPos.entryPriceUsd remains existingPos.entryPriceUsd

          } else if (modalMode === 'adjust') {
              actionType = 'ADJUST';
              // Manual Override
              newPos.investmentUsd = transactionInvest; // In adjust mode, form values are absolute
              newPos.entryPriceUsd = transactionPrice;
              newPos.quantity = transactionQty;
              newPos.exitStrategyId = formStrategy;
          }

          // Recalculate PnL
          const newCurrentValue = newPos.quantity * currentPrice;
          newPos.pnlUsd = newCurrentValue - newPos.investmentUsd;
          newPos.pnlPct = newPos.investmentUsd > 0 ? (newPos.pnlUsd / newPos.investmentUsd) * 100 : 0;

          // Add to History
          const historyItem: PositionHistoryItem = {
              id: historyId,
              dateIso,
              type: actionType,
              priceUsd: transactionPrice,
              quantity: transactionQty,
              valueUsd: transactionInvest
          };
          newPos.history = [historyItem, ...(existingPos.history || [])];

          removePosition(editingPositionId);
          addPosition(newPos);
          showToast(`Position ${modalMode === 'add' ? 'Increased' : modalMode === 'reduce' ? 'Reduced' : 'Adjusted'}`);

      } else {
          // CREATE NEW
          const currentValue = transactionQty * currentPrice;
          const pnlUsd = currentValue - transactionInvest;
          const pnlPct = (pnlUsd / transactionInvest) * 100;

          const historyItem: PositionHistoryItem = {
              id: historyId,
              dateIso,
              type: 'OPEN',
              priceUsd: transactionPrice,
              quantity: transactionQty,
              valueUsd: transactionInvest
          };

          const newPos: Position = {
              id: Date.now().toString(),
              tokenId: token.id,
              tokenName: token.name,
              tokenSymbol: token.symbol,
              chain: token.network,
              entryType: 'investment_and_entryPrice',
              investmentUsd: transactionInvest,
              entryPriceUsd: transactionPrice,
              quantity: transactionQty,
              entryDateIso: dateIso,
              currentPriceUsd: currentPrice,
              pnlUsd,
              pnlPct,
              exitStrategyId: formStrategy,
              history: [historyItem]
          };

          addPosition(newPos);
          showToast("Position Created");
      }

      setShowModal(false);
  };

  const handleExport = () => {
    // ... export logic ...
    showToast("Exporting...");
  };

  const getModalTitle = () => {
      switch(modalMode) {
          case 'add': return t('portfolio.modal.add');
          case 'reduce': return t('portfolio.modal.reduce');
          case 'adjust': return t('portfolio.modal.adjust');
          default: return t('portfolio.modal.create');
      }
  };

  const getModalButtonText = () => {
      switch(modalMode) {
          case 'add': return t('portfolio.modal.confirmBuy');
          case 'reduce': return t('portfolio.modal.confirmSell');
          case 'adjust': return t('portfolio.modal.saveAdj');
          default: return t('portfolio.modal.create');
      }
  };

  const isFormValid = useMemo(() => {
      if (!formTokenId) return false;
      return formInvest !== '' && formExecutionPrice !== '' && !isNaN(Number(formInvest)) && !isNaN(Number(formExecutionPrice)) && parseFloat(formExecutionPrice) > 0;
  }, [formTokenId, formInvest, formExecutionPrice]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('portfolio.title')}</h2>
          <p className="text-sm text-gray-500">{t('portfolio.subtitle')}</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
           <button 
                onClick={handleExport}
                className="flex-1 sm:flex-none bg-[#1E272E] px-6 py-3 rounded-xl font-bold text-sm border border-[#2D3942] hover:bg-[#2D3942] transition-colors whitespace-nowrap"
           >
                {t('portfolio.export')}
           </button>
           <button 
                onClick={handleManualEntry}
                className="flex-1 sm:flex-none bg-[#00FFA3] text-[#0B0F12] px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#00E08F] transition-all shadow-[0_4px_20px_rgba(0,255,163,0.2)] whitespace-nowrap flex items-center gap-2 justify-center"
           >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                {t('portfolio.manualEntry')}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard 
            label={t('portfolio.totalInvest')}
            value={formatCurrency(metrics.totalInvest)} 
            change={`${metrics.dailyChangePct > 0 ? '+' : ''}${metrics.dailyChangePct}%`} 
        />
        <KPICard 
            label={t('portfolio.unrealizedPnL')}
            value={formatCurrency(metrics.unrealizedPnL)} 
            change={`${metrics.pnlPct.toFixed(2)}%`}
            isPositive={metrics.unrealizedPnL >= 0}
        />
        <KPICard 
            label={t('portfolio.dailyChange')}
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
                <th className="px-6 py-4">{t('portfolio.posTable.position')}</th>
                <th className="px-6 py-4 text-right">{t('portfolio.posTable.investment')}</th>
                <th className="px-6 py-4 text-right">{t('portfolio.posTable.entry')}</th>
                <th className="px-6 py-4 text-right">{t('portfolio.posTable.current')}</th>
                <th className="px-6 py-4 text-right">{t('portfolio.posTable.pnl')}</th>
                <th className="px-6 py-4 text-center">{t('portfolio.posTable.strategy')}</th>
                <th className="px-6 py-4 text-center">{t('portfolio.posTable.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E272E]">
              {displayItems.length === 0 ? (
                 <tr>
                   <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                     <div className="flex flex-col items-center gap-4">
                       <div className="p-4 bg-[#1E272E] rounded-full">
                           <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                       </div>
                       <div className="text-center">
                           <p className="text-sm font-bold text-gray-300">{t('portfolio.emptyState')}</p>
                           <p className="text-xs text-gray-500 mb-4">{t('portfolio.emptyDesc')}</p>
                           <button 
                                onClick={handleManualEntry}
                                className="bg-[#1E272E] hover:bg-[#2D3942] text-white border border-[#2D3942] px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                           >
                               {t('portfolio.createFirst')}
                           </button>
                       </div>
                     </div>
                   </td>
                 </tr>
              ) : (
                displayItems.map(item => (
                  <tr key={item.id} className="transition-colors group hover:bg-[#1E272E]/30">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1E272E] border border-[#2D3942]">
                           <img src={`https://picsum.photos/seed/${item.tokenId}/32`} className="w-full h-full rounded-lg object-cover" alt="" />
                        </div>
                        <div>
                          <h5 className="text-sm font-bold text-white">{item.tokenName}</h5>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{item.tokenSymbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-sm text-gray-300">
                        {formatCurrency(item.investmentUsd)}
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-sm text-gray-500">
                        ${item.entryPriceUsd.toFixed(8)}
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-sm text-gray-300">
                        ${item.currentPriceUsd.toFixed(8)}
                    </td>
                    <td className="px-6 py-5 text-right">
                        <span className={`text-sm font-bold ${item.pnlPct >= 0 ? 'text-[#00FFA3]' : 'text-red-400'}`}>
                        {item.pnlPct >= 0 ? '+' : ''}{item.pnlPct.toFixed(2)}%
                        </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center flex-wrap gap-1 max-w-[200px] mx-auto">
                           {strategies[item.exitStrategyId as ExitStrategyId].timeline.map((badge, idx) => (
                                 <span key={idx} className="px-2 py-0.5 rounded bg-[#1E272E] text-[9px] font-bold text-gray-400 border border-[#2D3942] whitespace-nowrap">
                                     {badge}
                                 </span>
                             ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                         <button 
                            onClick={() => handleView(item.tokenId)}
                            className="p-1.5 hover:text-white transition-colors hover:bg-[#1E272E] rounded"
                            title="View Details"
                         >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                         </button>
                         {/* Add Button */}
                         <button 
                            onClick={() => handleUpdatePosition(item, 'add')}
                            className="p-1.5 text-[#00FFA3] hover:text-[#00E08F] hover:bg-[#00FFA3]/10 rounded transition-colors"
                            title="Add Position (Buy)"
                         >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                         </button>
                         {/* Reduce Button */}
                         <button 
                            onClick={() => handleUpdatePosition(item, 'reduce')}
                            className="p-1.5 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10 rounded transition-colors"
                            title="Reduce Position (Sell)"
                         >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"/></svg>
                         </button>
                         {/* Adjust Button (Pencil) */}
                         <button 
                            onClick={() => handleUpdatePosition(item, 'adjust')}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                            title="Adjust Position (Manual Correction)"
                         >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                         </button>
                         {/* Close Button */}
                         <button 
                            onClick={() => handleClosePosition(item.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                            title="Close Position"
                         >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
           <div className="absolute inset-0 bg-[#0B0F12]/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
           <div className="bg-[#151C21] border border-[#1E272E] w-full max-w-lg rounded-3xl relative p-6 sm:p-10 animate-in zoom-in-95 duration-200 m-auto">
              <h3 className="text-2xl font-bold mb-6">{getModalTitle()}</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Token</label>
                  <select 
                     value={formTokenId}
                     onChange={handleTokenChange}
                     disabled={!!editingPositionId}
                     className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3] disabled:opacity-50"
                  >
                      {mockTokens.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.symbol})</option>
                      ))}
                  </select>
                </div>

                <div>
                   <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">
                     {modalMode === 'add' ? 'Added Investment (USD)' : modalMode === 'reduce' ? 'Value Sold (USD)' : t('tokenDetail.totalInvest')}
                   </label>
                   <input 
                      type="number" 
                      value={formInvest}
                      onChange={(e) => setFormInvest(e.target.value)}
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

                {(modalMode === 'adjust' || modalMode === 'create') && (
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
                )}

                <div className="pt-4 flex gap-4">
                   <button 
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-6 py-3 border border-[#1E272E] rounded-xl font-bold text-sm hover:bg-[#1E272E] transition-colors"
                   >
                       {t('tokenDetail.cancel')}
                   </button>
                   <button 
                      onClick={handleSavePosition}
                      disabled={!isFormValid}
                      className={`flex-1 px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-[0_4px_20px_rgba(0,255,163,0.3)] ${!isFormValid ? 'bg-gray-700 text-gray-500 cursor-not-allowed shadow-none' : 'bg-[#00FFA3] text-[#0B0F12] hover:bg-[#00E08F]'}`}
                   >
                       {getModalButtonText()}
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

export default Portfolio;
