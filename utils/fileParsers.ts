import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

export const loadImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = url;
  });

export const readFileAsArrayBuffer = (file: Blob): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

export const readPlainText = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });

export const getDocxHtml = async (file: Blob): Promise<string> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const result = await mammoth.convertToHtml({ arrayBuffer });
  return `<div class="docx-content" style="font-family: Arial, sans-serif;">${result.value}</div>`;
};

export const getXlsxHtml = async (file: Blob): Promise<string> => {
  const arrayBuffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const html = XLSX.utils.sheet_to_html(worksheet);
  return `<div class="xlsx-content">${html}</div>`;
};

export const renderHtmlToThumbnail = async (htmlContent: string): Promise<string> => {
  const container = document.createElement('div');
  Object.assign(container.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    width: '600px',
    background: 'white',
    padding: '40px',
    color: 'black',
    fontSize: '14px',
    lineHeight: '1.5'
  });
  container.innerHTML = htmlContent;
  document.body.appendChild(container);
  try {
    const canvas = await html2canvas(container, {
      scale: 0.5,
      width: 600,
      height: 800,
      logging: false
    });
    return canvas.toDataURL('image/jpeg', 0.6);
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export const getPdfThumbnail = async (file: Blob): Promise<string | null> => {
  if (typeof window === 'undefined' || !window.pdfjsLib) return null;
  try {
    const buffer = await readFileAsArrayBuffer(file);
    const loadingTask = window.pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const scale = 0.5;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
    return canvas.toDataURL('image/jpeg', 0.8);
  } catch (err) {
    console.warn('PDF thumbnail failed:', err);
    return null;
  }
};

export const getTxtThumbnail = async (file: Blob): Promise<string> => {
  const text = await readPlainText(file);
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 300, 400);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, 300, 400);
    ctx.fillStyle = '#334155';
    ctx.font = '10px monospace';
    const lines = text.slice(0, 1000).split('\n').slice(0, 30);
    lines.forEach((line, i) => ctx.fillText(line.slice(0, 40), 15, 25 + i * 12));
  }
  return canvas.toDataURL('image/jpeg', 0.8);
};

export const generateThumbnail = async (file: Blob, type: string): Promise<string | null> => {
  try {
    if (type === 'pdf') return await getPdfThumbnail(file);
    if (type === 'docx') {
      const html = await getDocxHtml(file);
      return await renderHtmlToThumbnail(html);
    }
    if (type === 'xlsx') {
      const html = await getXlsxHtml(file);
      return await renderHtmlToThumbnail(html);
    }
    if (type === 'txt') return await getTxtThumbnail(file);
  } catch (e) {
    console.warn('Thumbnail generation failed', e);
  }
  return null;
};

export const renderHtmlToPageImages = async (htmlContent: string, widthMm: number): Promise<string[]> => {
  const container = document.createElement('div');
  container.id = 'hidden-render-container';
  Object.assign(container.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    width: `${Math.floor(widthMm * 3.78)}px`,
    backgroundColor: 'white',
    padding: '40px',
    color: '#000'
  });
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  try {
    const fullCanvas = await html2canvas(container, {
      scale: 1.5,
      useCORS: true,
      logging: false
    });

    const pageHeightRatio = 1.414;
    const pageWidth = fullCanvas.width;
    const pageHeight = pageWidth * pageHeightRatio;
    const totalHeight = fullCanvas.height;
    const pages: string[] = [];
    let currentY = 0;

    while (currentY < totalHeight) {
      const h = Math.min(pageHeight, totalHeight - currentY);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = pageWidth;
      pageCanvas.height = h;
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, pageWidth, h);
        ctx.drawImage(fullCanvas, 0, currentY, pageWidth, h, 0, 0, pageWidth, h);
      }
      pages.push(pageCanvas.toDataURL('image/jpeg', 0.85));
      currentY += h;
    }
    return pages;
  } finally {
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};
