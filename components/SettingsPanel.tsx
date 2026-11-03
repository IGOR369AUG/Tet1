import React from 'react';
import { HardDrive, Database, Cpu, Loader2, RotateCw } from 'lucide-react';
import { PDFSettings, MemoryStats, PageSize, Orientation, ImageFit } from '../types';
import { formatBytes } from '../utils/formatters';

interface SettingsPanelProps {
  settings: PDFSettings;
  onChange: (settings: PDFSettings) => void;
  memoryStats: MemoryStats | null;
  onCalculate: () => void;
  itemsCount: number;
  isCalculating: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
  memoryStats,
  onCalculate,
  itemsCount,
  isCalculating
}) => {
  const update = <K extends keyof PDFSettings>(k: K, v: PDFSettings[K]) =>
    onChange({ ...settings, [k]: v });

  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
          Tamanho do Papel
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['a4', 'letter', 'legal'] as PageSize[]).map((s) => (
            <button
              key={s}
              onClick={() => update('pageSize', s)}
              className={`py-2.5 text-sm border rounded-lg capitalize transition-all duration-200 font-medium cursor-pointer ${
                settings.pageSize === s
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-2 leading-tight">
          * Aplica-se às imagens e documentos. PDFs originais mantêm a geometria nativa.
        </p>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
          Orientação (Imagens)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(['portrait', 'landscape'] as Orientation[]).map((o) => (
            <button
              key={o}
              onClick={() => update('orientation', o)}
              className={`py-2.5 text-sm border rounded-lg transition-all duration-200 font-medium cursor-pointer ${
                settings.orientation === o
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {o === 'portrait' ? 'Retrato (Vertical)' : 'Paisagem (Horizontal)'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex justify-between mb-3">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <HardDrive size={14} /> Qualidade (Imagens)
          </label>
          <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 border border-slate-200 rounded text-primary">
            {Math.round(settings.quality * 100)}%
          </span>
        </div>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={settings.quality}
          onChange={(e) => update('quality', parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium">
          <span>Menor (Web)</span>
          <span>Melhor (Print)</span>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-3">
          Ajuste de Imagem
        </label>
        <div className="relative">
          <select
            value={settings.imageFit}
            onChange={(e) => update('imageFit', e.target.value as ImageFit)}
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none shadow-sm cursor-pointer"
          >
            <option value="contain">Ajustar (Manter Proporção)</option>
            <option value="cover">Preencher (Recortar)</option>
            <option value="fill">Esticar (Preencher Tudo)</option>
          </select>
          <div className="absolute right-3 top-3.5 pointer-events-none text-slate-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>

      {/* Bloco: Pré-processamento e Diagnóstico */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3 z-10 relative">
          <Database size={14} className="text-primary fill-primary" />
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Pré-processamento & Diagnóstico
          </h3>
        </div>

        {memoryStats === null ? (
          <button
            onClick={onCalculate}
            disabled={itemsCount === 0 || isCalculating}
            className="w-full py-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:text-primary hover:border-primary/50 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isCalculating ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Analisando Banco de Dados...
              </>
            ) : (
              <>
                <Cpu size={14} /> Calcular Consumo Real
              </>
            )}
          </button>
        ) : (
          <div className="animate-fade-in space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm p-2 bg-white rounded-t-lg border border-slate-100 shadow-sm">
                <span className="text-slate-500 font-medium text-xs">Disco (IndexedDB):</span>
                <span className="font-mono font-bold text-slate-700">{formatBytes(memoryStats.disk)}</span>
              </div>
              <div className="flex justify-between items-center text-sm p-2 bg-white rounded-b-lg border-x border-b border-slate-100 shadow-sm">
                <span className="text-slate-500 font-medium text-xs">RAM (Processamento):</span>
                <span
                  className={`font-mono font-bold ${
                    memoryStats.ram > 1024 * 1024 * 1024 ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {formatBytes(memoryStats.ram)}
                </span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-center leading-tight">
              Arquivos armazenados seguramente em disco local. Memória RAM liberada.
            </div>
            <button
              onClick={onCalculate}
              disabled={isCalculating}
              className="w-full py-1.5 text-[10px] text-slate-400 hover:text-slate-600 border border-transparent hover:border-slate-200 rounded transition-all flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              {isCalculating ? <Loader2 size={10} className="animate-spin" /> : <RotateCw size={10} />}
              {isCalculating ? 'Recalculando...' : 'Recalcular'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;