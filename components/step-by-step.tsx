
import React from 'react';
// Fix: Consolidate import casing for Icons
import { Icons } from './Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const StepByStep: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const steps = [
    { 
      title: "Preenchimento do Formulário", 
      desc: "Clique em 'Nova Solicitação' e preencha todos os campos obrigatórios (*). Garanta que os dados de contato estejam corretos.",
      icon: <Icons.Reports className="w-5 h-5" />
    },
    { 
      title: "Verificação de Paradas", 
      desc: "Caso existam paradas intermediárias, utilize os campos específicos (PARADA 1 a 6). Elas ficarão em destaque na planilha.",
      icon: <Icons.Search className="w-5 h-5" />
    },
    { 
      title: "Exportação Profissional", 
      desc: "Após salvar, clique em 'Baixar Planilha'. O sistema gerará um arquivo formatado com cabeçalho do Governo e cores padrão.",
      icon: <Icons.Truck className="w-5 h-5" />
    },
    { 
      title: "Envio no Processo SEI", 
      desc: "Anexe o arquivo .xlsx gerado ao seu processo SEI para que o setor de transporte possa processar o pedido.",
      icon: <Icons.Check className="w-5 h-5" />
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
        <div className="bg-amber-400 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3 text-blue-900">
            <Icons.Alert className="w-6 h-6" />
            <h3 className="font-black uppercase tracking-tight text-lg">Guia de Utilização</h3>
          </div>
          <button onClick={onClose} className="p-2 text-blue-900/50 hover:text-blue-900 rounded-full hover:bg-white/20 transition-all">
            <Icons.Close className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-6">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-blue-600">
                {step.icon}
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-slate-800 uppercase tracking-tight mb-1">{i + 1}. {step.title}</h4>
                <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{step.desc}</p>
              </div>
            </div>
          ))}
          
          <div className="pt-4">
            <button onClick={onClose} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
              Entendi, vamos começar!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepByStep;
