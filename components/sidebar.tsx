
import React from 'react';
import { ViewType } from '../types';
// Fix: Consolidate import casing for Icons
import { Icons } from './Icons';

interface SidebarProps {
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onRefresh: () => void;
  lastUpdated: Date | null;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeView, 
  setActiveView, 
  onRefresh, 
  lastUpdated,
  isLoading 
}) => {
  const navItems = [
    { id: ViewType.OPERATIONAL, label: 'Operacional', icon: Icons.Dashboard },
    { id: ViewType.MANAGERIAL, label: 'Gerencial', icon: Icons.TrendingUp },
    { id: ViewType.FINANCIAL, label: 'Financeiro', icon: Icons.Finance },
  ];

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-100">
              <Icons.Truck className="text-white w-6 h-6" />
            </div>
            <div className="hidden sm:flex flex-col">
              <h1 className="text-[18px] font-bold text-slate-800 tracking-tighter leading-tight">Getra Fretamento</h1>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Painel Integrado</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100 mx-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all duration-300 text-[13px] font-bold uppercase tracking-wider ${
                    isActive 
                      ? 'bg-white text-blue-600 shadow-sm border border-slate-100' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end px-4 border-r border-slate-100">
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Sincronizado</span>
              <p className="text-[11px] text-slate-600 font-bold">
                {lastUpdated ? formatDateTime(lastUpdated) : '--/-- --:--'}
              </p>
            </div>
            
            <button 
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-slate-100"
            >
              <Icons.Refresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>
          </div>
        </div>

        <div className="md:hidden flex overflow-x-auto custom-scrollbar gap-2 pb-3 pt-1 border-t border-slate-50">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest border transition-all ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'bg-white text-slate-400 border-slate-100'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Sidebar;
