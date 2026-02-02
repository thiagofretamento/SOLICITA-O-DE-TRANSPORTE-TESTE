
import React from 'react';
import { TransportRequest } from '../types';
import { 
  FIELDS, 
  EXECUTIVA_OPTIONS, 
  SETOR_OPTIONS, 
  PROGRAMA_OPTIONS, 
  MODALIDADE_OPTIONS, 
  DISPONIBILIDADE_OPTIONS 
} from '../constants';
// Fix: Consolidate import casing for Icons
import { Icons } from './Icons';

interface Props {
  formData: Partial<TransportRequest>;
  onChange: (id: string, value: string) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const TransportForm: React.FC<Props> = ({ formData, onChange, onSave, onCancel, isEditing }) => {
  const renderField = (field: typeof FIELDS[0]) => {
    const commonClasses = "w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all";
    
    // Selects específicos
    if (field.id === 'col_4') {
      return (
        <select key={field.id} value={formData[field.id] || ''} onChange={(e) => onChange(field.id, e.target.value)} required={field.required} className={commonClasses}>
          <option value="">Selecione a Executiva...</option>
          {EXECUTIVA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (field.id === 'col_5') {
      return (
        <select key={field.id} value={formData[field.id] || ''} onChange={(e) => onChange(field.id, e.target.value)} required={field.required} className={commonClasses}>
          <option value="">Selecione o Setor...</option>
          {SETOR_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (field.id === 'col_7') {
      return (
        <select key={field.id} value={formData[field.id] || ''} onChange={(e) => onChange(field.id, e.target.value)} required={field.required} className={commonClasses}>
          <option value="">Selecione o Programa...</option>
          {PROGRAMA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (field.id === 'col_28') {
      return (
        <select key={field.id} value={formData[field.id] || ''} onChange={(e) => onChange(field.id, e.target.value)} required={field.required} className={commonClasses}>
          <option value="">Selecione a Modalidade...</option>
          {MODALIDADE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (field.id === 'col_29') {
      return (
        <select key={field.id} value={formData[field.id] || ''} onChange={(e) => onChange(field.id, e.target.value)} required={field.required} className={commonClasses}>
          <option value="">Selecione a Disponibilidade...</option>
          {DISPONIBILIDADE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }

    // Textarea
    if (field.id === 'col_32') {
      return (
        <textarea key={field.id} value={formData[field.id] || ''} onChange={(e) => onChange(field.id, e.target.value)} placeholder={field.placeholder || 'Observações adicionais...'} className={`${commonClasses} min-h-[100px] resize-none`} />
      );
    }

    return (
      <input key={field.id} type={field.type || 'text'} value={formData[field.id] || ''} onChange={(e) => onChange(field.id, e.target.value)} placeholder={field.placeholder || `Informe o ${field.label.toLowerCase()}...`} required={field.required} className={commonClasses} />
    );
  };

  const sections = [
    { title: "Dados do Solicitante", fields: FIELDS.slice(0, 8) },
    { title: "Informações do Evento", fields: FIELDS.slice(8, 11) },
    { title: "Cronograma e Localização", fields: FIELDS.slice(11, 27) },
    { title: "Logística e Responsável", fields: FIELDS.slice(27, 33) },
  ];

  return (
    <form onSubmit={onSave} className="space-y-12 pb-10">
      {sections.map((section, idx) => (
        <div key={idx} className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">{idx + 1}</span>
            <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-[0.2em]">{section.title}</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
            {section.fields.map(field => (
              <div key={field.id} className={`flex flex-col gap-1.5 ${field.id === 'col_32' ? 'md:col-span-2 lg:col-span-3' : ''}`}>
                <label className="text-[12px] font-semibold text-slate-600 px-1">
                  {field.label}
                  {field.required && <span className="text-rose-500 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="px-8 py-3.5 font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all uppercase text-[12px] tracking-widest">
          Descartar
        </button>
        <button type="submit" className="px-12 py-3.5 font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all uppercase text-[12px] tracking-widest active:scale-95">
          {isEditing ? 'Salvar Alterações' : 'Emitir Solicitação'}
        </button>
      </div>
    </form>
  );
};

export default TransportForm;
