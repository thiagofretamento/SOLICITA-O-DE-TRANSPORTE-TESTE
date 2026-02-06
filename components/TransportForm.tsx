
import React, { useState, useEffect } from 'react';
import { 
  FIELDS, 
  EXECUTIVA_OPTIONS, 
  SETOR_OPTIONS, 
  PROGRAMA_OPTIONS, 
  MODALIDADE_OPTIONS, 
  DISPONIBILIDADE_OPTIONS 
} from '../constants';
import { TransportRequest } from '../types';

interface TransportFormProps {
  formData: Partial<TransportRequest>;
  onChange: (id: string, value: string) => void;
  onSave: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const SectionTitle = ({ title, showToggle = false, hasStops = false, toggleStops }: { title: string, showToggle?: boolean, hasStops?: boolean, toggleStops?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
  <div className="col-span-full border-b border-gray-200 pb-2 mb-4 mt-8 first:mt-0 flex justify-between items-center">
    <h4 className="text-sky-500 font-bold uppercase text-[13px] tracking-wide">{title}</h4>
    {showToggle && (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-600 uppercase">Teve paradas?</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={hasStops} 
            onChange={toggleStops} 
          />
          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0ea5e9]"></div>
        </label>
      </div>
    )}
  </div>
);

const TransportForm: React.FC<TransportFormProps> = ({ 
  formData, 
  onChange, 
  onSave, 
  onCancel,
  isEditing 
}) => {
  const stopFieldIds = ['col_18', 'col_19', 'col_20', 'col_21', 'col_22', 'col_23'];
  const [hasStops, setHasStops] = useState(stopFieldIds.some(id => !!formData[id]));
  const [visibleStopsCount, setVisibleStopsCount] = useState(() => {
    let lastFilledIndex = -1;
    for (let i = stopFieldIds.length - 1; i >= 0; i--) {
      if (formData[stopFieldIds[i]]) {
        lastFilledIndex = i;
        break;
      }
    }
    return lastFilledIndex === -1 ? 1 : lastFilledIndex + 1;
  });

  useEffect(() => {
    const modalidade = formData['col_28'];
    if (modalidade === 'APENAS IDA' || modalidade === 'APENAS VOLTA') {
      if (formData['col_12']) onChange('col_12', '');
      if (formData['col_14']) onChange('col_14', '');
    }
  }, [formData['col_28']]);

  const handleAddStop = () => visibleStopsCount < 6 && setVisibleStopsCount(v => v + 1);
  const handleRemoveStop = (index: number) => {
    for (let i = index; i < visibleStopsCount - 1; i++) {
      onChange(stopFieldIds[i], formData[stopFieldIds[i + 1]] || '');
    }
    onChange(stopFieldIds[visibleStopsCount - 1], '');
    if (visibleStopsCount > 1) setVisibleStopsCount(v => v - 1);
  };

  const toggleStops = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setHasStops(checked);
    if (!checked) {
      stopFieldIds.forEach(id => onChange(id, ''));
      setVisibleStopsCount(1);
    }
  };

