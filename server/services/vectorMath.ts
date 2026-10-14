export const VECTOR_DIMENSION = 768;

/**
 * Computes cosine similarity between two numeric vectors.
 * Returns a value between -1.0 and 1.0 (or normalized 0 to 1).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generates a deterministic normalized 768-dimensional pseudo-semantic vector
 * based on token hashing. Used as a high-fidelity fallback or for initial mock vectors.
 */
export function generateDeterministicVector(text: string): number[] {
  const vector = new Array<number>(VECTOR_DIMENSION).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    for (let i = 0; i < VECTOR_DIMENSION; i++) {
      vector[i] = Math.sin(i * 0.17 + 1);
    }
  } else {
    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      let hash = 5381;
      for (let c = 0; c < word.length; c++) {
        hash = ((hash << 5) + hash) + word.charCodeAt(c);
      }

      for (let i = 0; i < 32; i++) {
        const index = Math.abs((hash * (i + 1) * 31 + w * 17) % VECTOR_DIMENSION);
        const weight = 1.0 / Math.sqrt(w + 1);
        vector[index] += Math.sin((hash + i) * 0.23) * weight;
      }
    }
  }

  // Normalize to unit length
  let sumSq = 0;
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    sumSq += vector[i] * vector[i];
  }
  const magnitude = Math.sqrt(sumSq) || 1;
  return vector.map(val => Number((val / magnitude).toFixed(6)));
}
