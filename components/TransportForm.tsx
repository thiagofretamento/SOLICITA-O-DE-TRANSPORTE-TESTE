
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

  // Limpa campos de retorno se a modalidade mudar para apenas ida/volta
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
    
    if (visibleStopsCount > 1) {
      setVisibleStopsCount(v => v - 1);
    }
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
    if (v.length > 6) {
      v = `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0, 2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }
    return v;
  };

  const handleFieldChange = (id: string, value: string) => {
    if (id === 'col_0') { // Número do Processo
      const filteredValue = value.replace(/[^0-9./-]/g, '');
      onChange(id, filteredValue.toUpperCase());
    } else if (id === 'col_2' || id === 'col_31') { // Telefones
      onChange(id, maskPhone(value));
    } else {
      onChange(id, value.toUpperCase());
    }
  };

  const renderField = (index: number, colSpan = "1") => {
    const field = FIELDS[index];
    if (!field) return null;
    
    const isSelect = [4, 5, 7, 28, 29].includes(index);
    const isTextArea = index === 32 || index === 17 || index === 26;

    // Lógica para desabilitar campos de retorno (index 12: Data Retorno, index 14: Horário Retorno)
    const modalidade = formData['col_28'];
    const isReturnField = index === 12 || index === 14;
    const isDisabled = isReturnField && (modalidade === 'APENAS IDA' || modalidade === 'APENAS VOLTA');

    // Get options for select fields
    let selectOptions: string[] = [];
    if (index === 4) selectOptions = EXECUTIVA_OPTIONS;
    else if (index === 5) selectOptions = SETOR_OPTIONS;
    else if (index === 7) selectOptions = PROGRAMA_OPTIONS;
    else if (index === 28) selectOptions = MODALIDADE_OPTIONS;
    else if (index === 29) selectOptions = DISPONIBILIDADE_OPTIONS;

    // Help text specifically for fields with instructions
    let helpText = "";
    if (index === 5) helpText = "CASO NÃO ENCONTRE O SETOR, SELECIONE OUTROS";
    if (index === 9) helpText = "EX: 10 À 15 DE JANEIRO OU 10 DE JANEIRO";
    if (index === 16 || index === 25) helpText = "EX: INFORMAR NOME DA ESCOLA, HOTEL, POSTO, ETC.";
    if (index === 27) helpText = "MÉDIA DA CAPACIDADE DO ÔNIBUS É DE 46 LUGARES";
    if (index === 30) helpText = "RESPONSÁVEL POR FALAR DIRETAMENTE COM O MOTORISTA";

    const commonClasses = `w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm shadow-sm transition-all font-normal uppercase ${
      isDisabled 
        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
        : 'bg-white border-gray-300 text-gray-700'
    }`;

    return (
      <div className={`flex flex-col gap-1 col-span-${colSpan}`}>
        <label className={`text-sm font-bold flex items-center ${isDisabled ? 'text-gray-400' : 'text-[#334155]'}`}>
          {field.label}
          {field.required && !isDisabled && <span className="text-red-500 ml-1 font-bold">*</span>}
        </label>
        
        {isSelect ? (
          <div className="relative">
            <select
              disabled={isDisabled}
              value={formData[field.id] || ''}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              className={`${commonClasses} appearance-none`}
            >
              <option value="">SELECIONE...</option>
              {selectOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {!isDisabled && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        ) : isTextArea ? (
          <textarea
            disabled={isDisabled}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={`${commonClasses} min-h-[80px] resize-none`}
            placeholder=""
          />
        ) : (
          <input
            disabled={isDisabled}
            type={field.type === 'email' ? 'text' : field.type}
            value={formData[field.id] || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={commonClasses}
            placeholder=""
          />
        )}
        {helpText && !isDisabled && (
          <span className="text-[10px] text-black font-bold uppercase mt-0.5">
            {helpText}
          </span>
        )}
      </div>
    );
  };

  const SectionTitle = ({ title, showToggle = false }: { title: string, showToggle?: boolean }) => (
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

  return (
    <div className="w-full">
      <form onSubmit={onSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <SectionTitle title="INFORMAÇÕES DO SOLICITANTE" />
          {renderField(0)}
          {renderField(1)}
          {renderField(2)}
          {renderField(3)}
          {renderField(4)}
          {renderField(5)}
          {renderField(6)}

          <SectionTitle title="INFORMAÇÕES DO EVENTO" />
          {renderField(7)}
          {renderField(8)}
          {renderField(9)}
          {renderField(10)}

          <SectionTitle title="DATAS E HORÁRIOS" />
          {renderField(11)}
          {renderField(12)}
          {renderField(13)}
          {renderField(14)}

          <SectionTitle title="ORIGEM" />
          {renderField(15)}
          {renderField(16)}
          <div className="col-span-full">{renderField(17, "full")}</div>

          <SectionTitle title="PARADAS OPCIONAIS" showToggle={true} />
          
          {hasStops ? (
            <div className="col-span-full space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              {Array.from({ length: visibleStopsCount }).map((_, i) => (
                <div key={stopFieldIds[i]} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 uppercase">Parada {i + 1}</label>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={formData[stopFieldIds[i]] || ''}
                        onChange={(e) => handleFieldChange(stopFieldIds[i], e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none text-sm bg-white font-normal uppercase"
                        placeholder=""
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveStop(i)} 
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      title="Excluir parada"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-[10px] text-black font-bold uppercase">INFORME O ENDEREÇO COMPLETO</span>
                </div>
              ))}
              
              {visibleStopsCount < 6 && (
                <div className="pt-2">
                  <button 
                    type="button" 
                    onClick={handleAddStop} 
                    className="flex items-center gap-2 px-4 py-2 bg-[#f8fafc] border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all shadow-sm uppercase"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Adicionar Parada
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="col-span-full bg-[#f8fafc]/80 px-6 py-4 rounded-xl border border-dashed border-slate-200">
               <p className="text-sm text-slate-400 italic uppercase">Ative o botão acima para adicionar paradas ao trajeto.</p>
            </div>
          )}

          <SectionTitle title="DESTINO" />
          {renderField(24)}
          {renderField(25)}
          <div className="col-span-full">{renderField(26, "full")}</div>

          <SectionTitle title="DETALHES DA VIAGEM" />
          {renderField(27)}
          {renderField(28)}
          {renderField(29)}

          <SectionTitle title="RESPONSÁVEL E OBSERVAÇÕES" />
          {renderField(30)}
          {renderField(31)}
          <div className="col-span-full">{renderField(32, "full")}</div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-10 mt-10 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all uppercase"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancelar
          </button>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-10 py-3 text-sm font-bold text-white bg-sky-500 rounded-lg hover:bg-sky-600 shadow-lg shadow-sky-500/20 transition-all transform active:scale-95 uppercase"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {isEditing ? 'Salvar Alterações' : 'Salvar Solicitação'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransportForm;
