import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Passenger } from '../types';
import { SETOR_OPTIONS } from '../constants';

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

const maskPhone = (value: string) => {
  if (!value) return "";
  const v = value.replace(/\D/g, "");
  if (v.length === 0) return "";
  
  if (v.length > 7) {
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7, 11)}`;
  } else if (v.length > 2) {
    return `(${v.slice(0, 2)}) ${v.slice(2)}`;
  } else if (v.length > 0) {
    return `(${v}`;
  }
  return v;
};

const formatDateBR = (dateStr: string) => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const PassengerListModal: React.FC<PassengerListModalProps> = ({ isOpen, onClose }) => {
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [headerData, setHeaderData] = useState({
    requestingSector: '',
    departureDate: '',
    returnDate: '',
    originCity: '',
    originLocation: '',
    destinationCity: '',
    destinationLocation: '',
    responsibleName: '',
    responsibleContact: ''
  });

  const PASSENGER_LIMIT = 50;

  useEffect(() => {
    if (isOpen) {
      setPassengers([{ id: Math.random().toString(36).substring(2, 9), name: '', cpf: '' }]);
      setHeaderData({
        requestingSector: '',
        departureDate: '',
        returnDate: '',
        originCity: '',
        originLocation: '',
        destinationCity: '',
        destinationLocation: '',
        responsibleName: '',
        responsibleContact: ''
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
      setPassengers(prev => [...prev, newPassenger]);
    }
  };

  const removePassenger = (id: string) => {
    if (passengers.length > 1) {
      setPassengers(prev => prev.filter(p => p.id !== id));
    }
  };

  const updatePassenger = (id: string, field: keyof Passenger, value: string) => {
    setPassengers(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: field === 'cpf' ? maskCPF(value) : value.toUpperCase() } : p
    ));
  };

  const handleHeaderChange = (field: string, value: string) => {
    let finalValue = value;
    if (field === 'responsibleContact') {
      const digits = value.replace(/\D/g, "");
      finalValue = digits === "" ? "" : maskPhone(value);
    } else if (['requestingSector', 'departureDate', 'returnDate'].includes(field)) {
      finalValue = value;
    } else {
      finalValue = value.toUpperCase();
    }
    setHeaderData(prev => ({ ...prev, [field]: finalValue }));
  };

  const getSectorLabel = () => {
    let sectorLabel = headerData.requestingSector || '-';
    if (sectorLabel.includes('GETRA - Gerência de Transportes')) {
      sectorLabel = 'GETRA';
    } else if (sectorLabel.includes(' - ')) {
      sectorLabel = sectorLabel.split(' - ')[0].trim();
    }
    return sectorLabel;
  };

  const handleExportExcel = async () => {
    if (!passengers || passengers.length === 0) {
      alert("A lista de passageiros está vazia.");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Lista de Passageiros');
      worksheet.views = [{ showGridLines: false }];

      const borderThin: any = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      };

      const darkBlueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF001F54' } };
      const lightBlueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0EA5E9' } };

      worksheet.getColumn('A').width = 5.29;
      worksheet.getColumn('B').width = 73.14;
      worksheet.getColumn('C').width = 21.57;

      const sectorLabel = getSectorLabel();
      const fontBold = { bold: true, name: 'Arial', size: 10 };
      const fontNormal = { bold: false, name: 'Arial', size: 10 };

      worksheet.mergeCells('A1:C1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'LISTA DE PASSAGEIROS';
      titleCell.font = { bold: true, size: 16, color: { argb: 'FFFFFFFF' }, name: 'Arial' };
      titleCell.fill = darkBlueFill as ExcelJS.Fill;
      titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
      titleCell.border = borderThin;
      worksheet.getRow(1).height = 40;

      worksheet.mergeCells('A2:C2');
      const cellA2 = worksheet.getCell('A2');
      cellA2.value = {
        richText: [
          { text: 'SETOR: ', font: fontBold },
          { text: sectorLabel + '  |  ', font: fontNormal },
          { text: 'RESPONSÁVEL: ', font: fontBold },
          { text: (headerData.responsibleName || '-') + '  |  ', font: fontNormal },
          { text: 'CONTATO: ', font: fontBold },
          { text: headerData.responsibleContact || '-', font: fontNormal }
        ]
      };
      cellA2.alignment = { vertical: 'middle', horizontal: 'center' };
      cellA2.border = borderThin;
      worksheet.getRow(2).height = 25;

      worksheet.mergeCells('A3:C3');
      const cellA3 = worksheet.getCell('A3');
      cellA3.value = {
        richText: [
          { text: 'SAÍDA: ', font: fontBold },
          { text: (formatDateBR(headerData.departureDate) || '-') + '  |  ', font: fontNormal },
          { text: 'DE: ', font: fontBold },
          { text: (headerData.originCity || '-') + ' (' + (headerData.originLocation || '-') + ')', font: fontNormal }
        ]
      };
      cellA3.alignment = { vertical: 'middle', horizontal: 'center' };
      cellA3.border = borderThin;
      worksheet.getRow(3).height = 25;

      worksheet.mergeCells('A4:C4');
      const cellA4 = worksheet.getCell('A4');
      cellA4.value = {
        richText: [
          { text: 'RETORNO: ', font: fontBold },
          { text: (formatDateBR(headerData.returnDate) || '-') + '  |  ', font: fontNormal },
          { text: 'PARA: ', font: fontBold },
          { text: (headerData.destinationCity || '-') + ' (' + (headerData.destinationLocation || '-') + ')', font: fontNormal }
        ]
      };
      cellA4.alignment = { vertical: 'middle', horizontal: 'center' };
      cellA4.border = borderThin;
      worksheet.getRow(4).height = 25;

      worksheet.getRow(5).height = 10;

      const headerRow = worksheet.getRow(6);
      headerRow.height = 30;
      headerRow.values = ['Nº', 'NOME COMPLETO', 'CPF'];
      [1, 2, 3].forEach(col => {
        const cell = headerRow.getCell(col);
        cell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' }, name: 'Arial' };
        cell.fill = lightBlueFill as ExcelJS.Fill;
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
        cell.border = borderThin;
      });

      passengers.forEach((p, index) => {
        const rowNum = index + 7;
        const row = worksheet.getRow(rowNum);
        row.height = 22;
        const seqNum = (index + 1).toString().padStart(2, '0');
        row.values = [seqNum, p.name || '-', p.cpf || '-'];
        
        [1, 2, 3].forEach(col => {
          const cell = row.getCell(col);
          cell.font = { name: 'Arial', size: 10 };
          cell.alignment = { vertical: 'middle', horizontal: col === 2 ? 'left' : 'center' };
          cell.border = borderThin;
          if (index % 2 !== 0) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          }
        });
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LISTA_DE_PASSAGEIROS_${headerData.originCity || 'FRETAMENTO'}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error("Erro na exportação Excel:", error);
      alert("Houve um erro ao processar o arquivo Excel.");
    }
  };

  const handleExportPDF = () => {
    if (!passengers || passengers.length === 0) {
      alert("A lista de passageiros está vazia.");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const sectorLabel = getSectorLabel();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Título
      doc.setFillColor(0, 31, 84); // Azul Escuro
      doc.rect(10, 10, pageWidth - 20, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('LISTA DE PASSAGEIROS', pageWidth / 2, 20, { align: 'center' });

      // Sub-cabeçalho
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);

      // Função auxiliar para desenhar texto rico (misto negrito/normal) centralizado
      const drawMixedText = (parts: { text: string; bold: boolean }[], y: number) => {
        let totalWidth = 0;
        parts.forEach(p => {
          doc.setFont('helvetica', p.bold ? 'bold' : 'normal');
          totalWidth += doc.getTextWidth(p.text);
        });

        let currentX = (pageWidth - totalWidth) / 2;
        parts.forEach(p => {
          doc.setFont('helvetica', p.bold ? 'bold' : 'normal');
          doc.text(p.text, currentX, y);
          currentX += doc.getTextWidth(p.text);
        });
      };
      
      // Linha 2: SETOR | RESPONSÁVEL | CONTATO
      doc.rect(10, 25, pageWidth - 20, 10);
      drawMixedText([
        { text: 'SETOR: ', bold: true },
        { text: sectorLabel + '  |  ', bold: false },
        { text: 'RESPONSÁVEL: ', bold: true },
        { text: (headerData.responsibleName || '-') + '  |  ', bold: false },
        { text: 'CONTATO: ', bold: true },
        { text: headerData.responsibleContact || '-', bold: false }
      ], 31.5);

      // Linha 3: SAÍDA | DE
      doc.rect(10, 35, pageWidth - 20, 10);
      drawMixedText([
        { text: 'SAÍDA: ', bold: true },
        { text: (formatDateBR(headerData.departureDate) || '-') + '  |  ', bold: false },
        { text: 'DE: ', bold: true },
        { text: (headerData.originCity || '-') + ' (' + (headerData.originLocation || '-') + ')', bold: false }
      ], 41.5);

      // Linha 4: RETORNO | PARA
      doc.rect(10, 45, pageWidth - 20, 10);
      drawMixedText([
        { text: 'RETORNO: ', bold: true },
        { text: (formatDateBR(headerData.returnDate) || '-') + '  |  ', bold: false },
        { text: 'PARA: ', bold: true },
        { text: (headerData.destinationCity || '-') + ' (' + (headerData.destinationLocation || '-') + ')', bold: false }
      ], 51.5);

      // Tabela de Passageiros
      const tableData = passengers.map((p, index) => [
        (index + 1).toString().padStart(2, '0'),
        p.name || '-',
        p.cpf || '-'
      ]);

      autoTable(doc, {
        startY: 60,
        head: [['Nº', 'NOME COMPLETO', 'CPF']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [14, 165, 233], // Azul Claro
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { halign: 'left' },
          2: { halign: 'center', cellWidth: 40 }
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
          font: 'helvetica'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        }
      });

      doc.save(`LISTA_DE_PASSAGEIROS_${headerData.originCity || 'FRETAMENTO'}.pdf`);
    } catch (error) {
      console.error("Erro na exportação PDF:", error);
      alert("Houve um erro ao processar o arquivo PDF.");
    }
  };

  if (!isOpen) return null;

  const labelClass = "text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 block font-['Inter']";
  const commonInputClass = "px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold font-['Inter'] outline-none transition-all focus:ring-2 focus:ring-sky-500 bg-white text-slate-700 shadow-sm disabled:bg-slate-50 disabled:border-slate-300 h-10";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-['Inter']">
      <div className="absolute inset-0 bg-[#001f54]/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#001f54] text-white px-8 py-5 flex justify-between items-center shadow-md z-30 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black uppercase tracking-tight font-['Inter']">
              Criar Lista de Passageiros
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-grow overflow-y-auto custom-scrollbar bg-white font-['Inter']">
          <div className="bg-slate-50 border-b p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="flex flex-col md:col-span-3">
                <label className={labelClass}>Setor do Solicitante</label>
                <select
                  value={headerData.requestingSector}
                  onChange={(e) => handleHeaderChange('requestingSector', e.target.value)}
                  className={`${commonInputClass} w-full appearance-none`}
                >
                  <option value="">SELECIONE O SETOR...</option>
                  {SETOR_OPTIONS && SETOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div className="flex flex-col md:col-span-6">
                <label className={labelClass}>Nome do Responsável</label>
                <input 
                  type="text" 
                  value={headerData.responsibleName}
                  onChange={(e) => handleHeaderChange('responsibleName', e.target.value)}
                  className={commonInputClass}
                />
              </div>
              <div className="flex flex-col md:col-span-3">
                <label className={labelClass}>Contato do Responsável</label>
                <input 
                  type="tel" 
                  value={headerData.responsibleContact}
                  onChange={(e) => handleHeaderChange('responsibleContact', e.target.value)}
                  placeholder="(00) 00000-0000"
                  className={commonInputClass}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm items-end">
              <div className="flex flex-col md:col-span-3">
                <label className={`${labelClass} text-slate-400`}>Data Saída</label>
                <input type="date" value={headerData.departureDate} onChange={(e) => handleHeaderChange('departureDate', e.target.value)} className={commonInputClass} />
              </div>
              <div className="flex flex-col md:col-span-4">
                <label className={`${labelClass} text-slate-400`}>Cidade Origem</label>
                <input type="text" value={headerData.originCity} onChange={(e) => handleHeaderChange('originCity', e.target.value)} className={commonInputClass} />
              </div>
              <div className="flex flex-col md:col-span-5">
                <label className={`${labelClass} text-slate-400`}>Local de Saída</label>
                <input type="text" value={headerData.originLocation} onChange={(e) => handleHeaderChange('originLocation', e.target.value)} className={commonInputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm items-end">
              <div className="flex flex-col md:col-span-3">
                <label className={`${labelClass} text-slate-400`}>Data Retorno</label>
                <input type="date" value={headerData.returnDate} onChange={(e) => handleHeaderChange('returnDate', e.target.value)} className={commonInputClass} />
              </div>
              <div className="flex flex-col md:col-span-4">
                <label className={`${labelClass} text-slate-400`}>Cidade Destino</label>
                <input type="text" value={headerData.destinationCity} onChange={(e) => handleHeaderChange('destinationCity', e.target.value)} className={commonInputClass} />
              </div>
              <div className="flex flex-col md:col-span-5">
                <label className={`${labelClass} text-slate-400`}>Local de Destino</label>
                <input type="text" value={headerData.destinationLocation} onChange={(e) => handleHeaderChange('destinationLocation', e.target.value)} className={commonInputClass} />
              </div>
            </div>
          </div>

          <div className="px-8 pt-8 pb-10">
            <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-left font-['Inter']">
                  <th className="pb-2 w-12 text-center">Nº</th>
                  <th className="pb-2 pl-4 w-[70%]">NOME COMPLETO</th>
                  <th className="pb-2 pl-4 w-[30%] text-left">CPF</th>
                  <th className="pb-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {passengers.map((p, index) => (
                  <tr key={p.id} className="group transition-all">
                    <td className="py-2 text-center align-middle">
                      <span className="inline-flex w-10 h-10 rounded-full bg-slate-50 items-center justify-center text-[11px] font-black text-slate-400 border border-slate-200">
                        {(index + 1).toString().padStart(2, '0')}
                      </span>
                    </td>
                    <td className="py-2 px-2">
                      <input 
                        type="text" 
                        value={p.name}
                        onChange={(e) => updatePassenger(p.id, 'name', e.target.value)}
                        placeholder="DIGITE O NOME COMPLETO"
                        className="w-full px-5 py-3 h-12 border border-slate-200 rounded-xl text-[13px] font-bold uppercase outline-none transition-all tracking-wide font-['Inter'] bg-white text-slate-900 focus:ring-4 focus:ring-sky-500/10 hover:border-sky-400 shadow-sm"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input 
                        type="text" 
                        placeholder="000.000.000-00"
                        value={p.cpf}
                        onChange={(e) => updatePassenger(p.id, 'cpf', e.target.value)}
                        className="w-full px-5 py-3 h-12 border border-slate-200 rounded-xl text-[13px] font-bold outline-none transition-all font-['Inter'] bg-white text-slate-900 focus:ring-4 focus:ring-sky-500/10 hover:border-sky-400 shadow-sm"
                      />
                    </td>
                    <td className="py-2 text-center align-middle">
                      <button 
                        onClick={() => removePassenger(p.id)} 
                        className={`p-2 rounded-lg transition-all ${passengers.length > 1 ? 'text-slate-300 hover:text-red-500 hover:bg-red-50' : 'text-slate-50 cursor-not-allowed'}`} 
                        disabled={passengers.length <= 1}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="py-8 flex flex-col items-center">
              <button 
                onClick={addPassenger} 
                disabled={passengers.length >= PASSENGER_LIMIT} 
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-[11px] font-black transition-all uppercase shadow-md active:scale-95 bg-[#0ea5e9] text-white hover:bg-[#0284c7]"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                Adicionar Passageiro ({passengers.length}/{PASSENGER_LIMIT})
              </button>
            </div>
          </div>

          {/* Action Button Footer */}
          <div className="p-8 border-t bg-slate-50 flex flex-wrap justify-end gap-3 shadow-inner rounded-b-2xl">
            <button onClick={onClose} className="px-8 py-3 bg-white border border-slate-200 text-slate-500 rounded-lg font-black text-[10px] uppercase hover:bg-slate-100 transition-all active:scale-95 shadow-sm font-['Inter']">Fechar Janela</button>
            
            <button 
              onClick={handleExportExcel} 
              disabled={passengers.length === 0} 
              className="flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg font-black text-[10px] uppercase hover:bg-green-700 transition-all shadow-lg active:scale-95 font-['Inter']"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              BAIXAR EXCEL
            </button>

            <button 
              onClick={handleExportPDF} 
              disabled={passengers.length === 0} 
              className="flex items-center justify-center gap-2 px-8 py-3 bg-red-600 text-white rounded-lg font-black text-[10px] uppercase hover:bg-red-700 transition-all shadow-lg active:scale-95 font-['Inter']"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              BAIXAR PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerListModal;