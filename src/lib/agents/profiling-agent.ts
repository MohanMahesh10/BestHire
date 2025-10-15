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
      throw new Error('Insufficient text for profiling');
    }

    // Use ML parser to extract candidate information
    const parsed = parseResumeWithML(text);

    // Validate required fields
    if (!parsed.name || parsed.name === 'Unknown') {
      throw new Error('Could not extract candidate name');
    }

    if (!parsed.email) {
      throw new Error('Could not extract candidate email');
    }

    return {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      skills: parsed.skills,
      experience: parsed.experience,
      education: parsed.education,
      summary: parsed.summary,
    };
  }
}
