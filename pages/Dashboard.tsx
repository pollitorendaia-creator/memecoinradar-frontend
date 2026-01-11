import React, { useEffect, useMemo, useState } from 'react';
import KPICard from '../components/KPICard';
import { mockTokens } from '../mockData';
import { useAppContext } from '../index';
import { TokenTable } from '../components/TokenTable';
import { fetchTokens } from '../api';

interface DashboardProps {
  setCurrentPage: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const { setSelectedTokenId, t } = useAppContext();
  const [tokens, setTokens] = useState<any[]>(mockTokens);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const apiTokens = await fetchTokens();
        if (!alive) return;

        // Map API -> UI token shape (minimal) with a stable id
        const mapped = apiTokens.map((x) => ({
          id: `${x.chain}:${x.symbol}`,
          symbol: x.symbol,
          name: x.name,
          chain: x.chain,
          // Best-effort mapping to fields used in UI (keep existing UI tolerant)
          price: x.priceUsd,
          change24h: x.change24hPct,
        }));

        if (mapped.length > 0) setTokens(mapped);
      } catch (e) {
        // Keep mockTokens as fallback
        console.warn('Failed to load tokens from API, using mockTokens.', e);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const monitoredCount = useMemo(() => tokens.length.toString(), [tokens.length]);

  const handleViewDetails = (id: string) => {
    setSelectedTokenId(id);
    setCurrentPage('token-detail');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard label={t('dashboard.monitoredTokens')} value={monitoredCount} change="+12.5%" />
        <KPICard label={t('dashboard.approvedChecklist')} value="422" change="-2.4%" isPositive={false} />
        <KPICard label={t('dashboard.confirming')} value="85" change="+5.1%" />
        <KPICard label={t('dashboard.exitSignals')} value="12" change="-1.8%" isPositive={false} />
      </div>

      <TokenTable
        data={tokens}
        mode="dashboard"
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default Dashboard;