  const maskPhone = (value: string) => {
    let v = value.replace(/\D/g, "");
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 6) { v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`; }
    else if (v.length > 2) { v = `(${v.slice(0, 2)}) ${v.slice(2)}`; }
    else if (v.length > 0) { v = `(${v}`; }
    return v;
  };

  const handleFieldChange = (id: string, value: string) => {
    const fieldIndex = parseInt(id.split('_')[1]);
    const isSelectField = [4, 5, 7, 28, 29].includes(fieldIndex);

    if (id === 'col_0') {
      onChange(id, value.replace(/[^0-9./-]/g, '').toUpperCase());
    } else if (id === 'col_2' || id === 'col_31') {
      onChange(id, maskPhone(value));
    } else if (isSelectField) {
      onChange(id, value);
    } else {
      onChange(id, value.toUpperCase());
    }
  };

  const renderField = (index: number, colSpan = "1") => {
    const field = FIELDS[index];
    if (!field) return null;
    
    const isSelect = [4, 5, 7, 28, 29].includes(index);
    const isTextArea = index === 32 || index === 17 || index === 26;

    const modalidade = formData['col_28'];
    const isReturnField = index === 12 || index === 14;
    const isDisabled = isReturnField && (modalidade === 'APENAS IDA' || modalidade === 'APENAS VOLTA');

    let selectOptions: string[] = [];
    if (index === 4) selectOptions = EXECUTIVA_OPTIONS;
    else if (index === 5) selectOptions = SETOR_OPTIONS;
    else if (index === 7) selectOptions = PROGRAMA_OPTIONS;
    else if (index === 28) selectOptions = MODALIDADE_OPTIONS;
    else if (index === 29) selectOptions = DISPONIBILIDADE_OPTIONS;

    const isRequired = field.required && !isDisabled;
    const commonClasses = `w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm shadow-sm transition-all font-normal ${isDisabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-700'}`;

    return (
      <div className={`flex flex-col gap-1 col-span-${colSpan}`}>
        <label className={`text-sm font-bold flex items-center ${isDisabled ? 'text-gray-400' : 'text-[#334155]'}`}>
          {field.label} {isRequired && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
        {isSelect ? (
          <select disabled={isDisabled} required={isRequired} value={formData[field.id] || ''} onChange={(e) => handleFieldChange(field.id, e.target.value)} className={commonClasses}>
            <option value="">SELECIONE...</option>
            {selectOptions.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
          </select>
        ) : isTextArea ? (
          <textarea disabled={isDisabled} required={isRequired} value={formData[field.id] || ''} onChange={(e) => handleFieldChange(field.id, e.target.value)} className={`${commonClasses} min-h-[80px] uppercase`} />
        ) : (
          <input disabled={isDisabled} required={isRequired} type={field.type === 'email' ? 'text' : field.type} value={formData[field.id] || ''} onChange={(e) => handleFieldChange(field.id, e.target.value)} className={`${commonClasses} uppercase`} />
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <form onSubmit={onSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SectionTitle title="INFORMAÇÕES DO SOLICITANTE" />
          {renderField(0)} {renderField(1)} {renderField(2)} {renderField(3)} {renderField(4)} {renderField(5)} {renderField(6)}

          <SectionTitle title="INFORMAÇÕES DO EVENTO" />
          {renderField(7)} {renderField(8)} {renderField(9)} {renderField(10)}

          <SectionTitle title="DATAS E HORÁRIOS" />
          {renderField(11)} {renderField(12)} {renderField(13)} {renderField(14)}

          <SectionTitle title="ORIGEM" />
          {renderField(15)} {renderField(16)}
          <div className="col-span-full">{renderField(17)}</div>

          <SectionTitle title="PARADAS OPCIONAIS" showToggle={true} hasStops={hasStops} toggleStops={toggleStops} />
          {hasStops ? (
            <div className="col-span-full space-y-4">
              {Array.from({ length: visibleStopsCount }).map((_, i) => (
                <div key={stopFieldIds[i]} className="flex items-center gap-2">
                  <input type="text" value={formData[stopFieldIds[i]] || ''} onChange={(e) => handleFieldChange(stopFieldIds[i], e.target.value)} className="flex-grow px-3 py-2.5 border border-gray-300 rounded-lg text-sm uppercase" placeholder={`PARADA ${i + 1}`} />
                  <button type="button" onClick={() => handleRemoveStop(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              ))}
              {visibleStopsCount < 6 && <button type="button" onClick={handleAddStop} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold uppercase">Adicionar Parada</button>}
            </div>
          ) : <div className="col-span-full py-4 text-slate-400 italic uppercase text-xs">Nenhuma parada adicionada.</div>}

          <SectionTitle title="DESTINO" />
          {renderField(24)} {renderField(25)}
          <div className="col-span-full">{renderField(26)}</div>

          <SectionTitle title="DETALHES DA VIAGEM" />
          {renderField(27)} {renderField(28)} {renderField(29)}

          <SectionTitle title="RESPONSÁVEL E OBSERVAÇÕES" />
          {renderField(30)} {renderField(31)}
          <div className="col-span-full">{renderField(32)}</div>
        </div>

        <div className="flex justify-end gap-3 pt-8 mt-8 border-t">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 text-sm font-bold text-slate-500 border rounded-lg uppercase">Cancelar</button>
          <button type="submit" className="px-8 py-2.5 text-sm font-bold text-white bg-sky-500 rounded-lg uppercase shadow-lg shadow-sky-500/20">
            {isEditing ? 'Salvar Alterações' : 'Salvar Solicitação'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransportForm;
