
import React, { useState, useMemo } from 'react';
import { DashboardStats, ProcessData } from '../types';
import KPICard from './KPICard';
// Fix: Consolidate import casing for Icons
import { Icons } from './Icons';

interface Props {
  stats: DashboardStats;
  processes: ProcessData[];
  isLoading: boolean;
}

const MONTH_NAMES_MAP: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
};

const DashboardOperational: React.FC<Props> = ({ stats, processes, isLoading }) => {
  const [searchProcess, setSearchProcess] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Extrair dinamicamente apenas os meses que constam nos dados
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    
    processes.forEach(p => {
      if (p.startDate && p.startDate.includes('/')) {
        const monthPart = p.startDate.split('/')[1];
        if (monthPart && MONTH_NAMES_MAP[monthPart]) {
          monthsSet.add(monthPart);
        }
      }
    });

    return Array.from(monthsSet)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map(m => ({
        value: m,
        label: MONTH_NAMES_MAP[m]
      }));
  }, [processes]);

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const matchProcess = p.processo.toLowerCase().includes(searchProcess.toLowerCase());
      const matchStatus = filterStatus === '' || p.status === filterStatus;
      const matchDate = filterDate === '' || p.startDate.includes(filterDate.split('-').reverse().join('/'));
      let matchMonth = true;
      if (filterMonth !== '') {
        matchMonth = p.startDate.includes(`/${filterMonth}/`);
      }
      return matchProcess && matchStatus && matchDate && matchMonth;
    });
  }, [processes, searchProcess, filterStatus, filterDate, filterMonth]);

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap";
    switch (status) {
      case 'Solicitada': return `${base} bg-orange-50/40 text-orange-400 border-orange-200/50`;
      case 'Confirmada': return `${base} bg-blue-50/40 text-blue-400 border-blue-200/50`;
      case 'Realizada': return `${base} bg-[#f0fdf4] text-[#22c55e] border-[#bbf7d0]`;
      case 'Cancelada': return `${base} bg-rose-50/40 text-rose-400 border-rose-200/50`;
      default: return `${base} bg-slate-50/40 text-slate-400 border-slate-200/50`;
    }
  };

  const getCompanyBadge = (company: string) => {
    if (company.toUpperCase().includes('ASA BRANCA')) {
      return (
        <span className="bg-[#00a86b] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-100 inline-block whitespace-nowrap">
          ASA BRANCA
        </span>
      );
    }
    return <span className="text-black font-bold uppercase text-[11px] whitespace-nowrap">{company}</span>;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-full">
      {/* 1 - FILTROS NO TOPO */}
      <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="space-y-2">
            <label className="text-slate-800 font-bold text-[11px] uppercase tracking-wider block ml-1">Número do Processo</label>
            <div className="relative">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Buscar número..." 
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none text-slate-600 text-[14px] transition-all"
                value={searchProcess}
                onChange={(e) => setSearchProcess(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-slate-800 font-bold text-[11px] uppercase tracking-wider block ml-1">Data de Saída</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none text-slate-600 text-[14px] transition-all"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-slate-800 font-bold text-[11px] uppercase tracking-wider block ml-1">Mês</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none text-slate-600 text-[14px] transition-all appearance-none cursor-pointer"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              <option value="">Todos os meses</option>
              {availableMonths.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-slate-800 font-bold text-[11px] uppercase tracking-wider block ml-1">Status</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white outline-none text-slate-600 text-[14px] transition-all appearance-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Todos os status</option>
              {['Solicitada', 'Confirmada', 'Realizada', 'Cancelada', 'Não Atendida', 'Cobrança/Diária'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2 - KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard label="Processos" value={stats.totalProcesses} icon="Truck" color="bg-blue-600" isLoading={isLoading} />
        <KPICard label="Solicitações" value={stats.totalRequests} icon="Search" color="bg-indigo-600" isLoading={isLoading} />
        <KPICard label="Solicitadas" value={stats.byStatus['Solicitada']} icon="Clock" color="bg-amber-500" isLoading={isLoading} />
        <KPICard label="Confirmadas" value={stats.byStatus['Confirmada']} icon="Check" color="bg-sky-500" isLoading={isLoading} />
        <KPICard label="Realizadas" value={stats.byStatus['Realizada']} icon="Check" color="bg-emerald-500" isLoading={isLoading} />
        <KPICard label="Canceladas" value={stats.byStatus['Cancelada']} icon="Cancel" color="bg-rose-500" isLoading={isLoading} />
        <KPICard label="Não Atendidas" value={stats.byStatus['Não Atendida']} icon="Alert" color="bg-orange-500" isLoading={isLoading} />
        <KPICard label="Diárias" value={stats.byStatus['Cobrança/Diária']} icon="Receipt" color="bg-violet-500" isLoading={isLoading} />
      </div>

      {/* 3 - TABELA DE SOLICITAÇÕES OTIMIZADA */}
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm overflow-hidden w-full mb-10">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-50">
          <div className="flex flex-col">
            <h3 className="text-[22px] font-bold text-[#0f172a] tracking-tight leading-none">Lista de Solicitações</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">VISÃO DETALHADA POR ORDEM DE SERVIÇO</p>
          </div>
          <div className="bg-[#eff6ff] text-[#2563eb] px-5 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest border border-[#dbeafe]">
            {filteredProcesses.length} REGISTROS ENCONTRADOS
          </div>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar w-full">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="text-black uppercase text-[12px] font-black tracking-widest border-b border-slate-100 bg-white">
                <th className="px-3 py-6 whitespace-nowrap text-center">Ordem</th>
                <th className="px-3 py-6 whitespace-nowrap">Número do Processo</th>
                <th className="px-3 py-6 whitespace-nowrap">Cidade de Origem</th>
                <th className="px-3 py-6 whitespace-nowrap">Cidade de Destino</th>
                <th className="px-3 py-6 text-center whitespace-nowrap">Data de Saída</th>
                <th className="px-3 py-6 text-center whitespace-nowrap">Data de Retorno</th>
                <th className="px-3 py-6 text-center whitespace-nowrap">Empresa</th>
                <th className="px-3 py-6 text-center whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProcesses.map((p, idx) => (
                <tr key={`${p.id}-${idx}`} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-3 py-6 text-center whitespace-nowrap">
                    <span className="text-[13px] text-black font-normal">{p.id}</span>
                  </td>
                  <td className="px-3 py-6 whitespace-nowrap">
                    <span className="text-[13px] font-normal text-black leading-none">{p.processo}</span>
                  </td>
                  <td className="px-3 py-6 whitespace-nowrap">
                    <span className="text-[12px] font-normal text-black uppercase tracking-tight">{p.origin}</span>
                  </td>
                  <td className="px-3 py-6 whitespace-nowrap">
                    <span className="text-[12px] font-normal text-black uppercase tracking-tight">{p.destination}</span>
                  </td>
                  <td className="px-3 py-6 text-center whitespace-nowrap">
                    <span className="text-[13px] font-normal text-black">{p.startDate}</span>
                  </td>
                  <td className="px-3 py-6 text-center whitespace-nowrap">
                    <span className="text-[13px] font-normal text-black">{p.endDate}</span>
                  </td>
                  <td className="px-3 py-6 text-center whitespace-nowrap">
                    {getCompanyBadge(p.company)}
                  </td>
                  <td className="px-3 py-6 text-center whitespace-nowrap">
                    <span className={getStatusBadge(p.status)}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardOperational;
