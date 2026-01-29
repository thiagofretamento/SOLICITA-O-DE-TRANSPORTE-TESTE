
import React from 'react';

interface HeaderProps {
  onOpenManual: () => void;
  onOpenPassengerList: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenManual, onOpenPassengerList }) => {
  const handleWhatsApp = () => {
    window.open('https://wa.me/5581984942091', '_blank');
  };

  const buttonBaseClass = "flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-black text-[10px] md:text-[11px] uppercase transition-all shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 min-w-[240px] h-12 text-center whitespace-nowrap";

  return (
    <header className="bg-[#001f54] text-white shadow-xl">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex-1 hidden lg:block"></div>
          
          <h1 className="text-xl md:text-4xl lg:text-5xl font-black tracking-tight text-white text-center flex-grow uppercase leading-tight">
            SOLICITAÇÃO DE TRANSPORTE - FRETAMENTO
          </h1>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-end gap-3 flex-1 w-full lg:w-auto">
            <button 
              onClick={onOpenManual}
              className={`${buttonBaseClass} bg-yellow-400 hover:bg-yellow-500 text-[#001f54] hover:shadow-yellow-400/20`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Passo a Passo
            </button>

            <button 
              onClick={onOpenPassengerList}
              className={`${buttonBaseClass} bg-sky-500 hover:bg-sky-600 text-white hover:shadow-sky-500/20`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Listas de Passageiros
            </button>

            <button 
              onClick={handleWhatsApp}
              className={`${buttonBaseClass} bg-[#25D366] hover:bg-[#128C7E] text-white hover:shadow-green-500/20`}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.412.001 12.049c0 2.123.554 4.197 1.607 6.037L0 24l6.105-1.602a11.834 11.834 0 005.937 1.598h.005c6.637 0 12.048-5.412 12.052-12.049a11.829 11.829 0 00-3.41-8.461z"/>
              </svg>
              Para mais Informações
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
