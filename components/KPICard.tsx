
import React from 'react';

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  isPositive?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, change, isPositive = true }) => {
  return (
    <div className="bg-[#151C21] border border-[#1E272E] p-6 rounded-2xl flex flex-col gap-2 flex-1">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">{label}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {change}
        </span>
      </div>
      <h3 className="text-3xl font-bold">{value}</h3>
    </div>
  );
};

export default KPICard;
