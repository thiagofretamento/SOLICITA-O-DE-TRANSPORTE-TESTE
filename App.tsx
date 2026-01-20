
import React, { useState, useEffect } from 'react';
import { FIELD_LABELS, FIELDS } from './constants';
import { TransportRequest } from './types';
import TransportForm from './components/TransportForm';
import TransportTable from './components/TransportTable';
import Header from './components/Header';
import StepByStep from './components/StepByStep';
import ExcelJS from 'exceljs';

// Fallback para geração de ID caso crypto.randomUUID não esteja disponível
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const formatDateBR = (dateStr: string) => {
  if (!dateStr || !dateStr.includes('-')) return dateStr;
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const App: React.FC = () => {
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [formData, setFormData] = useState<Partial<TransportRequest>>({});
  
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('transport_requests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const validated = parsed.map((item: any) => ({
          ...item,
          id: item.id || generateId()
        }));
        setRequests(validated);
      } catch (e) {
        console.error("Erro ao carregar dados", e);
        setRequests([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transport_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (showForm || idToDelete || showManual) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showForm, idToDelete, showManual]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setRequests(prev => prev.map(r => r.id === editingId ? { ...r, ...formData, id: editingId } as TransportRequest : r));
      setEditingId(null);
    } else {
      const newRequest: TransportRequest = {
        ...formData,
        id: generateId(),
      } as TransportRequest;
      setRequests(prev => [...prev, newRequest]);
    }
    setFormData({});
    setShowForm(false);
  };

  const handleEdit = (request: TransportRequest) => {
    setFormData({ ...request });
    setEditingId(request.id);
    setShowForm(true);
  };

  const handleDelete = (requestId: string) => {
    if (!requestId) return;
    setIdToDelete(requestId);
  };

  const confirmDelete = () => {
    if (idToDelete) {
      setRequests(prevRequests => {
        const updated = prevRequests.filter(r => String(r.id) !== String(idToDelete));
        return [...updated];
      });
      setIdToDelete(null);
    }
  };

  const handleDuplicate = (request: TransportRequest) => {
    const duplicated: TransportRequest = {
      ...request,
      id: generateId()
    };
    setRequests(prev => [...prev, duplicated]);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({});
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({});
  };

  const handleExportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Solicitações');
    worksheet.views = [{ showGridLines: false }];
    worksheet.mergeCells('A1:AG6');
    const bannerCell = worksheet.getCell('A1');
    bannerCell.value = {
      richText: [
        { text: 'SECRETARIA DE EDUCAÇÃO | GOVERNO DE PERNAMBUCO', font: { bold: true, size: 22, color: { argb: 'FFFFFFFF' }, name: 'Arial' } },
        { text: '                                                         ', font: { size: 22, name: 'Arial' } },
        { text: 'Solicitação de Transporte (Fretamento)', font: { bold: true, size: 22, color: { argb: 'FFFFFFFF' }, name: 'Arial' } }
      ]
    };
    bannerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF001F54' } };
    bannerCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };

    const headerRow = worksheet.getRow(8);
    headerRow.height = 35;
    FIELD_LABELS.forEach((label, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = label;
      let bgColor = 'FFD3D3D3';
      if (label === 'Caso o Setor for Outros, Informe Aqui' || label.startsWith('PARADA')) bgColor = 'FFFFFF00';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.font = { bold: true, size: 10, name: 'Arial', color: { argb: 'FF000000' } };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
    });

    requests.forEach((req, idx) => {
      const row = worksheet.getRow(idx + 9);
      row.height = 20;
      FIELDS.forEach((field, fIdx) => {
        const cell = row.getCell(fIdx + 1);
        let value = req[field.id] || '';
        if (field.label.includes('Data')) {
          value = formatDateBR(value);
        }
        cell.value = value;
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
        cell.font = { size: 10, name: 'Arial' };
      });
    });

    worksheet.columns.forEach((column, i) => {
      let maxColumnLength = 0;
      const headerValue = FIELD_LABELS[i];
      maxColumnLength = headerValue ? headerValue.length : 0;
      column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber >= 8) {
          const cellValue = cell.value ? cell.value.toString() : '';
          if (cellValue.length > maxColumnLength) maxColumnLength = cellValue.length;
        }
      });
      column.width = maxColumnLength < 12 ? 15 : (maxColumnLength * 1.15) + 4;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    
    let finalFileName = `SOLICITACAO_FRETAMENTO_PE_${new Date().toISOString().split('T')[0]}.xlsx`;
    if (requests.length > 0) {
      const first = requests[0];
      const dataSaidaRaw = first.col_11;
      const cidadeOrigem = first.col_15 || "";
      const cidadeDestino = first.col_24 || "";
      let dateFormatted = "";
      if (dataSaidaRaw && dataSaidaRaw.includes('-')) {
        const [y, m, d] = dataSaidaRaw.split('-');
        dateFormatted = `${d}/${m}`;
      }
      if (dateFormatted && cidadeOrigem && cidadeDestino) {
        finalFileName = `Solicitação de Transporte - ${dateFormatted} - ${cidadeOrigem} x ${cidadeDestino}.xlsx`;
      }
    }

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = finalFileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      <Header onOpenManual={() => setShowManual(true)} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#001f54] flex items-center gap-3">
              <span className="w-1.5 h-8 bg-yellow-400 rounded-full"></span>
              PAINEL DE GERENCIAMENTO
            </h2>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={handleAddNew} className="flex-1 md:flex-none bg-[#001f54] hover:bg-[#002d7a] text-white px-8 py-3 rounded-lg font-bold shadow-xl transition-all flex items-center justify-center gap-2 transform hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              NOVA SOLICITAÇÃO
            </button>
            <button onClick={handleExportExcel} disabled={requests.length === 0} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${requests.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              BAIXAR EXCEL
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-12">
          <TransportTable requests={requests} onEdit={handleEdit} onDelete={handleDelete} onDuplicate={handleDuplicate} onAddNew={handleAddNew} />
        </div>
      </main>

      <StepByStep isOpen={showManual} onClose={() => setShowManual(false)} />

      {idToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIdToDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirmar Exclusão</h3>
              <p className="text-slate-500">Deseja realmente excluir esta solicitação?</p>
            </div>
            <div className="flex border-t border-slate-100">
              <button 
                onClick={() => setIdToDelete(null)}
                className="flex-1 px-6 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors border-r border-slate-100 uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 px-6 py-4 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors uppercase tracking-wider"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          <div className="absolute inset-0 bg-[#001f54]/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleCancel} />
          <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-2xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="sticky top-0 z-10 bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Sistema de Fretamento</h3>
                  <p className="text-xs font-medium text-gray-400">Preencha todos os campos obrigatórios abaixo</p>
                </div>
              </div>
              <button onClick={handleCancel} className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all shadow-sm">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
              <TransportForm formData={formData} onChange={handleInputChange} onSave={handleSave} onCancel={handleCancel} isEditing={!!editingId} />
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#001f54] h-16 md:h-24 w-full border-t border-white/10 flex items-center justify-center">
        <div className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
          Secretaria de Educação • Governo de Pernambuco
        </div>
      </footer>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-left: 1px solid #e2e8f0; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; border: 3px solid #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default App;
