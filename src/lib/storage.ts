import { Candidate, JobDescription, AnalyticsData } from '@/types';

const CANDIDATES_KEY = 'besthire_candidates';
const JOBS_KEY = 'besthire_jobs';

export const storage = {
  getCandidates: (): Candidate[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(CANDIDATES_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCandidates: (candidates: Candidate[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CANDIDATES_KEY, JSON.stringify(candidates));
  },

  addCandidate: (candidate: Candidate) => {
    const candidates = storage.getCandidates();
    candidates.push(candidate);
    storage.saveCandidates(candidates);
  },

  getJobs: (): JobDescription[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(JOBS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveJob: (job: JobDescription) => {
    const jobs = storage.getJobs();
    jobs.push(job);
    localStorage.setItem(JOBS_KEY, JSON.stringify(jobs));
  },

  getAnalytics: (): AnalyticsData => {
    const candidates = storage.getCandidates();
    
    const totalCandidates = candidates.length;
    const averageMatchScore = candidates.reduce((sum, c) => sum + (c.matchScore || 0), 0) / totalCandidates || 0;
    
    const skillsMap = new Map<string, number>();
    candidates.forEach(c => {
      c.skills.forEach(skill => {
        skillsMap.set(skill, (skillsMap.get(skill) || 0) + 1);
      });
    });
    
    const topSkills = Array.from(skillsMap.entries())
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const sentimentDistribution = {
      positive: candidates.filter(c => (c.sentimentScore || 0) > 0.5).length,
      neutral: candidates.filter(c => (c.sentimentScore || 0) >= 0.3 && (c.sentimentScore || 0) <= 0.5).length,
      negative: candidates.filter(c => (c.sentimentScore || 0) < 0.3).length,
    };

    // Confusion Matrix (simulated based on match scores)
    // Threshold: 0.7 for "good match"
    const threshold = 0.7;
    const candidatesWithScores = candidates.filter(c => c.matchScore !== undefined);
    
    const confusionMatrix = {
      truePositive: candidatesWithScores.filter(c => (c.matchScore || 0) >= threshold && (c.sentimentScore || 0) > 0.5).length,
      trueNegative: candidatesWithScores.filter(c => (c.matchScore || 0) < threshold && (c.sentimentScore || 0) <= 0.5).length,
      falsePositive: candidatesWithScores.filter(c => (c.matchScore || 0) >= threshold && (c.sentimentScore || 0) <= 0.5).length,
      falseNegative: candidatesWithScores.filter(c => (c.matchScore || 0) < threshold && (c.sentimentScore || 0) > 0.5).length,
    };

    // Match Distribution
    const matchDistribution = [
      { range: '90-100%', count: candidates.filter(c => (c.matchScore || 0) >= 0.9).length },
      { range: '80-89%', count: candidates.filter(c => (c.matchScore || 0) >= 0.8 && (c.matchScore || 0) < 0.9).length },
      { range: '70-79%', count: candidates.filter(c => (c.matchScore || 0) >= 0.7 && (c.matchScore || 0) < 0.8).length },
      { range: '60-69%', count: candidates.filter(c => (c.matchScore || 0) >= 0.6 && (c.matchScore || 0) < 0.7).length },
      { range: '50-59%', count: candidates.filter(c => (c.matchScore || 0) >= 0.5 && (c.matchScore || 0) < 0.6).length },
      { range: '0-49%', count: candidates.filter(c => (c.matchScore || 0) < 0.5).length },
    ];

    return { 
      totalCandidates, 
      averageMatchScore, 
      topSkills, 
      sentimentDistribution,
      confusionMatrix,
      matchDistribution
    };
  }
};
