import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes } from '../utils/formatters';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FileItem | null;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  item,
  onNext,
  onPrev,
  hasNext,
  hasPrev
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev, hasNext, hasPrev]);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
      <button
        onClick={onClose}
        aria-label="Fechar pré-visualização"
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-20 cursor-pointer"
      >
        <X size={24} />
      </button>

      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <div className="relative max-w-full max-h-[85vh] flex items-center justify-center">
          {item.preview ? (
            <img
              src={item.preview}
              alt={item.name}
              className="max-w-full max-h-[80vh] object-contain shadow-2xl rounded-lg"
              style={{ transform: `rotate(${item.rotation}deg)` }}
            />
          ) : (
            <div className="p-12 bg-slate-800 text-white rounded-xl text-center">
              <p className="text-sm">Pré-visualização visual indisponível para este arquivo.</p>
            </div>
          )}
        </div>

        <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
          <div className="inline-block bg-black/60 text-white px-4 py-2 rounded-full backdrop-blur-sm pointer-events-auto">
            <p className="text-sm font-medium truncate max-w-xs md:max-w-md">{item.name}</p>
            <p className="text-[10px] text-white/60">
              {item.type.toUpperCase()} • {formatBytes(item.size)}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Item anterior"
            className="p-4 text-white/50 hover:text-white disabled:opacity-0 transition-all hover:scale-110 cursor-pointer disabled:cursor-default"
          >
            <ChevronLeft size={48} />
          </button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Próximo item"
            className="p-4 text-white/50 hover:text-white disabled:opacity-0 transition-all hover:scale-110 cursor-pointer disabled:cursor-default"
          >
            <ChevronRight size={48} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
