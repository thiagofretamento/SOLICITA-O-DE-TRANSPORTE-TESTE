
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-[#001f54] text-white shadow-xl">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white text-center">
            Solicitação de Transporte - Fretamento
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
