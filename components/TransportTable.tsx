
import React from 'react';
import { FIELD_LABELS, FIELDS } from '../constants';
import { TransportRequest } from '../types';

interface TransportTableProps {
  requests: TransportRequest[];
  onEdit: (request: TransportRequest) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const TransportTable: React.FC<TransportTableProps> = ({ 
  requests, 
  onEdit, 
  onDelete,
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
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Nenhuma solicitação cadastrada</h3>
        <p className="text-gray-500 text-lg">Clique em "Nova Solicitação" para começar</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse table-auto">
        <thead>
          <tr className="bg-slate-200 border-b-2 border-slate-300">
            <th className="px-4 py-6 sticky left-0 z-20 bg-slate-200 border-r border-slate-300 shadow-[4px_0_10px_rgba(0,0,0,0.05)] w-[120px]">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center block">Ações</span>
            </th>
            {FIELD_LABELS.map((label, idx) => {
              const isSpecial = label === 'CASO O SETOR DO SOLICITANTE FOR OUTROS, INFORME AQUI' || label.startsWith('PARADA');
              return (
                <th 
                  key={idx} 
                  className={`px-4 py-5 whitespace-nowrap min-w-[220px] border-r border-slate-300 ${
                    isSpecial ? 'bg-yellow-400/80' : 'bg-slate-200'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-[#001f54] font-black opacity-40 mb-1">COLUNA {String.fromCharCode(65 + (idx % 26))}{idx >= 26 ? 'G' : ''}</span>
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
          {requests.map((request, rowIndex) => (
            <tr key={request.id} className="hover:bg-blue-50/50 transition-colors group">
              <td className="px-4 py-4 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-[4px_0_10px_rgba(0,0,0,0.03)] group-hover:bg-blue-50 transition-colors">
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => onEdit(request)}
                    className="p-2 text-blue-700 hover:bg-blue-100 rounded-lg transition-all"
                    title="Editar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
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
              {FIELDS.map((field) => (
                <td key={field.id} className="px-4 py-4 text-xs font-semibold text-gray-700 whitespace-nowrap border-r border-gray-50 text-center">
                  {request[field.id] || '-'}
                </td>
              ))}
            </tr>
          ))}
          
          <tr className="bg-slate-50">
            <td className="px-4 py-6 sticky left-0 z-10 border-r border-slate-200 bg-slate-100 flex justify-center items-center">
               <button
                onClick={onAddNew}
                className="flex items-center gap-2 text-[#001f54] hover:text-blue-800 font-black text-[10px] uppercase bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                ADICIONAR
              </button>
            </td>
            <td colSpan={FIELDS.length} className="px-8 py-6 italic text-slate-400 text-[11px] font-bold uppercase tracking-widest text-center">
              Fim da lista de registros • Estrutura sincronizada (Linha 9 até Row {requests.length + 8})
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default TransportTable;
