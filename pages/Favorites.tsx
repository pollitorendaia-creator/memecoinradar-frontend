
import React, { useMemo, useState } from 'react';
import KPICard from '../components/KPICard';
import { mockTokens } from '../mockData';
import { useAppContext } from '../index';
import { Position, ExitStrategyId } from '../types';
import { TokenTable } from '../components/TokenTable';

interface FavoritesProps {
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

const Favorites: React.FC<FavoritesProps> = ({ setCurrentPage }) => {
  const { watchlist, toggleWatchlist, positions, addPosition, setSelectedTokenId, t } = useAppContext();
  const strategies = getStrategies(t);
  
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

  // Filter tokens that are in watchlist BUT NOT in positions
  const displayItems = useMemo(() => {
    const positionTokenIds = new Set(positions.map(p => p.tokenId));
    return mockTokens.filter(token => {
        return watchlist.includes(token.id) && !positionTokenIds.has(token.id);
    });
  }, [watchlist, positions]);

  // Handlers
  const handleView = (tokenId: string) => {
    setSelectedTokenId(tokenId);
    if (setCurrentPage) setCurrentPage('token-detail');
  };

  const handleOpenEntry = (tokenId: string) => {
    const token = mockTokens.find(t => t.id === tokenId);
    setFormTokenId(tokenId);
    
    // Reset form
    setFormInvest('');
    setFormExecutionPrice(token?.price?.toString() || '');
    setFormStrategy('standard');
    
    setShowModal(true);
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
      
      // Remove from favorites as it is now a position
      toggleWatchlist(token.id);
      
      setShowModal(false);
      showToast("Position Opened - Moved to Portfolio");
  };

  const isFormValid = useMemo(() => {
    return formTokenId && formInvest !== '' && formExecutionPrice !== '' && !isNaN(Number(formInvest)) && !isNaN(Number(formExecutionPrice)) && parseFloat(formExecutionPrice) > 0;
  }, [formTokenId, formInvest, formExecutionPrice]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('sidebar.favorites')}</h2>
          <p className="text-sm text-gray-500">Track tokens of interest. Open a position to start managing your exit strategy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard label="Favorites Count" value={displayItems.length.toString()} change="" isPositive={true} />
        {/* Functional Ready to Enter Block */}
        <div className="md:col-span-3 bg-[#151C21] border border-[#1E272E] p-6 rounded-2xl flex items-center justify-between">
            <div className="flex gap-4">
                <div className="p-3 bg-[#1E272E] rounded-lg">
                    <svg className="w-6 h-6 text-[#00FFA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-300">Ready to Enter?</h4>
                    <p className="text-xs text-gray-500">Use the <span className="text-[#00FFA3] font-bold">{t('tokenDetail.openPosition')}</span> button on the list below to move a token to your portfolio.</p>
                </div>
            </div>
        </div>
      </div>

      <TokenTable 
        data={displayItems}
        mode="favorites"
        onViewDetails={handleView}
        onOpenPosition={handleOpenEntry}
      />

      {/* Manual Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
           <div className="absolute inset-0 bg-[#0B0F12]/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
           <div className="bg-[#151C21] border border-[#1E272E] w-full max-w-lg rounded-3xl relative p-6 sm:p-10 animate-in zoom-in-95 duration-200 m-auto">
              <h3 className="text-2xl font-bold mb-6">{t('tokenDetail.createOpenPos')}</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Selected Token</label>
                  <select 
                     value={formTokenId}
                     onChange={(e) => setFormTokenId(e.target.value)}
                     disabled={true}
                     className="w-full bg-[#0B0F12] border border-[#1E272E] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00FFA3] disabled:opacity-50 text-gray-400"
                  >
                      {mockTokens.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.symbol})</option>
                      ))}
                  </select>
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
                       {t('portfolio.modal.confirmBuy')}
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

export default Favorites;
