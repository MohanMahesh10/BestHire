// Suggestions Agent - Generates AI-powered suggestions using Gemini API

import { BaseAgent } from './types';

export interface SuggestionsInput {
  resumeText: string;
  jobDescription: string;
  apiKey?: string;
  model?: string;
}

export interface SuggestionsResult {
  suggestions: string[];
  usedAI: boolean;
  model?: string;
}

export class SuggestionsAgent extends BaseAgent<SuggestionsInput, SuggestionsResult> {
  constructor() {
    super({
      name: 'SuggestionsAgent',
      maxRetries: 2,
      retryDelay: 1000,
      timeout: 20000,
    });
  }

  protected async process(input: SuggestionsInput): Promise<SuggestionsResult> {
    const { resumeText, jobDescription, apiKey, model } = input;

    // Try Gemini API if key is provided
    if (apiKey && apiKey.trim()) {
      try {
        const aiSuggestions = await this.getGeminiSuggestions(
          resumeText,
          jobDescription,
          apiKey,
          model || 'gemini-2.0-flash-exp'
        );
        return {
          suggestions: aiSuggestions,
          usedAI: true,
          model: model || 'gemini-2.0-flash-exp',
        };
      } catch (error) {
        // Fall back to ML-based suggestions
        console.warn('Gemini API failed, using ML fallback:', error);
      }
    }

    // ML-based fallback suggestions
    const mlSuggestions = this.generateMLSuggestions(resumeText, jobDescription);
    return {
      suggestions: mlSuggestions,
      usedAI: false,
    };
  }

  private async getGeminiSuggestions(
    resumeText: string,
    jdText: string,
    apiKey: string,
    model: string
  ): Promise<string[]> {
    const prompt = `You are a professional recruitment consultant. Analyze this resume against the job description and provide 5-8 specific, actionable suggestions to improve the candidate's fit.

RESUME:
${resumeText.substring(0, 2000)}

JOB DESCRIPTION:
${jdText.substring(0, 1000)}

Provide suggestions in this format:
1. [Specific suggestion]
2. [Specific suggestion]
...

Focus on:
- Skills to highlight or add
- Experience to emphasize
- Keywords to include
- Formatting improvements
- Missing qualifications to address`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse numbered suggestions
    const suggestions = text
      .split('\n')
      .filter((line: string) => /^\d+\./.test(line.trim()))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((s: string) => s.length > 10);

    if (suggestions.length === 0) {
      throw new Error('No valid suggestions from Gemini');
    }

    return suggestions;
  }

  private generateMLSuggestions(resumeText: string, jdText: string): string[] {
    const suggestions: string[] = [];
    const resumeLower = resumeText.toLowerCase();
    const jdLower = jdText.toLowerCase();

    // Extract keywords from JD
    const jdKeywords: string[] = jdText
      .toLowerCase()
      .match(/\b[a-z]{4,}\b/g) || [];
    const resumeKeywords: string[] = resumeText
      .toLowerCase()
      .match(/\b[a-z]{4,}\b/g) || [];

    // Missing keywords
    const missingKeywords = [...new Set(jdKeywords)]
      .filter((keyword: string) => !resumeKeywords.includes(keyword))
      .slice(0, 5);

    if (missingKeywords.length > 0) {
      suggestions.push(
        `Consider adding relevant keywords: ${missingKeywords.slice(0, 3).join(', ')}`
      );
    }

    // Technical skills
    if (jdLower.includes('skill') && !resumeLower.includes('skill')) {
      suggestions.push('Add a dedicated skills section to highlight your technical abilities');
    }

    // Projects
    if (!resumeLower.includes('project')) {
      suggestions.push('Include relevant projects that demonstrate your expertise');
    }

    // Metrics
    if (!/\d+%|\d+\+/.test(resumeText)) {
      suggestions.push('Add quantifiable achievements and metrics to showcase impact');
    }

    // Certifications
    if (jdLower.includes('certif') && !resumeLower.includes('certif')) {
      suggestions.push('List relevant certifications if you have them');
    }

    // Professional summary
    if (resumeText.length < 500) {
      suggestions.push('Expand your professional summary to highlight key qualifications');
    }

    // Action verbs
    if (!/\b(led|managed|developed|implemented|designed)\b/i.test(resumeText)) {
      suggestions.push('Use strong action verbs to describe your accomplishments');
    }

    return suggestions.slice(0, 8);
  }
}
