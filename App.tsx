
import React, { useState, useEffect } from 'react';
import { FIELD_LABELS, FIELDS } from './constants';
import { TransportRequest } from './types';
import TransportForm from './components/TransportForm';
import TransportTable from './components/TransportTable';
import Header from './components/Header';
import StepByStep from './components/StepByStep';
import ExcelJS from 'exceljs';

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const formatDateBR = (dateStr: string) => {
  if (!dateStr || dateStr === '-' || !dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
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
    const saved = localStorage.getItem('transport_requests_v2');
    if (saved) {
      try {
        setRequests(JSON.parse(saved));
      } catch (e) {
        setRequests([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transport_requests_v2', JSON.stringify(requests));
  }, [requests]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setRequests(prev => prev.map(r => r.id === editingId ? { ...formData, id: editingId } as TransportRequest : r));
      setEditingId(null);
    } else {
      setRequests(prev => [...prev, { ...formData, id: generateId() } as TransportRequest]);
    }
    setFormData({});
    setShowForm(false);
  };

  const confirmDelete = () => {
    if (idToDelete) {
      setRequests(prev => prev.filter(r => r.id !== idToDelete));
      setIdToDelete(null);
    }
  };

  const handleDuplicate = (request: TransportRequest) => {
    setRequests(prev => [...prev, { ...request, id: generateId() }]);
  };

  const handleEdit = (request: TransportRequest) => {
    setFormData({ ...request });
    setEditingId(request.id);
    setShowForm(true);
  };

  const handleExportExcel = async () => {
    if (requests.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Solicitações');
    
    // REMOVER LINHAS DE GRADE
    worksheet.views = [{ showGridLines: false }];
    
    const totalCols = FIELD_LABELS.length;
    const lastColLetter = worksheet.getColumn(totalCols).letter;
    worksheet.mergeCells(`A1:${lastColLetter}6`);
    
    const bannerCell = worksheet.getCell('A1');
    bannerCell.value = {
      richText: [
        { text: '  SECRETARIA DE EDUCAÇÃO | GOVERNO DE PERNAMBUCO', font: { bold: true, size: 22, color: { argb: 'FFFFFFFF' }, name: 'Arial' } },
        { text: '\n  Solicitação de Transporte (Fretamento)', font: { bold: true, size: 18, color: { argb: 'FFFFFFFF' }, name: 'Arial' } }
      ]
    };
    bannerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF001F54' } };
    bannerCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    const headerRow = worksheet.getRow(8);
    headerRow.height = 35;
    FIELD_LABELS.forEach((label, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = label;
      const bgColor = (label === 'Caso o Setor for Outros, Informe Aqui' || label.startsWith('PARADA')) ? 'FFFFFF00' : 'FFD3D3D3';
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.font = { bold: true, size: 10, name: 'Arial' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    requests.forEach((req, idx) => {
      const row = worksheet.getRow(idx + 9);
      FIELDS.forEach((field, fIdx) => {
        const cell = row.getCell(fIdx + 1);
        let value = req[field.id] || '';
        if (field.label.includes('Data')) value = formatDateBR(value);
        cell.value = value || '-';
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        cell.font = { size: 10, name: 'Arial' };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    });

    // AJUSTE AUTOMÁTICO DE COLUNAS (APRIMORADO)
    if (worksheet.columns) {
      worksheet.columns.forEach((column, i) => {
        if (i >= totalCols) return;
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          // Explicitly convert cell.row to number to fix comparison errors with string vs number
          const rowNum = Number(cell.row);
          if (rowNum < 8) return; // Ignora o banner mas inclui o cabeçalho (linha 8)
          
          const columnValue = cell.value ? cell.value.toString() : '';
          // Considera que textos em negrito (header) ocupam mais espaço
          const cellLength = rowNum === 8 ? columnValue.length * 1.2 : columnValue.length;
          maxLength = Math.max(maxLength, cellLength);
        });
        // Largura mínima de 15, máxima de 100, com margem de segurança de 5
        column.width = Math.min(100, Math.max(15, maxLength + 5));
      });
    }

    const sanitizedPeriod = (requests[0]?.col_9 || 'GERAL').replace(/[\\/:*?"<>|]/g, '-');
    const fileName = `Solicitação de Transporte - ${sanitizedPeriod.toUpperCase()}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      <Header onOpenManual={() => setShowManual(true)} />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-2xl font-black text-[#001f54] flex items-center gap-3">
            <span className="w-1.5 h-8 bg-yellow-400 rounded-full"></span>
            GERENCIAMENTO LOCAL
          </h2>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => { setEditingId(null); setFormData({}); setShowForm(true); }} className="flex-1 md:flex-none bg-[#001f54] hover:bg-[#002d7a] text-white px-8 py-3 rounded-lg font-bold shadow-xl transition-all flex items-center justify-center gap-2 transform hover:scale-105">
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
          <TransportTable requests={requests} onEdit={handleEdit} onDelete={setIdToDelete} onDuplicate={handleDuplicate} onAddNew={() => setShowForm(true)} />
        </div>
      </main>

      <StepByStep isOpen={showManual} onClose={() => setShowManual(false)} />

      {idToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIdToDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
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
              <button onClick={() => setIdToDelete(null)} className="flex-1 px-6 py-4 font-bold text-slate-500 hover:bg-slate-50 transition-colors border-r">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 px-6 py-4 font-bold text-red-500 hover:bg-red-50 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-[#001f54]/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-8 py-5 border-b flex justify-between items-center">
              <h3 className="font-black text-gray-500 uppercase tracking-widest">{editingId ? 'Editar Solicitação' : 'Nova Solicitação'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-red-500"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
              <TransportForm formData={formData} onChange={handleInputChange} onSave={handleSave} onCancel={() => setShowForm(false)} isEditing={!!editingId} />
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#001f54] h-12 flex items-center justify-center"></footer>
    </div>
  );
};

export default App;
