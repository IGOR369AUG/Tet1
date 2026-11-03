import { PDFDocument, StandardFonts } from 'pdf-lib';
import { idb } from './idb';
import {
  readFileAsArrayBuffer,
  readPlainText,
  getDocxHtml,
  getXlsxHtml,
  renderHtmlToPageImages,
  loadImage
} from './fileParsers';
import { FileItem, PDFSettings } from '../types';

export const writeTextToPdf = async (
  pdfDoc: PDFDocument,
  text: string,
  width: number,
  height: number,
  margin: number,
  fontSize = 11
): Promise<void> => {
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const lines = text.split('\n');
  let currentPage = pdfDoc.addPage([width, height]);
  const lineHeight = fontSize * 1.2;
  let y = height - margin;
  const maxWidth = width - margin * 2;

  for (const line of lines) {
    const words = line.split(' ');
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const textWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (textWidth > maxWidth) {
        if (y < margin + lineHeight) {
          currentPage = pdfDoc.addPage([width, height]);
          y = height - margin;
        }
        currentPage.drawText(currentLine, { x: margin, y, size: fontSize, font });
        y -= lineHeight;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      if (y < margin + lineHeight) {
        currentPage = pdfDoc.addPage([width, height]);
        y = height - margin;
      }
      currentPage.drawText(currentLine, { x: margin, y, size: fontSize, font });
      y -= lineHeight;
    }
  }
};

export const generatePDF = async (items: FileItem[], settings: PDFSettings): Promise<boolean> => {
  if (!items || items.length === 0) return false;
  const pdfDoc = await PDFDocument.create();
  const mmToPt = 2.83465;
  const sizes: Record<string, [number, number]> = {
    a4: [210 * mmToPt, 297 * mmToPt],
    letter: [215.9 * mmToPt, 279.4 * mmToPt],
    legal: [215.9 * mmToPt, 355.6 * mmToPt]
  };
  const [pageW, pageH] = sizes[settings.pageSize] || sizes.a4;
  const docW = settings.orientation === 'landscape' ? pageH : pageW;
  const docH = settings.orientation === 'landscape' ? pageW : pageH;
  const margin = settings.margin * mmToPt;
  const contentWidthMm = docW / mmToPt - settings.margin * 2;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // Recuperar arquivo do IndexedDB
    const fileBlob = await idb.get(item.id);
    if (!fileBlob) {
      console.error('Arquivo não encontrado no IDB:', item.id);
      continue;
    }

    try {
      if (item.type === 'pdf') {
        const existingPdfBytes = await readFileAsArrayBuffer(fileBlob);
        const srcPdf = await PDFDocument.load(existingPdfBytes);
        const pageIndices = srcPdf.getPageIndices();
        const copiedPages = await pdfDoc.copyPages(srcPdf, pageIndices);
        copiedPages.forEach((page) => pdfDoc.addPage(page));
      } else if (item.type === 'docx' || item.type === 'xlsx') {
        const htmlContent = item.type === 'docx' ? await getDocxHtml(fileBlob) : await getXlsxHtml(fileBlob);
        const pageImages = await renderHtmlToPageImages(htmlContent, contentWidthMm);
        for (const imgDataUrl of pageImages) {
          const imgBytes = await fetch(imgDataUrl).then((res) => res.arrayBuffer());
          const embeddedImage = await pdfDoc.embedJpg(imgBytes);
          const page = pdfDoc.addPage([docW, docH]);
          const imgDims = embeddedImage.scale(1);
          const availableW = docW - margin * 2;
          const scaleFactor = availableW / imgDims.width;
          const drawnW = imgDims.width * scaleFactor;
          const drawnH = imgDims.height * scaleFactor;
          page.drawImage(embeddedImage, {
            x: margin,
            y: docH - margin - drawnH,
            width: drawnW,
            height: drawnH
          });
        }
      } else if (item.type === 'txt') {
        const textContent = await readPlainText(fileBlob);
        await writeTextToPdf(pdfDoc, `Arquivo: ${item.name}\n\n` + textContent, docW, docH, margin);
      } else if (item.type === 'image') {
        const imgUrl = URL.createObjectURL(fileBlob);
        const img = await loadImage(imgUrl);
        const canvas = document.createElement('canvas');
        const isRotated = item.rotation % 180 !== 0;
        canvas.width = isRotated ? img.naturalHeight : img.naturalWidth;
        canvas.height = isRotated ? img.naturalWidth : img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((item.rotation * Math.PI) / 180);
          ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        }
        const imgDataUrl = canvas.toDataURL('image/jpeg', settings.quality);
        const embeddedImage = await pdfDoc.embedJpg(await fetch(imgDataUrl).then((res) => res.arrayBuffer()));

        let iPageW = pageW;
        let iPageH = pageH;
        if (settings.orientation === 'landscape') {
          [iPageW, iPageH] = [iPageH, iPageW];
        }
        const iContentW = iPageW - margin * 2;
        const iContentH = iPageH - margin * 2;
        const imgDims = embeddedImage.scale(1);
        const page = pdfDoc.addPage([iPageW, iPageH]);
        let w = iContentW;
        let h = iContentH;
        let x = margin;
        let y = margin;
        const imgRatio = imgDims.width / imgDims.height;
        const pageRatio = iContentW / iContentH;

        if (settings.imageFit === 'contain') {
          if (imgRatio > pageRatio) {
            h = iContentW / imgRatio;
            y = margin + (iContentH - h) / 2;
          } else {
            w = iContentH * imgRatio;
            x = margin + (iContentW - w) / 2;
          }
        } else if (settings.imageFit === 'cover' || settings.imageFit === 'fill') {
          if (settings.imageFit === 'fill') {
            w = iContentW;
            h = iContentH;
          } else if (imgRatio > pageRatio) {
            w = iContentH * imgRatio;
            x = margin + (iContentW - w) / 2;
          } else {
            h = iContentW / imgRatio;
            y = margin + (iContentH - y) / 2;
          }
        }
        page.drawImage(embeddedImage, {
          x,
          y: iPageH - y - h,
          width: w,
          height: h
        });
        URL.revokeObjectURL(imgUrl);
      }
    } catch (err) {
      console.error('Erro ao processar item para PDF:', err);
    }
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Documento-Combinado-${new Date().toISOString().slice(0, 10)}.pdf`;
  link.click();
  return true;
};