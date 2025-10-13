import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Try pdf2json first (fast, lightweight)
    try {
      const PDFParser = require('pdf2json');
      const pdfParser = new PDFParser();
      
      const text = await new Promise<string>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('PDF parsing timeout'));
        }, 10000); // 10 second timeout
        
        pdfParser.on('pdfParser_dataError', (errData: any) => {
          clearTimeout(timeout);
          reject(errData.parserError);
        });
        
        pdfParser.on('pdfParser_dataReady', (pdfData: any) => {
          clearTimeout(timeout);
          try {
            // Extract text from all pages - O(n) single pass
            let fullText = '';
            if (pdfData.Pages) {
              for (const page of pdfData.Pages) {
                if (page.Texts) {
                  for (const text of page.Texts) {
                    if (text.R) {
                      for (const r of text.R) {
                        if (r.T) {
                          fullText += decodeURIComponent(r.T) + ' ';
                        }
                      }
                    }
                  }
                }
                fullText += '\n';
              }
            }
            resolve(fullText.trim());
          } catch (err) {
            reject(err);
          }
        });
        
        pdfParser.parseBuffer(buffer);
      });
      
      return NextResponse.json({ text, method: 'pdf2json' });
    } catch (pdf2jsonError) {
      console.log('pdf2json failed, trying fallback...', pdf2jsonError);
      
      // Fallback: Extract raw text from PDF buffer
      const text = buffer.toString('utf-8', 0, Math.min(buffer.length, 50000))
        .replace(/[^\x20-\x7E\n]/g, ' ') // Remove non-printable chars
        .replace(/\s+/g, ' ')
        .trim();
      
      if (text.length > 100) {
        return NextResponse.json({ text, method: 'fallback' });
      }
      
      throw new Error('Could not extract text from PDF');
    }
  } catch (error: any) {
    console.error('PDF parsing error:', error);
    return NextResponse.json({ 
      error: 'Failed to parse PDF', 
      details: error.message,
      tip: 'Please ensure the PDF contains selectable text (not scanned images)'
    }, { status: 500 });
  }
}
