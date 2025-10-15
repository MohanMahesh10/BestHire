// Insights Agent - Generates strengths, weaknesses, and recommendations

import { BaseAgent } from './types';

export interface InsightsInput {
  resumeText: string;
  jobDescription: string;
  matchScore: number;
}

export interface InsightsResult {
  strengths: string[];
  weaknesses: string[];
  areasToImprove: string[];
  constraints: string[];
}

export class InsightsAgent extends BaseAgent<InsightsInput, InsightsResult> {
  constructor() {
    super({
      name: 'InsightsAgent',
      maxRetries: 1,
      retryDelay: 500,
      timeout: 10000,
    });
  }

  protected async process(input: InsightsInput): Promise<InsightsResult> {
    const { resumeText, jobDescription, matchScore } = input;

    const strengths = this.generateStrengths(resumeText, jobDescription, matchScore);
    const weaknesses = this.generateWeaknesses(resumeText, jobDescription, matchScore);
    const areasToImprove = this.generateAreasToImprove(resumeText, matchScore);
    const constraints = this.generateConstraints(resumeText, jobDescription);

    return {
      strengths,
      weaknesses,
      areasToImprove,
      constraints,
    };
  }

  private generateStrengths(resumeText: string, jdText: string, score: number): string[] {
    const strengths: string[] = [];
    const resumeLower = resumeText.toLowerCase();
    const jdLower = jdText.toLowerCase();

    if (score >= 70) {
      strengths.push('Strong overall match with job requirements');
    }

    // Technical skills alignment
    const techKeywords = ['python', 'javascript', 'java', 'react', 'node', 'aws', 'docker', 'kubernetes'];
    const matchedTech = techKeywords.filter(tech => 
      resumeLower.includes(tech) && jdLower.includes(tech)
    );
    if (matchedTech.length >= 3) {
      strengths.push(`Technical skills align well: ${matchedTech.slice(0, 3).join(', ')}`);
    }

    // Experience indicators
    if (/\d+\+?\s*years?/i.test(resumeText)) {
      strengths.push('Relevant years of experience mentioned');
    }

    // Leadership
    if (/lead|manage|mentor|senior/i.test(resumeText)) {
      strengths.push('Demonstrated leadership experience');
    }

    // Achievements
    if (/\d+%|\d+\+|award|achievement|recognition/i.test(resumeText)) {
      strengths.push('Quantifiable achievements and recognition');
    }

    return strengths.slice(0, 5);
  }

  private generateWeaknesses(resumeText: string, jdText: string, score: number): string[] {
    const weaknesses: string[] = [];
    const resumeLower = resumeText.toLowerCase();
    const jdLower = jdText.toLowerCase();

    if (score < 40) {
      weaknesses.push('Significant gaps in required qualifications');
    }

    // Missing required skills
    const criticalSkills = ['required', 'must have', 'essential'];
    if (criticalSkills.some(term => jdLower.includes(term))) {
      weaknesses.push('May be missing critical required skills');
    }

    // Tools/technologies
    if (jdLower.includes('tool') && !resumeLower.includes('tool')) {
      weaknesses.push('Limited mention of relevant tools and technologies');
    }

    // Communication
    if (jdLower.includes('communication') && !resumeLower.includes('communication')) {
      weaknesses.push('Communication skills not highlighted');
    }

    return weaknesses.slice(0, 4);
  }

  private generateAreasToImprove(resumeText: string, score: number): string[] {
    const areas: string[] = [];
    const resumeLower = resumeText.toLowerCase();

    if (resumeText.length < 500) {
      areas.push('Resume appears too brief - consider adding more detail');
    }

    if (!resumeLower.includes('project')) {
      areas.push('Add a projects section showcasing relevant work');
    }

    if (!resumeLower.includes('skill') && !resumeLower.includes('technolog')) {
      areas.push('Create a dedicated technical skills section');
    }

    if (score < 50) {
      areas.push('Consider tailoring resume to better match job requirements');
    }

    return areas.slice(0, 4);
  }

  private generateConstraints(resumeText: string, jdText: string): string[] {
    const constraints: string[] = [];
    const resumeLower = resumeText.toLowerCase();
    const jdLower = jdText.toLowerCase();

    if (jdLower.includes('location') || jdLower.includes('remote')) {
      if (!resumeLower.includes('remote') && !resumeLower.includes('location')) {
        constraints.push('Location preference not specified');
      }
    }

    if (jdLower.includes('authorization') || jdLower.includes('visa')) {
      if (!resumeLower.includes('authorized') && !resumeLower.includes('citizen')) {
        constraints.push('Work authorization status not mentioned');
      }
    }

    return constraints.slice(0, 3);
  }
}
