
import React, { useState, useMemo, useEffect } from 'react';
import { Token, TokenStatus } from '../types';
import { useAppContext } from '../index';

interface TokenTableProps {
  data: Token[];
  mode: 'dashboard' | 'favorites';
  onViewDetails: (id: string) => void;
  onOpenPosition?: (id: string) => void;
}

const StatusBadge: React.FC<{ status: TokenStatus }> = ({ status }) => {
  const styles = {
    'VERIFIED': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'WARNING': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'HIGH RISK': 'bg-red-500/10 text-red-400 border-red-500/20',
    'TRENDING': 'bg-green-500/10 text-green-400 border-green-500/20',
  };

  return (
    <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${styles[status]}`}>
      ● {status}
    </span>
  );
};

type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: string;
  direction: SortDirection;
}

export const TokenTable: React.FC<TokenTableProps> = ({ 
  data, 
  mode, 
  onViewDetails, 
  onOpenPosition 
}) => {
  const { activeChain, searchQuery, watchlist, toggleWatchlist, t } = useAppContext();
  
  // Local Filter State
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [minLiquidity, setMinLiquidity] = useState(0);
  const [minMktCap, setMinMktCap] = useState(0);
  const [filterRenounced, setFilterRenounced] = useState(false);
  const [filterLocked, setFilterLocked] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Pagination & Sort State
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'score', direction: 'desc' });

  // Load preferences
  useEffect(() => {
    const savedSize = localStorage.getItem('dashboard_pageSize');
    if (savedSize) setItemsPerPage(parseInt(savedSize));
    
    const savedSort = localStorage.getItem('dashboard_sort');
    if (savedSort) {
      try {
        setSortConfig(JSON.parse(savedSort));
      } catch (e) {
        console.error("Error parsing sort config", e);
      }
    }
  }, []);

  const parseCurrency = (str: string) => {
    if (str.includes('B')) return parseFloat(str.replace('$', '').replace('B', '')) * 1000000000;
    if (str.includes('M')) return parseFloat(str.replace('$', '').replace('M', '')) * 1000000;
    if (str.includes('k')) return parseFloat(str.replace('$', '').replace('k', '')) * 1000;
    return parseFloat(str.replace('$', '').replace(',', '')) || 0;
  };

  useEffect(() => {
    setCurrentPageIndex(0);
  }, [activeChain, searchQuery, minLiquidity, minMktCap, filterRenounced, filterLocked, itemsPerPage, data]);

  const filteredTokens = useMemo(() => {
    return data.filter(token => {
      // Global Filters (Context)
      if (activeChain && token.network !== activeChain) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!token.name.toLowerCase().includes(q) && 
            !token.symbol.toLowerCase().includes(q) && 
            !token.address.toLowerCase().includes(q)) {
          return false;
        }
      }

      // Advanced Filters (Local)
      const liqVal = parseCurrency(token.liquidity);
      const mcVal = parseCurrency(token.mktCap);
      
      const effectiveMinLiq = minLiquidity * 5000;
      const effectiveMinMC = minMktCap * 100000;

      if (liqVal < effectiveMinLiq) return false;
      if (mcVal < effectiveMinMC) return false;

      if (filterRenounced && !token.security.isRenounced) return false;
      if (filterLocked && !token.security.isLiquidityLocked) return false;

      return true;
    });
  }, [data, activeChain, searchQuery, minLiquidity, minMktCap, filterRenounced, filterLocked]);

  const sortedTokens = useMemo(() => {
    const sortedData = [...filteredTokens];
    return sortedData.sort((a, b) => {
      let aValue: any = a[sortConfig.key as keyof typeof a];
      let bValue: any = b[sortConfig.key as keyof typeof b];

      if (['mktCap', 'liquidity', 'volume24h', 'holders'].includes(sortConfig.key)) {
        aValue = parseCurrency(String(aValue));
        bValue = parseCurrency(String(bValue));
      } else if (sortConfig.key === 'token') {
         aValue = a.name.toLowerCase();
         bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredTokens, sortConfig]);

  // Pagination
  const totalItems = sortedTokens.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = totalItems === 0 ? 0 : currentPageIndex * itemsPerPage + 1;
  const endItem = Math.min((currentPageIndex + 1) * itemsPerPage, totalItems);

  const paginatedTokens = useMemo(() => {
    const start = currentPageIndex * itemsPerPage;
    return sortedTokens.slice(start, start + itemsPerPage);
  }, [sortedTokens, currentPageIndex, itemsPerPage]);

  const handleSort = (key: string) => {
    let direction: SortDirection = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    const newConfig = { key, direction };
    setSortConfig(newConfig);
    localStorage.setItem('dashboard_sort', JSON.stringify(newConfig));
  };

  const handleFavorite = (id: string, name: string) => {
      toggleWatchlist(id);
      const isAdding = !watchlist.includes(id);
      setToastMsg(`${name} ${isAdding ? 'added to' : 'removed from'} Watchlist`);
      
      const btn = document.getElementById(`fav-${id}`);
      if(btn) {
          btn.classList.add('scale-125');
          setTimeout(() => btn.classList.remove('scale-125'), 200);
      }
      setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExternalLink = (token: Token) => {
      window.open(`https://dexscreener.com/${token.network.toLowerCase()}/${token.address}`, '_blank');
  };

  const renderSortArrow = (key: string) => {
      if (sortConfig.key !== key) return <span className="text-gray-700 ml-1">⇅</span>;
      return <span className="text-[#00FFA3] ml-1">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl overflow-hidden">
        <div 
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="px-6 py-4 flex items-center justify-between cursor-pointer border-b border-[#1E272E] bg-[#1E272E]/20"
        >
          <div className="flex items-center gap-3">
            <svg className="w-4 h-4 text-[#00FFA3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            <h4 className="text-xs font-bold uppercase tracking-widest">{t('tokenTable.filters.title')}</h4>
          </div>
          <svg className={`w-4 h-4 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
        </div>

        {filtersOpen && (
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-4">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <span>{t('tokenTable.filters.minLiquidity')}</span>
                <span className="text-[#00FFA3]">${(minLiquidity * 5000).toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={minLiquidity}
                onChange={(e) => setMinLiquidity(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#1E272E] rounded-lg appearance-none cursor-pointer accent-[#00FFA3]" 
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                <span>$0</span>
                <span>$500k+</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <span>{t('tokenTable.filters.mktCap')}</span>
                <span className="text-[#00FFA3]">${(minMktCap * 100000).toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="0" max="100" 
                value={minMktCap}
                onChange={(e) => setMinMktCap(parseInt(e.target.value))}
                className="w-full h-1.5 bg-[#1E272E] rounded-lg appearance-none cursor-pointer accent-[#00FFA3]" 
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                <span>$10k</span>
                <span>$10M+</span>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{t('tokenTable.filters.securityFlags')}</h5>
              
              <div 
                className="flex items-center justify-between group cursor-pointer"
                onClick={() => setFilterRenounced(!filterRenounced)}
              >
                <span className={`text-sm font-medium transition-colors ${filterRenounced ? 'text-white' : 'text-gray-300'}`}>{t('tokenTable.filters.ownerRenounced')}</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${filterRenounced ? 'bg-[#00FFA3]' : 'bg-[#1E272E]'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-[#0B0F12] rounded-full transition-all ${filterRenounced ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>

              <div 
                className="flex items-center justify-between group cursor-pointer"
                onClick={() => setFilterLocked(!filterLocked)}
              >
                <span className={`text-sm font-medium transition-colors ${filterLocked ? 'text-white' : 'text-gray-300'}`}>{t('tokenTable.filters.liquidityLocked')}</span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${filterLocked ? 'bg-[#00FFA3]' : 'bg-[#1E272E]'}`}>
                  <div className={`absolute top-1 w-3 h-3 bg-[#0B0F12] rounded-full transition-all ${filterLocked ? 'right-1' : 'left-1'}`}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="border-b border-[#1E272E]">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <th 
                    className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('token')}
                >
                    {t('tokenTable.headers.token')} {renderSortArrow('token')}
                </th>
                <th 
                    className="px-6 py-4 cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('score')}
                >
                    {t('tokenTable.headers.score')} {renderSortArrow('score')}
                </th>
                <th className="px-6 py-4">{t('tokenTable.headers.status')}</th>
                <th 
                    className="px-6 py-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('mktCap')}
                >
                    {t('tokenTable.headers.mktCap')} {renderSortArrow('mktCap')}
                </th>
                <th 
                    className="px-6 py-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('liquidity')}
                >
                    {t('tokenTable.headers.liquidity')} {renderSortArrow('liquidity')}
                </th>
                <th 
                    className="px-6 py-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('volume24h')}
                >
                    {t('tokenTable.headers.vol24h')} {renderSortArrow('volume24h')}
                </th>
                <th 
                    className="px-6 py-4 text-right cursor-pointer hover:text-white transition-colors select-none"
                    onClick={() => handleSort('holders')}
                >
                    {t('tokenTable.headers.holders')} {renderSortArrow('holders')}
                </th>
                <th className="px-6 py-4 text-center">{t('tokenTable.headers.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E272E]">
              {paginatedTokens.length === 0 ? (
                  <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-gray-500 font-medium">
                          No tokens found.
                      </td>
                  </tr>
              ) : (
                paginatedTokens.map(token => (
                    <tr key={token.id} className="hover:bg-[#1E272E]/30 transition-colors group">
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#1E272E] rounded-full flex items-center justify-center border border-[#2D3942] group-hover:border-[#00FFA3] transition-colors relative">
                            <img src={`https://picsum.photos/seed/${token.id}/36`} className="w-full h-full rounded-full opacity-80" alt="" />
                            <div className="absolute -bottom-1 -right-1 bg-[#1E272E] rounded-full p-0.5">
                                <span className="text-[8px] font-bold px-1 rounded bg-[#0B0F12] text-gray-400 border border-gray-700">{token.network}</span>
                            </div>
                        </div>
                        <div>
                            <h5 className="text-sm font-bold">{token.name}</h5>
                            <p className="text-[10px] text-gray-500 font-bold">{token.symbol}</p>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-5">
                        <span className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold border ${token.score > 80 ? 'text-[#00FFA3] border-[#00FFA3]/20 bg-[#00FFA3]/5' : token.score > 40 ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5' : 'text-red-400 border-red-400/20 bg-red-400/5'}`}>
                        {token.score}
                        </span>
                    </td>
                    <td className="px-6 py-5">
                        <StatusBadge status={token.status} />
                    </td>
                    <td className="px-6 py-5 text-right font-medium text-sm text-gray-300">{token.mktCap}</td>
                    <td className="px-6 py-5 text-right font-medium text-sm text-gray-300">{token.liquidity}</td>
                    <td className="px-6 py-5 text-right font-medium text-sm text-gray-300">{token.volume24h}</td>
                    <td className="px-6 py-5 text-right font-medium text-sm text-gray-300">{token.holders}</td>
                    <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-4 text-gray-500">
                            {/* View Details - Common */}
                            <button 
                                onClick={() => onViewDetails(token.id)}
                                title="View Details"
                                className="hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            </button>

                            {/* Mode Specific Actions */}
                            {mode === 'favorites' && onOpenPosition && (
                                <button 
                                    onClick={() => onOpenPosition(token.id)}
                                    className="flex items-center gap-1.5 bg-[#00FFA3] text-[#0B0F12] px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-[#00E08F] transition-colors shadow-lg shadow-[#00FFA3]/10"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"/></svg>
                                    {t('tokenDetail.openPosition')}
                                </button>
                            )}

                            {/* Favorite / Unfavorite - Common */}
                            <button 
                                id={`fav-${token.id}`}
                                onClick={() => handleFavorite(token.id, token.name)}
                                title={watchlist.includes(token.id) ? "Remove from Watchlist" : "Add to Watchlist"}
                                className={`transition-all duration-200 transform ${watchlist.includes(token.id) ? 'text-[#00FFA3]' : 'hover:text-[#00FFA3]'}`}
                            >
                                <svg className="w-4 h-4" fill={watchlist.includes(token.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                            </button>

                            {/* External Link - Dashboard Only */}
                            {mode === 'dashboard' && (
                                <button 
                                    onClick={() => handleExternalLink(token)}
                                    title="Open in DexScreener"
                                    className="hover:text-[#00D1FF] transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
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

        <div className="px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#1E272E]/10">
          <div className="flex items-center gap-3">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest text-center sm:text-left">
                Showing {startItem}-{endItem} of {totalItems} tokens
              </p>
              <select 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  className="bg-[#151C21] border border-[#1E272E] text-[10px] text-gray-500 font-bold uppercase tracking-widest rounded px-2 py-1 focus:outline-none focus:border-[#00FFA3]"
              >
                  <option value={20}>20 per page</option>
                  <option value={30}>30 per page</option>
                  <option value={40}>40 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
              </select>
          </div>
          <div className="flex gap-2">
            <button 
                onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
                disabled={currentPageIndex === 0}
                className={`w-8 h-8 flex items-center justify-center bg-[#151C21] border border-[#1E272E] rounded transition-colors ${currentPageIndex === 0 ? 'text-gray-600 cursor-not-allowed opacity-50' : 'text-gray-400 hover:text-white hover:border-[#00FFA3]'}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button 
                onClick={() => setCurrentPageIndex(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPageIndex >= totalPages - 1}
                className={`w-8 h-8 flex items-center justify-center bg-[#151C21] border border-[#1E272E] rounded transition-colors ${currentPageIndex >= totalPages - 1 ? 'text-gray-600 cursor-not-allowed opacity-50' : 'text-gray-400 hover:text-white hover:border-[#00FFA3]'}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Local Toast for Table Actions */}
      {toastMsg && (
            <div className="fixed bottom-6 right-6 bg-[#00FFA3] text-[#0B0F12] px-6 py-3 rounded-xl font-bold text-sm shadow-2xl animate-in slide-in-from-bottom-5 fade-in z-50 transition-all duration-300">
                {toastMsg}
            </div>
      )}
    </div>
  );
};
