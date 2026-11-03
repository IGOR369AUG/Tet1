import React from 'react';
import { Check } from 'lucide-react';

interface PostDownloadToastProps {
  onClear: () => void;
  onKeep: () => void;
}

export const PostDownloadToast: React.FC<PostDownloadToastProps> = ({ onClear, onKeep }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-4 animate-slide-up border border-slate-700 w-[90%] sm:w-auto">
    <div className="flex items-center gap-3">
      <div className="bg-emerald-500 rounded-full p-1">
        <Check size={16} className="text-slate-900 font-bold" />
      </div>
      <div className="text-sm font-medium">Download iniciado com sucesso!</div>
    </div>
    <div className="flex gap-2 w-full sm:w-auto">
      <button
        onClick={onKeep}
        className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold hover:bg-white/10 rounded-lg transition-colors border border-slate-600 hover:border-slate-500 cursor-pointer"
      >
        Manter Arquivos
      </button>
      <button
        onClick={onClear}
        className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm cursor-pointer"
      >
        Limpar Tudo
      </button>
    </div>
  </div>
);

export default PostDownloadToast;
