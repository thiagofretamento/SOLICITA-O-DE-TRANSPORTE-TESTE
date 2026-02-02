
import React, { useState, useEffect, useCallback } from 'react';
// Fix: Consolidate import casing for Sidebar
import Sidebar from './Sidebar';
import DashboardOperational from './components/DashboardOperational';
import DashboardFinancial from './components/DashboardFinancial';
import DashboardManagerial from './components/DashboardManagerial';
import { ViewType, DashboardStats, ProcessData } from './types';
import { fetchDashboardData } from './services/dataService';
// Fix: Consolidate import casing for Icons
import { Icons } from './components/Icons';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>(ViewType.OPERATIONAL);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ processes: ProcessData[], stats: DashboardStats } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchDashboardData();
      setData(result);
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Failed to fetch dashboard data", err);
      setError(err.message || "Erro desconhecido ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderContent = () => {
    if (isLoading && !data) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
          <Icons.Refresh className="w-10 h-10 animate-spin mb-4 text-blue-500" />
          <p className="text-[14px] font-normal animate-pulse uppercase tracking-widest">Sincronizando com a base Getra...</p>
        </div>
      );
    }

    if (error && !data) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[500px] text-rose-500 text-center p-8">
          <Icons.Alert className="w-12 h-12 mb-4" />
          <h3 className="textxl font-bold mb-2">Erro na integração Getra</h3>
          <p className="text-[14px] text-slate-500 max-w-md">{error}</p>
          <button 
            onClick={loadData}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    if (!data) return null;

    switch (activeView) {
      case ViewType.OPERATIONAL:
        return <DashboardOperational stats={data.stats} processes={data.processes} isLoading={isLoading} />;
      case ViewType.FINANCIAL:
        return <DashboardFinancial stats={data.stats} processes={data.processes} isLoading={isLoading} />;
      case ViewType.MANAGERIAL:
        return <DashboardManagerial stats={data.stats} processes={data.processes} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (activeView) {
      case ViewType.OPERATIONAL: return 'Painel Operacional';
      case ViewType.MANAGERIAL: return 'Gerencial / Indicadores';
      case ViewType.FINANCIAL: return 'Análise Financeira';
      default: return 'Fretamento Getra';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] font-['Inter'] selection:bg-blue-100 overflow-x-hidden w-full">
      {/* Sidebar Horizontal (Header) da Raiz */}
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        onRefresh={loadData}
        lastUpdated={lastUpdated}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center overflow-x-hidden">
        
        {/* Dynamic View Header Bar */}
        <div className="w-full bg-white/50 backdrop-blur-sm border-b border-slate-100">
          <div className="max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-10 py-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-lg shadow-blue-100"></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">VISÃO ATIVA</p>
                <h2 className="text-[22px] sm:text-[32px] font-bold text-slate-800 tracking-tighter leading-none">
                  {getHeaderTitle()}
                </h2>
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end shrink-0">
               <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">SISTEMA ESTÁVEL</span>
               <span className="text-[11px] sm:text-xs text-blue-600 font-black bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 mt-2">v1.2.0-PROD</span>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="p-4 sm:p-8 lg:p-10 w-full max-w-[1800px] mx-auto overflow-x-hidden">
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
