'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, Trophy, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Progress } from '@/components/Progress';
import { storage } from '@/lib/storage';
import { generateEmbedding } from '@/lib/gemini';
import { generateEmbeddingML } from '@/lib/ml-parser';
import { generateClientEmbedding } from '@/lib/client-embeddings';
import { calculateCandidateMetrics } from '@/lib/metrics';
import { cosineSimilarity } from '@/lib/utils';
import { Candidate, CandidateMetrics } from '@/types';

interface RankedCandidate extends Candidate {
  matchScore: number;
  metrics?: CandidateMetrics;
}

export default function MatchPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  useEffect(() => {
    setCandidates(storage.getCandidates());
  }, []);

  const handleMatch = async () => {
    if (!jobDescription.trim() || candidates.length === 0) return;
    
    if (jobDescription.trim().length < 10) {
      alert('Please enter a more detailed job description (at least 10 characters)');
      return;
    }

    setLoading(true);

    try {
      const mode = localStorage.getItem('besthire_mode') || 'ml';
      let jobEmbedding: number[];

      // Extract required skills from job description
      const skillKeywords = [
        'react', 'angular', 'vue', 'node', 'python', 'java', 'javascript', 'typescript',
        'aws', 'azure', 'docker', 'kubernetes', 'sql', 'mongodb', 'postgresql',
        'agile', 'scrum', 'devops', 'ci/cd', 'testing', 'api', 'rest', 'graphql'
      ];
      
      const requiredSkills: string[] = [];
      const lowerJobDesc = jobDescription.toLowerCase();
      
      skillKeywords.forEach(skill => {
        if (lowerJobDesc.includes(skill)) {
          requiredSkills.push(skill.charAt(0).toUpperCase() + skill.slice(1));
        }
      });

      // Extract experience level
      let experienceLevel = '';
      if (lowerJobDesc.includes('senior')) experienceLevel = 'senior';
      else if (lowerJobDesc.includes('junior')) experienceLevel = 'junior';
      else if (lowerJobDesc.includes('mid')) experienceLevel = 'mid';

      // Extract education level
      let educationLevel = '';
      if (lowerJobDesc.includes('phd')) educationLevel = 'phd';
      else if (lowerJobDesc.includes('master')) educationLevel = 'master';
      else if (lowerJobDesc.includes('bachelor')) educationLevel = 'bachelor';

      // Generate job embedding once - O(1)
      // Check if we're running in a static export environment
      const isStaticExport = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
      
      if (isStaticExport || mode === 'ml') {
        // Always use ML-based embedding in static export environments
        jobEmbedding = generateEmbeddingML(jobDescription);
      } else {
        try {
          jobEmbedding = await generateEmbedding(jobDescription);
        } catch (err) {
          // Fallback to ML-based embedding if API fails
          console.log('Falling back to ML embeddings:', err);
          jobEmbedding = generateEmbeddingML(jobDescription);
        }
      }

      // Process candidates - O(n) for ML mode
      const rankedResults: RankedCandidate[] = [];
      
      for (const candidate of candidates) {
        // Build comprehensive candidate text
        const candidateText = `${candidate.summary || ''} ${candidate.skills.join(' ')} ${candidate.experience.join(' ')} ${candidate.education.join(' ')}`.trim();
        
        // Skip if candidate has no meaningful content
        if (candidateText.length < 10) {
          rankedResults.push({
            ...candidate,
            matchScore: 0,
            metrics: calculateCandidateMetrics(candidate, {
              requiredSkills,
              experienceLevel,
              educationLevel,
            }),
          });
          continue;
        }
        
        let candidateEmbedding: number[];
        // Use the same approach as with job embedding for consistency
        if (isStaticExport || mode === 'ml') {
          candidateEmbedding = generateEmbeddingML(candidateText);
        } else {
          try {
            candidateEmbedding = await generateEmbedding(candidateText);
          } catch (err) {
            console.log('Falling back to ML embeddings for candidate:', err);
            candidateEmbedding = generateEmbeddingML(candidateText);
          }
        }
        
        let similarity = cosineSimilarity(jobEmbedding, candidateEmbedding);
        
        // Fallback: If similarity is 0, use skill-based matching as backup
        if (similarity === 0 && requiredSkills.length > 0) {
          const candidateSkills = new Set(candidate.skills.map(s => s.toLowerCase()));
          const matchedSkills = requiredSkills.filter(skill => 
            candidateSkills.has(skill.toLowerCase())
          );
          // Give at least some score based on skill matches
          similarity = matchedSkills.length / requiredSkills.length;
        }
        
        const metrics = calculateCandidateMetrics(candidate, {
          requiredSkills,
          experienceLevel,
          educationLevel,
        });

        rankedResults.push({
          ...candidate,
          matchScore: similarity,
          metrics,
        });
      }

      // Sort - O(n log n)
      rankedResults.sort((a, b) => b.matchScore - a.matchScore);

      // Update candidates in storage with match scores - O(n)
      const updatedCandidates = candidates.map(c => {
        const ranked = rankedResults.find(r => r.id === c.id);
        return ranked ? { ...c, matchScore: ranked.matchScore } : c;
      });
      storage.saveCandidates(updatedCandidates);

      setRankedCandidates(rankedResults);
    } catch (error) {
      console.error('Matching error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Match Candidates</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Rank candidates by relevance
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>
              Enter required skills and qualifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g., We're looking for a Senior Full Stack Developer with 5+ years of experience..."
              className="w-full min-h-[120px] md:min-h-[150px] p-3 md:p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-xs md:text-sm text-muted-foreground">
                {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} available
              </p>
              <Button
                onClick={handleMatch}
                disabled={loading || !jobDescription.trim() || candidates.length === 0}
                size="lg"
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Find Matches
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {rankedCandidates.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="space-y-3 md:space-y-4"
        >
          <h2 className="text-xl md:text-2xl font-bold">Ranked Candidates</h2>

          {rankedCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2">
                        {index === 0 && <Trophy className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 flex-shrink-0" />}
                        <CardTitle className="text-base md:text-lg break-words">{candidate.name}</CardTitle>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        {candidate.email && (
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span className="break-all">{candidate.email}</span>
                          </div>
                        )}
                        {candidate.phone && (
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Phone className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            {candidate.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <div className="text-2xl md:text-3xl font-bold text-primary">
                        {((candidate.matchScore || 0) * 100).toFixed(0)}%
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">Match Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Progress value={(candidate.matchScore || 0) * 100} className="h-2" />
                  </div>

                  {candidate.summary && (
                    <p className="text-sm text-muted-foreground">{candidate.summary}</p>
                  )}

                  {candidate.skills.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-xs md:text-sm">Skills</h4>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                        {candidate.skills.slice(0, 8).map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-primary/10 text-primary px-2 py-0.5 md:py-1 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                        {candidate.skills.length > 8 && (
                          <span className="text-xs text-muted-foreground self-center">
                            +{candidate.skills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {candidate.sentimentScore !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Sentiment:</span>
                      <div className="flex-1 bg-secondary rounded-full h-1.5 max-w-[100px]">
                        <div
                          className="bg-green-500 h-1.5 rounded-full"
                          style={{ width: `${candidate.sentimentScore * 100}%` }}
                        />
                      </div>
                      <span className="font-medium">
                        {(candidate.sentimentScore * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {candidates.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No candidates found. Upload resumes first to start matching.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
