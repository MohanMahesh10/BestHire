// ML Algorithm Validator - Production Quality Check
// Ensures all ML functions work correctly before deployment

import { parseResumeWithML, analyzeSentimentML, generateEmbeddingML } from './ml-parser';
import { cosineSimilarity } from './utils';

interface ValidationResult {
  passed: boolean;
  score: number;
  message: string;
  details?: any;
}

interface MLValidationReport {
  overall: boolean;
  timestamp: string;
  tests: {
    parsing: ValidationResult;
    embedding: ValidationResult;
    similarity: ValidationResult;
    sentiment: ValidationResult;
    performance: ValidationResult;
  };
}

// Test sample resume
const SAMPLE_RESUME = `
John Doe
Senior Software Engineer
john.doe@email.com
+1-555-123-4567

SUMMARY
Experienced software engineer with 8+ years in full-stack development, specializing in JavaScript, Python, and cloud technologies.

SKILLS
JavaScript, TypeScript, Python, React, Node.js, AWS, Docker, Kubernetes, SQL, MongoDB

EXPERIENCE
Senior Software Engineer at Tech Corp (2020-Present)
- Led development of microservices architecture
- Improved system performance by 40%

Software Engineer at StartupCo (2015-2020)
- Built scalable web applications
- Mentored junior developers

EDUCATION
Bachelor of Science in Computer Science
University of Technology, 2015
`;

const SAMPLE_JOB = `
Looking for a Senior Full Stack Developer with strong JavaScript, Python, and cloud experience.
Must have knowledge of React, Node.js, AWS, and microservices architecture.
5+ years of experience required.
`;

/**
 * Validate Resume Parsing
 */
function validateParsing(): ValidationResult {
  try {
    const parsed = parseResumeWithML(SAMPLE_RESUME);
    
    // Check all fields are extracted
    const checks = {
      name: parsed.name && parsed.name !== 'Unknown',
      email: parsed.email && parsed.email.includes('@'),
      phone: parsed.phone && parsed.phone.length > 0,
      skills: parsed.skills && parsed.skills.length >= 5,
      experience: parsed.experience && parsed.experience.length >= 1,
      education: parsed.education && parsed.education.length >= 1,
      summary: parsed.summary && parsed.summary.length > 20
    };
    
    const passedChecks = Object.values(checks).filter(v => v).length;
    const totalChecks = Object.keys(checks).length;
    const score = (passedChecks / totalChecks) * 100;
    
    return {
      passed: score >= 80, // 80% threshold
      score,
      message: `Parsing: ${passedChecks}/${totalChecks} fields extracted`,
      details: checks
    };
  } catch (error) {
    return {
      passed: false,
      score: 0,
      message: `Parsing failed: ${error}`,
    };
  }
}

/**
 * Validate Embedding Generation
 */
function validateEmbedding(): ValidationResult {
  try {
    const embedding1 = generateEmbeddingML(SAMPLE_RESUME);
    const embedding2 = generateEmbeddingML(SAMPLE_JOB);
    
    // Check embedding properties
    const checks = {
      dimension: embedding1.length === 256,
      normalized: Math.abs(embedding1.reduce((sum, v) => sum + v * v, 0) ** 0.5 - 1) < 0.01,
      nonZero: embedding1.some(v => v !== 0),
      valid: embedding1.every(v => !isNaN(v) && isFinite(v)),
      consistent: embedding2.length === 256
    };
    
    const passedChecks = Object.values(checks).filter(v => v).length;
    const totalChecks = Object.keys(checks).length;
    const score = (passedChecks / totalChecks) * 100;
    
    return {
      passed: score === 100,
      score,
      message: `Embedding: ${passedChecks}/${totalChecks} checks passed`,
      details: checks
    };
  } catch (error) {
    return {
      passed: false,
      score: 0,
      message: `Embedding generation failed: ${error}`,
    };
  }
}

/**
 * Validate Similarity Calculation
 */
function validateSimilarity(): ValidationResult {
  try {
    const embedding1 = generateEmbeddingML(SAMPLE_RESUME);
    const embedding2 = generateEmbeddingML(SAMPLE_JOB);
    const embedding3 = generateEmbeddingML("Completely unrelated content about cooking recipes");
    
    const similarityRelevant = cosineSimilarity(embedding1, embedding2);
    const similarityIrrelevant = cosineSimilarity(embedding1, embedding3);
    const similarityIdentical = cosineSimilarity(embedding1, embedding1);
    
    const checks = {
      identicalIsHigh: similarityIdentical > 0.99, // Same text should be ~1.0
      relevantIsPositive: similarityRelevant > 0,
      relevantIsBetter: similarityRelevant > similarityIrrelevant,
      inRange: similarityRelevant >= 0 && similarityRelevant <= 1,
      notNaN: !isNaN(similarityRelevant) && !isNaN(similarityIrrelevant)
    };
    
    const passedChecks = Object.values(checks).filter(v => v).length;
    const totalChecks = Object.keys(checks).length;
    const score = (passedChecks / totalChecks) * 100;
    
    return {
      passed: score === 100,
      score,
      message: `Similarity: ${passedChecks}/${totalChecks} checks passed (relevant: ${(similarityRelevant * 100).toFixed(1)}%)`,
      details: { ...checks, similarityRelevant, similarityIrrelevant, similarityIdentical }
    };
  } catch (error) {
    return {
      passed: false,
      score: 0,
      message: `Similarity calculation failed: ${error}`,
    };
  }
}

