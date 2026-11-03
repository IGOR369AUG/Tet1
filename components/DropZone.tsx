import React, { useRef, useState } from 'react';
import { UploadCloud, Plus } from 'lucide-react';

interface DropZoneProps {
  onFiles: (files: FileList) => void;
  hasItems: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFiles, hasItems }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFiles(e.target.files);
    }
    if (fileInput.current) {
      fileInput.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.length) {
      onFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onClick={() => fileInput.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDrag(false);
      }}
      onDrop={handleDrop}
      className={`cursor-pointer rounded-2xl transition-all duration-300 flex flex-col items-center justify-center text-center border-2 border-dashed ${
        drag
          ? 'border-primary bg-primary/5 scale-[1.01]'
          : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'
      } ${hasItems ? 'py-8' : 'py-20'}`}
    >
      <input
        type="file"
        ref={fileInput}
        onChange={handleFileChange}
        multiple
        accept="image/*,application/pdf,.docx,.xlsx,.txt,.csv"
        className="hidden"
      />
      <div
        className={`p-4 rounded-full mb-4 transition-all duration-300 ${
          drag
            ? 'bg-primary text-white shadow-lg scale-110'
            : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-primary shadow-sm'
        }`}
      >
        {hasItems ? <Plus size={24} /> : <UploadCloud size={32} />}
      </div>
      <h3 className="text-lg font-semibold text-slate-700">
        {hasItems ? 'Adicionar mais arquivos' : 'Solte seus arquivos aqui'}
      </h3>
      <p className="text-sm text-slate-500 mt-2 font-medium">
        Suporta Imagens (PNG, JPG, WEBP), PDF, DOCX, XLSX, CSV e TXT
      </p>
    </div>
  );
};

export default DropZone;