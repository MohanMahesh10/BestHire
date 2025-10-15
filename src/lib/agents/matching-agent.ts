// Matching Agent - Calculates compatibility score between resume and JD

import { BaseAgent } from './types';
import { generateEmbeddingML } from '../ml-parser';
import { cosineSimilarity } from '../utils';

export interface MatchingInput {
  resumeText: string;
  jobDescription: string;
}

export interface MatchingResult {
  score: number;
  fitCategory: 'good-fit' | 'partial-fit' | 'not-fit';
  resumeEmbedding: number[];
  jdEmbedding: number[];
}

export class MatchingAgent extends BaseAgent<MatchingInput, MatchingResult> {
  constructor() {
    super({
      name: 'MatchingAgent',
      maxRetries: 1,
      retryDelay: 500,
      timeout: 15000,
    });
  }

  protected async process(input: MatchingInput): Promise<MatchingResult> {
    const { resumeText, jobDescription } = input;

    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error('Resume text is too short');
    }

    if (!jobDescription || jobDescription.trim().length < 20) {
      throw new Error('Job description is too short');
    }

    // Generate embeddings
    const resumeEmbedding = generateEmbeddingML(resumeText);
    const jdEmbedding = generateEmbeddingML(jobDescription);

    // Calculate similarity score
    const similarityScore = cosineSimilarity(resumeEmbedding, jdEmbedding);
    const score = Math.round(similarityScore * 100);

    // Determine fit category
    let fitCategory: 'good-fit' | 'partial-fit' | 'not-fit';
    if (score >= 70) {
      fitCategory = 'good-fit';
    } else if (score >= 40) {
      fitCategory = 'partial-fit';
    } else {
      fitCategory = 'not-fit';
    }

    return {
      score,
      fitCategory,
      resumeEmbedding,
      jdEmbedding,
    };
  }
}
