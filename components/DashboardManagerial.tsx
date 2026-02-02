
import React, { useState, useMemo, useEffect } from 'react';
import { DashboardStats, ProcessData } from '../types';
// Fix: Consolidate import casing for Icons
import { Icons } from './Icons';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface Props {
  stats: DashboardStats;
  processes: ProcessData[];
  isLoading: boolean;
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
};

const MONTH_FULL_NAMES: Record<string, string> = {
  '01': 'Janeiro', '02': 'Fevereiro', '03': 'Março', '04': 'Abril',
  '05': 'Maio', '06': 'Junho', '07': 'Julho', '08': 'Agosto',
  '09': 'Setembro', '10': 'Outubro', '11': 'Novembro', '12': 'Dezembro'
};

const DashboardManagerial: React.FC<Props> = ({ stats, processes, isLoading }) => {
  const [filterProcess, setFilterProcess] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterExecutive, setFilterExecutive] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // 1. Extrair opções dinâmicas dos dados carregados
  const filterOptions = useMemo(() => {
    const executives = new Set<string>();
    const sectors = new Set<string>();
    const companies = new Set<string>();
    const months = new Set<string>();

    processes.forEach(p => {
      if (p.executive) executives.add(p.executive);
      if (p.sector) sectors.add(p.sector);
      if (p.company) companies.add(p.company);
      
      const monthPart = p.startDate.split('/')[1];
      if (monthPart && MONTH_FULL_NAMES[monthPart]) months.add(monthPart);
    });

    return {
      executives: Array.from(executives).sort(),
      sectors: Array.from(sectors).sort(),
      companies: Array.from(companies).sort(),
      months: Array.from(months).sort().map(m => ({ value: m, label: MONTH_FULL_NAMES[m] }))
    };
  }, [processes]);

  // 2. Filtragem de dados
  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      const matchProcess = filterProcess === '' || p.processo.toLowerCase().includes(filterProcess.toLowerCase());
      const matchMonth = filterMonth === '' || p.startDate.includes(`/${filterMonth}/`);
      const matchExec = filterExecutive === '' || p.executive === filterExecutive;
      const matchSector = filterSector === '' || p.sector === filterSector;
      const matchCompany = filterCompany === '' || p.company === filterCompany;
      
      return matchProcess && matchMonth && matchExec && matchSector && matchCompany;
    });
  }, [processes, filterProcess, filterMonth, filterExecutive, filterSector, filterCompany]);

  // Cálculo de tendências mensais garantindo a ordem de Jan a Dez
  const monthlyTrendsManagerial = useMemo(() => {
    // Array fixo para garantir a ordem cronológica correta
    const monthsOrder = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    
    // Inicializa o mapa com valores zerados
    const trendsMap: Record<string, { month: string, requests: number, vehicles: number }> = {};
    monthsOrder.forEach(m => {
      trendsMap[m] = { month: MONTH_NAMES[m], requests: 0, vehicles: 0 };
    });

    // Popula o mapa com os dados reais
    filteredProcesses.forEach(p => {
      const parts = p.startDate.split('/');
      const monthPart = parts[1];
      if (monthPart && trendsMap[monthPart]) {
        trendsMap[monthPart].requests += 1;
        trendsMap[monthPart].vehicles += (p.busQuantity || 0);
      }
    });

    // Retorna os dados na ordem do array fixed monthsOrder
    return monthsOrder.map(m => trendsMap[m]);
  }, [filteredProcesses]);

  // Resetar página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [filterProcess, filterMonth, filterExecutive, filterSector, filterCompany]);

  // Lógica de Paginação
  const totalPages = Math.ceil(filteredProcesses.length / pageSize);
  const paginatedProcesses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProcesses.slice(start, start + pageSize);
  }, [filteredProcesses, currentPage]);

  // 3. Estatísticas baseadas nos dados filtrados
  const totalVehicles = useMemo(() => {
    return filteredProcesses.reduce((acc, p) => acc + (p.busQuantity || 0), 0);
  }, [filteredProcesses]);

  // Rankings Consolidados
  const rankings = useMemo(() => {
    const execMap: Record<string, { requests: number, vehicles: number, lowOcc: number, delayed: number }> = {};
    const sectorMap: Record<string, { requests: number, vehicles: number, lowOcc: number, delayed: number }> = {};
    
    processes.forEach(p => {
      const exec = p.executive || 'Não Informado';
      const sector = p.sector || 'Geral';
      
      if (!execMap[exec]) execMap[exec] = { requests: 0, vehicles: 0, lowOcc: 0, delayed: 0 };
      execMap[exec].requests += 1;
      execMap[exec].vehicles += (p.busQuantity || 0);
      if (p.occupancy === 'Baixa') execMap[exec].lowOcc += 1;
      if (p.deadlineDays < 15) execMap[exec].delayed += 1;

      if (!sectorMap[sector]) sectorMap[sector] = { requests: 0, vehicles: 0, lowOcc: 0, delayed: 0 };
      sectorMap[sector].requests += 1;
      sectorMap[sector].vehicles += (p.busQuantity || 0);
      if (p.occupancy === 'Baixa') sectorMap[sector].lowOcc += 1;
      if (p.deadlineDays < 15) sectorMap[sector].delayed += 1;
    });

    const execEntries = Object.entries(execMap);
    const sectorEntries = Object.entries(sectorMap);

    return {
      exec: {
        requests: [...execEntries].sort((a, b) => b[1].requests - a[1].requests).slice(0, 3),
        vehicles: [...execEntries].sort((a, b) => b[1].vehicles - a[1].vehicles).slice(0, 3),
        lowOcc: [...execEntries].sort((a, b) => b[1].lowOcc - a[1].lowOcc).slice(0, 3),
        delayed: [...execEntries].sort((a, b) => b[1].delayed - a[1].delayed).slice(0, 3)
      },
      sector: {
        requests: [...sectorEntries].sort((a, b) => b[1].requests - a[1].requests).slice(0, 3),
        vehicles: [...sectorEntries].sort((a, b) => b[1].vehicles - a[1].vehicles).slice(0, 3),
        lowOcc: [...sectorEntries].sort((a, b) => b[1].lowOcc - a[1].lowOcc).slice(0, 3),
        delayed: [...sectorEntries].sort((a, b) => b[1].delayed - a[1].delayed).slice(0, 3)
      }
    };
  }, [processes]);

  const formatDisplayName = (name: string) => {
    if (name.includes(' - ')) {
      return name.split(' - ')[0];
    }
    return name;
  };

  const companyProportions = useMemo(() => {
    const distribution: Record<string, number> = {};
    filteredProcesses.forEach(p => {
      const comp = p.company || 'Não Informado';
      distribution[comp] = (distribution[comp] || 0) + (p.busQuantity || 0);
    });

    const total = Object.values(distribution).reduce((a, b) => a + b, 0);
    
    return Object.entries(distribution)
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);
  }, [filteredProcesses]);

  const occupancyStats = useMemo(() => {
    let low = 0, medium = 0, high = 0;
    filteredProcesses.forEach(p => {
      if (p.occupancy === 'Baixa') low++;
      else if (p.occupancy === 'Média') medium++;
      else if (p.occupancy === 'Boa') high++;
    });
    return { low, medium, high };
  }, [filteredProcesses]);

  const deadlineStats = useMemo(() => {
    let inTime = 0, delayed = 0;
    filteredProcesses.forEach(p => {
      if (p.deadlineDays >= 15) inTime++;
      else delayed++;
    });
    return { inTime, delayed };
  }, [filteredProcesses]);

  const getCompanyBadge = (company: string) => {
    if (company.toUpperCase().includes('ASA BRANCA')) {
      return (
        <span className="bg-[#00a86b] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100 whitespace-nowrap">
          Asa Branca
        </span>
      );
    }
    return <span className="text-black font-bold uppercase text-[11px] sm:text-[12px] whitespace-nowrap">{company}</span>;
  };

  const renderStatusPrazoBadge = (days: number) => {
    if (days < 15) {
      return (
        <span className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-widest">
          FORA DO PRAZO
        </span>
      );
    }
    return (
      <span className="px-4 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">
        DENTRO DO PRAZO
      </span>
    );
  };

  const getCompanyColor = (name: string, index: number) => {
    const upper = name.toUpperCase();
    if (upper.includes('ASA BRANCA')) return 'bg-emerald-700';
    if (upper.includes('GRAVATAENSE')) return 'bg-rose-900';
    const colors = ['bg-blue-600', 'bg-amber-500', 'bg-indigo-500', 'bg-slate-400'];
    return colors[index % colors.length];
  };

  const formatOccupancyRateDisplay = (rate: string) => {
    if (!rate || rate === 'N/A' || rate === '---') return '0%';
    if (rate.includes('%')) return rate;
    const num = parseFloat(rate.replace(',', '.'));
    if (!isNaN(num)) {
      return Math.round(num * 100) + '%';
    }
    return rate;
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Filtros Consolidados */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest block ml-1">Processo</label>
            <div className="relative">
              <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="text" 
                placeholder="Pesquisar Processo..." 
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white transition-all text-[13px] text-black font-medium" 
                value={filterProcess}
                onChange={(e) => setFilterProcess(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest block ml-1">Mês</label>
            <select className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl outline-none appearance-none cursor-pointer text-[13px] text-black font-medium focus:ring-2 focus:ring-blue-500/10 transition-all" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
              <option value="">Todos</option>
              {filterOptions.months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest block ml-1">Executiva</label>
            <select className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl outline-none appearance-none cursor-pointer text-[13px] text-black font-medium focus:ring-2 focus:ring-blue-500/10 transition-all" value={filterExecutive} onChange={(e) => setFilterExecutive(e.target.value)}>
              <option value="">Todos</option>
              {filterOptions.executives.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest block ml-1">Setor</label>
            <select className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl outline-none appearance-none cursor-pointer text-[13px] text-black font-medium focus:ring-2 focus:ring-blue-500/10 transition-all" value={filterSector} onChange={(e) => setFilterSector(e.target.value)}>
              <option value="">Todos</option>
              {filterOptions.sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-black uppercase tracking-widest block ml-1">Empresa</label>
            <select className="w-full px-4 py-2.5 bg-slate-50/50 border border-slate-100 rounded-xl outline-none appearance-none cursor-pointer text-[13px] text-black font-medium focus:ring-2 focus:ring-blue-500/10 transition-all" value={filterCompany} onChange={(e) => setFilterCompany(e.target.value)}>
              <option value="">Todos</option>
              {filterOptions.companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Veículos Solicitados e Distribuição */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-4 bg-white p-6 rounded-[1.2rem] shadow-sm border border-slate-100 flex flex-col gap-6 h-full transition-all hover:shadow-md group border-l-4 border-l-blue-600">
          <div className="flex justify-start">
            <div className="bg-[#121a2f] p-2.5 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Icons.Truck className="text-white w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h4 className="text-black font-bold text-[11px] uppercase tracking-widest">Total de Veículos Solicitados</h4>
            <p className="text-[32px] font-bold text-black leading-none tracking-tight">{totalVehicles}</p>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white p-6 rounded-[1.2rem] border border-slate-100 shadow-sm flex flex-col h-full justify-between">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center">
                <Icons.Maximize className="text-blue-500 w-3.5 h-3.5" />
              </div>
              <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">Distribuição por Empresa (Veículos)</h4>
            </div>
            <span className="text-[10px] font-bold text-black uppercase tracking-widest">{totalVehicles} Veículos Totais</span>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest">Proporção de Veículos</h5>
            <div className="w-full h-8 bg-slate-50 rounded-full flex overflow-hidden border border-slate-100 relative">
              {companyProportions.length > 0 ? companyProportions.map((comp, idx) => (
                <div 
                  key={idx}
                  className={`h-full ${getCompanyColor(comp.name, idx)} flex items-center justify-center transition-all duration-700`}
                  style={{ width: `${comp.percentage}%` }}
                >
                  {comp.percentage > 10 && (
                    <span className="text-[10px] font-black text-white">{Math.round(comp.percentage)}%</span>
                  )}
                </div>
              )) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px] font-black uppercase">Nenhum dado</div>
              )}
            </div>
            <div className="flex flex-wrap gap-x-8 gap-y-3 pt-4">
              {companyProportions.map((comp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getCompanyColor(comp.name, idx)}`}></div>
                  <span className="text-[10px] font-bold text-black uppercase tracking-widest">
                    {comp.name}: <span className="font-bold">{comp.count}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Novos Gráficos: Quantidade de Solicitações e Quantidade de Veículos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Card 1: Quantidade de Solicitações */}
        <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2.5 rounded-xl flex items-center justify-center text-indigo-600">
                <Icons.Reports className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-black uppercase tracking-[0.1em]">Quantidade de Solicitações</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Visão Mensal Consolidada</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[20px] font-black text-indigo-600 leading-none">{filteredProcesses.length}</p>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendsManagerial}>
                <defs>
                  <linearGradient id="colorReqs" x1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                  formatter={(v: number) => [v, 'Solicitações']}
                />
                <Area type="monotone" dataKey="requests" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReqs)" dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Quantidade de Veículos */}
        <div className="bg-white p-6 sm:p-8 rounded-[1.5rem] border border-slate-100 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-amber-50 p-2.5 rounded-xl flex items-center justify-center text-amber-500">
                <Icons.Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[11px] font-bold text-black uppercase tracking-[0.1em]">Quantidade de Veículos</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Distribuição Mensal de Ônibus</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[20px] font-black text-amber-500 leading-none">{totalVehicles}</p>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendsManagerial}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                  formatter={(v: number) => [v, 'Veículos']}
                />
                <Bar dataKey="vehicles" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={25}>
                  {monthlyTrendsManagerial.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.vehicles > 0 ? '#f59e0b' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Seção Ocupação */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[2px] bg-blue-600/30"></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Níveis de Ocupação</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {[
            { label: 'Boa Ocupação', value: occupancyStats.high, color: 'emerald' },
            { label: 'Ocupação Média', value: occupancyStats.medium, color: 'amber' },
            { label: 'Baixa Ocupação', value: occupancyStats.low, color: 'rose' }
          ].map((card, i) => (
            <div key={i} className={`bg-white p-6 rounded-[1.2rem] shadow-sm border-l-[6px] hover:shadow-md transition-all ${
              card.color === 'emerald' ? 'border-emerald-500' : 
              card.color === 'amber' ? 'border-amber-500' : 'border-rose-500'
            }`}>
              <h4 className={`font-bold text-[11px] uppercase tracking-widest mb-6 ${
                card.color === 'emerald' ? 'text-emerald-600' : 
                card.color === 'amber' ? 'text-amber-600' : 'text-rose-600'
              }`}>{card.label}</h4>
              <p className="text-[32px] font-bold text-black leading-none mb-1">{card.value}</p>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solicitações</span>
              <div className={`mt-6 h-1 w-full rounded-full overflow-hidden ${
                card.color === 'emerald' ? 'bg-emerald-100' : 
                card.color === 'amber' ? 'bg-amber-100' : 'bg-rose-100'
              }`}>
                <div 
                  className={`h-full transition-all duration-1000 ${
                    card.color === 'emerald' ? 'bg-emerald-500' : 
                    card.color === 'amber' ? 'bg-amber-500' : 'bg-rose-500'
                  }`} 
                  style={{ width: filteredProcesses.length > 0 ? `${(card.value / filteredProcesses.length) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seção Prazos */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[2px] bg-blue-600/30"></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Performance de Prazos</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-emerald-50/40 p-6 sm:p-10 rounded-[1.5rem] border border-emerald-100 flex items-center gap-6 group hover:bg-emerald-50 transition-colors h-full">
            <div className="bg-emerald-500 p-4 rounded-2xl shadow-xl shadow-emerald-200 group-hover:scale-110 transition-transform">
              <Icons.Check className="text-white w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h4 className="text-emerald-600 font-bold text-[11px] uppercase tracking-widest mb-1">Dentro do Prazo</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-bold text-black leading-none">{deadlineStats.inTime}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solicitações</span>
              </div>
            </div>
          </div>
          <div className="bg-rose-50/40 p-6 sm:p-10 rounded-[1.5rem] border border-rose-100 flex items-center gap-6 group hover:bg-rose-50 transition-colors h-full">
            <div className="bg-rose-500 p-4 rounded-2xl shadow-xl shadow-rose-200 group-hover:scale-110 transition-transform">
              <Icons.Cancel className="text-white w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div>
              <h4 className="text-rose-600 font-bold text-[11px] uppercase tracking-widest mb-1">Fora do Prazo</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-[32px] font-bold text-black leading-none">{deadlineStats.delayed}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Solicitações</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings por Executiva */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[2px] bg-blue-600/30"></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Rankings por Executiva (Top 3)</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="bg-blue-600 p-2 rounded-lg"><Icons.Reports className="text-white w-4 h-4" /></div>
              <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">Solicitações</h4>
            </div>
            <div className="space-y-3">
              {rankings.exec.requests.map(([name, val], i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-600' : 'bg-amber-700 text-white'}`}>{i + 1}º</span>
                    <span className="text-[11px] font-bold text-black truncate uppercase" title={name}>{formatDisplayName(name)}</span>
                  </div>
                  <span className="text-[11px] font-normal text-black shrink-0">{val.requests}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="bg-indigo-600 p-2 rounded-lg"><Icons.Truck className="text-white w-4 h-4" /></div>
              <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">Pedido de Veículos</h4>
            </div>
            <div className="space-y-3">
              {rankings.exec.vehicles.map(([name, val], i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-600' : 'bg-amber-700 text-white'}`}>{i + 1}º</span>
                    <span className="text-[11px] font-bold text-black truncate uppercase" title={name}>{formatDisplayName(name)}</span>
                  </div>
                  <span className="text-[11px] font-normal text-black shrink-0">{val.vehicles}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="bg-orange-500 p-2 rounded-lg"><Icons.Alert className="text-white w-4 h-4" /></div>
              <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">Ocupação Baixa</h4>
            </div>
            <div className="space-y-3">
              {rankings.exec.lowOcc.map(([name, val], i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-600' : 'bg-amber-700 text-white'}`}>{i + 1}º</span>
                    <span className="text-[11px] font-bold text-black truncate uppercase" title={name}>{formatDisplayName(name)}</span>
                  </div>
                  <span className="text-[11px] font-normal text-black shrink-0">{val.lowOcc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="bg-rose-500 p-2 rounded-lg"><Icons.Clock className="text-white w-4 h-4" /></div>
              <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">Fora do Prazo</h4>
            </div>
            <div className="space-y-3">
              {rankings.exec.delayed.map(([name, val], i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-600' : 'bg-amber-700 text-white'}`}>{i + 1}º</span>
                    <span className="text-[11px] font-bold text-black truncate uppercase" title={name}>{formatDisplayName(name)}</span>
                  </div>
                  <span className="text-[11px] font-normal text-black shrink-0">{val.delayed}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rankings por Setor */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[2px] bg-blue-600/30"></div>
          <span className="text-[10px] sm:text-[11px] font-bold text-black uppercase tracking-widest">Rankings por Setor do Solicitante (Top 3)</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="bg-blue-600 p-2 rounded-lg"><Icons.Reports className="text-white w-4 h-4" /></div>
              <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">Solicitações</h4>
            </div>
            <div className="space-y-3">
              {rankings.sector.requests.map(([name, val], i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-600' : 'bg-amber-700 text-white'}`}>{i + 1}º</span>
                    <span className="text-[11px] font-bold text-black truncate uppercase">{name}</span>
                  </div>
                  <span className="text-[11px] font-normal text-black shrink-0">{val.requests}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="bg-indigo-600 p-2 rounded-lg"><Icons.Truck className="text-white w-4 h-4" /></div>
              <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">Pedido de Veículos</h4>
            </div>
            <div className="space-y-3">
              {rankings.sector.vehicles.map(([name, val], i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-600' : 'bg-amber-700 text-white'}`}>{i + 1}º</span>
                    <span className="text-[11px] font-bold text-black truncate uppercase">{name}</span>
                  </div>
                  <span className="text-[11px] font-normal text-black shrink-0">{val.vehicles}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="bg-orange-500 p-2 rounded-lg"><Icons.Alert className="text-white w-4 h-4" /></div>
              <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">Ocupação Baixa</h4>
            </div>
            <div className="space-y-3">
              {rankings.sector.lowOcc.map(([name, val], i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-600' : 'bg-amber-700 text-white'}`}>{i + 1}º</span>
                    <span className="text-[11px] font-bold text-black truncate uppercase">{name}</span>
                  </div>
                  <span className="text-[11px] font-normal text-black shrink-0">{val.lowOcc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
              <div className="bg-rose-500 p-2 rounded-lg"><Icons.Clock className="text-white w-4 h-4" /></div>
              <h4 className="text-[11px] font-bold text-black uppercase tracking-widest">Fora do Prazo</h4>
            </div>
            <div className="space-y-3">
              {rankings.sector.delayed.map(([name, val], i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-slate-300 text-slate-600' : 'bg-amber-700 text-white'}`}>{i + 1}º</span>
                    <span className="text-[11px] font-bold text-black truncate uppercase">{name}</span>
                  </div>
                  <span className="text-[11px] font-normal text-black shrink-0">{val.delayed}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lista Técnica Detalhada com Paginação */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-10">
        <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h3 className="text-[26px] font-bold text-black tracking-tight leading-none">Lista de Solicitações</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Visão por Ordem de Serviço • {pageSize} registros por página</p>
          </div>
          <span className="bg-[#eff6ff] text-[#2563eb] px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-widest border border-[#dbeafe]">
            {filteredProcesses.length} Registros Filtrados
          </span>
        </div>
        
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="text-black uppercase text-[12px] font-bold tracking-widest border-b border-slate-100 bg-white">
                <th className="px-6 sm:px-10 py-6">Ordem</th>
                <th className="px-6 sm:px-10 py-6">Processo</th>
                <th className="px-6 sm:px-10 py-6">Executiva</th>
                <th className="px-6 sm:px-10 py-6">Setor</th>
                <th className="px-6 sm:px-10 py-6">Empresa</th>
                <th className="px-6 sm:px-10 py-6 text-center">OCUPAÇÃO</th>
                <th className="px-6 sm:px-10 py-6 text-center">Status de Prazo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedProcesses.map((p, idx) => (
                <tr key={`${p.id}-${idx}`} className="hover:bg-slate-50/40 transition-colors group">
                  <td className="px-6 sm:px-10 py-6 text-[13px] font-normal text-black">{p.id}</td>
                  <td className="px-6 sm:px-10 py-6 text-[13px] font-normal text-black">{p.processo}</td>
                  <td className="px-6 sm:px-10 py-6 text-[11px] font-normal text-black uppercase">{p.executive}</td>
                  <td className="px-6 sm:px-10 py-6 text-[11px] font-normal text-black uppercase">{p.sector}</td>
                  <td className="px-6 sm:px-10 py-6">{getCompanyBadge(p.company)}</td>
                  <td className="px-6 sm:px-10 py-6 text-center">
                    <span className={`px-4 py-1.5 rounded-full text-[11px] font-bold border ${
                      p.occupancy === 'Boa' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      p.occupancy === 'Média' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {formatOccupancyRateDisplay(p.occupancyRate)}
                    </span>
                  </td>
                  <td className="px-6 sm:px-10 py-6 text-center">
                    {renderStatusPrazoBadge(p.deadlineDays)}
                  </td>
                </tr>
              ))}
              {paginatedProcesses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-400 font-black uppercase tracking-widest text-[12px]">
                    Nenhum indicador encontrado para os filtros selecionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* CONTROLES DE PAGINAÇÃO */}
        {totalPages > 1 && (
          <div className="p-6 sm:p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Página {currentPage} de {totalPages}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Próxima Página
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardManagerial;
