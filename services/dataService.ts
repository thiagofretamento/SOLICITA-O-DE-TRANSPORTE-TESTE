
import { ProcessData, DashboardStats, Status } from '../types';

// Link da Planilha: https://docs.google.com/spreadsheets/d/1Cwzzw5r8VW1jjKoYCqEkTan7lQXNmdkS2hHDx-gX6-k
// Aba BASE_API: GID 624578284
const SHEET_ID = '1Cwzzw5r8VW1jjKoYCqEkTan7lQXNmdkS2hHDx-gX6-k';
const GID = '624578284';
const GOOGLE_SHEETS_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&gid=${GID}`;

/**
 * Retorna um estado vazio para o dashboard em caso de erro ou ausência de dados.
 */
const getEmptyState = (): { processes: ProcessData[], stats: DashboardStats } => {
  return {
    processes: [],
    stats: {
      totalProcesses: 0,
      totalRequests: 0,
      totalValue: 0,
      byStatus: {
        'Solicitada': 0,
        'Confirmada': 0,
        'Realizada': 0,
        'Cancelada': 0,
        'Não Atendida': 0,
        'Cobrança/Diária': 0,
      },
      financial: {
        totalGeral: { previsto: 0, realizado: 0 },
        kmQtd: { previsto: 0, realizado: 0 },
        kmVal: { previsto: 0, realizado: 0 },
        diariasQtd: { previsto: 0, realizado: 0 },
        diariasVal: { previsto: 0, realizado: 0 },
        motoristaQtd: { previsto: 0, realizado: 0 },
        motoristaVal: { previsto: 0, realizado: 0 }
      },
      managerial: {
        totalBuses: 0,
        occupancy: {
          low: 0,
          medium: 0,
          high: 0,
        }
      }
    }
  };
};

/**
 * Busca e processa os dados da planilha do Google para o Dashboard Getra.
 */
export const fetchDashboardData = async (): Promise<{ processes: ProcessData[], stats: DashboardStats }> => {
  try {
    const response = await fetch(GOOGLE_SHEETS_URL);
    
    if (!response.ok) {
      throw new Error(`Falha na conexão com o Google Sheets (${response.status})`);
    }

    const text = await response.text();
    // Extrai o JSON da resposta JSONP do Google
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    const jsonStr = text.substring(jsonStart, jsonEnd + 1);
    const json = JSON.parse(jsonStr);
    
    const rows = json.table.rows;

    if (!rows || rows.length === 0) {
      console.warn("Nenhum dado encontrado na aba especificada.");
      return getEmptyState();
    }

    const getVal = (row: any, index: number) => {
      if (!row.c || !row.c[index]) return null;
      return row.c[index].v;
    };

    const processes: ProcessData[] = rows.map((row: any) => {
      // Mapeamento de Status (Coluna AL - Índice 37)
      const rawStatus = (getVal(row, 37) || '').toString().trim().toUpperCase();
      
      let mappedStatus: Status = 'Solicitada';
      if (rawStatus.includes('CONFIRMADA')) mappedStatus = 'Confirmada';
      else if (rawStatus.includes('REALIZADA')) mappedStatus = 'Realizada';
      else if (rawStatus.includes('CANCELADA')) mappedStatus = 'Cancelada';
      else if (rawStatus.includes('NÃO ATENDIDA')) mappedStatus = 'Não Atendida';
      else if (rawStatus.includes('DIÁRIA') || rawStatus.includes('COBRANÇA')) mappedStatus = 'Cobrança/Diária';
      else mappedStatus = 'Solicitada';

      const processoStr = (getVal(row, 4) || '').toString().trim(); // Coluna E (Índice 4)

      // Cálculo de Valor Realizado (AU + AZ + BE)
      const lineReal = parseNumber(getVal(row, 46)) + parseNumber(getVal(row, 51)) + parseNumber(getVal(row, 56));

      // Mapeamento do Mês para Dashboard Financeiro
      const startDate = formatDate(getVal(row, 15)); // Coluna P (Índice 15)
      const monthPart = startDate.split('/')[1];
      const monthNames = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO', 'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'];
      const month = monthPart ? monthNames[parseInt(monthPart, 10) - 1] || '' : '';

      return {
        id: (getVal(row, 1) || '').toString(), // Coluna B (Índice 1)
        processo: processoStr,
        origin: (getVal(row, 19) || '').toString(), // Coluna T (Índice 19)
        destination: (getVal(row, 28) || '').toString(), // Coluna AC (Índice 28)
        startDate,
        endDate: formatDate(getVal(row, 16)), // Coluna Q (Índice 16)
        company: (getVal(row, 3) || '').toString(), // Coluna D (Índice 3)
        status: mappedStatus,
        value: lineReal,
        busQuantity: parseNumber(getVal(row, 39)), // Coluna AN (Índice 39)
        occupancy: mapOccupancy(getVal(row, 40)), // Coluna AO (Índice 40)
        occupancyRate: (getVal(row, 41) || '0%').toString(), // Coluna AP (Índice 41)
        paymentTerms: (getVal(row, 58) || 'A Definir').toString(), // Coluna BG (Índice 58)
        deadlineStatus: (getVal(row, 57) || '').toString(), // Coluna BF (Índice 57)
        deadlineDays: parseNumber(getVal(row, 65)), // Coluna BN (Índice 65)
        executive: (getVal(row, 8) || 'N/I').toString(), // FIX DEFINITIVO: Coluna I (Índice 8)
        sector: (getVal(row, 9) || 'Geral').toString(), // Coluna J (Índice 9)
        program: (getVal(row, 11) || 'Geral').toString(), // Coluna L (Índice 11)
        month,
        kmQtdP: parseNumber(getVal(row, 42)), kmQtdR: parseNumber(getVal(row, 43)),
        kmValP: parseNumber(getVal(row, 45)), kmValR: parseNumber(getVal(row, 46)),
        diaQtdP: parseNumber(getVal(row, 48)), diaQtdR: parseNumber(getVal(row, 49)),
        diaValP: parseNumber(getVal(row, 50)), diaValR: parseNumber(getVal(row, 51)),
        motQtdP: parseNumber(getVal(row, 52)), motQtdR: parseNumber(getVal(row, 53)),
        motValP: parseNumber(getVal(row, 55)), motValR: parseNumber(getVal(row, 56))
      };
    });

    // Filtragem de linhas inválidas ou cabeçalhos
    const validProcesses = processes.filter(p => p.processo && p.processo !== 'PROCESSO' && p.processo !== 'null');
    const uniqueProcessNumbers = new Set(validProcesses.map(p => p.processo));

    // Consolidação Financeira
    const financialTotals = validProcesses.reduce((acc, p) => {
      acc.totalGeral.previsto += (p.kmValP + p.diaValP + p.motValP);
      acc.totalGeral.realizado += (p.kmValR + p.diaValR + p.motValR);
      acc.kmVal.previsto += p.kmValP;
      acc.kmVal.realizado += p.kmValR;
      acc.diariasVal.previsto += p.diaValP;
      acc.diariasVal.realizado += p.diaValR;
      acc.motoristaVal.previsto += p.motValP;
      acc.motoristaVal.realizado += p.motValR;
      return acc;
    }, {
      totalGeral: { previsto: 0, realizado: 0 },
      kmVal: { previsto: 0, realizado: 0 },
      diariasVal: { previsto: 0, realizado: 0 },
      motoristaVal: { previsto: 0, realizado: 0 }
    });

    const stats: DashboardStats = {
      totalProcesses: uniqueProcessNumbers.size,
      totalRequests: validProcesses.length,
      totalValue: financialTotals.totalGeral.realizado,
      byStatus: {
        'Solicitada': validProcesses.filter(p => p.status === 'Solicitada').length,
        'Confirmada': validProcesses.filter(p => p.status === 'Confirmada').length,
        'Realizada': validProcesses.filter(p => p.status === 'Realizada').length,
        'Cancelada': validProcesses.filter(p => p.status === 'Cancelada').length,
        'Não Atendida': validProcesses.filter(p => p.status === 'Não Atendida').length,
        'Cobrança/Diária': validProcesses.filter(p => p.status === 'Cobrança/Diária').length,
      },
      financial: {
        totalGeral: financialTotals.totalGeral,
        kmQtd: { previsto: 0, realizado: 0 },
        kmVal: financialTotals.kmVal,
        diariasQtd: { previsto: 0, realizado: 0 },
        diariasVal: financialTotals.diariasVal,
        motoristaQtd: { previsto: 0, realizado: 0 },
        motoristaVal: financialTotals.motoristaVal
      },
      managerial: {
        totalBuses: validProcesses.reduce((acc, p) => acc + p.busQuantity, 0),
        occupancy: {
          low: validProcesses.filter(p => p.occupancy === 'Baixa').length,
          medium: validProcesses.filter(p => p.occupancy === 'Média').length,
          high: validProcesses.filter(p => p.occupancy === 'Boa').length,
        }
      }
    };

    return { processes: validProcesses, stats };
  } catch (error) {
    console.error("Erro na integração Getra:", error);
    throw error;
  }
};

/**
 * Utilitário para converter valores da planilha em números.
 */
const parseNumber = (val: any): number => {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return val;
  const s = val.toString().replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

/**
 * Utilitário para formatar datas provenientes do Google Sheets.
 */
const formatDate = (val: any): string => {
  if (!val) return '--/--/----';
  if (typeof val === 'string' && val.startsWith('Date')) {
    const parts = val.match(/\d+/g);
    if (parts) {
      return `${parts[2].padStart(2, '0')}/${(parseInt(parts[1]) + 1).toString().padStart(2, '0')}/${parts[0]}`;
    }
  }
  return val.toString();
};

/**
 * Mapeia o nível de ocupação baseado na classificação de texto da planilha.
 */
const mapOccupancy = (val: any): 'Baixa' | 'Média' | 'Boa' | 'N/A' => {
  const s = (val || '').toString().toUpperCase();
  if (s.includes('BAIXA')) return 'Baixa';
  if (s.includes('MÉDIA') || s.includes('MEDIA')) return 'Média';
  if (s.includes('BOA') || s.includes('ALTA')) return 'Boa';
  return 'N/A';
};
