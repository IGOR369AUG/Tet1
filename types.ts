export type FileType = 'image' | 'pdf' | 'docx' | 'xlsx' | 'txt';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: FileType;
  preview: string | null;
  loadingPreview: boolean;
  width: number;
  height: number;
  rawPixels: number;
  rotation: number;
}

export type PageSize = 'a4' | 'letter' | 'legal';
export type Orientation = 'portrait' | 'landscape';
export type ImageFit = 'contain' | 'cover' | 'fill';

export interface PDFSettings {
  pageSize: PageSize;
  orientation: Orientation;
  margin: number;
  imageFit: ImageFit;
  quality: number;
}

export interface MemoryStats {
  ram: number;
  disk: number;
}

declare global {
  interface Window {
    pdfjsLib?: any;
  }
}