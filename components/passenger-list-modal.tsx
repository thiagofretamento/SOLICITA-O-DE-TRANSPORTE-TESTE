
import React, { useState, useEffect } from 'react';
import { SavedPassengerList, Passenger } from '../types';
// Fix: Consolidate import casing for Icons
import { Icons } from './Icons';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const PassengerListModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [lists, setLists] = useState<SavedPassengerList[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [currentList, setCurrentList] = useState<Partial<SavedPassengerList>>({
    passengers: []
  });

  useEffect(() => {
    const saved = localStorage.getItem('getra_passenger_lists');
    if (saved) {
      try { setLists(JSON.parse(saved)); } catch (e) { setLists([]); }
    }
  }, [isOpen]);

  const saveToStorage = (newLists: SavedPassengerList[]) => {
    localStorage.setItem('getra_passenger_lists', JSON.stringify(newLists));
    setLists(newLists);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <div className="bg-sky-500 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3 text-white">
            <Icons.Truck className="w-6 h-6" />
            <h3 className="font-bold uppercase tracking-widest text-sm">Gerenciador de Listas de Passageiros</h3>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white rounded-full transition-all">
            <Icons.Close className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {!showEditor ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <p className="text-[13px] text-slate-500 font-medium">Você possui {lists.length} listas salvas localmente.</p>
                <button onClick={() => setShowEditor(true)} className="px-4 py-2 bg-sky-50 text-sky-600 rounded-lg font-bold text-xs uppercase hover:bg-sky-100 transition-all border border-sky-100">Nova Lista</button>
              </div>

              {lists.length === 0 ? (
                <div className="text-center py-20 opacity-40">
                  <Icons.Reports className="w-12 h-12 mx-auto mb-4" />
                  <p className="font-bold text-sm uppercase tracking-widest">Nenhuma lista encontrada</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lists.map(list => (
                    <div key={list.id} className="p-5 border border-slate-100 rounded-2xl hover:border-sky-200 hover:shadow-md transition-all group">
                      <div className="flex justify-between mb-3">
                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-400">{list.processNumber || 'S/N'}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button className="p-1 text-slate-300 hover:text-sky-500"><Icons.TrendingUp className="w-4 h-4" /></button>
                           <button onClick={() => saveToStorage(lists.filter(l => l.id !== list.id))} className="p-1 text-slate-300 hover:text-rose-500"><Icons.Cancel className="w-4 h-4" /></button>
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-700 text-sm mb-1 uppercase truncate">{list.destinationCity || 'Destino Indefinido'}</h4>
                      <p className="text-[11px] text-slate-400 font-bold uppercase mb-4">{list.passengers.length} Passageiros cadastrados</p>
                      <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold uppercase hover:bg-sky-500 hover:text-white transition-all">Ver Detalhes</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-slate-400 italic">O editor de listas está sendo carregado...</p>
              <button onClick={() => setShowEditor(false)} className="mt-4 text-sky-600 font-bold uppercase text-xs underline">Voltar para listagem</button>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t flex justify-center">
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">Ambiente de Armazenamento Local</p>
        </div>
      </div>
    </div>
  );
};

export default PassengerListModal;
