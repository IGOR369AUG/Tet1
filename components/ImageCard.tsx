import React from 'react';
import {
  RotateCw,
  X,
  Eye,
  Loader2,
  FileType as FileTypeIcon,
  FileText,
  FileSpreadsheet,
  File as GenericFileIcon,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes } from '../utils/formatters';

interface ItemCardProps {
  item: FileItem;
  idx: number;
  total: number;
  onRemove: (id: string) => void;
  onRotate: (id: string) => void;
  onMove: (idx: number, direction: number) => void;
  onPreview: (idx: number) => void;
}

export const ImageCard: React.FC<ItemCardProps> = ({
  item,
  idx,
  total,
  onRemove,
  onRotate,
  onMove,
  onPreview
}) => {
  const isImage = item.type === 'image';
  const hasPreview = isImage || !!item.preview;
  const isLoading = !hasPreview && item.loadingPreview;

  let IconComp = GenericFileIcon;
  let badgeColor = 'bg-slate-500';
  if (item.type === 'pdf') {
    IconComp = FileTypeIcon;
    badgeColor = 'bg-red-500';
  } else if (item.type === 'docx') {
    IconComp = FileText;
    badgeColor = 'bg-blue-600';
  } else if (item.type === 'xlsx') {
    IconComp = FileSpreadsheet;
    badgeColor = 'bg-emerald-600';
  } else if (item.type === 'txt') {
    IconComp = FileText;
    badgeColor = 'bg-slate-500';
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative group overflow-hidden hover:shadow-md transition-shadow duration-300 flex flex-col">
      <div className="absolute top-2 right-2 flex gap-1.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
        {isImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotate(item.id);
            }}
            title="Girar 90°"
            className="p-2 bg-white/95 backdrop-blur rounded-lg text-slate-700 hover:text-primary shadow-sm border border-slate-200 hover:border-primary/30 transition-colors cursor-pointer"
          >
            <RotateCw size={16} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          title="Remover"
          className="p-2 bg-white/95 backdrop-blur rounded-lg text-slate-700 hover:text-red-600 shadow-sm border border-slate-200 hover:border-red-200 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Thumbnail Area - Clickable */}
      <div
        className={`aspect-[4/3] relative p-4 flex flex-col items-center justify-center overflow-hidden cursor-zoom-in ${
          !hasPreview ? 'bg-slate-50 pdf-pattern' : 'bg-slate-100/30'
        }`}
        onClick={() => onPreview(idx)}
      >
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors z-[5] flex items-center justify-center">
          <Eye
            className="text-white opacity-0 group-hover:opacity-100 transform scale-90 group-hover:scale-100 transition-all drop-shadow-lg"
            size={32}
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center text-slate-400">
            <Loader2 size={24} className="animate-spin mb-2" />
            <span className="text-[10px] font-medium">Gerando preview...</span>
          </div>
        ) : hasPreview && item.preview ? (
          <div className="relative group-hover:scale-[1.02] transition-transform duration-300 w-full h-full flex items-center justify-center">
            <img
              src={item.preview}
              className={`max-w-full max-h-full object-contain ${!isImage ? 'shadow-md ring-1 ring-black/5' : ''}`}
              style={{ maxHeight: '100%', transform: `rotate(${item.rotation}deg)` }}
              alt="Preview"
            />
            {!isImage && (
              <div
                className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[9px] font-bold text-white shadow-sm tracking-wider ${badgeColor}`}
              >
                {item.type.toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center w-full px-2">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm bg-slate-100 text-slate-500">
              <IconComp size={32} />
            </div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.type}</span>
          </div>
        )}
      </div>

      {/* Filename Info */}
      <div className="px-3 py-2 border-t border-slate-100 bg-white min-h-[50px] flex flex-col justify-center">
        <p className="text-xs font-medium text-slate-700 truncate w-full mb-0.5" title={item.name}>
          {item.name}
        </p>
        <p className="text-[10px] text-slate-400 font-mono">{formatBytes(item.size)}</p>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/50 mt-auto">
        <div className="bg-white border border-slate-200 px-2 py-1 rounded-md text-[11px] font-mono font-bold text-slate-500">
          #{String(idx + 1).padStart(2, '0')}
        </div>
        <div className="flex gap-1">
          <button
            disabled={idx === 0}
            onClick={(e) => {
              e.stopPropagation();
              onMove(idx, -1);
            }}
            title="Mover para a esquerda"
            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-30 hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            disabled={idx === total - 1}
            onClick={(e) => {
              e.stopPropagation();
              onMove(idx, 1);
            }}
            title="Mover para a direita"
            className="p-1.5 text-slate-400 hover:text-slate-800 disabled:opacity-30 hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;