export async function parsePDF(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/parse-pdf', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to parse PDF');
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF');
  }
}

export async function parseDOCX(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/parse-docx', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to parse DOCX');
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX');
  }
}

export async function parseResume(file: File): Promise<string> {
  const fileType = file.name.toLowerCase();
  
  // Check if we're running in a browser environment and if API routes might not be available (static export)
  const isStaticExport = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
  
  // For static export (GitHub Pages), use client-side parsing
  if (isStaticExport) {
    // Import dynamically to avoid SSR issues
    const { parseResumeClient } = await import('./client-parsers');
    return parseResumeClient(file);
  }
  
  // For development or server-side environments, use API routes
  if (fileType.endsWith('.pdf')) {
    return parsePDF(file);
  } else if (fileType.endsWith('.docx')) {
    return parseDOCX(file);
  } else if (fileType.endsWith('.txt')) {
    // Support plain text files for easy testing
    return file.text();
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT');
  }
}
