// Client-side embeddings module that works in static export environments
import { generateEmbeddingML } from './ml-parser';

/**
 * Creates a client-side embedding for text without requiring API access
 * @param text Text to generate embedding for
 * @returns Embedding vector
 */
export async function generateClientEmbedding(text: string): Promise<number[]> {
  // For static export environments, always use ML embeddings
  return generateEmbeddingML(text);
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