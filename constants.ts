
import { FieldDefinition } from './types';

export const EXECUTIVA_OPTIONS = [
  'GABINETE DO SECRETÁRIO',
  'SECRETARIA EXECUTIVA DE ADMINISTRAÇÃO E FINANÇAS',
  'SECRETARIA EXECUTIVA DE EDUCAÇÃO PROFISSIONAL',
  'SECRETARIA EXECUTIVA DE DESENVOLVIMENTO DA EDUCAÇÃO',
  'SECRETARIA EXECUTIVA DE GESTÃO DA REDE',
  'OUTROS'
];

export const SETOR_OPTIONS = [
  'GARE', 'GERC', 'GEGE', 'GEGP', 'GEAV', 'GEAD', 'GELOG', 'OUTROS'
];

export const PROGRAMA_OPTIONS = [
  'GANHE O MUNDO',
  'BANDAS E FANFARRAS',
  'EDUCAÇÃO INTEGRAL',
  'JOGOS ESCOLARES',
  'OUTROS'
];

export const MODALIDADE_OPTIONS = [
  'APENAS IDA',
  'APENAS VOLTA',
  'IDA + VOLTA'
];

export const DISPONIBILIDADE_OPTIONS = [
  'RETORNO PROGRAMADO',
  'DISPONÍVEL NO LOCAL'
];

export const FIELDS: FieldDefinition[] = [
  { id: 'col_0', label: 'Número do Processo (SEI)', required: true },
  { id: 'col_1', label: 'Nome do Solicitante', required: true },
  { id: 'col_2', label: 'Telefone do Solicitante', type: 'tel', required: true },
  { id: 'col_3', label: 'E-mail do Solicitante', type: 'email', required: true },
  { id: 'col_4', label: 'Executiva', required: true },
  { id: 'col_5', label: 'Setor do Solicitante', required: true },
  { id: 'col_6', label: 'Caso o Setor for Outros, Informe Aqui' },
  { id: 'col_7', label: 'Programa', required: true },
  { id: 'col_8', label: 'Nome do Evento', required: true },
  { id: 'col_9', label: 'Período do Evento', required: true },
  { id: 'col_10', label: 'Horário do Evento', type: 'time', required: true },
  { id: 'col_11', label: 'Data de Saída', type: 'date', required: true },
  { id: 'col_12', label: 'Data do Retorno', type: 'date' },
  { id: 'col_13', label: 'Horário de Saída', type: 'time', required: true },
  { id: 'col_14', label: 'Horário de Retorno', type: 'time' },
  { id: 'col_15', label: 'Cidade de Origem', required: true },
  { id: 'col_16', label: 'Local de Saída', required: true },
  { id: 'col_17', label: 'Endereço Completo de Origem', required: true },
  { id: 'col_18', label: 'PARADA 1' },
  { id: 'col_19', label: 'PARADA 2' },
  { id: 'col_20', label: 'PARADA 3' },
  { id: 'col_21', label: 'PARADA 4' },
  { id: 'col_22', label: 'PARADA 5' },
  { id: 'col_23', label: 'PARADA 6' },
  { id: 'col_24', label: 'Cidade de Destino', required: true },
  { id: 'col_25', label: 'Local de Destino', required: true },
  { id: 'col_26', label: 'Endereço Completo de Destino', required: true },
  { id: 'col_27', label: 'Total de Passageiros', type: 'number', required: true },
  { id: 'col_28', label: 'Modalidade da Viagem', required: true },
  { id: 'col_29', label: 'Disponibilidade do Veículo', required: true },
  { id: 'col_30', label: 'Nome do Responsável', required: true },
  { id: 'col_31', label: 'Telefone do Responsável', type: 'tel', required: true },
  { id: 'col_32', label: 'Informações Complementares' }
];

export const FIELD_LABELS = FIELDS.map(f => f.label);
