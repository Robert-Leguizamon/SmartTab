import { GoogleGenAI } from '@google/genai';
import { generateDeterministicVector, VECTOR_DIMENSION } from './vectorMath';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export async function generateTextEmbedding(text: string): Promise<{ embedding: number[]; isModelGenerated: boolean }> {
  const cleanText = text.trim().slice(0, 8000);
  if (!cleanText) {
    return { embedding: generateDeterministicVector('empty'), isModelGenerated: false };
  }

  const ai = getAiClient();
  if (ai) {
    try {
      // Primary: text-embedding-004 (768 dimensions)
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: cleanText,
      });

      const resAny = response as { embedding?: { values?: number[] }; embeddings?: Array<{ values?: number[] }> };
      const values = resAny.embedding?.values || resAny.embeddings?.[0]?.values;
      if (values && Array.isArray(values) && values.length > 0) {
        // Ensure standard 768 dimension or pad/slice
        const normalized = values.slice(0, VECTOR_DIMENSION);
        return { embedding: normalized, isModelGenerated: true };
      }
    } catch (err) {
      console.warn('Gemini embedding API call failed, falling back to semantic vector generator:', err);
    }
  }

  return {
    embedding: generateDeterministicVector(cleanText),
    isModelGenerated: false,
  };
}
