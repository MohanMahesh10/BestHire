import { Candidate, CandidateMetrics } from '@/types';

export function calculateCandidateMetrics(
  candidate: Candidate,
  jobRequirements: {
    requiredSkills: string[];
    experienceLevel?: string;
    educationLevel?: string;
  }
): CandidateMetrics {
  // Skill Match Calculation
  const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
  const requiredSkillsLower = jobRequirements.requiredSkills.map(s => s.toLowerCase());
  
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  
  requiredSkillsLower.forEach(reqSkill => {
    const found = candidateSkillsLower.some(candSkill => 
      candSkill.includes(reqSkill) || reqSkill.includes(candSkill)
    );
    
    if (found) {
      const originalSkill = jobRequirements.requiredSkills[requiredSkillsLower.indexOf(reqSkill)];
      matchedSkills.push(originalSkill);
    } else {
      const originalSkill = jobRequirements.requiredSkills[requiredSkillsLower.indexOf(reqSkill)];
      missingSkills.push(originalSkill);
    }
  });
  
  const skillMatchPercentage = requiredSkillsLower.length > 0
    ? (matchedSkills.length / requiredSkillsLower.length) * 100
    : 0;

  // Experience Match Calculation
  let experienceMatchPercentage = 50; // Default
  
  if (jobRequirements.experienceLevel) {
    const experienceText = candidate.experience.join(' ').toLowerCase();
    const level = jobRequirements.experienceLevel.toLowerCase();
    
    if (level.includes('senior') && experienceText.includes('senior')) {
      experienceMatchPercentage = 90;
    } else if (level.includes('mid') && (experienceText.includes('mid') || experienceText.includes('senior'))) {
      experienceMatchPercentage = 85;
    } else if (level.includes('junior') && experienceText.includes('junior')) {
      experienceMatchPercentage = 80;
    } else if (candidate.experience.length >= 3) {
      experienceMatchPercentage = 70;
    } else if (candidate.experience.length >= 1) {
      experienceMatchPercentage = 60;
    }
  }

  // Education Match Calculation
  let educationMatchPercentage = 50; // Default
  
  if (jobRequirements.educationLevel) {
    const educationText = candidate.education.join(' ').toLowerCase();
    const level = jobRequirements.educationLevel.toLowerCase();
    
    if (level.includes('phd') && educationText.includes('phd')) {
      educationMatchPercentage = 100;
    } else if (level.includes('master') && (educationText.includes('master') || educationText.includes('phd'))) {
      educationMatchPercentage = 95;
    } else if (level.includes('bachelor') && educationText.includes('bachelor')) {
      educationMatchPercentage = 90;
    } else if (candidate.education.length > 0) {
      educationMatchPercentage = 70;
    }
  }

  // Overall Match Percentage (weighted average)
  const overallMatchPercentage = (
    skillMatchPercentage * 0.5 +        // 50% weight on skills
    experienceMatchPercentage * 0.3 +   // 30% weight on experience
    educationMatchPercentage * 0.2      // 20% weight on education
  );

  // Strength and Weakness Areas
  const strengthAreas: string[] = [];
  const weaknessAreas: string[] = [];

  if (skillMatchPercentage >= 70) strengthAreas.push('Technical Skills');
  else weaknessAreas.push('Technical Skills');

  if (experienceMatchPercentage >= 70) strengthAreas.push('Experience Level');
  else weaknessAreas.push('Experience Level');

  if (educationMatchPercentage >= 70) strengthAreas.push('Education');
  else weaknessAreas.push('Education');

  if ((candidate.sentimentScore || 0) > 0.7) strengthAreas.push('Professional Presentation');
  else if ((candidate.sentimentScore || 0) < 0.5) weaknessAreas.push('Professional Presentation');

  return {
    skillMatchPercentage: Math.round(skillMatchPercentage),
    experienceMatchPercentage: Math.round(experienceMatchPercentage),
    educationMatchPercentage: Math.round(educationMatchPercentage),
    overallMatchPercentage: Math.round(overallMatchPercentage),
    matchedSkills,
    missingSkills,
    strengthAreas,
    weaknessAreas,
  };
}
