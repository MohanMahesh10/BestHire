export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  education: string[];
  experience: string[];
  summary?: string;
  matchScore?: number;
  sentimentScore?: number;
  uploadedAt: string;
  resumeText: string;
}

export interface JobDescription {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  createdAt: string;
}

export interface AnalyticsData {
  totalCandidates: number;
  averageMatchScore: number;
  topSkills: { skill: string; count: number }[];
  sentimentDistribution: { positive: number; neutral: number; negative: number };
  confusionMatrix?: {
    truePositive: number;
    trueNegative: number;
    falsePositive: number;
    falseNegative: number;
  };
  matchDistribution: { range: string; count: number }[];
}

export interface CandidateMetrics {
  skillMatchPercentage: number;
  experienceMatchPercentage: number;
  educationMatchPercentage: number;
  overallMatchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengthAreas: string[];
  weaknessAreas: string[];
}
