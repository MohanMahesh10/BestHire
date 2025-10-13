import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  // Enhanced validation to prevent zeros
  if (!vecA || !vecB || !Array.isArray(vecA) || !Array.isArray(vecB)) return 0.3; // Default similarity
  if (vecA.length === 0 || vecB.length === 0) return 0.3; // Default similarity
  
  // Check if all values are zeros
  const allZerosA = vecA.every(val => val === 0);
  const allZerosB = vecB.every(val => val === 0);
  if (allZerosA || allZerosB) return 0.3; // Default similarity
  
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
  
  if (magA === 0 || magB === 0) return 0.3; // Default similarity
  
  const similarity = dotProduct / (magA * magB);
  if (isNaN(similarity)) return 0.3; // Default similarity
  
  // Cosine similarity returns -1 to 1, but for normalized vectors (like ours),
  // it's already 0 to 1. Just clamp to be safe.
  // Never return pure 0 to avoid display issues
  return Math.max(0.1, Math.min(0.99, similarity));
}
