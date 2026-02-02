
import React, { useState, useMemo } from 'react';
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
  AreaChart,
  Area
} from 'recharts';

interface Props {
  stats: DashboardStats;
  processes: ProcessData[];
  isLoading: boolean;
}

const MONTH_ORDER = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];

const MONTH_SHORT: Record<string, string> = {
  'JANEIRO': 'Jan', 'FEVEREIRO': 'Fev', 'MARÇO': 'Mar', 'ABRIL': 'Abr',
  'MAIO': 'Mai', 'JUNHO': 'Jun', 'JULHO': 'Jul', 'AGOSTO': 'Ago',
  'SETEMBRO': 'Set', 'OUTUBRO': 'Out', 'NOVEMBRO': 'Nov', 'DEZEMBRO': 'Dez'
};

const DashboardFinancial: React.FC<Props> = ({ stats, processes, isLoading }) => {
  const [filterMonth, setFilterMonth] = useState('');

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    processes.forEach(p => {
      if (p.month && p.month !== '') months.add(p.month);
    });
    return Array.from(months)
      .sort((a, b) => MONTH_ORDER.indexOf(a) - MONTH_ORDER.indexOf(b))
      .map(m => ({ value: m, label: m }));
  }, [processes]);

  const monthlyTrends = useMemo(() => {
    return MONTH_ORDER.map(m => {
      const dataInMonth = processes.filter(p => p.month === m);
      return {
        month: MONTH_SHORT[m],
        fullName: m,
        kmVal: dataInMonth.reduce((acc, p) => acc + (p.kmValR || 0), 0),
        kmQtd: dataInMonth.reduce((acc, p) => acc + (p.kmQtdR || 0), 0),
        diaVal: dataInMonth.reduce((acc, p) => acc + (p.diaValR || 0), 0),
        diaQtd: dataInMonth.reduce((acc, p) => acc + (p.diaQtdR || 0), 0),
        motVal: dataInMonth.reduce((acc, p) => acc + (p.motValR || 0), 0),
        motQtd: dataInMonth.reduce((acc, p) => acc + (p.motQtdR || 0), 0),
      };
    });
  }, [processes]);

  const financialData = useMemo(() => {
    const filtered = filterMonth === '' 
      ? processes 
      : processes.filter(p => p.month === filterMonth);

    return filtered.reduce((acc, p) => {
      acc.kmVal.previsto += (p.kmValP || 0);
      acc.kmVal.realizado += (p.kmValR || 0);
      acc.diaVal.previsto += (p.diaValP || 0);
      acc.diaVal.realizado += (p.diaValR || 0);
      acc.motVal.previsto += (p.motValP || 0);
      acc.motVal.realizado += (p.motValR || 0);
      acc.kmQtd.previsto += (p.kmQtdP || 0);
      acc.kmQtd.realizado += (p.kmQtdR || 0);
      acc.diaQtd.previsto += (p.diaQtdP || 0);
      acc.diaQtd.realizado += (p.diaQtdR || 0);
      acc.motQtd.previsto += (p.motQtdP || 0);
      acc.motQtd.realizado += (p.motQtdR || 0);
      return acc;
    }, {
      kmVal: { previsto: 0, realizado: 0 },
      diaVal: { previsto: 0, realizado: 0 },
      motVal: { previsto: 0, realizado: 0 },
      kmQtd: { previsto: 0, realizado: 0 },
      diaQtd: { previsto: 0, realizado: 0 },
      motQtd: { previsto: 0, realizado: 0 }
    });
  }, [processes, filterMonth]);

  const totalPrevisto = financialData.kmVal.previsto + financialData.diaVal.previsto + financialData.motVal.previsto;
  const totalRealizado = financialData.kmVal.realizado + financialData.diaVal.realizado + financialData.motVal.realizado;

  const chartData = [
    { name: 'KM', previsto: financialData.kmVal.previsto, realizado: financialData.kmVal.realizado },
    { name: 'Diárias', previsto: financialData.diaVal.previsto, realizado: financialData.diaVal.realizado },
    { name: 'Motorista', previsto: financialData.motVal.previsto, realizado: financialData.motVal.realizado },
    { name: 'TOTAL', previsto: totalPrevisto, realizado: totalRealizado },
  ];

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const formatNumber = (val: number) => new Intl.NumberFormat('pt-BR').format(Math.ceil(val));

  return (
    <div className="space-y-6 sm:space-y-10">
      <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] border border-slate-200/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-[22px] sm:text-[26px] font-bold text-slate-800 tracking-tight leading-none">Análise Financeira</h2>
          <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">Monitoramento de Custos e Orçamentos</p>
        </div>
        <div className="w-full md:w-auto">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Período de Referência</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-6 py-3 text-[14px] font-medium text-slate-500 outline-none min-w-[240px] focus:ring-2 focus:ring-blue-500/10 transition-all cursor-pointer appearance-none shadow-sm uppercase"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
          >
            <option value="">TODOS OS MESES</option>
            {availableMonths.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cartões de Resumo Geral */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 sm:p-12 rounded-2xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-blue-500/20">
          <div className="relative z-10">
            <h3 className="text-blue-100/80 font-black uppercase text-[10px] sm:text-[11px] tracking-widest mb-2">Total Geral Previsto</h3>
            <p className="text-[28px] sm:text-[36px] xl:text-[42px] font-black text-white leading-tight break-words">{formatCurrency(totalPrevisto)}</p>
          </div>
          <Icons.Finance className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-all duration-700 w-32 h-32 sm:w-48 sm:h-48 text-white" />
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 sm:p-12 rounded-2xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-emerald-500/20">
          <div className="relative z-10">
            <h3 className="text-emerald-100/80 font-black uppercase text-[10px] sm:text-[11px] tracking-widest mb-2">Total Geral Realizado</h3>
            <p className="text-[28px] sm:text-[36px] xl:text-[42px] font-black text-white leading-tight break-words">{formatCurrency(totalRealizado)}</p>
          </div>
          <Icons.Check className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-125 transition-all duration-700 w-32 h-32 sm:w-48 sm:h-48 text-white" />
        </div>
      </div>

      {/* Grade de 6 Cartões com alinhamento horizontal interno */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* COLUNA 1: KM */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md border-l-4 border-l-blue-500 min-h-[160px] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><Icons.Finance className="w-4 h-4" /></div>
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">KM (R$)</h4>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Previsto</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatCurrency(financialData.kmVal.previsto)}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Realizado</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatCurrency(financialData.kmVal.realizado)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md border-l-4 border-l-blue-400 min-h-[160px] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-blue-50 rounded-lg text-blue-400"><Icons.Maximize className="w-4 h-4" /></div>
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">KM (Quantidade)</h4>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Previsto</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatNumber(financialData.kmQtd.previsto)}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Realizado</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatNumber(financialData.kmQtd.realizado)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA 2: DIÁRIA */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md border-l-4 border-l-violet-500 min-h-[160px] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-violet-50 rounded-lg text-violet-600"><Icons.Receipt className="w-4 h-4" /></div>
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Diária (R$)</h4>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Previsto</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatCurrency(financialData.diaVal.previsto)}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Realizado</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatCurrency(financialData.diaVal.realizado)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md border-l-4 border-l-violet-400 min-h-[160px] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-violet-50 rounded-lg text-violet-400"><Icons.Clock className="w-4 h-4" /></div>
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Diária (Quantidade)</h4>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Previsto</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatNumber(financialData.diaQtd.previsto)}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Realizado</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatNumber(financialData.diaQtd.realizado)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA 3: MOTORISTA ADICIONAL */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md border-l-4 border-l-amber-500 min-h-[160px] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><Icons.Reports className="w-4 h-4" /></div>
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">MOTORISTA ADICIONAL (R$)</h4>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Previsto</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatCurrency(financialData.motVal.previsto)}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Realizado</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatCurrency(financialData.motVal.realizado)}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md border-l-4 border-l-amber-400 min-h-[160px] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-amber-50 rounded-lg text-amber-400"><Icons.Truck className="w-4 h-4" /></div>
              <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">MOTORISTA ADICIONAL (QTD)</h4>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Previsto</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatNumber(financialData.motQtd.previsto)}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Realizado</span>
                <p className="text-[18px] font-bold text-slate-800 leading-none">{formatNumber(financialData.motQtd.realizado)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-[20px] sm:text-[24px] font-bold text-slate-800 tracking-tight">Desempenho Financeiro Consolidado</h3>
            <p className="text-[11px] sm:text-[12px] font-medium text-slate-400 mt-1 uppercase tracking-widest">Comparativo por Categoria</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded-full"></div> <span>Previsto</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div> <span>Realizado</span></div>
          </div>
        </div>
        
        <div className="h-[300px] sm:h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }} barGap={16}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 700}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(v) => `R$ ${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                formatter={(v: number) => [formatCurrency(v), '']}
              />
              <Bar dataKey="previsto" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
              <Bar dataKey="realizado" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-[2px] bg-blue-600/30"></div>
          <span className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">Evolução Mensal de Realizados</span>
        </div>

        {/* Grade com 2 cards lado a lado para os gráficos de tendência */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* KM VALORES */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">KM - (R$)</h4>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(v) => `R$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip formatter={(v: any) => [formatCurrency(v), 'Valor Realizado']} />
                  <Bar dataKey="kmVal" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* KM QUANTIDADE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">KM - (Quantidade)</h4>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip formatter={(v: any) => [formatNumber(v), 'Quantidade (KM)']} />
                  <Area type="monotone" dataKey="kmQtd" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorKm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DIÁRIAS VALORES */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">DIÁRIAS - (R$)</h4>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(v) => `R$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip formatter={(v: any) => [formatCurrency(v), 'Valor Realizado']} />
                  <Bar dataKey="diaVal" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DIÁRIAS QUANTIDADE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">DIÁRIAS - (Quantidade)</h4>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip formatter={(v: any) => [formatNumber(v), 'Quantidade (Diárias)']} />
                  <Area type="monotone" dataKey="diaQtd" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorDia)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MOTORISTA VALORES */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">MOTOTORISTA ADICIONAL - (R$)</h4>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} tickFormatter={(v) => `R$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip formatter={(v: any) => [formatCurrency(v), 'Valor Realizado']} />
                  <Bar dataKey="motVal" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* MOTORISTA QUANTIDADE */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:shadow-md">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">MOTORISTA ADICIONAL- (QUANTIDADE)</h4>
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <defs>
                    <linearGradient id="colorMot" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                  <Tooltip formatter={(v: any) => [formatNumber(v), 'Quantidade (Mot. Adic.)']} />
                  <Area type="monotone" dataKey="motQtd" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorMot)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardFinancial;
