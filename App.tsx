
import React, { useState, useEffect } from 'react';
import { FIELD_LABELS, FIELDS } from './constants';
import { TransportRequest } from './types';
import TransportForm from './components/TransportForm';
import TransportTable from './components/TransportTable';
import Header from './components/Header';
import ExcelJS from 'exceljs';

const App: React.FC = () => {
  const [requests, setRequests] = useState<TransportRequest[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<TransportRequest>>({});

  useEffect(() => {
    const saved = localStorage.getItem('transport_requests');
    if (saved) {
      setRequests(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('transport_requests', JSON.stringify(requests));
  }, [requests]);

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setRequests(prev => prev.map(r => r.id === editingId ? { ...r, ...formData } as TransportRequest : r));
      setEditingId(null);
    } else {
      const newRequest: TransportRequest = {
        id: crypto.randomUUID(),
        ...formData
      } as TransportRequest;
      setRequests(prev => [...prev, newRequest]);
    }
    setFormData({});
    setShowForm(false);
  };

  const handleEdit = (request: TransportRequest) => {
    setFormData(request);
    setEditingId(request.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta solicitação?')) {
      setRequests(prev => prev.filter(r => r.id !== id));
    }
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
        { 
          text: 'SECRETARIA DE EDUCAÇÃO | GOVERNO DE PERNAMBUCO', 
          font: { bold: true, size: 22, color: { argb: 'FFFFFFFF' }, name: 'Arial' } 
        },
        { 
          text: '                                                         ', 
          font: { size: 22, name: 'Arial' } 
        },
        { 
          text: 'Solicitação de Transporte (Fretamento)', 
          font: { bold: true, size: 22, color: { argb: 'FFFFFFFF' }, name: 'Arial' } 
        }
      ]
    };
    
    bannerCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF001F54' }
    };
    
    bannerCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 2 };

    const headerRow = worksheet.getRow(8);
    headerRow.height = 35;
    
    FIELD_LABELS.forEach((label, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.value = label;
      
      let bgColor = 'FFD3D3D3';
      if (label === 'CASO O SETOR DO SOLICITANTE FOR OUTROS, INFORME AQUI' || label.startsWith('PARADA')) {
        bgColor = 'FFFFFF00';
      }

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor }
      };

      cell.font = { 
        bold: true, 
        size: 10, 
        name: 'Arial', 
        color: { argb: 'FF000000' } 
      };
      
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
    });

    requests.forEach((req, idx) => {
      const row = worksheet.getRow(idx + 9);
      row.height = 20;
      FIELDS.forEach((field, fIdx) => {
        const cell = row.getCell(fIdx + 1);
        cell.value = req[field.id] || '';
        
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: false };
        cell.font = { size: 10, name: 'Arial' };
      });
    });

    worksheet.columns.forEach((column, i) => {
      let maxColumnLength = 0;
      const headerValue = FIELD_LABELS[i];
      const headerLength = headerValue ? headerValue.length : 0;
      maxColumnLength = headerLength;

      column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber >= 8) {
          const cellValue = cell.value ? cell.value.toString() : '';
          const cellLength = cellValue.length;
          if (cellLength > maxColumnLength) {
            maxColumnLength = cellLength;
          }
        }
      });
      column.width = maxColumnLength < 12 ? 15 : (maxColumnLength * 1.15) + 4;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `SOLICITACAO_FRETAMENTO_PE_${new Date().toISOString().split('T')[0]}.xlsx`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-[#001f54] flex items-center gap-3">
              <span className="w-1.5 h-8 bg-yellow-400 rounded-full"></span>
              {editingId ? 'EDITAR REGISTRO' : 'PAINEL DE GERENCIAMENTO'}
            </h2>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            {!showForm && (
              <button
                onClick={handleAddNew}
                className="flex-1 md:flex-none bg-[#001f54] hover:bg-[#002d7a] text-white px-8 py-3 rounded-lg font-bold shadow-xl transition-all flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                NOVA SOLICITAÇÃO
              </button>
            )}
            <button 
              onClick={handleExportExcel} 
              disabled={requests.length === 0}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-all shadow-lg ${
                requests.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white transform hover:scale-105'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              BAIXAR EXCEL
            </button>
          </div>
        </div>

        {showForm && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-6 duration-500">
            <div className="bg-white rounded-2xl shadow-2xl border-t-8 border-[#001f54] p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-[#001f54] uppercase tracking-wider">
                  {editingId ? 'Edição de Dados' : 'Novo Cadastro de Transporte'}
                </h3>
                <button onClick={handleCancel} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-400 hover:text-red-500 transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <TransportForm 
                formData={formData} 
                onChange={handleInputChange} 
                onSave={handleSave}
                onCancel={handleCancel}
                isEditing={!!editingId}
              />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden mb-12">
          <TransportTable 
            requests={requests} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
            onAddNew={handleAddNew}
          />
        </div>
      </main>

      {/* RODAPÉ APENAS RETÂNGULO AZUL */}
      <footer className="bg-[#001f54] h-16 md:h-24 w-full border-t border-white/10">
        <div className="container mx-auto h-full">
          {/* Conteúdo removido conforme solicitado */}
        </div>
      </footer>
    </div>
  );
};

export default App;
