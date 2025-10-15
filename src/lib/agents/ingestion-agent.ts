// Ingestion Agent - Handles PDF/DOCX parsing and text extraction

import { BaseAgent } from './types';

export interface IngestionInput {
  file: File;
}

export interface IngestionResult {
  text: string;
  fileName: string;
  fileSize: number;
  pageCount?: number;
  extractedAt: number;
}

export class IngestionAgent extends BaseAgent<IngestionInput, IngestionResult> {
  constructor() {
    super({
      name: 'IngestionAgent',
      maxRetries: 2,
      retryDelay: 1000,
      timeout: 30000,
    });
  }

  protected async process(input: IngestionInput): Promise<IngestionResult> {
    const { file } = input;

    if (!file) {
      throw new Error('No file provided');
    }

    const fileType = file.type.toLowerCase();
    const fileName = file.name;
    const fileSize = file.size;

    let text = '';
    let pageCount: number | undefined;

    if (fileType.includes('pdf')) {
      const result = await this.extractPDFText(file);
      text = result.text;
      pageCount = result.pageCount;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      text = await this.extractDOCXText(file);
    } else {
      throw new Error('Unsupported file type. Please upload PDF or DOCX.');
    }

    if (!text || text.trim().length < 50) {
      throw new Error('Could not extract sufficient text from file');
    }

    return {
      text,
      fileName,
      fileSize,
      pageCount,
      extractedAt: Date.now(),
    };
  }

  private async extractPDFText(file: File): Promise<{ text: string; pageCount: number }> {
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const textParts: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();

        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .filter((text: string) => text.trim().length > 0)
          .join(' ');

        if (pageText.trim()) {
          textParts.push(pageText);
        }
      }

      const fullText = textParts.join('\n\n')
        .replace(/\s+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .trim();

      return {
        text: fullText,
        pageCount: pdf.numPages,
      };
    } catch (error: any) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to parse PDF: ${error?.message || 'Unknown error'}. Please ensure the PDF is not corrupted and contains selectable text.`);
    }
  }

  private async extractDOCXText(file: File): Promise<string> {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  }
}
