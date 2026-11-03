import React from 'react';
import { Layers, Loader2, FileCheck } from 'lucide-react';

interface HeaderProps {
  onConvert: () => void;
  isGenerating: boolean;
  hasItems: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onConvert, isGenerating, hasItems }) => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm px-4 py-3">
    <div className="max-w-7xl mx-auto flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="bg-primary text-white p-2 rounded-lg shadow-sm">
          <Layers size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">PDF MAKER</h1>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold hidden sm:block">Conversor Universal</p>
        </div>
      </div>
      <button
        onClick={onConvert}
        disabled={!hasItems || isGenerating}
        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
          !hasItems || isGenerating
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
            : 'bg-primary text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95 border border-transparent cursor-pointer'
        }`}
      >
        {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <FileCheck size={20} />}
        <span>{isGenerating ? 'Processando...' : 'Baixar PDF'}</span>
      </button>
    </div>
  </header>
);

export default Header;