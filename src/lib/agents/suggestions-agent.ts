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
    const prompt = `You are an expert recruitment consultant. Analyze this resume against the job description and provide EXACTLY 3 highly specific, actionable suggestions to improve the candidate's fit for this role.

RESUME:
${resumeText.substring(0, 2000)}

JOB DESCRIPTION:
${jdText.substring(0, 1000)}

CRITICAL REQUIREMENTS:
- Provide EXACTLY 3 suggestions, no more, no less
- Each suggestion must be specific and actionable
- Focus on the MOST IMPACTFUL improvements only
- Use this exact format:

1. **[Category]:** [Specific actionable suggestion with details]
2. **[Category]:** [Specific actionable suggestion with details]
3. **[Category]:** [Specific actionable suggestion with details]

Categories should be one of:
- Skills Enhancement
- Experience Emphasis
- Keyword Optimization
- Quantifiable Achievements
- Technical Proficiency
- Project Showcase
- Certification Addition
- Communication Skills

Example format:
1. **Skills Enhancement:** Add proficiency level indicators (Beginner/Intermediate/Expert) for each technical skill to help recruiters quickly assess your expertise in React (Expert), TypeScript (Advanced), and Node.js (Intermediate).
2. **Quantifiable Achievements:** Include specific metrics in your project descriptions, such as "Reduced API response time by 40%" or "Improved user engagement by 25%" to demonstrate measurable impact.
3. **Keyword Optimization:** Incorporate key terms from the job description like "cloud architecture," "microservices," and "CI/CD pipelines" throughout your experience section to pass ATS screening.

Now provide 3 suggestions for this candidate:`;

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

    // Parse exactly 3 numbered suggestions with categories
    const suggestions = text
      .split('\n')
      .filter((line: string) => /^\d+\./.test(line.trim()))
      .map((line: string) => line.replace(/^\d+\.\s*/, '').trim())
      .filter((s: string) => s.length > 20)
      .slice(0, 3); // Take exactly first 3

    if (suggestions.length < 3) {
      // If we don't get 3 structured suggestions, fall back to ML
      throw new Error('Gemini did not provide 3 structured suggestions');
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

    // Priority 1: Keywords & Skills
    if (missingKeywords.length > 0) {
      suggestions.push(
        `**Keyword Optimization:** Incorporate job-specific keywords throughout your resume: "${missingKeywords.slice(0, 3).join('", "')}" to improve ATS compatibility and demonstrate alignment with the role requirements.`
      );
    } else if (jdLower.includes('skill') && !resumeLower.includes('skill')) {
      suggestions.push(
        `**Skills Enhancement:** Add a dedicated skills section prominently displaying your technical abilities with proficiency levels to help recruiters quickly assess your capabilities.`
      );
    } else {
      suggestions.push(
        `**Technical Proficiency:** Organize your skills section into categories (Programming Languages, Frameworks, Tools, Methodologies) to showcase the breadth and depth of your technical expertise.`
      );
    }

    // Priority 2: Achievements & Metrics
    if (!/\d+%|\d+\+|\$[\d,]+/.test(resumeText)) {
      suggestions.push(
        `**Quantifiable Achievements:** Add specific metrics and numbers to your accomplishments (e.g., "Increased efficiency by 30%", "Managed team of 5", "Reduced costs by $50K") to demonstrate measurable impact and value.`
      );
    } else if (!resumeLower.includes('project')) {
      suggestions.push(
        `**Project Showcase:** Include a dedicated projects section with 2-3 relevant projects, describing technologies used, challenges solved, and outcomes achieved to demonstrate hands-on experience.`
      );
    } else {
      suggestions.push(
        `**Experience Emphasis:** Use strong action verbs (Led, Architected, Implemented, Optimized) at the beginning of each bullet point to convey leadership and initiative in your accomplishments.`
      );
    }

    // Priority 3: Format & Presentation
    if (jdLower.includes('certif') && !resumeLower.includes('certif')) {
      suggestions.push(
        `**Certification Addition:** Add relevant professional certifications (AWS, Azure, Google Cloud, etc.) to validate your expertise and meet the preferred qualifications mentioned in the job description.`
      );
    } else if (resumeText.length < 500) {
      suggestions.push(
        `**Professional Summary:** Expand your opening summary to 3-4 sentences highlighting your years of experience, key technical skills, and 1-2 notable achievements that align with this role.`
      );
    } else {
      suggestions.push(
        `**Communication Skills:** Add a brief bullet point demonstrating soft skills like "collaboration," "communication," or "problem-solving" with concrete examples from your experience to show you're a well-rounded candidate.`
      );
    }

    // Always return exactly 3 suggestions
    return suggestions.slice(0, 3);
  }
}
