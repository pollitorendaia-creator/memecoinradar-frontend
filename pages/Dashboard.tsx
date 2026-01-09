
import React from 'react';
import KPICard from '../components/KPICard';
import { mockTokens } from '../mockData';
import { useAppContext } from '../index';
import { TokenTable } from '../components/TokenTable';

interface DashboardProps {
    setCurrentPage: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage }) => {
  const { setSelectedTokenId, t } = useAppContext();

  const handleViewDetails = (id: string) => {
      setSelectedTokenId(id);
      setCurrentPage('token-detail');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard label={t('dashboard.monitoredTokens')} value={mockTokens.length.toString()} change="+12.5%" />
        <KPICard label={t('dashboard.approvedChecklist')} value="422" change="-2.4%" isPositive={false} />
        <KPICard label={t('dashboard.confirming')} value="85" change="+5.1%" />
        <KPICard label={t('dashboard.exitSignals')} value="12" change="-1.8%" isPositive={false} />
      </div>

      <TokenTable 
        data={mockTokens} 
        mode="dashboard"
        onViewDetails={handleViewDetails}
      />
    </div>
  );
};

export default Dashboard;
