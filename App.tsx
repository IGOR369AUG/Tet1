import React, { useState, useCallback, useEffect } from 'react';
import { Layers, Trash2, FileText } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DropZone } from './components/DropZone';
import { ImageCard } from './components/ImageCard';
import { SettingsPanel } from './components/SettingsPanel';
import { AboutModal } from './components/AboutModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PreviewModal } from './components/PreviewModal';
import { PostDownloadToast } from './components/PostDownloadToast';
import { FileItem, PDFSettings, MemoryStats, FileType } from './types';
import { idb } from './utils/idb';
import { generateId } from './utils/formatters';
import { loadImage, generateThumbnail } from './utils/fileParsers';
import { generatePDF } from './utils/pdfGenerator';

export const App: React.FC = () => {
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState<boolean>(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  useEffect(() => {
    // Iniciar DB e Limpar sessões anteriores
    idb.clear().catch(console.error);
    try {
      const hasSeen = localStorage.getItem('imgpdf_welcome_v3');
      if (!hasSeen) {
        setAboutOpen(true);
        localStorage.setItem('imgpdf_welcome_v3', 'true');
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const [settings, setSettings] = useState<PDFSettings>(() => {
    const defaults: PDFSettings = {
      pageSize: 'a4',
      orientation: 'portrait',
      margin: 10,
      imageFit: 'contain',
      quality: 0.8
    };
    try {
      const saved = localStorage.getItem('imgpdf_cfg');
      return saved ? JSON.parse(saved) : defaults;
    } catch {
      return defaults;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('imgpdf_cfg', JSON.stringify(settings));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [settings]);

  const getFileType = (file: File): FileType | null => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) return 'pdf';
    if (file.type.startsWith('image/')) return 'image';
    if (file.name.endsWith('.docx')) return 'docx';
    if (file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) return 'xlsx';
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) return 'txt';
    return null;
  };

  const addFiles = useCallback(async (files: FileList) => {
    if (!files || files.length === 0) return;
    setMemoryStats(null);

    const processedItems = await Promise.all(
      Array.from(files).map(async (f): Promise<FileItem | null> => {
        const type = getFileType(f);
        if (!type) return null;

        const id = generateId();
        const isImage = type === 'image';
        let width = 0;
        let height = 0;
        let rawPixels = 0;

        // Lógica de estimativa de pixels (para cálculo de memória)
        if (isImage) {
          try {
            const tempUrl = URL.createObjectURL(f);
            const img = await loadImage(tempUrl);
            width = img.naturalWidth;
            height = img.naturalHeight;
            rawPixels = width * height;
            URL.revokeObjectURL(tempUrl);
          } catch {
            rawPixels = (f.size * 5) / 4;
          }
        } else if (type === 'docx' || type === 'xlsx') {
          rawPixels = f.size * 15;
        } else if (type === 'pdf') {
          rawPixels = f.size * 2;
        } else {
          rawPixels = f.size;
        }

        // Gerar Thumbnail (leve)
        let preview: string | null = null;
        if (isImage) {
          preview = URL.createObjectURL(f);
        } else {
          preview = await generateThumbnail(f, type);
        }

        // Armazenar arquivo real no IndexedDB para liberar RAM
        await idb.put(id, f);

        // Retornamos apenas metadados leves para o React State
        return {
          id,
          name: f.name,
          size: f.size,
          type,
          preview,
          loadingPreview: false,
          width,
          height,
          rawPixels,
          rotation: 0
        };
      })
    );

    const validItems = processedItems.filter((item): item is FileItem => item !== null);
    setItems((prev) => [...prev, ...validItems]);
  }, []);

  const removeItem = useCallback(
    async (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item && item.type === 'image' && item.preview) {
        URL.revokeObjectURL(item.preview);
      }

      await idb.delete(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setMemoryStats(null);
    },
    [items]
  );

  const rotateItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, rotation: (item.rotation + 90) % 360 } : item))
    );
  }, []);

  const moveItem = useCallback((idx: number, dir: number) => {
    setItems((prev) => {
      const copy = [...prev];
      const targetIdx = idx + dir;
      if (targetIdx >= 0 && targetIdx < copy.length) {
        [copy[idx], copy[targetIdx]] = [copy[targetIdx], copy[idx]];
        return copy;
      }
      return prev;
    });
  }, []);

  const executeClearAll = async () => {
    items.forEach((i) => {
      if (i.type === 'image' && i.preview) {
        URL.revokeObjectURL(i.preview);
      }
    });
    await idb.clear();
    setItems([]);
    setMemoryStats(null);
    setConfirmClearOpen(false);
    setShowSuccessToast(false);
  };

  const calculateMemory = async () => {
    setIsCalculating(true);
    setMemoryStats(null);

    try {
      let totalRamUsage = 0;
      let totalDiskUsage = 0;
      const dbStartTime = performance.now();

      for (const item of items) {
        const blob = await idb.get(item.id);
        if (blob) {
          totalDiskUsage += blob.size;
          if (item.type === 'image') {
            totalRamUsage += item.rawPixels * 4; // 4 bytes por pixel (RGBA)
          } else {
            totalRamUsage += item.rawPixels;
          }
        }
      }

      if (performance.now() - dbStartTime < 600) {
        await new Promise((resolve) => setTimeout(resolve, 600));
      }

      setMemoryStats({ ram: totalRamUsage, disk: totalDiskUsage });
    } catch (e) {
      console.error('Erro ao calcular uso de recursos:', e);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleConvert = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setShowSuccessToast(false);
    setTimeout(async () => {
      try {
        const success = await generatePDF(items, settings);
        if (success) {
          setShowSuccessToast(true);
        }
      } catch (e) {
        console.error('Erro ao gerar PDF:', e);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  const nextPreview = () => setPreviewIndex((prev) => (prev !== null && prev < items.length - 1 ? prev + 1 : prev));
  const prevPreview = () => setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased">
      <Header onConvert={handleConvert} isGenerating={loading} hasItems={items.length > 0} />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Layers className="text-primary" size={20} /> Arquivos{' '}
                <span className="text-slate-400 text-sm font-normal ml-1">({items.length})</span>
              </h2>
              {items.length > 0 && (
                <button
                  onClick={() => setConfirmClearOpen(true)}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 size={14} /> Limpar Tudo
                </button>
              )}
            </div>
            <DropZone onFiles={addFiles} hasItems={items.length > 0} />
            {items.length > 0 && (
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 animate-fade-in">
                {items.map((item, i) => (
                  <ImageCard
                    key={item.id}
                    item={item}
                    idx={i}
                    total={items.length}
                    onRemove={removeItem}
                    onRotate={rotateItem}
                    onMove={moveItem}
                    onPreview={setPreviewIndex}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:sticky lg:top-24">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <FileText size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Configuração PDF</h2>
            </div>
            <SettingsPanel
              settings={settings}
              onChange={setSettings}
              memoryStats={memoryStats}
              onCalculate={calculateMemory}
              itemsCount={items.length}
              isCalculating={isCalculating}
            />
          </div>
        </div>
      </main>
      <Footer onOpenAbout={() => setAboutOpen(true)} />

      {showSuccessToast && (
        <PostDownloadToast onKeep={() => setShowSuccessToast(false)} onClear={executeClearAll} />
      )}

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
      <ConfirmationModal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={executeClearAll}
      />

      <PreviewModal
        isOpen={previewIndex !== null}
        onClose={() => setPreviewIndex(null)}
        item={previewIndex !== null ? items[previewIndex] : null}
        onNext={nextPreview}
        onPrev={prevPreview}
        hasNext={previewIndex !== null && previewIndex < items.length - 1}
        hasPrev={previewIndex !== null && previewIndex > 0}
      />
    </div>
  );
};

export default App;