import * as pdfjs from 'pdfjs-dist';
import { TextItem } from 'pdfjs-dist/types/src/display/api';

// Set worker source path - required for PDF.js
// In a static export, we need to use the browser-compatible distribution
// We need to set the worker URL before using any PDF.js functionality
const pdfjsWorkerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerSrc;

export async function parseResumeClient(file: File): Promise<string> {
  const fileType = file.name.toLowerCase();
  
  if (fileType.endsWith('.pdf')) {
    return parsePDFClient(file);
  } else if (fileType.endsWith('.docx')) {
    // For DOCX, we could use mammoth.js, but it needs to be configured for browser
    throw new Error('DOCX parsing in browser is not supported in this deployment. Please convert to PDF.');
  } else if (fileType.endsWith('.txt')) {
    // Support plain text files for easy testing
    return file.text();
  } else {
    throw new Error('Unsupported file type. Please upload PDF or TXT');
  }
}

export async function parsePDFClient(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Use PDF.js to parse the document
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item) => (item as TextItem).str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('Client-side PDF parsing error:', error);
    
    // Fallback method for simple PDFs
    try {
      const text = await file.text();
      // Clean up the text to handle binary data
      const cleanedText = text
        .replace(/[^\x20-\x7E\n]/g, ' ') // Remove non-printable chars
        .replace(/\s+/g, ' ')
        .trim();
        
      if (cleanedText.length > 100) {
        return cleanedText;
      }
    } catch (fallbackError) {
      console.error('Fallback parsing failed:', fallbackError);
    }
    
    throw new Error('Failed to parse PDF. Please ensure the PDF contains selectable text (not scanned images)');
  }
}