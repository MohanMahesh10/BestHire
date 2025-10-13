'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Key, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';

export default function SetupPage() {
  const [apiKey, setApiKey] = useState('');
  const [useML, setUseML] = useState(true);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Don't auto-redirect - always show setup options
    // Users can choose mode every time they start the app
  }, [router]);

  const validateApiKey = async () => {
    setValidating(true);
    setError('');

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      
      // Test the API key with a simple prompt
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Say "valid" if you can read this',
      });
      
      const text = response.text;
      
      if (text) {
        localStorage.setItem('besthire_api_key', apiKey);
        localStorage.setItem('besthire_mode', 'api');
        setSuccess(true);
        
        setTimeout(() => {
          router.push('/upload');
        }, 1000);
      } else {
        throw new Error('Invalid response from API');
      }
    } catch (err: any) {
      console.error('API validation error:', err);
      
      // Provide helpful error message based on error type
      let errorMsg = 'Invalid API key. ';
      
      const errString = err.toString().toLowerCase();
      const errMessage = err.message?.toLowerCase() || '';
      
      if (errString.includes('api_key_invalid') || errMessage.includes('api_key_invalid')) {
        errorMsg += 'The API key format is invalid. Make sure you copied the entire key.';
      } else if (errString.includes('403') || errMessage.includes('403')) {
        errorMsg += 'API key is not authorized. Check if the API is enabled in Google Cloud Console.';
      } else if (errString.includes('429') || errMessage.includes('429')) {
        errorMsg += 'Rate limit exceeded. Try again in a few minutes.';
      } else if (errString.includes('quota') || errMessage.includes('quota')) {
        errorMsg += 'API quota exceeded. Check your usage limits.';
      } else if (errString.includes('network') || errMessage.includes('network')) {
        errorMsg += 'Network error. Check your internet connection.';
      } else {
        errorMsg += 'Please verify your API key at https://makersuite.google.com/app/apikey';
        if (err.message) {
          errorMsg += `\n\nError details: ${err.message}`;
        }
      }
      
      setError(errorMsg);
    } finally {
      setValidating(false);
    }
  };

  const useMLMode = () => {
    localStorage.setItem('besthire_mode', 'ml');
    localStorage.removeItem('besthire_api_key');
    setSuccess(true);
    
    setTimeout(() => {
      router.push('/upload');
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">BestHire</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Choose Processing Mode
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* ML Mode - Recommended */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className={`h-full cursor-pointer transition-all hover:shadow-lg ${useML ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Local ML</CardTitle>
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">Fast & Free</span>
                </div>
                <CardDescription>
                  Instant processing, no setup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>No API key required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>100% free forever</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Works offline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Privacy-focused (all local)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                    <span>Fast processing</span>
                  </li>
                </ul>
                
                <Button 
                  onClick={useMLMode}
                  className="w-full"
                  size="lg"
                  disabled={success}
                >
                  {success ? 'Redirecting...' : 'Use Local ML (Start Now)'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* API Mode */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Gemini AI API</CardTitle>
                <CardDescription>
                  Enhanced accuracy (requires key)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span>More accurate parsing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span>Better context understanding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>Requires API key</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>Needs internet connection</span>
                  </li>
                </ul>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Gemini API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Get API key from Google AI Studio →
                  </a>
                </div>

                {error && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm whitespace-pre-line">
                    {error}
                    <div className="mt-2 pt-2 border-t border-destructive/20">
                      <p className="text-xs text-muted-foreground">
                        💡 <strong>Quick Fix:</strong> Use Local ML mode on the left for instant access!
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={validateApiKey}
                  disabled={!apiKey || validating || success}
                  className="w-full"
                  variant="outline"
                >
                  {validating ? (
                    <>
                      <Key className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Validated!
                    </>
                  ) : (
                    <>
                      <Key className="mr-2 h-4 w-4" />
                      Validate & Continue
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Select your preferred mode
        </p>
      </motion.div>
    </div>
  );
}
