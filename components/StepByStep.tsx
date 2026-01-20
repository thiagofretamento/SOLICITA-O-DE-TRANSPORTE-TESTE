
import React from 'react';

interface StepByStepProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { 
    title: "1. NÚMERO DO PROCESSO", 
    desc: "Informe corretamente o número do processo no SEI. O preenchimento deste campo é obrigatório e fundamental para a validação da solicitação." 
  },
  { 
    title: "2. NOME DO SOLICITANTE", 
    desc: "Informe o nome da pessoa responsável pelo preenchimento da planilha. Em caso de necessidade, o contato será realizado com o solicitante." 
  },
  { 
    title: "3. TELEFONE DO SOLICITANTE", 
    desc: "Informe, preferencialmente, um número de celular com WhatsApp, para facilitar a comunicação em caso de dúvidas sobre a solicitação." 
  },
  { 
    title: "4. E-MAIL DO SOLICITANTE", 
    desc: "Digite o e-mail institucional ou pessoal do solicitante, que será utilizado para comunicações oficiais." 
  },
  { 
    title: "5. EXECUTIVA", 
    desc: "Selecione a Executiva correspondente, utilizando as opções disponíveis no campo de seleção." 
  },
  { 
    title: "6. SETOR DO SOLICITANTE", 
    desc: "Escolha o setor do solicitante dentre as opções apresentadas no campo de seleção." 
  },
  { 
    title: "7. CASO O SETOR SEJA “OUTROS”", 
    desc: "Caso não localize seu setor na lista, informe neste campo o nome completo do setor ao qual pertence." 
  },
  { 
    title: "8. PROGRAMA", 
    desc: "Selecione, no campo indicado, o programa relacionado à solicitação (ex.: Ganhe o Mundo, Bandas e Fanfarras, entre outros)." 
  },
  { 
    title: "9. NOME DO EVENTO", 
    desc: "Informe o nome do evento ou atividade que motivou a solicitação (ex.: Emissão de Passaporte, Visita Técnica)." 
  },
  { 
    title: "10. PERÍODO DO EVENTO", 
    desc: "Informe o período de realização do evento.\n\nPara um único dia: “20 de janeiro de 2026”.\n\nPara mais de um dia: “20 de janeiro a 21 de janeiro de 2026”." 
  },
  { 
    title: "11. HORÁRIO DO EVENTO", 
    desc: "Informe o horário de início do evento. Este dado é essencial para que o transporte chegue com antecedência adequada." 
  },
  { 
    title: "12. DATA DE SAÍDA", 
    desc: "Informe a data em que o veículo realizará a saída." 
  },
  { 
    title: "13. DATA DO RETORNO", 
    desc: "Informe a data do retorno do veículo (campo disponível apenas para a modalidade Ida + Volta)." 
  },
  { 
    title: "14. HORÁRIO DE SAÍDA", 
    desc: "Informe o horário previsto para a saída do veículo." 
  },
  { 
    title: "15. HORÁRIO DE RETORNO", 
    desc: "Informe o horário previsto para o retorno do veículo.\n(campo disponível apenas para a modalidade Ida + Volta)" 
  },
  { 
    title: "16. CIDADE DE ORIGEM", 
    desc: "Informe a cidade de onde o veículo iniciará o deslocamento." 
  },
  { 
    title: "17. LOCAL DE SAÍDA", 
    desc: "Informe o local específico da cidade de origem (ex.: nome da GRE, escola, shopping ou outro ponto de referência)." 
  },
  { 
    title: "18. ENDEREÇO COMPLETO DE ORIGEM", 
    desc: "Informe o endereço completo para consulta no Google Maps (rua, número, bairro e cidade)." 
  },
  { 
    title: "19. PARADAS (1 a 6)", 
    desc: "Caso haja paradas durante o trajeto, informe os endereços completos (rua/avenida) conforme cadastro no Google Maps." 
  },
  { 
    title: "20. CIDADE DE DESTINO", 
    desc: "Informe a cidade para onde o veículo deverá se deslocar." 
  },
  { 
    title: "21. LOCAL DE DESTINO", 
    desc: "Informe o local específico de destino (ex.: nome da GRE, escola, shopping ou outro ponto de referência)." 
  },
  { 
    title: "22. ENDEREÇO COMPLETO DE DESTINO", 
    desc: "Informe o endereço completo do destino para consulta no Google Maps." 
  },
  { 
    title: "23. TOTAL DE PASSAGEIROS", 
    desc: "Informe a quantidade total de passageiros. Ressalta-se que a capacidade média do ônibus é de 46 lugares." 
  },
  { 
    title: "24. MODALIDADE DA VIAGEM", 
    desc: "Selecione uma das opções:\n\nApenas Ida – Transporte apenas para o destino.\n\nApenas Volta – Transporte apenas para o retorno.\n\nIda + Volta – Transporte de ida e retorno." 
  },
  { 
    title: "25. DISPONIBILIDADE DO VEÍCULO", 
    desc: "Selecione uma das opções:\n\nRetorno Programado – O veículo realiza ida e retorno no horário definido.\n\nDisponível no Local – O veículo permanece à disposição até o horário do retorno." 
  },
  { 
    title: "26. NOME DO RESPONSÁVEL", 
    desc: "Informe o nome da pessoa que manterá contato direto com o motorista durante a viagem." 
  },
  { 
    title: "27. TELEFONE DO RESPONSÁVEL", 
    desc: "Informe o número de celular do responsável, preferencialmente com WhatsApp." 
  },
  { 
    title: "28. INFORMAÇÕES COMPLEMENTARES", 
    desc: "Utilize este campo para incluir observações adicionais relevantes à empresa de fretamento." 
  }
];

const StepByStep: React.FC<StepByStepProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white z-[160] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="bg-[#001f54] p-6 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-400 p-2 rounded-lg">
              <svg className="w-6 h-6 text-[#001f54]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Manual de Preenchimento</h2>
              <p className="text-xs text-blue-200 font-medium tracking-wide">Orientações Técnicas para Solicitação</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm group hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-black text-[#001f54] uppercase tracking-wider border-b border-slate-100 pb-2 mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
          
          <div className="pt-8 pb-4 text-center border-t border-slate-200 mt-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Secretaria de Educação • Governo de Pernambuco
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default StepByStep;
