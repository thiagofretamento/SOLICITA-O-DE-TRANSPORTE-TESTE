
export type Status = 'Solicitada' | 'Confirmada' | 'Realizada' | 'Cancelada' | 'Não Atendida' | 'Cobrança/Diária';

export interface FinancialMetric {
  previsto: number;
  realizado: number;
}

export interface ProcessData {
  id: string; // ORDEM
  processo: string; // PROCESSO
  origin: string; // ORIGEM
  destination: string; // DESTINO
  startDate: string; // DATA SAÍDA
  endDate: string; // DATA RETORNO
  company: string; // EMPRESA
  status: Status; // STATUS
  value: number; // Valor financeiro Realizado Total
  
  // Novos Campos Gerenciais
  busQuantity: number; // Quantidade de ônibus
  occupancy: 'Baixa' | 'Média' | 'Boa' | 'N/A'; // Nível de ocupação (Classificação AO)
  occupancyRate: string; // Nível de ocupação percentual (Coluna AP)
  paymentTerms: string; // Prazo de recebimento
  deadlineStatus: string; // Status do Prazo (Original da BF)
  deadlineDays: number; // Valor da Coluna BN para cálculo de prazo
  executive: string; // EXECUTIVA (Responsável)
  sector: string; // SETOR
  program: string; // PROGRAMA (Adicionado para rankings)
  
  // Fix: Added missing month property used in DashboardFinancial
  month: string;
  
  // Detalhamento Financeiro (Colunas AQ-BE)
  kmQtdP: number; // AQ
  kmQtdR: number; // AR
  kmValP: number; // AT
  kmValR: number; // AU
  diaQtdP: number; // AW
  diaQtdR: number; // AX
  diaValP: number; // AY
  diaValR: number; // AZ
  motQtdP: number; // BA
  motQtdR: number; // BB
  motValP: number; // BD
  motValR: number; // BE
}

export interface DashboardStats {
  totalProcesses: number;
  totalRequests: number;
  byStatus: Record<Status, number>;
  totalValue: number;
  financial: {
    totalGeral: FinancialMetric;
    kmQtd: FinancialMetric;
    kmVal: FinancialMetric;
    diariasQtd: FinancialMetric;
    diariasVal: FinancialMetric;
    motoristaQtd: FinancialMetric;
    motoristaVal: FinancialMetric;
  };
  managerial: {
    totalBuses: number;
    occupancy: {
      low: number;
      medium: number;
      high: number;
    };
  };
}

export enum ViewType {
  OPERATIONAL = 'OPERATIONAL',
  MANAGERIAL = 'MANAGERIAL',
  FINANCIAL = 'FINANCIAL',
  // Fix: Added REQUESTS to ViewType enum to resolve error in Sidebar.tsx
  REQUESTS = 'REQUESTS'
}

// Fix: Added missing FieldDefinition interface used in constants.ts
export interface FieldDefinition {
  id: string;
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
}

// Fix: Added missing TransportRequest interface used in TransportTable and TransportForm
export interface TransportRequest {
  id: string;
  [key: string]: string;
}

// Fix: Added missing Passenger interface used in PassengerListModal
export interface Passenger {
  name: string;
  document: string;
}

// Fix: Added missing SavedPassengerList interface used in PassengerListModal
export interface SavedPassengerList {
  id: string;
  processNumber: string;
  destinationCity: string;
  passengers: Passenger[];
}
