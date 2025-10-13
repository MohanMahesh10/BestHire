import { GoogleGenAI } from '@google/genai';

function getApiKey(): string {
  // Try to get API key from localStorage first (set via setup page)
  if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem('besthire_api_key');
    if (storedKey) return storedKey;
  }
  
  // Fallback to environment variable
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
}

export async function parseResume(resumeText: string) {
  try {
    const API_KEY = getApiKey();
    
    if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Please set a valid Gemini API key');
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `Extract structured information from this resume. Return ONLY valid JSON with this exact structure:
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number",
  "skills": ["skill1", "skill2"],
  "education": ["degree/institution"],
  "experience": ["job title at company"],
  "summary": "brief professional summary"
}

Resume text:
${resumeText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    
    if (!text) {
      throw new Error('Failed to parse resume');
    }
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Failed to parse resume');
  } catch (error: any) {
    console.error('Gemini parsing error:', error);
    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key')) {
      throw new Error('Invalid API key. Please check your Gemini API key.');
    }
    return null;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const API_KEY = getApiKey();
    
    if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Please set a valid Gemini API key');
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text,
    });
    
    return response.embeddings?.[0]?.values || Array(768).fill(0);
  } catch (error) {
    console.error('Embedding error:', error);
    return Array(768).fill(0);
  }
}

export async function analyzeSentiment(text: string): Promise<number> {
  try {
    const API_KEY = getApiKey();
    
    if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
      throw new Error('Please set a valid Gemini API key');
    }

    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `Analyze the sentiment and professionalism of this text. Return ONLY a number between 0 and 1, where 0 is very negative/unprofessional and 1 is very positive/professional.

Text: ${text}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const score = parseFloat(response.text?.trim() || '0.5');
    
    return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    return 0.5;
  }
}
