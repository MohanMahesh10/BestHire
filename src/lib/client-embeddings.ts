// Client-side embeddings module that works in static export environments
import { generateEmbeddingML } from './ml-parser';

/**
 * Creates a client-side embedding for text without requiring API access
 * @param text Text to generate embedding for
 * @returns Embedding vector
 */
export async function generateClientEmbedding(text: string): Promise<number[]> {
  try {
    // For static export environments, always use ML embeddings
    const embedding = generateEmbeddingML(text);
    
    // Validate the embedding - ensure it's not all zeros
    const isAllZeros = embedding.every(val => val === 0);
    if (isAllZeros) {
      // Generate a non-zero pseudo-random embedding based on the text
      return generatePseudoRandomEmbedding(text);
    }
    
    return embedding;
  } catch (error) {
    console.error("Error generating client embedding:", error);
    // Fallback to a pseudo-random embedding
    return generatePseudoRandomEmbedding(text);
  }
}

/**
 * Creates a pseudo-random embedding vector based on the text content
 * This ensures we never return an all-zeros vector which would break similarity calculations
 */
function generatePseudoRandomEmbedding(text: string): number[] {
  // Create a deterministic seed based on the text
  let seed = 0;
  for (let i = 0; i < text.length; i++) {
    seed += text.charCodeAt(i);
  }
  
  // Generate 768 dimensions (same as standard embeddings)
  const embedding = new Array(768).fill(0);
  
  // Fill with deterministic but varied values
  for (let i = 0; i < embedding.length; i++) {
    // Simple pseudo-random number generation
    seed = (seed * 9301 + 49297) % 233280;
    const value = seed / 233280.0;
    
    // Scale to typical embedding range
    embedding[i] = (value - 0.5) * 0.1;
  }
  
  // Normalize the vector to length 1
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => val / magnitude);
}

/**
 * Simple client-side sentiment analysis
 * This is a very basic implementation that doesn't require API access
 * @param text Text to analyze sentiment for
 * @returns Score between 0 and 1
 */
export function analyzeClientSentiment(text: string): number {
  // List of positive words
  const positiveWords = [
    'excellent', 'outstanding', 'exceptional', 'great', 'good', 'best', 'positive',
    'skilled', 'proficient', 'expert', 'experienced', 'professional', 'qualified',
    'successful', 'achievement', 'accomplished', 'award', 'excellent', 'impressive',
    'strong', 'dedicated', 'committed', 'reliable', 'efficient', 'effective'
  ];

  // List of negative words
  const negativeWords = [
    'poor', 'bad', 'worst', 'negative', 'terrible', 'horrible', 'awful',
    'unsuccessful', 'failure', 'failed', 'inadequate', 'incompetent', 'inexperienced',
    'weakness', 'weak', 'struggle', 'poor', 'insufficient', 'limited'
  ];

  const lowerText = text.toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Count positive words
  positiveWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) positiveCount += matches.length;
  });
  
  // Count negative words
  negativeWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) negativeCount += matches.length;
  });
  
  // If no sentiment words found, return neutral sentiment
  if (positiveCount === 0 && negativeCount === 0) return 0.6;
  
  // Calculate sentiment score (0 to 1)
  const total = positiveCount + negativeCount;
  const score = positiveCount / total;
  
  // Add a baseline so it's not too extreme
  return 0.4 + (score * 0.6); 
}