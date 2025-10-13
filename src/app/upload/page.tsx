'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { parseResume } from '@/lib/parsers';
import { parseResume as aiParseResume, analyzeSentiment } from '@/lib/gemini';
import { parseResumeWithML, analyzeSentimentML } from '@/lib/ml-parser';
import { storage } from '@/lib/storage';
import { Candidate } from '@/types';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<Candidate | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedData(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // Step 1: Extract text from PDF/DOCX (O(n) - single pass)
      console.log('Parsing file...');
      const resumeText = await parseResume(file);
      
      if (!resumeText || resumeText.length < 50) {
        throw new Error('Could not extract text from file. Please ensure the PDF/DOCX contains readable text.');
      }

      console.log('Extracted text length:', resumeText.length);

      // Check processing mode
      const mode = localStorage.getItem('besthire_mode') || 'ml';
      let aiData;
      let sentimentScore;

      if (mode === 'ml') {
        // Step 2: Use local ML processing (FAST - O(n))
        console.log('Processing with local ML...');
        aiData = parseResumeWithML(resumeText);
        sentimentScore = analyzeSentimentML(resumeText);
      } else {
        // Step 2: Use Gemini API (parallel processing)
        console.log('Analyzing with Gemini AI...');
        [aiData, sentimentScore] = await Promise.all([
          aiParseResume(resumeText),
          analyzeSentiment(resumeText)
        ]);

        if (!aiData) {
          throw new Error('Failed to parse resume with AI. Switching to local ML...');
        }
      }

      // Step 3: Create candidate object (O(1))
      const candidate: Candidate = {
        id: Date.now().toString(),
        name: aiData.name || 'Unknown',
        email: aiData.email || '',
        phone: aiData.phone || '',
        skills: aiData.skills || [],
        education: aiData.education || [],
        experience: aiData.experience || [],
        summary: aiData.summary || '',
        sentimentScore,
        uploadedAt: new Date().toISOString(),
        resumeText,
      };

      // Step 4: Save to local storage (O(1))
      storage.addCandidate(candidate);
      setParsedData(candidate);
      console.log('Successfully parsed candidate:', candidate.name);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to process resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Upload Resume</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Parse resumes instantly with AI
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>
              PDF, DOCX, or TXT supported
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-6 md:p-8 text-center">
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <Upload className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm md:text-base">
                    {file ? file.name : 'Click to upload'}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    PDF, DOCX, or TXT (Max 10MB)
                  </p>
                </div>
              </label>
            </div>

            {file && (
              <Button
                onClick={handleUpload}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Parse Resume
                  </>
                )}
              </Button>
            )}

            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {parsedData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <CardTitle>Parsed Successfully</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-base md:text-lg break-words">{parsedData.name}</h3>
                <p className="text-xs md:text-sm text-muted-foreground break-all">{parsedData.email}</p>
                {parsedData.phone && (
                  <p className="text-xs md:text-sm text-muted-foreground">{parsedData.phone}</p>
                )}
              </div>

              {parsedData.summary && (
                <div>
                  <h4 className="font-semibold mb-1">Summary</h4>
                  <p className="text-sm text-muted-foreground">{parsedData.summary}</p>
                </div>
              )}

              {parsedData.skills.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {parsedData.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {parsedData.experience.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Experience</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {parsedData.experience.map((exp, idx) => (
                      <li key={idx}>{exp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {parsedData.education.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Education</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {parsedData.education.map((edu, idx) => (
                      <li key={idx}>{edu}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-1">Sentiment Score</h4>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${(parsedData.sentimentScore || 0) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {((parsedData.sentimentScore || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
