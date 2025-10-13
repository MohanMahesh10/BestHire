// Simple client-side PDF text extraction without external libraries
export async function parseResumeClient(file: File): Promise<string> {
  const fileType = file.name.toLowerCase();
  
  if (fileType.endsWith('.pdf')) {
    return parsePDFClient(file);
  } else if (fileType.endsWith('.docx')) {
    throw new Error('DOCX parsing in browser is not supported. Please convert to PDF.');
  } else if (fileType.endsWith('.txt')) {
    return file.text();
  } else {
    throw new Error('Unsupported file type. Please upload PDF or TXT');
  }
}

export async function parsePDFClient(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Convert to Latin1 string (preserves byte values)
        let pdfText = '';
        for (const byte of uint8Array) {
          pdfText += String.fromCharCode(byte);
        }
        
        // Method 1: Extract text between parentheses (most common in PDFs)
        const textPattern = /\(([^)]+)\)/g;
        const matches = [];
        let match;
        while ((match = textPattern.exec(pdfText)) !== null) {
          let text = match[1];
          // Decode PDF escape sequences
          text = text
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\')
            .replace(/\\(\d{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
          
          if (text.trim()) {
            matches.push(text);
          }
        }
        
        // Method 2: Extract text with Tj/TJ operators
        const tjPattern = /\(([^)]*)\)\s*T[jJ]/g;
        while ((match = tjPattern.exec(pdfText)) !== null) {
          let text = match[1];
          text = text
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, ' ')
            .replace(/\\t/g, ' ')
            .replace(/\\\(/g, '(')
            .replace(/\\\)/g, ')')
            .replace(/\\\\/g, '\\');
          
          if (text.trim() && !matches.includes(text)) {
            matches.push(text);
          }
        }
        
        // Combine and clean text
        let extractedText = matches.join(' ');
        
        // Additional cleanup
        extractedText = extractedText
          .replace(/\s+/g, ' ')  // Normalize whitespace
          .replace(/\\[a-z]/g, '') // Remove remaining escape sequences
          .trim();
        
        // Decode common UTF-8 sequences that appear as garbled text
        try {
          const decoder = new TextDecoder('utf-8', { fatal: false });
          const bytes = new Uint8Array(extractedText.split('').map(c => c.charCodeAt(0)));
          const decoded = decoder.decode(bytes);
          if (decoded.length > extractedText.length * 0.8) {
            extractedText = decoded;
          }
        } catch {
          // Keep original if decoding fails
        }
        
        if (extractedText.length > 50) {
          resolve(extractedText);
        } else {
          // Fallback: extract all readable characters
          const fallbackText = Array.from(uint8Array)
            .map(byte => {
              // Include extended ASCII and common special characters
              if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13 || (byte >= 128 && byte <= 255)) {
                return String.fromCharCode(byte);
              }
              return '';
            })
            .join('')
            .replace(/[^\x20-\x7E\x80-\xFF\n\r]/g, '') // Keep printable chars
            .replace(/\s+/g, ' ')
            .trim();
          
          if (fallbackText.length > 50) {
            resolve(fallbackText);
          } else {
            reject(new Error('Could not extract text from PDF. Please ensure it is a text-based PDF.'));
          }
        }
      } catch (error) {
        console.error('PDF parsing error:', error);
        reject(new Error('Failed to parse PDF file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}