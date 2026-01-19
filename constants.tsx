
import { FieldDefinition } from './types';

export const FIELD_LABELS: string[] = [
  "NÚMERO DO SEI",
  "NOME DO SOLICITANTE",
  "TELEFONE DO SOLICITANTE",
  "E-MAIL DO SOLICITANTE",
  "EXECUTIVA",
  "SETOR DO SOLICITANTE",
  "CASO O SETOR DO SOLICITANTE FOR OUTROS, INFORME AQUI",
  "PROGRAMA",
  "NOME DO EVENTO",
  "PERÍODO DO EVENTO",
  "HORÁRIO DO EVENTO",
  "DATA DE SAÍDA",
  "DATA DO RETORNO",
  "HORÁRIO DE SAÍDA",
  "HORÁRIO DE RETORNO",
  "CIDADE DE ORIGEM",
  "LOCAL DE SAÍDA",
  "ENDEREÇO COMPLETO DE ORIGEM",
  "PARADA 1",
  "PARADA 2",
  "PARADA 3",
  "PARADA 4",
  "PARADA 5",
  "PARADA 6",
  "CIDADE DE DESTINO",
  "LOCAL DE DESTINO",
  "ENDEREÇO COMPLETO DE DESTINO",
  "TOTAL DE PASSAGEIROS",
  "MODALIDADE DA VIAGEM",
  "DISPONIBILIDADE DE VEÍCULO",
  "NOME DO RESPONSÁVEL",
  "TELEFONE DO RESPONSÁVEL",
  "INFORMAÇÕES COMPLEMENTARES"
];

export const FIELDS: FieldDefinition[] = FIELD_LABELS.map((label, index) => {
  let type: FieldDefinition['type'] = 'text';
  
  if (label.includes('DATA')) type = 'date';
  if (label.includes('HORÁRIO')) type = 'time';
  if (label.includes('TELEFONE')) type = 'tel';
  if (label.includes('E-MAIL')) type = 'email';
  if (label.includes('TOTAL')) type = 'number';

  return {
    id: `col_${index}`,
    label: label,
    placeholder: `Digite ${label.toLowerCase()}`,
    type: type,
    required: index < 5 // First 5 fields are required for example
  };
});
