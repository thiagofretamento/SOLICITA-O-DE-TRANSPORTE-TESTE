
import React from 'react';
import { FIELDS } from '../constants';
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
  return (
    <form onSubmit={onSave}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {FIELDS.map((field) => (
          <div key={field.id} className="flex flex-col gap-1.5">
            <label 
              htmlFor={field.id}
              className={`text-xs font-bold uppercase tracking-wider ${
                field.id === 'col_6' ? 'text-blue-600 bg-yellow-100 p-1 rounded' : 'text-gray-500'
              }`}
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              id={field.id}
              type={field.type}
              value={formData[field.id] || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none bg-gray-50 hover:bg-white text-sm"
            />
          </div>
        ))}
      </div>
      
      <div className="mt-10 flex flex-col sm:flex-row justify-end gap-4 border-t pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-8 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 text-sm font-bold text-white bg-blue-900 rounded-lg hover:bg-blue-800 shadow-md transition-all"
        >
          {isEditing ? 'Salvar Alterações' : 'Cadastrar Solicitação'}
        </button>
      </div>
    </form>
  );
};

export default TransportForm;
