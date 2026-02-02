
import React from 'react';
import { TransportRequest } from '../types';
// Fix: Consolidate import casing for Icons
import { Icons } from './Icons';

interface Props {
  requests: TransportRequest[];
  onEdit: (request: TransportRequest) => void;
  onDelete: (id: string) => void;
  onDuplicate: (request: TransportRequest) => void;
  onAddNew: () => void;
}

const TransportTable: React.FC<Props> = ({ requests, onEdit, onDelete, onDuplicate, onAddNew }) => {
  if (requests.length === 0) {
    return (
      <div className="p-20 text-center">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Icons.Reports className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">Nenhuma solicitação emitida</h3>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">Comece criando sua primeira solicitação de fretamento para que ela apareça nesta listagem.</p>
        <button onClick={onAddNew} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
          <Icons.Reports className="w-4 h-4" /> Criar Solicitação
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-slate-50/70 border-b border-slate-100">
            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Processo SEI</th>
            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Evento</th>
            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data Saída</th>
            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Origem/Destino</th>
            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Passag..</th>
            <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-slate-700">{req.col_0 || '---'}</span>
                  <span className="text-[11px] text-slate-400 uppercase font-medium">{req.col_4 || 'Não Informado'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-[14px] text-slate-600 font-medium truncate max-w-[200px]">
                {req.col_8 || 'Sem Nome'}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-slate-700">{req.col_11 || '--/--/----'}</span>
                  <span className="text-[11px] text-slate-400 font-bold uppercase">{req.col_13 || '--:--'}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 text-[12px] text-slate-500 font-medium">
                  <span className="uppercase">{req.col_15 || '?'}</span>
                  <Icons.ChevronRight className="w-3 h-3 text-slate-300" />
                  <span className="uppercase text-blue-600 font-bold">{req.col_24 || '?'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 rounded-lg text-[13px] font-bold border border-blue-100">
                  {req.col_27 || '0'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onDuplicate(req)} className="p-2 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-all" title="Duplicar"><Icons.Reports className="w-4 h-4" /></button>
                  <button onClick={() => onEdit(req)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Editar"><Icons.TrendingUp className="w-4 h-4" /></button>
                  <button onClick={() => onDelete(req.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all" title="Excluir"><Icons.Cancel className="w-4 h-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransportTable;
