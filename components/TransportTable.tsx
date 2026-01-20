
import React from 'react';
import { FIELD_LABELS, FIELDS } from '../constants';
import { TransportRequest } from '../types';

interface TransportTableProps {
  requests: TransportRequest[];
  onEdit: (request: TransportRequest) => void;
  onDelete: (id: string) => void;
  onDuplicate: (request: TransportRequest) => void;
  onAddNew: () => void;
}

const formatDateBR = (dateStr: string) => {
  if (!dateStr || dateStr === '-' || !dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  if (!year || !month || !day) return dateStr;
  return `${day}/${month}/${year}`;
};

const TransportTable: React.FC<TransportTableProps> = ({ 
  requests, 
  onEdit, 
  onDelete,
  onDuplicate,
  onAddNew
}) => {
  if (requests.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center bg-white">
        <div className="bg-slate-50 p-8 rounded-full mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Sem registros locais</h3>
        <p className="text-gray-500 text-lg">Clique em "Nova Solicitação" para começar</p>
      </div>
    );
  }

  const visibleFieldsWithIndices = FIELDS.map((field, index) => ({ field, index, label: FIELD_LABELS[index] }))
    .filter(({ index, field }) => {
      const isStop = index >= 18 && index <= 23;
      if (!isStop) return true;
      return requests.some(req => req[field.id] && req[field.id].toString().trim() !== '');
    });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse table-auto">
        <thead>
          <tr className="bg-slate-200 border-b-2 border-slate-300">
            <th className="px-4 py-6 sticky left-0 z-20 bg-slate-200 border-r border-slate-300 shadow-[4px_0_10px_rgba(0,0,0,0.05)] w-[160px]">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">Ações</span>
            </th>
            {visibleFieldsWithIndices.map(({ label, index }) => {
              const isSpecial = label === 'Caso o Setor for Outros, Informe Aqui' || label.startsWith('PARADA');
              return (
                <th 
                  key={index} 
                  className={`px-4 py-5 whitespace-nowrap min-w-[220px] border-r border-slate-300 ${
                    isSpecial ? 'bg-yellow-400/80' : 'bg-slate-200'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className={`text-[11px] font-black uppercase tracking-tighter leading-tight text-center ${isSpecial ? 'text-black' : 'text-slate-700'}`}>
                      {label}
                    </span>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-blue-50/50 transition-colors group">
              <td className="px-4 py-4 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.03)] group-hover:bg-blue-50 transition-colors">
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(request)}
                    className="p-2 text-blue-700 hover:bg-blue-100 rounded-lg transition-all"
                    title="Editar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicate(request)}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Duplicar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(request.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Excluir"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
              {visibleFieldsWithIndices.map(({ field, label }) => {
                let value = request[field.id] || '-';
                if (label.includes('Data')) {
                  value = formatDateBR(value as string);
                }
                return (
                  <td key={field.id} className="px-4 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap border-r border-gray-50 text-center">
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransportTable;
