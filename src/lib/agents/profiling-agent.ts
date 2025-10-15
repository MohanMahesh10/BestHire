// Profiling Agent - Extracts structured candidate information

import { BaseAgent } from './types';
import { parseResumeWithML } from '../ml-parser';

export interface ProfilingInput {
  text: string;
}

export interface CandidateProfile {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string[];
  education: string[];
  summary: string;
}

export class ProfilingAgent extends BaseAgent<ProfilingInput, CandidateProfile> {
  constructor() {
    super({
      name: 'ProfilingAgent',
      maxRetries: 1,
      retryDelay: 500,
      timeout: 15000,
    });
  }

  protected async process(input: ProfilingInput): Promise<CandidateProfile> {
    const { text } = input;

    if (!text || text.trim().length < 50) {
      throw new Error('Insufficient text for profiling. Please ensure the resume contains readable text.');
    }

    // Use ML parser to extract candidate information
    const parsed = parseResumeWithML(text);

    // More lenient validation - provide defaults if extraction fails
    const profile: CandidateProfile = {
      name: parsed.name && parsed.name !== 'Unknown' ? parsed.name : 'Candidate',
      email: parsed.email || 'Not found',
      phone: parsed.phone || 'Not found',
      skills: parsed.skills && parsed.skills.length > 0 ? parsed.skills : ['Skills not extracted'],
      experience: parsed.experience && parsed.experience.length > 0 ? parsed.experience : ['Experience not extracted'],
      education: parsed.education && parsed.education.length > 0 ? parsed.education : ['Education not extracted'],
      summary: parsed.summary || 'Summary not available',
    };

    // Only throw error if we have absolutely no useful information
    if (profile.name === 'Candidate' && profile.email === 'Not found' && profile.skills[0] === 'Skills not extracted') {
      throw new Error('Could not extract sufficient candidate information. The resume may be poorly formatted, image-based, or corrupted. Please try a different file or ensure the PDF contains selectable text.');
    }

    // Warn if name is missing but continue
    if (profile.name === 'Candidate') {
      console.warn('Warning: Could not extract candidate name. Using placeholder.');
    }

    return profile;
  }
}
