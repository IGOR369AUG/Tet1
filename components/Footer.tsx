import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface FooterProps {
  onOpenAbout: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAbout }) => (
  <footer className="bg-white border-t border-slate-200 mt-auto py-4 px-6">
    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm">
      <p className="text-slate-400 flex items-center gap-1.5">
        <ShieldCheck size={16} className="text-emerald-500" /> Processamento 100% local no navegador
      </p>
      <div className="flex items-center gap-6">
        <button
          onClick={onOpenAbout}
          className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors font-medium cursor-pointer"
        >
          <Info size={16} /> Sobre
        </button>
        <span className="text-slate-300">|</span>
        <span className="font-semibold text-slate-400 tracking-wider text-[10px]">POWERED BY SYNIJI</span>
      </div>
    </div>
  </footer>
);

export default Footer;