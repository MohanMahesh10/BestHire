import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  
  const minLength = Math.min(vecA.length, vecB.length);
  let dotProduct = 0, magA = 0, magB = 0;
  
  // Single loop - O(n) complexity
  for (let i = 0; i < minLength; i++) {
    dotProduct += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  
  if (magA === 0 || magB === 0) return 0;
  
  const similarity = dotProduct / (magA * magB);
  if (isNaN(similarity)) return 0;
  
  // Cosine similarity returns -1 to 1, but for normalized vectors (like ours),
  // it's already 0 to 1. Just clamp to be safe.
  return Math.max(0, Math.min(1, similarity));
}
