
import React from 'react';
// Fix: Consolidate import casing for Icons
import { Icons } from './Icons';

interface KPICardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Icons;
  color: string;
  trend?: string;
  isLoading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, icon, color, trend, isLoading }) => {
  const IconComponent = Icons[icon];

  return (
    <div className="bg-white rounded-[1.2rem] shadow-sm border border-slate-100 p-6 flex flex-col gap-6 h-full transition-all hover:shadow-md group">
      <div className="flex justify-start">
        <div className={`p-2.5 rounded-xl ${color} shadow-lg shadow-slate-100 shrink-0 group-hover:scale-110 transition-transform`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex flex-col gap-1 items-start">
        <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest">{label}</h3>
        {isLoading ? (
          <div className="h-9 w-20 bg-slate-50 animate-pulse rounded-md"></div>
        ) : (
          <p className="text-[32px] font-bold text-slate-800 leading-none tracking-tight">{value}</p>
        )}
      </div>
      {trend && (
        <div className="mt-1">
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
