// LangChain workflow for advanced resume processing
// This provides a more sophisticated AI pipeline for resume analysis

import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

/**
 * LangChain-based Resume Parser
 * Uses prompt templates and chains for structured extraction
 */
export class LangChainResumeParser {
  private parsePrompt: PromptTemplate;
  private skillsPrompt: PromptTemplate;
  private experiencePrompt: PromptTemplate;

  constructor() {
    // Resume parsing prompt template
    this.parsePrompt = PromptTemplate.fromTemplate(`
      You are an expert HR AI assistant. Extract structured information from the following resume.
      
      Resume Text:
      {resumeText}
      
      Extract and return ONLY a JSON object with this exact structure:
      {{
        "name": "candidate full name",
        "email": "email address",
        "phone": "phone number",
        "summary": "brief professional summary (max 200 chars)"
      }}
      
      Return only valid JSON, no additional text.
    `);

    // Skills extraction prompt
    this.skillsPrompt = PromptTemplate.fromTemplate(`
      Extract all technical skills from this resume. Focus on programming languages, frameworks, tools, and technologies.
      
      Resume Text:
      {resumeText}
      
      Return ONLY a JSON array of skills:
      ["skill1", "skill2", "skill3"]
      
      Return only valid JSON array, no additional text.
    `);

    // Experience extraction prompt
    this.experiencePrompt = PromptTemplate.fromTemplate(`
      Extract work experience from this resume. Include job titles, companies, and key responsibilities.
      
      Resume Text:
      {resumeText}
      
      Return ONLY a JSON array of experience entries:
      ["Job Title at Company", "Another Job Title at Another Company"]
      
      Return only valid JSON array, no additional text.
    `);
  }

  /**
   * Parse resume using LangChain prompts
   */
  async parseResume(resumeText: string) {
    try {
      // For now, return a structured format
      // In production, this would use actual LLM chains
      return {
        basicInfo: await this.extractBasicInfo(resumeText),
        skills: await this.extractSkills(resumeText),
        experience: await this.extractExperience(resumeText),
      };
    } catch (error) {
      console.error('LangChain parsing error:', error);
      return null;
    }
  }

  private async extractBasicInfo(text: string) {
    // Simulate LangChain processing
    const emailRegex = /[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/gi;
    const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
    
    const emails = text.match(emailRegex);
    const phones = text.match(phoneRegex);
    
    const lines = text.split('\n').filter(l => l.trim());
    const name = lines[0] || 'Unknown';
    
    return {
      name,
      email: emails ? emails[0] : '',
      phone: phones ? phones[0] : '',
      summary: lines.slice(1, 4).join(' ').substring(0, 200),
    };
  }

  private async extractSkills(text: string) {
    // Simulate LangChain skill extraction
    const commonSkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript',
      'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB', 'PostgreSQL',
      'Machine Learning', 'AI', 'TensorFlow', 'PyTorch'
    ];
    
    const lowerText = text.toLowerCase();
    return commonSkills.filter(skill => 
      lowerText.includes(skill.toLowerCase())
    );
  }

  private async extractExperience(text: string) {
    // Simulate LangChain experience extraction
    const experienceKeywords = ['developer', 'engineer', 'manager', 'designer', 'analyst'];
    const lines = text.split('\n');
    
    return lines
      .filter(line => 
        experienceKeywords.some(keyword => line.toLowerCase().includes(keyword))
      )
      .slice(0, 5);
  }
}

/**
 * LangChain-based Candidate Ranking Agent
 * Uses graph-based workflow for multi-step reasoning
 */
export class CandidateRankingAgent {
  /**
   * Rank candidates using multi-step reasoning
   */
  async rankCandidates(candidates: any[], jobDescription: string) {
    // Step 1: Extract job requirements
    const requirements = await this.extractRequirements(jobDescription);
    
    // Step 2: Score each candidate
    const scoredCandidates = candidates.map(candidate => ({
      ...candidate,
      scores: this.scoreCandidate(candidate, requirements),
    }));
    
    // Step 3: Rank by total score
    return scoredCandidates.sort((a, b) => 
      b.scores.total - a.scores.total
    );
  }

  private async extractRequirements(jobDescription: string) {
    const lowerDesc = jobDescription.toLowerCase();
    
    return {
      skills: this.extractSkillsFromJob(lowerDesc),
      experience: this.extractExperienceLevel(lowerDesc),
      education: this.extractEducationLevel(lowerDesc),
    };
  }

