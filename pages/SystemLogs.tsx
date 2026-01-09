
import React, { useState, useEffect, useMemo } from 'react';
import { mockLogs } from '../mockData';
import { SystemLog } from '../types';

// Helper to generate random logs for simulation
const generateRandomLog = (baseTime?: Date): SystemLog => {
    const types = ['Price Surge > 20%', 'Liquidity Drain', 'New Whale Wallet', 'Volume Spike', 'Contract Verified', 'Ownership Renounced'];
    const statuses: SystemLog['status'][] = ['Executed', 'Alerted', 'Logged'];
    const tokens = [
        { name: 'PEPE', addr: '0x28...4f1e' },
        { name: 'WOJAK', addr: '0x71...a93b' },
        { name: 'DOGE', addr: '0x14...55cc' },
        { name: 'SHIB', addr: '0x92...11aa' },
        { name: 'WIF', addr: 'wif...1234' }
    ];
    
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const now = baseTime || new Date();
    // Format: YYYY-MM-DD HH:mm:ss UTC
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';

    return {
        id: Math.random().toString(36).substr(2, 9),
        timestamp,
        tokenName: randomToken.name,
        tokenAddress: randomToken.addr,
        eventType: randomType,
        status: randomStatus
    };
};

const SystemLogs: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>(mockLogs);
  const [filter, setFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Load settings on mount
  useEffect(() => {
      const storedSettings = localStorage.getItem('app_settings');
      if (storedSettings) {
          try {
              const parsed = JSON.parse(storedSettings);
              setAutoRefresh(parsed.autoRefresh);
          } catch (e) {
              console.error("Failed to load settings", e);
          }
      }
  }, []);

  // Live Feed Simulation
  useEffect(() => {
      if (!autoRefresh) return;

      const interval = setInterval(() => {
          // 30% chance to generate a log every interval to make it feel natural (not too robotic)
          if (Math.random() > 0.7) {
              const newLog = generateRandomLog();
              setLogs(prev => [newLog, ...prev]);
          }
      }, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
  }, [autoRefresh]);

  // View Older Events (Pagination Simulation)
  const handleLoadMore = () => {
      const lastLogTimeStr = logs[logs.length - 1]?.timestamp || new Date().toISOString();
      // Parse simplistic string date or just use current time offset
      const baseDate = new Date(); // In a real app, parse the last log's date
      
      const newOldLogs = Array.from({ length: 5 }).map((_, i) => {
          const pastDate = new Date(baseDate.getTime() - (logs.length + i + 1) * 1000 * 60 * 15); // Go back 15 mins per item
          return generateRandomLog(pastDate);
      });
      
      setLogs(prev => [...prev, ...newOldLogs]);
  };

  const filteredLogs = useMemo(() => {
      if (filter === 'All') return logs;
      return logs.filter(log => log.status === filter);
  }, [logs, filter]);

  // Mock details for the modal
  const getLogDetails = (log: SystemLog) => {
      return {
          ruleId: `RULE-${Math.floor(Math.random() * 1000)}`,
          latency: `${Math.floor(Math.random() * 200)}ms`,
          gasCost: log.status === 'Executed' ? `$${(Math.random() * 5).toFixed(2)}` : 'N/A',
          impact: log.status === 'Executed' ? 'Position Adjusted' : log.status === 'Alerted' ? 'User Notified' : 'Database Record',
          confidence: `${85 + Math.floor(Math.random() * 15)}%`
      };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Live System Logs</h2>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">Real-time trace of all automated events and alerts.</p>
            {autoRefresh && (
                <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    LIVE
                </span>
            )}
          </div>
        </div>
        <div className="flex bg-[#151C21] p-1 rounded-xl border border-[#1E272E] overflow-x-auto max-w-full">
           {['All', 'Executed', 'Alerted', 'Logged'].map(f => (
             <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${filter === f ? 'bg-[#1E272E] text-[#00FFA3] shadow-sm' : 'text-gray-500 hover:text-white'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-[#151C21] border border-[#1E272E] rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="border-b border-[#1E272E] bg-[#1E272E]/10">
              <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <th className="px-6 py-5">Timestamp (UTC)</th>
                <th className="px-6 py-5">Token / Asset</th>
                <th className="px-6 py-5">Event Description</th>
                <th className="px-6 py-5 text-center">Status</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E272E]">
              {filteredLogs.length === 0 ? (
                  <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">No logs found for this filter.</td>
                  </tr>
              ) : (
                filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#1E272E]/20 transition-colors group">
                    <td className="px-6 py-5 text-xs font-mono text-gray-500">{log.timestamp}</td>
                    <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[#00FFA3]/10 text-[#00FFA3] rounded flex items-center justify-center font-bold text-[10px]">
                            $
                        </div>
                        <div>
                            <p className="text-sm font-bold">{log.tokenName}</p>
                            <p className="text-[10px] text-gray-500 font-mono">{log.tokenAddress}</p>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-300">{log.eventType}</td>
                    <td className="px-6 py-5">
                        <div className="flex justify-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                            log.status === 'Executed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            log.status === 'Alerted' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                            {log.status}
                        </span>
                        </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                        <button 
                            onClick={() => setSelectedLog(log)}
                            className="text-gray-600 hover:text-white transition-colors p-2 hover:bg-[#1E272E] rounded-lg"
                            title="View Event Details"
                        >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 flex justify-center border-t border-[#1E272E] bg-[#1E272E]/5">
           <button 
            onClick={handleLoadMore}
            className="text-xs font-bold text-gray-500 hover:text-white flex items-center gap-2 group transition-all"
           >
             View Older Events
             <svg className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
           </button>
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
           <div className="absolute inset-0 bg-[#0B0F12]/80 backdrop-blur-sm" onClick={() => setSelectedLog(null)}></div>
           <div className="bg-[#151C21] border border-[#1E272E] w-full max-w-lg rounded-3xl relative p-6 sm:p-8 animate-in zoom-in-95 duration-200 m-auto shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <h3 className="text-xl font-bold">Event Details</h3>
                      <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedLog.id}</p>
                  </div>
                  <button onClick={() => setSelectedLog(null)} className="text-gray-500 hover:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
              </div>

              <div className="space-y-4">
                  <div className="bg-[#0B0F12] border border-[#1E272E] rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#1E272E] rounded-lg flex items-center justify-center">
                              <span className="text-lg font-bold text-[#00FFA3]">$</span>
                          </div>
                          <div>
                              <h4 className="font-bold text-sm text-white">{selectedLog.tokenName}</h4>
                              <p className="text-[10px] text-gray-500 font-mono">{selectedLog.tokenAddress}</p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Event Type</p>
                          <p className="text-sm font-bold text-[#00FFA3]">{selectedLog.eventType}</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl border border-[#1E272E] bg-[#1E272E]/10">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Status</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border inline-block ${
                            selectedLog.status === 'Executed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                            selectedLog.status === 'Alerted' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        }`}>
                            {selectedLog.status}
                        </span>
                      </div>
                      <div className="p-4 rounded-xl border border-[#1E272E] bg-[#1E272E]/10">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Timestamp</p>
                          <p className="text-xs font-mono text-gray-300">{selectedLog.timestamp}</p>
                      </div>
                  </div>

                  {/* Simulated Deep Data */}
                  <div className="border-t border-[#1E272E] pt-4 mt-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Audit Trail</h4>
                      <div className="space-y-2">
                          {(() => {
                              const details = getLogDetails(selectedLog);
                              return (
                                  <>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Trigger Rule ID</span>
                                        <span className="font-mono text-gray-300">{details.ruleId}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">System Latency</span>
                                        <span className="font-mono text-gray-300">{details.latency}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Algorithm Confidence</span>
                                        <span className="font-mono text-gray-300">{details.confidence}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">Estimated Gas Cost</span>
                                        <span className="font-mono text-gray-300">{details.gasCost}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500">System Impact</span>
                                        <span className="font-mono text-[#00FFA3]">{details.impact}</span>
                                    </div>
                                  </>
                              );
                          })()}
                      </div>
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SystemLogs;
