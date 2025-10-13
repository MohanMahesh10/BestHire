'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Progress } from '@/components/Progress';
import { parseResumeWithML, generateEmbeddingML } from '@/lib/ml-parser';
import { cosineSimilarity } from '@/lib/utils';

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string[];
  education: string[];
  summary: string;
  rawText: string;
}

interface MatchResult {
  score: number;
  fitCategory: 'good-fit' | 'partial-fit' | 'not-fit';
  strengths: string[];
  weaknesses: string[];
  geminiSuggestions: string[];
  areasToImprove: string[];
  constraints: string[];
}

export default function RecruitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsedResume, setParsedResume] = useState<ParsedResume | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyStatus, setApiKeyStatus] = useState<'valid' | 'invalid' | 'testing' | 'untested'>('untested');
  const [apiKeyError, setApiKeyError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setParsedResume(null);
    setMatchResult(null);
  };

  const validateApiKeyFormat = (key: string): boolean => {
    // Gemini API keys typically start with 'AIza' and are 39 characters long
    const trimmedKey = key.trim();
    return trimmedKey.startsWith('AIza') && trimmedKey.length === 39;
  };

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyStatus('invalid');
      setApiKeyError('Please enter an API key');
      return;
    }

    if (!validateApiKeyFormat(apiKey)) {
      setApiKeyStatus('invalid');
      setApiKeyError('API key must start with "AIza" and be 39 characters long');
      return;
    }

    setApiKeyStatus('testing');
    setApiKeyError('');

    try {
      // Test API key directly with Google's Gemini API using the official SDK approach
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: 'Hello'
              }]
            }]
          })
        }
      );

      if (response.ok) {
        setApiKeyStatus('valid');
        setApiKeyError('');
      } else {
        const errorData = await response.json();
        setApiKeyStatus('invalid');
        const errorMsg = errorData.error?.message || 'API key verification failed';
        
        if (errorMsg.includes('API_KEY_INVALID') || errorMsg.includes('invalid') || errorMsg.includes('not found')) {
          setApiKeyError('Invalid API key. Please check your key from Google AI Studio.');
        } else if (errorMsg.includes('quota')) {
          setApiKeyError('API quota exceeded. Please check your usage limits.');
        } else if (errorMsg.includes('not supported')) {
          setApiKeyError('Model not available. Using alternative model for validation.');
          // Try with fallback model
          const fallbackResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: 'Hello' }] }]
              })
            }
          );
          if (fallbackResponse.ok) {
            setApiKeyStatus('valid');
            setApiKeyError('');
          } else {
            setApiKeyError('API key verification failed with all models.');
          }
        } else {
          setApiKeyError(errorMsg);
        }
      }
    } catch (err) {
      setApiKeyStatus('invalid');
      const error = err as Error;
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        setApiKeyError('Network error. Please check your internet connection and try again.');
      } else {
        setApiKeyError('Failed to verify API key. Please try again.');
      }
    }
  };

  const getFitCategory = (score: number): 'good-fit' | 'partial-fit' | 'not-fit' => {
    if (score >= 70) return 'good-fit';
    if (score >= 40) return 'partial-fit';
    return 'not-fit';
  };

  const generateGeminiSuggestions = async (resumeText: string, jdText: string): Promise<string[]> => {
    // Try to use Gemini API if API key is provided
    if (apiKey && apiKey.trim()) {
      try {
        const response = await fetch('/api/gemini-suggestions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-API-Key': apiKey.trim()
          },
          body: JSON.stringify({ resume: resumeText, jobDescription: jdText }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.suggestions && data.suggestions.length > 0) {
            return data.suggestions;
          }
        }
      } catch (err) {
        console.log('Gemini API call failed, using ML suggestions');
      }
    }

    // Fallback to ML-based suggestions
    return generateMLSuggestions(resumeText, jdText);
  };

  const generateMLSuggestions = (resumeText: string, jdText: string): string[] => {
    const suggestions: string[] = [];
    
    // Analyze missing keywords
    const jdKeywords: string[] = jdText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const resumeKeywords: string[] = resumeText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    
    const missingKeywords = jdKeywords
      .filter(keyword => !resumeKeywords.includes(keyword))
      .filter((keyword, idx, arr) => arr.indexOf(keyword) === idx)
      .slice(0, 5);
    
    if (missingKeywords.length > 0) {
      suggestions.push(`Add relevant experience with: ${missingKeywords.slice(0, 3).join(', ')}`);
    }
    
    // Check for quantifiable achievements
    if (!/\d+%|\d+\+|increased|decreased|improved/i.test(resumeText)) {
      suggestions.push('Include quantifiable achievements (e.g., "Increased efficiency by 30%")');
    }
    
    // Check for action verbs
    const actionVerbs = ['developed', 'managed', 'led', 'created', 'implemented', 'designed', 'built', 'optimized'];
    const hasStrongVerbs = actionVerbs.some(verb => resumeText.toLowerCase().includes(verb));
    if (!hasStrongVerbs) {
      suggestions.push('Use stronger action verbs (developed, managed, led, implemented, etc.)');
    }
    
    // Check for certifications
    if (jdText.toLowerCase().includes('certif') && !resumeText.toLowerCase().includes('certif')) {
      suggestions.push('Add relevant certifications if available');
    }

    // Check for experience level
    if (jdText.match(/\d+\+?\s*years/i) && !resumeText.match(/\d+\+?\s*years/i)) {
      suggestions.push('Clearly state your years of experience in each technology');
    }
    
    return suggestions.slice(0, 5);
  };

  const generateStrengths = (resumeText: string, jdText: string): string[] => {
    const strengths: string[] = [];
    
    // Check for matching keywords
    const jdKeywords: string[] = jdText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const resumeKeywords: string[] = resumeText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    
    const matchingKeywords = jdKeywords
      .filter(keyword => resumeKeywords.includes(keyword))
      .filter((keyword, idx, arr) => arr.indexOf(keyword) === idx)
      .slice(0, 5);
    
    if (matchingKeywords.length > 3) {
      strengths.push(`Strong keyword match: ${matchingKeywords.slice(0, 3).join(', ')}`);
    }
    
    // Check for years of experience
    const experienceMatch = resumeText.match(/(\d+)\+?\s*years?/i);
    if (experienceMatch) {
      strengths.push(`${experienceMatch[1]}+ years of relevant experience`);
    }
    
    // Check for education
    if (/bachelor|master|phd|doctorate|degree/i.test(resumeText)) {
      strengths.push('Relevant educational background');
    }
    
    // Check for leadership
    if (/lead|manage|supervise|mentor|team lead/i.test(resumeText)) {
      strengths.push('Demonstrated leadership experience');
    }

    // Check for achievements
    if (/\d+%|\d+\+|award|achievement|recognition/i.test(resumeText)) {
      strengths.push('Quantifiable achievements and recognition');
    }
    
    return strengths.slice(0, 5);
  };

  const generateWeaknesses = (resumeText: string, jdText: string): string[] => {
    const weaknesses: string[] = [];
    
    // Check for missing required skills
    const jdKeywords: string[] = jdText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const resumeKeywords: string[] = resumeText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    
    const criticalMissing = ['required', 'must have', 'essential'].some(term => 
      jdText.toLowerCase().includes(term)
    );
    
    if (criticalMissing) {
      const missing = jdKeywords
        .filter(keyword => !resumeKeywords.includes(keyword))
        .slice(0, 3);
      if (missing.length > 0) {
        weaknesses.push(`Missing critical skills: ${missing.join(', ')}`);
      }
    }
    
    // Check for lack of specific tools/technologies
    const tools = ['framework', 'tool', 'platform', 'technology'];
    tools.forEach(tool => {
      if (jdText.toLowerCase().includes(tool) && !resumeText.toLowerCase().includes(tool)) {
        weaknesses.push(`Limited mention of relevant tools and technologies`);
      }
    });
    
    // Check for communication skills
    if (jdText.toLowerCase().includes('communication') && !resumeText.toLowerCase().includes('communication')) {
      weaknesses.push('Communication skills not highlighted');
    }
    
    return weaknesses.slice(0, 4);
  };

  const generateAreasToImprove = (resumeText: string, jdText: string): string[] => {
    const areas: string[] = [];
    
    // Resume formatting
    if (resumeText.length < 500) {
      areas.push('Resume appears too brief - consider adding more detail to experience and achievements');
    }
    
    // Projects section
    if (!resumeText.toLowerCase().includes('project')) {
      areas.push('Add a projects section showcasing relevant work');
    }
    
    // Technical skills section
    if (!resumeText.toLowerCase().includes('skills') && !resumeText.toLowerCase().includes('technologies')) {
      areas.push('Create a dedicated technical skills section');
    }
    
    // Professional summary
    if (resumeText.split('\n').length < 5) {
      areas.push('Add a professional summary at the top of your resume');
    }
    
    return areas.slice(0, 4);
  };

  const generateConstraints = (resumeText: string, jdText: string): string[] => {
    const constraints: string[] = [];
    
    // Location
    if (jdText.toLowerCase().includes('location') || jdText.toLowerCase().includes('remote')) {
      if (!resumeText.toLowerCase().includes('remote') && !resumeText.toLowerCase().includes('location')) {
        constraints.push('Location preference not specified');
      }
    }
    
    // Visa/Work authorization
    if (jdText.toLowerCase().includes('authorization') || jdText.toLowerCase().includes('visa')) {
      if (!resumeText.toLowerCase().includes('authorized') && !resumeText.toLowerCase().includes('citizen')) {
        constraints.push('Work authorization status not mentioned');
      }
    }
    
    // Salary expectations
    if (jdText.toLowerCase().includes('salary') || jdText.toLowerCase().includes('compensation')) {
      constraints.push('Consider discussing salary expectations during interview');
    }
    
    return constraints.slice(0, 3);
  };

  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // Convert to string for text extraction
          let pdfText = '';
          for (let i = 0; i < uint8Array.length; i++) {
            pdfText += String.fromCharCode(uint8Array[i]);
          }
          
          // Extract text using multiple methods
          const extractedLines: string[] = [];
          const seenTexts = new Set<string>();
          
          // Method 1: Extract text between parentheses (most reliable for PDFs)
          const textInParentheses = /\(([^)]+)\)/g;
          let match;
          
          while ((match = textInParentheses.exec(pdfText)) !== null) {
            let text = match[1];
            
            // Decode PDF escape sequences
            text = text
              .replace(/\\n/g, '\n')
              .replace(/\\r/g, ' ')
              .replace(/\\t/g, ' ')
              .replace(/\\b/g, '')
              .replace(/\\f/g, '\n')
              .replace(/\\\(/g, '(')
              .replace(/\\\)/g, ')')
              .replace(/\\\\/g, '\\')
              .replace(/\\(\d{3})/g, (_: string, oct: string) => {
                try {
                  return String.fromCharCode(parseInt(oct, 8));
                } catch {
                  return '';
                }
              });
            
            // Clean up the text
            text = text
              .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
              .trim();
            
            // Only keep meaningful text (has letters, numbers, or email/phone patterns)
            if (text.length > 0 && /[a-zA-Z0-9@.]/.test(text) && !seenTexts.has(text)) {
              seenTexts.add(text);
              extractedLines.push(text);
            }
          }
          
          // Method 2: Extract text from TJ/Tj operators (array and string text)
          const tjOperators = /\[([^\]]+)\]\s*TJ|\(([^)]+)\)\s*Tj/g;
          while ((match = tjOperators.exec(pdfText)) !== null) {
            const content = match[1] || match[2];
            if (!content) continue;
            
            // Extract text from array format [(...) (...) ...]
            const arrayTexts = content.match(/\(([^)]+)\)/g);
            if (arrayTexts) {
              arrayTexts.forEach(t => {
                let text = t.replace(/[()]/g, '').trim();
                if (text.length > 0 && /[a-zA-Z0-9@.]/.test(text) && !seenTexts.has(text)) {
                  seenTexts.add(text);
                  extractedLines.push(text);
                }
              });
            }
          }
          
          // Combine extracted text with proper spacing
          let finalText = extractedLines.join(' ');
          
          // Clean up the final text
          finalText = finalText
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between camelCase
            .replace(/([a-zA-Z])(\d)/g, '$1 $2') // Add space between letter and number
            .replace(/(\d)([a-zA-Z])/g, '$1 $2') // Add space between number and letter
            .trim();
          
          console.log('Extracted PDF text length:', finalText.length);
          console.log('First 200 chars:', finalText.substring(0, 200));
          
          if (finalText.length > 50) {
            resolve(finalText);
          } else {
            // Last resort: try to extract any readable ASCII text
            const asciiText = Array.from(uint8Array)
              .map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : ' ')
              .join('')
              .replace(/\s+/g, ' ')
              .trim();
            
            if (asciiText.length > 100) {
              console.log('Using ASCII fallback extraction');
              resolve(asciiText);
            } else {
              reject(new Error('Could not extract readable text from PDF. The PDF may be a scanned image or encrypted. Please try a different PDF with selectable text.'));
            }
          }
        } catch (err) {
          console.error('PDF parsing error:', err);
          reject(new Error('Failed to parse PDF file. Please try a different PDF.'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      if (pdfFile) {
        reader.readAsArrayBuffer(pdfFile);
      } else {
        reject(new Error('No file provided'));
      }
    });
  };

  const handleMatch = async () => {
    if (!file || !jobDescription.trim()) {
      setError('Please upload a resume and enter a job description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Extract text from resume
      const resumeText = await extractTextFromPDF(file);
      
      if (!resumeText || resumeText.length < 50) {
        throw new Error('Could not extract enough text from resume');
      }
      
      // Step 2: Parse resume
      const parsed = parseResumeWithML(resumeText);
      setParsedResume({ ...parsed, rawText: resumeText });
      
      // Step 3: Calculate match score using embeddings
      const resumeEmbedding = generateEmbeddingML(resumeText);
      const jdEmbedding = generateEmbeddingML(jobDescription);
      const similarityScore = cosineSimilarity(resumeEmbedding, jdEmbedding);
      const matchPercentage = Math.round(similarityScore * 100);
      
      // Step 4: Determine fit category
      const fitCategory = getFitCategory(matchPercentage);
      
      // Step 5: Generate comprehensive analysis
      const [geminiSuggestions, strengths, weaknesses, areasToImprove, constraints] = await Promise.all([
        generateGeminiSuggestions(resumeText, jobDescription),
        Promise.resolve(generateStrengths(resumeText, jobDescription)),
        Promise.resolve(generateWeaknesses(resumeText, jobDescription)),
        Promise.resolve(generateAreasToImprove(resumeText, jobDescription)),
        Promise.resolve(generateConstraints(resumeText, jobDescription)),
      ]);
      
      setMatchResult({
        score: matchPercentage,
        fitCategory,
        strengths,
        weaknesses,
        geminiSuggestions,
        areasToImprove,
        constraints,
      });
    } catch (err) {
      console.error('Error processing:', err);
      setError(err instanceof Error ? err.message : 'Failed to process resume');
    } finally {
      setLoading(false);
    }
  };

  const getFitColor = (category: string) => {
    switch (category) {
      case 'good-fit':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'partial-fit':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'not-fit':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getFitIcon = (category: string) => {
    switch (category) {
      case 'good-fit':
        return <CheckCircle className="h-6 w-6" />;
      case 'partial-fit':
        return <AlertCircle className="h-6 w-6" />;
      case 'not-fit':
        return <AlertCircle className="h-6 w-6" />;
      default:
        return null;
    }
  };

  const getFitLabel = (category: string) => {
    switch (category) {
      case 'good-fit':
        return 'Good Fit';
      case 'partial-fit':
        return 'Partial Fit';
      case 'not-fit':
        return 'Not a Fit';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI-Powered Recruitment</h1>
          <p className="text-lg text-gray-600">Upload resume → Enter JD → Get AI-powered matching & suggestions</p>
        </motion.div>

        {/* API Key Configuration (Optional) */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🔑 Gemini API Key (Optional)</span>
              <Button
                onClick={() => setShowApiKey(!showApiKey)}
                variant="outline"
                size="sm"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
            <CardDescription>
              Add your Gemini API key for AI-powered suggestions. Leave empty to use ML-based analysis.
            </CardDescription>
          </CardHeader>
          {showApiKey && (
            <CardContent>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setApiKeyStatus('untested');
                    }}
                    placeholder="Enter your Gemini API key (starts with AIza...)"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <Button
                    onClick={testApiKey}
                    disabled={!apiKey.trim() || apiKeyStatus === 'testing'}
                    variant="outline"
                    className="px-4"
                  >
                    {apiKeyStatus === 'testing' ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </>
                    ) : (
                      'Test'
                    )}
                  </Button>
                </div>

                {/* Validation Status */}
                {apiKey && apiKeyStatus === 'valid' && (
                  <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-green-700 font-semibold">✓ API Key Valid</p>
                      <p className="text-xs text-green-600">Your key is working. AI suggestions enabled.</p>
                    </div>
                  </div>
                )}

                {apiKey && apiKeyStatus === 'invalid' && (
                  <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-red-700 font-semibold">✗ Invalid API Key</p>
                      <p className="text-xs text-red-600 mt-1">
                        {apiKeyError || 'API key verification failed'}
                      </p>
                    </div>
                  </div>
                )}

                {apiKey && apiKeyStatus === 'untested' && (
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-700 font-semibold">⚠ Untested Key</p>
                      <p className="text-xs text-yellow-600">Click "Test" to verify your API key works.</p>
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-600">
                  Get your free API key from{' '}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Google AI Studio
                  </a>
                  {' '}• Format: AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (39 chars)
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Step 1: Upload Resume */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📄 Step 1: Upload Resume</CardTitle>
            <CardDescription>Upload a PDF resume to analyze</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    {file ? (
                      <span className="font-semibold text-blue-600">✓ {file.name}</span>
                    ) : (
                      <>
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Job Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📝 Step 2: Paste Job Description</CardTitle>
            <CardDescription>Enter the job description to match against</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here...&#10;&#10;Include:&#10;• Required skills and qualifications&#10;• Experience requirements&#10;• Job responsibilities&#10;• Nice-to-have skills"
              className="w-full h-56 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            />
            <p className="mt-2 text-xs text-gray-500">{jobDescription.length} characters</p>
          </CardContent>
        </Card>

        {/* Step 3: Validate Match Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleMatch}
            disabled={loading || !file || !jobDescription.trim()}
            size="lg"
            className="px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Analyzing with AI...
              </>
            ) : (
              <>
                <CheckCircle className="mr-3 h-6 w-6" />
                Validate Match & Get Suggestions
              </>
            )}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"
          >
            <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </motion.div>
        )}

        {/* Results Section */}
        {matchResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Match Score & Fit Category */}
            <Card className={`border-2 ${getFitColor(matchResult.fitCategory)}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {getFitIcon(matchResult.fitCategory)}
                    <div>
                      <h3 className="text-2xl font-bold">{getFitLabel(matchResult.fitCategory)}</h3>
                      <p className="text-sm opacity-75">AI Compatibility Assessment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold">{matchResult.score}%</div>
                    <p className="text-sm opacity-75">Match Score</p>
                  </div>
                </div>
                <Progress value={matchResult.score} className="h-3" />
              </CardContent>
            </Card>

            {/* Candidate Info */}
            {parsedResume && (
              <Card>
                <CardHeader>
                  <CardTitle>👤 Candidate Profile</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Name</p>
                    <p className="text-lg font-medium">{parsedResume.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">Contact</p>
                    <p className="text-lg">{parsedResume.email}</p>
                    {parsedResume.phone && <p className="text-sm text-gray-600">{parsedResume.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm font-semibold text-gray-500 mb-2">Skills ({parsedResume.skills.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {parsedResume.skills.slice(0, 12).map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Strengths & Weaknesses */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-700 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Strengths
                  </CardTitle>
                  <CardDescription>What makes this candidate strong</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {matchResult.strengths.map((strength, idx) => (
                      <li key={`strength-${idx}`} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-700 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Weaknesses
                  </CardTitle>
                  <CardDescription>Areas of concern</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {matchResult.weaknesses.length > 0 ? (
                      matchResult.weaknesses.map((weakness, idx) => (
                        <li key={`weakness-${idx}`} className="flex items-start">
                          <span className="text-red-600 mr-2">✗</span>
                          <span className="text-sm text-gray-700">{weakness}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 italic">No significant weaknesses identified</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* AI Suggestions from Gemini */}
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-700 flex items-center">
                  <span className="mr-2">🤖</span>
                  <span>AI-Powered Suggestions</span>
                </CardTitle>
                <CardDescription>Intelligent recommendations to improve this match</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {matchResult.geminiSuggestions.map((suggestion, idx) => (
                    <li key={`suggestion-${idx}`} className="flex items-start p-3 bg-white rounded-lg border border-blue-100">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mr-3">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Areas to Improve */}
            <Card className="border-orange-200">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-orange-700 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Areas to Improve
                </CardTitle>
                <CardDescription>Recommendations for the candidate</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {matchResult.areasToImprove.map((area, idx) => (
                    <li key={`area-${idx}`} className="flex items-start">
                      <span className="text-orange-600 mr-2">→</span>
                      <span className="text-sm text-gray-700">{area}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Constraints */}
            {matchResult.constraints.length > 0 && (
              <Card className="border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-purple-700 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Constraints & Considerations
                  </CardTitle>
                  <CardDescription>Important factors to consider</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {matchResult.constraints.map((constraint, idx) => (
                      <li key={`constraint-${idx}`} className="flex items-start">
                        <span className="text-purple-600 mr-2">⚠</span>
                        <span className="text-sm text-gray-700">{constraint}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
