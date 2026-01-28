
import { FieldDefinition } from './types';

export const FIELD_LABELS: string[] = [
  "Número do Processo",
  "Nome do Solicitante",
  "Telefone do Solicitante",
  "E-mail do Solicitante",
  "Executiva",
  "Setor do Solicitante",
  "Caso o Setor for Outros, Informe Aqui",
  "Programa",
  "Nome do Evento",
  "Período do Evento",
  "Horário do Evento",
  "Data de Saída",
  "Data do Retorno",
  "Horário de Saída",
  "Horário de Retorno",
  "Cidade de Origem",
  "Local de Saída",
  "Endereço Completo de Origem",
  "PARADA 1",
  "PARADA 2",
  "PARADA 3",
  "PARADA 4",
  "PARADA 5",
  "PARADA 6",
  "Cidade de Destino",
  "Local de Destino",
  "Endereço Completo de Destino",
  "Total de Passageiros",
  "Modalidade da Viagem",
  "Disponibilidade de Veículo",
  "Nome do Responsável",
  "Telefone do Responsável",
  "Informações Complementares"
];

export const EXECUTIVA_OPTIONS = [
  "GABSEE - GABINETE DA SECRETÁRIA",
  "SEGP - SECRETARIA EXECUTIVA DE GESTÃO DE PESSOAS",
  "SEAF - SECRETARIA EXECUTIVA DE ADMINISTRAÇÃO E FINANÇAS",
  "SEDE - SECRETARIA EXECUTIVA DE DESENVOLVIMENTO DA EDUCAÇÃO",
  "SEMP - SECRETARIA EXECUTIVA DE EDUCAÇÃO INTEGRAL E PROFISSIONAL",
  "SEES - SECRETARIA EXECUTIVA DE ESPORTES",
  "SEGE - SECRETARIA EXECUTIVA DE GESTÃO DA REDE",
  "SEOB - SECRETARIA EXECUTIVA DE OBRAS",
  "SEAM - SECRETARIA EXECUTIVA DE PLANEJAMENTO E COORDENAÇÃO"
];

export const SETOR_OPTIONS = [
  "OUTROS", "AAFG", "AJGGPE", "AJUG", "ASTEC", "ASTECADM", "CAC", "CAGP", "CALF", "CBR", "CCEFP", "CEAI", 
  "CECEB", "CECF", "CEEI", "CGAM-VC", "CGDE-GRE AM", "CGEMP-SAP", "CGEMP-SMI", "CGPP", "CNP", "COEFP", 
  "CORREGED", "CPL I", "CPL III", "CPL IV", "CPM", "CPPU", "CTG", "CTNE", "CTPETE", "FUNDEF", "GABSEDE", 
  "GABSEE", "GACE", "GAM", "GAPE", "GAPRO", "GATG", "GCES", "GCINC", "GCODA", "GCOMP", "GCRE", "GDEP", 
  "GEAME", "GEARE", "GECAP", "GECON", "GEDES", "GEDH", "GEEQ", "GEFP", "GEINT", "GEJAI", "GELIC", 
  "GELOG", "GEMAP", "GEMR", "GENSE", "GEOE", "GEPAF", "GEPCC", "GEPEC", "GEPEM", "GEPFI", 
  "GEPLA / APLAN", "GEPLO", "GEPPE", "GERED", "GERET", "GERJI", "GERJS", "GERPE", "GESAD", 
  "GETAF", "GETAN", "GETRA", "GGADM", "GGAE", "GGAJ", "GGCP", "GGDIP", "GGEAF", "GGEI", "GGEP", 
  "GGES", "GGFIC", "GGFR", "GGGR", "GGMOD", "GGPE", "GGTIC", "GISA", "GITI", "GJAF", 
  "GJUCE", "GMRE", "GPCON", "GPIE", "GPLAN", "GRI", "GRIMP", "GSTE", "GTCLI", "GTCON", 
  "GTLIC", "GTPAT", "GTPP", "GTRES", "NAS", "NASE", "NGAPRO", "OUV", "PAAF", "SAJES", 
  "SAJUR", "SCOMP", "SUASE", "SUCE", "SUCOM", "SUCOP", "SUCOSP", "SUEAI", "SUES", "SULIC", 
  "SULOG", "SUOBR", "SUPAE", "SUPED", "SUPGM", "SUPI", "SUPIN", "SUPOF", "UAB", "UABP", 
  "UAGC", "UAGP", "UAN", "UATA", "UATF", "UBEN", "UCES", "UEBLL", "UECE", "UEFAF", "UEJAI", 
  "UELAP", "UEST", "UFGC", "UMCT", "UMOP I", "UMOP II", "UNAPC", "UNAPE", "UNEDI", "UNIEC", 
  "UNIEI", "UNIEM", "UNPAT", "UNPEL", "UNPPAG", "UNVALID", "UPCON", "UPCP", "UPGP I", 
  "UPGP II", "USEP", "USGE"
];

export const PROGRAMA_OPTIONS = [
  "BANDAS E FANFARRAS", "BOA VISÃO", "CLIPE", "CONSERVATÓRIO", "GANHE O MUNDO", 
  "GRES", "PROFESP", "SEDE", "SEGE", "SEMP", "VISITA ESCOLAR", "OUTROS"
];

export const MODALIDADE_OPTIONS = [
  "APENAS IDA", "APENAS VOLTA", "IDA + VOLTA"
];

export const DISPONIBILIDADE_OPTIONS = [
  "RETORNO PROGRAMADO", "DISPONÍVEL NO LOCAL"
];

export const FIELDS: FieldDefinition[] = FIELD_LABELS.map((label, index) => {
  let type: FieldDefinition['type'] = 'text';
  
  if (label.includes('Data')) type = 'date';
  if (label.includes('Horário')) type = 'time';
  if (label.includes('Telefone')) type = 'tel';
  if (label.includes('E-mail')) type = 'email';
  if (label.includes('Total')) type = 'number';

  return {
    id: `col_${index}`,
    label: label,
    placeholder: ``,
    type: type,
    // Deixa obrigatório todos os campos exceto:
    // 3: E-mail, 4: Executiva, 5: Setor, 6: Outros, 12: Data Retorno, 14: Hora Retorno, 18-23: Paradas, 32: Complementares
    required: ![3, 4, 5, 6, 12, 14, 18, 19, 20, 21, 22, 23, 32].includes(index)
  };
});