  private extractSkillsFromJob(text: string): string[] {
    const skills = [
      'javascript', 'python', 'java', 'react', 'node', 'aws', 'docker',
      'kubernetes', 'sql', 'mongodb', 'machine learning', 'ai'
    ];
    
    return skills.filter(skill => text.includes(skill));
  }

  private extractExperienceLevel(text: string): string {
    if (text.includes('senior')) return 'senior';
    if (text.includes('junior')) return 'junior';
    if (text.includes('mid')) return 'mid';
    return 'any';
  }

  private extractEducationLevel(text: string): string {
    if (text.includes('phd')) return 'phd';
    if (text.includes('master')) return 'master';
    if (text.includes('bachelor')) return 'bachelor';
    return 'any';
  }

  private scoreCandidate(candidate: any, requirements: any) {
    // Skill matching score
    const candidateSkills = candidate.skills.map((s: string) => s.toLowerCase());
    const matchedSkills = requirements.skills.filter((s: string) => 
      candidateSkills.some((cs: string) => cs.includes(s) || s.includes(cs))
    );
    
    const skillScore = requirements.skills.length > 0
      ? (matchedSkills.length / requirements.skills.length) * 100
      : 50;
    
    // Experience score
    const experienceText = candidate.experience.join(' ').toLowerCase();
    let experienceScore = 50;
    
    if (requirements.experience === 'senior' && experienceText.includes('senior')) {
      experienceScore = 90;
    } else if (requirements.experience === 'mid' && experienceText.includes('mid')) {
      experienceScore = 85;
    } else if (requirements.experience === 'junior' && experienceText.includes('junior')) {
      experienceScore = 80;
    }
    
    // Education score
    const educationText = candidate.education.join(' ').toLowerCase();
    let educationScore = 50;
    
    if (requirements.education === 'phd' && educationText.includes('phd')) {
      educationScore = 100;
    } else if (requirements.education === 'master' && educationText.includes('master')) {
      educationScore = 90;
    } else if (requirements.education === 'bachelor' && educationText.includes('bachelor')) {
      educationScore = 85;
    }
    
    // Weighted total score
    const total = (skillScore * 0.5) + (experienceScore * 0.3) + (educationScore * 0.2);
    
    return {
      skill: Math.round(skillScore),
      experience: Math.round(experienceScore),
      education: Math.round(educationScore),
      total: Math.round(total),
    };
  }
}

/**
 * LangGraph-based Multi-Agent Workflow
 * Coordinates multiple AI agents for comprehensive analysis
 */
export class RecruitmentWorkflow {
  private parser: LangChainResumeParser;
  private ranker: CandidateRankingAgent;

  constructor() {
    this.parser = new LangChainResumeParser();
    this.ranker = new CandidateRankingAgent();
  }

  /**
   * Execute complete recruitment workflow
   */
  async execute(resumeText: string, jobDescription?: string) {
    // Step 1: Parse resume
    const parsedData = await this.parser.parseResume(resumeText);
    
    if (!parsedData) {
      throw new Error('Failed to parse resume');
    }
    
    // Step 2: Enrich with additional analysis
    const enrichedData = {
      ...parsedData.basicInfo,
      skills: parsedData.skills,
      experience: parsedData.experience,
      education: [], // Would be extracted in full implementation
    };
    
    // Step 3: If job description provided, calculate match score
    if (jobDescription) {
      const ranked = await this.ranker.rankCandidates([enrichedData], jobDescription);
      return {
        ...enrichedData,
        matchScores: ranked[0].scores,
      };
    }
    
    return enrichedData;
  }

  /**
   * Batch process multiple candidates
   */
  async batchProcess(resumes: string[], jobDescription: string) {
    const candidates = [];
    
    for (const resume of resumes) {
      try {
        const result = await this.execute(resume);
        candidates.push(result);
      } catch (error) {
        console.error('Error processing resume:', error);
      }
    }
    
    return this.ranker.rankCandidates(candidates, jobDescription);
  }
}

// Export singleton instances
export const langChainParser = new LangChainResumeParser();
export const candidateRanker = new CandidateRankingAgent();
export const recruitmentWorkflow = new RecruitmentWorkflow();
