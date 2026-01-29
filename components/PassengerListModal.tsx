
import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { Passenger } from '../types';

interface PassengerListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const maskCPF = (value: string) => {
  let v = value.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);
  if (v.length > 9) {
    v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  } else if (v.length > 6) {
    v = v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  } else if (v.length > 3) {
    v = v.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  }
  return v;
};

const formatDateBR = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const PassengerListModal: React.FC<PassengerListModalProps> = ({ isOpen, onClose }) => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [headerData, setHeaderData] = useState({
    processNumber: '',
    departureDate: '',
    returnDate: '',
    originCity: '',
    destinationCity: ''
  });

  const PASSENGER_LIMIT = 50;

  useEffect(() => {
    if (isOpen) {
      setPassengers([{ id: Math.random().toString(36).substring(2, 9), name: '', cpf: '' }]);
      setIsPreview(false);
      setHeaderData({
        processNumber: '',
        departureDate: '',
        returnDate: '',
        originCity: '',
        destinationCity: ''
      });
    }
  }, [isOpen]);

  const addPassenger = () => {
    if (passengers.length < PASSENGER_LIMIT) {
      const newPassenger: Passenger = {
        id: Math.random().toString(36).substring(2, 9),
        name: '',
        cpf: ''
      };
      setPassengers([...passengers, newPassenger]);
    }
  };

  const removePassenger = (id: string) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter(p => p.id !== id));
    }
  };

  const updatePassenger = (id: string, field: keyof Passenger, value: string) => {
    setPassengers(passengers.map(p => 
      p.id === id ? { ...p, [field]: field === 'cpf' ? maskCPF(value) : value.toUpperCase() } : p
    ));
  };

  const handleHeaderChange = (field: string, value: string) => {
    setHeaderData(prev => ({ ...prev, [field]: value.toUpperCase() }));
  };

  const handleExportExcel = async () => {
    if (passengers.length === 0) return;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Lista de Passageiros');
    worksheet.views = [{ showGridLines: false }];

    const borderThin: Partial<ExcelJS.Borders> = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

    // TÍTULO DO CABEÇALHO (BANNER AZUL ESCURO)
    worksheet.mergeCells('A1:C1');
    const titleRow = worksheet.getRow(1);
    titleRow.height = 35;
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'LISTA DE PASSAGEIROS - FRETAMENTO';
    titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' }, name: 'Arial' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF001F54' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.border = borderThin as ExcelJS.Borders;

    // BLOCO DE INFORMAÇÕES DO PROCESSO (LINHA 2)
    worksheet.mergeCells('A2:C2');
    const processRow = worksheet.getRow(2);
    processRow.height = 25;
    const processInfoCell = worksheet.getCell('A2');
    processInfoCell.value = `PROCESSO: ${headerData.processNumber || '-'}   |   SAÍDA: ${formatDateBR(headerData.departureDate) || '-'}   |   RETORNO: ${formatDateBR(headerData.returnDate) || '-'}`;
    processInfoCell.font = { bold: true, size: 10, name: 'Arial' };
    processInfoCell.alignment = { vertical: 'middle', horizontal: 'center' };
    processInfoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    processInfoCell.border = borderThin as ExcelJS.Borders;

    // BLOCO DE ORIGEM E DESTINO (LINHA 3)
    worksheet.mergeCells('A3:C3');
    const routeRow = worksheet.getRow(3);
    routeRow.height = 25;
    const routeInfoCell = worksheet.getCell('A3');
    routeInfoCell.value = `ORIGEM: ${headerData.originCity || '-'}   |   DESTINO: ${headerData.destinationCity || '-'}`;
    routeInfoCell.font = { bold: true, size: 10, name: 'Arial' };
    routeInfoCell.alignment = { vertical: 'middle', horizontal: 'center' };
    routeInfoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } };
    routeInfoCell.border = borderThin as ExcelJS.Borders;

    // ESPAÇO EM BRANCO (LINHA 4)
    worksheet.getRow(4).height = 10;

    // CABEÇALHO DA TABELA (AZUL BRILHANTE)
    const tableHeaderRow = worksheet.getRow(5);
    tableHeaderRow.height = 25;
    tableHeaderRow.values = ['Nº', 'NOME COMPLETO', 'CPF'];
    
    ['A', 'B', 'C'].forEach(col => {
      const cell = tableHeaderRow.getCell(col);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Arial', size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0ea5e9' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = borderThin as ExcelJS.Borders;
    });

    // DADOS DOS PASSAGEIROS
    passengers.forEach((p, index) => {
      const rowNum = index + 6;
      const row = worksheet.getRow(rowNum);
      row.height = 22;
      row.values = [index + 1, p.name || '-', p.cpf || '-'];
      
      ['A', 'B', 'C'].forEach(col => {
        const cell = row.getCell(col);
        cell.font = { name: 'Arial', size: 10 };
        cell.alignment = { vertical: 'middle', horizontal: col === 'B' ? 'left' : 'center' };
        cell.border = borderThin as ExcelJS.Borders;
        if (index % 2 !== 0) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        }
      });
    });

    // AJUSTE DAS COLUNAS
    worksheet.getColumn('A').width = 8;
    worksheet.getColumn('B').width = 65;
    worksheet.getColumn('C').width = 25;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const origin = headerData.originCity || 'ORIGEM';
    const dest = headerData.destinationCity || 'DESTINO';
    a.download = `Listas de Passageiros - ${origin} x ${dest}.xlsx`;
    
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#001f54]/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Header Modal */}
        <div className="bg-[#001f54] text-white px-8 py-5 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black uppercase tracking-tight">
              {isPreview ? 'Visualização da Lista' : 'Criar Lista de Passageiros'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Informações do Processo - Grid ajustado para 6 colunas para dar mais espaço ao processo */}
        <div className="bg-slate-50 border-b p-6 grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-500 uppercase">Nº do Processo</label>
            <input 
              type="text" 
              readOnly={isPreview}
              value={headerData.processNumber}
              onChange={(e) => handleHeaderChange('processNumber', e.target.value)}
              className={`px-4 py-2 border rounded-lg text-sm font-bold outline-none transition-all w-full ${isPreview ? 'bg-slate-100 border-transparent' : 'bg-white border-slate-200 focus:ring-2 focus:ring-sky-500'}`}
              placeholder="PROCESSO SEI"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase">Data Saída</label>
            <input 
              type="date" 
              readOnly={isPreview}
              value={headerData.departureDate}
              onChange={(e) => handleHeaderChange('departureDate', e.target.value)}
              className={`px-3 py-2 border rounded-lg text-sm font-bold outline-none transition-all ${isPreview ? 'bg-slate-100 border-transparent' : 'bg-white border-slate-200 focus:ring-2 focus:ring-sky-500'}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase">Data Retorno</label>
            <input 
              type="date" 
              readOnly={isPreview}
              value={headerData.returnDate}
              onChange={(e) => handleHeaderChange('returnDate', e.target.value)}
              className={`px-3 py-2 border rounded-lg text-sm font-bold outline-none transition-all ${isPreview ? 'bg-slate-100 border-transparent' : 'bg-white border-slate-200 focus:ring-2 focus:ring-sky-500'}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase">Cidade Origem</label>
            <input 
              type="text" 
              readOnly={isPreview}
              value={headerData.originCity}
              onChange={(e) => handleHeaderChange('originCity', e.target.value)}
              className={`px-3 py-2 border rounded-lg text-sm font-bold outline-none transition-all ${isPreview ? 'bg-slate-100 border-transparent' : 'bg-white border-slate-200 focus:ring-2 focus:ring-sky-500'}`}
              placeholder="ORIGEM"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black text-slate-500 uppercase">Cidade Destino</label>
            <input 
              type="text" 
              readOnly={isPreview}
              value={headerData.destinationCity}
              onChange={(e) => handleHeaderChange('destinationCity', e.target.value)}
              className={`px-3 py-2 border rounded-lg text-sm font-bold outline-none transition-all ${isPreview ? 'bg-slate-100 border-transparent' : 'bg-white border-slate-200 focus:ring-2 focus:ring-sky-500'}`}
              placeholder="DESTINO"
            />
          </div>
        </div>

        {/* Tabela de Nomes */}
        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left border-b pb-2">
                <th className="pb-3 w-16 text-center">Nº</th>
                <th className="pb-3 pl-4">NOME COMPLETO</th>
                <th className="pb-3 pl-4">CPF</th>
                {!isPreview && <th className="pb-3 w-12"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {passengers.map((p, index) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 text-center">
                    <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500 mx-auto">
                      {(index + 1).toString().padStart(2, '0')}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text" 
                      readOnly={isPreview}
                      value={p.name}
                      onChange={(e) => updatePassenger(p.id, 'name', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg text-sm font-bold uppercase outline-none transition-all ${isPreview ? 'bg-transparent border-transparent' : 'bg-white border-slate-200 focus:ring-2 focus:ring-sky-500'}`}
                      placeholder="NOME COMPLETO"
                    />
                  </td>
                  <td className="py-3 px-2">
                    <input 
                      type="text" 
                      readOnly={isPreview}
                      placeholder="000.000.000-00"
                      value={p.cpf}
                      onChange={(e) => updatePassenger(p.id, 'cpf', e.target.value)}
                      className={`w-full px-4 py-2 border rounded-lg text-sm font-bold outline-none transition-all ${isPreview ? 'bg-transparent border-transparent' : 'bg-white border-slate-200 focus:ring-2 focus:ring-sky-500'}`}
                    />
                  </td>
                  {!isPreview && (
                    <td className="py-3 text-center">
                      <button 
                        onClick={() => removePassenger(p.id)} 
                        className={`p-2 transition-colors ${passengers.length > 1 ? 'text-slate-300 hover:text-red-500' : 'text-slate-100 cursor-not-allowed'}`}
                        disabled={passengers.length <= 1}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          
          {!isPreview && (
            <div className="pt-8 flex flex-col items-center gap-2">
              <button 
                onClick={addPassenger}
                disabled={passengers.length >= PASSENGER_LIMIT}
                className={`flex items-center gap-2 px-10 py-3 rounded-lg text-xs font-black transition-all uppercase shadow-lg ${
                  passengers.length >= PASSENGER_LIMIT 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-[#0ea5e9] text-white hover:bg-[#0284c7] active:scale-95 shadow-sky-500/20'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                Adicionar Passageiro ({passengers.length}/{PASSENGER_LIMIT})
              </button>
              {passengers.length >= PASSENGER_LIMIT && (
                <span className="text-[10px] text-red-500 font-bold uppercase animate-bounce">Limite máximo de 50 atingido</span>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shadow-inner">
          <button onClick={onClose} className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-lg font-bold text-xs uppercase hover:bg-slate-50 transition-all">
            Fechar
          </button>
          <button 
            onClick={handleExportExcel}
            disabled={passengers.length === 0}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-bold text-xs uppercase hover:bg-green-700 transition-all disabled:opacity-50 shadow-lg active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Exportar Excel
          </button>
          <button 
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center justify-center gap-2 px-10 py-3 bg-[#001f54] text-white rounded-lg font-bold text-xs uppercase hover:bg-[#002d7a] transition-all shadow-lg active:scale-95"
          >
             {isPreview ? 'Voltar para Edição' : 'Visualizar Lista'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PassengerListModal;