/**
 * Validate Sentiment Analysis
 */
function validateSentiment(): ValidationResult {
  try {
    const positiveText = "Excellent software engineer with outstanding achievements and great leadership skills";
    const neutralText = "Software engineer with experience in development";
    const negativeText = "Poor performance with limited skills and weak results";
    
    const sentimentPositive = analyzeSentimentML(positiveText);
    const sentimentNeutral = analyzeSentimentML(neutralText);
    const sentimentNegative = analyzeSentimentML(negativeText);
    
    const checks = {
      inRange: [sentimentPositive, sentimentNeutral, sentimentNegative].every(s => s >= 0 && s <= 1),
      notNaN: [sentimentPositive, sentimentNeutral, sentimentNegative].every(s => !isNaN(s)),
      positiveIsHigh: sentimentPositive > 0.6,
      negativeIsLow: sentimentNegative < 0.5,
      differentiated: sentimentPositive !== sentimentNeutral
    };
    
    const passedChecks = Object.values(checks).filter(v => v).length;
    const totalChecks = Object.keys(checks).length;
    const score = (passedChecks / totalChecks) * 100;
    
    return {
      passed: score >= 80,
      score,
      message: `Sentiment: ${passedChecks}/${totalChecks} checks passed`,
      details: { ...checks, sentimentPositive, sentimentNeutral, sentimentNegative }
    };
  } catch (error) {
    return {
      passed: false,
      score: 0,
      message: `Sentiment analysis failed: ${error}`,
    };
  }
}

/**
 * Validate Performance
 */
function validatePerformance(): ValidationResult {
  try {
    const iterations = 10;
    const times: number[] = [];
    
    // Test parsing speed
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      parseResumeWithML(SAMPLE_RESUME);
      generateEmbeddingML(SAMPLE_RESUME);
      const end = performance.now();
      times.push(end - start);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    
    const checks = {
      fastParsing: avgTime < 500, // < 500ms average
      consistent: Math.max(...times) - Math.min(...times) < 300, // Low variance
      reliable: times.every(t => t < 1000) // Always < 1s
    };
    
    const passedChecks = Object.values(checks).filter(v => v).length;
    const totalChecks = Object.keys(checks).length;
    const score = (passedChecks / totalChecks) * 100;
    
    return {
      passed: score >= 66,
      score,
      message: `Performance: ${avgTime.toFixed(0)}ms avg (${passedChecks}/${totalChecks} checks passed)`,
      details: { ...checks, avgTime: Math.round(avgTime), minTime: Math.min(...times), maxTime: Math.max(...times) }
    };
  } catch (error) {
    return {
      passed: false,
      score: 0,
      message: `Performance test failed: ${error}`,
    };
  }
}

/**
 * Run all ML validation tests
 */
export function validateMLAlgorithms(): MLValidationReport {
  console.log('🔍 Running ML Algorithm Validation...\n');
  
  const tests = {
    parsing: validateParsing(),
    embedding: validateEmbedding(),
    similarity: validateSimilarity(),
    sentiment: validateSentiment(),
    performance: validatePerformance()
  };
  
  // Print results
  Object.entries(tests).forEach(([name, result]) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  });
  
  const allPassed = Object.values(tests).every(t => t.passed);
  const avgScore = Object.values(tests).reduce((sum, t) => sum + t.score, 0) / Object.keys(tests).length;
  
  console.log(`\n📊 Overall Score: ${avgScore.toFixed(1)}%`);
  console.log(allPassed ? '✅ All ML algorithms passed validation!' : '❌ Some ML algorithms need attention');
  
  return {
    overall: allPassed,
    timestamp: new Date().toISOString(),
    tests
  };
}

/**
 * Quick validation check (for production health checks)
 */
export function quickMLCheck(): boolean {
  try {
    const embedding = generateEmbeddingML("test");
    const sentiment = analyzeSentimentML("test");
    return embedding.length === 256 && !isNaN(sentiment) && sentiment >= 0 && sentiment <= 1;
  } catch {
    return false;
  }
}

