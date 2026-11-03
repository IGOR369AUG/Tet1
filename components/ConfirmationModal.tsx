import React from 'react';
import { Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-auto relative z-10 animate-fade-in overflow-hidden p-6"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 ring-4 ring-red-50">
            <Trash2 size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Limpar Lista?</h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            Você tem certeza que deseja remover todos os arquivos carregados da sessão atual?
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors shadow-sm shadow-red-200 cursor-pointer"
            >
              Sim, Limpar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;