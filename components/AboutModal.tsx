import React from 'react';
import { X, Code2, ShieldCheck } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto relative z-10 animate-fade-in overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        <div className="h-24 bg-gradient-to-r from-primary to-blue-400" />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1.5 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
        <div className="px-6 pb-8 -mt-10 relative">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 border-4 border-white text-primary">
            <Code2 size={40} />
          </div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">PDF MAKER</h2>
            <p className="text-sm text-slate-500 font-medium">Versão 3.3.0 (Cloudflare Pages Ready)</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck size={16} className="text-primary" /> Privacidade Total
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Imagens, PDFs, documentos Word e planilhas Excel são processados localmente no seu navegador. Nenhum arquivo é enviado a servidores externos.
            </p>
          </div>
          <div className="text-center border-t border-slate-100 pt-6">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-4">
              Desenvolvido por
            </p>
            <div className="inline-flex items-center gap-3 bg-white border border-slate-200 px-4 py-3 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg font-serif">
                S
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900 text-sm">Syniji</div>
                <div className="text-[10px] text-slate-500 font-medium">Software Engineering</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;