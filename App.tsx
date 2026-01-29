
import React, { useState, useEffect } from 'react';
import { FIELD_LABELS, FIELDS } from './constants';
import { TransportRequest } from './types';
import TransportForm from './components/TransportForm';
import TransportTable from './components/TransportTable';
import Header from './components/Header';
import StepByStep from './components/StepByStep';
import PassengerListModal from './components/PassengerListModal';
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
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [formData, setFormData] = useState<Partial<TransportRequest>>({});
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    const savedReqs = localStorage.getItem('transport_requests_v2');
    if (savedReqs) {
      try { setRequests(JSON.parse(savedReqs)); } catch (e) { setRequests([]); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transport_requests_v2', JSON.stringify(requests));
  }, [requests]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSaveRequest = (e: React.FormEvent) => {
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

  const handleExportExcel = async () => {
    if (requests.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Solicitações');
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
    for (let i = 1; i <= totalCols; i++) {
      const column = worksheet.getColumn(i);
      let maxColumnWidth = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const rowNum = Number(cell.row);
        if (rowNum < 8) return; 
        if (cell.value) {
          const content = cell.value.toString();
          const scaleFactor = rowNum === 8 ? 1.4 : 1.15;
          const cellContentWidth = content.length * scaleFactor;
          if (cellContentWidth > maxColumnWidth) maxColumnWidth = cellContentWidth;
        }
      });
      column.width = Math.max(15, maxColumnWidth + 4);
    }
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    
    // Lógica de Nome de Arquivo Dinâmico
    const firstReq = requests[0];
    const eventName = (firstReq?.col_8 || '').toString().trim();
    const eventPeriod = (firstReq?.col_9 || '').toString().trim();
    
    let baseFilename = "Solicitação de Transporte";
    if (eventName && eventPeriod) {
      baseFilename = `Solicitação de Transporte - ${eventName} - ${eventPeriod}`;
    } else if (eventName) {
      baseFilename = `Solicitação de Transporte - ${eventName}`;
    } else if (eventPeriod) {
      baseFilename = `Solicitação de Transporte - ${eventPeriod}`;
    } else {
      baseFilename = `Solicitação de Transporte - ${new Date().getTime()}`;
    }

    // Sanitização para evitar erros de caracteres inválidos em nomes de arquivos
    const safeFilename = baseFilename.replace(/[/\\?%*:|"<>]/g, '-');
    anchor.download = `${safeFilename}.xlsx`;
    
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      <Header 
        onOpenManual={() => setShowManual(true)} 
        onOpenPassengerList={() => setShowPassengerModal(true)}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-8 bg-yellow-400 rounded-full"></span>
            <h2 className="text-2xl font-black text-[#001f54] uppercase">
              SOLICITAÇÕES DE TRANSPORTE
            </h2>
            {requests.length > 0 && (
              <div className="flex items-center gap-2 bg-sky-100 text-sky-700 px-3 py-1.5 rounded-full border border-sky-200 animate-in fade-in zoom-in duration-300">
                <span className="text-[10px] font-black uppercase tracking-wider">Total:</span>
                <span className="text-sm font-black">{requests.length}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={() => { setEditingId(null); setFormData({}); setShowForm(true); }} className="flex-1 md:flex-none bg-[#001f54] hover:bg-[#002d7a] text-white px-8 py-3 rounded-lg font-bold shadow-xl transition-all flex items-center justify-center gap-2 transform hover:scale-105 uppercase text-xs">
              NOVA SOLICITAÇÃO
            </button>
            
            <button 
              onClick={handleExportExcel} 
              disabled={requests.length === 0} 
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg text-xs uppercase ${
                requests.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 transform hover:scale-105 shadow-green-500/20 active:scale-95'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              BAIXAR SOLICITAÇÃO
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-16">
          <TransportTable requests={requests} onEdit={(r) => { setFormData(r); setEditingId(r.id); setShowForm(true); }} onDelete={setIdToDelete} onDuplicate={(r) => setRequests(p => [...p, {...r, id: generateId()}])} onAddNew={() => setShowForm(true)} />
        </div>
      </main>

      <StepByStep isOpen={showManual} onClose={() => setShowManual(false)} />
      
      <PassengerListModal 
        isOpen={showPassengerModal} 
        onClose={() => setShowPassengerModal(false)} 
      />

      {idToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIdToDelete(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center">
            <h3 className="text-xl font-bold mb-4">Confirmar Exclusão</h3>
            <p className="text-slate-500 mb-6">Deseja realmente excluir esta solicitação?</p>
            <div className="flex gap-3">
              <button onClick={() => setIdToDelete(null)} className="flex-1 py-3 font-bold text-slate-500 bg-slate-50 rounded-lg">Cancelar</button>
              <button onClick={() => { setRequests(p => p.filter(r => r.id !== idToDelete)); setIdToDelete(null); }} className="flex-1 py-3 font-bold text-white bg-red-500 rounded-lg">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#001f54]/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-8 py-5 border-b flex justify-between items-center">
              <h3 className="font-black text-gray-500 uppercase tracking-widest">{editingId ? 'Editar Solicitação' : 'Nova Solicitação'}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 text-gray-400 hover:text-red-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
              <TransportForm formData={formData} onChange={handleInputChange} onSave={handleSaveRequest} onCancel={() => setShowForm(false)} isEditing={!!editingId} />
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#001f54] h-12 flex items-center justify-center"></footer>
    </div>
  );
};

export default App;
