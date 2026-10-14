import { GoogleGenAI, Type } from '@google/genai';
import { ArchiveAnalysis, ArchiveItem, ChatMessage, SourceType } from '../../shared/types';

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

export function detectSourceTypeFromUrl(url: string): SourceType {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be') || lowerUrl.includes('vimeo.com')) {
    return 'YOUTUBE_VIDEO';
  }
  if (
    lowerUrl.includes('chatgpt.com') ||
    lowerUrl.includes('chat.openai.com') ||
    lowerUrl.includes('claude.ai') ||
    lowerUrl.includes('gemini.google.com') ||
    lowerUrl.includes('chat.deepseek.com') ||
    lowerUrl.includes('perplexity.ai')
  ) {
    return 'AI_CHAT';
  }
  if (
    lowerUrl.includes('medium.com') ||
    lowerUrl.includes('dev.to') ||
    lowerUrl.includes('substack.com') ||
    lowerUrl.includes('nytimes.com') ||
    lowerUrl.includes('blog.') ||
    lowerUrl.includes('/blog/') ||
    lowerUrl.includes('/article/') ||
    lowerUrl.includes('/post/') ||
    lowerUrl.includes('.edu') ||
    lowerUrl.includes('arxiv.org')
  ) {
    return 'ARTICLE';
  }
  return 'OTHER';
}

export async function analyzeContentWithGemini(
  url: string,
  title?: string,
  rawContent?: string,
  hintSourceType?: SourceType
): Promise<ArchiveAnalysis> {
  const ai = getAiClient();
  const guessedSourceType = hintSourceType || detectSourceTypeFromUrl(url);

  if (ai) {
    try {
      const prompt = `Analyze this web resource for a developer smart tab archive system.
URL: ${url}
Title Provided: ${title || 'None'}
Guessed Source Type: ${guessedSourceType}
Content/Snippet:
${(rawContent || title || url).slice(0, 10000)}

Perform deep structural summarization:
1. Provide a sharp, high-density main idea (1-2 sentences).
2. Generate 3-5 concise bullet points capturing core insights.
3. Assign a specific topic category (e.g. AI & Machine Learning, Software Engineering, Frontend & UI, DevOps & Cloud, Productivity & Leadership, Science & Technology, Design & UX, General).
4. Provide 4-6 precise searchable tags.
5. Classify the source type: AI_CHAT, YOUTUBE_VIDEO, ARTICLE, or OTHER.
6. Provide 1-2 actionable key takeaways.
7. Estimated reading or watching duration in minutes.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              mainIdea: { type: Type.STRING, description: 'Core thesis or main takeaway' },
              summary: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-5 key bullet point takeaways',
              },
              topicCategory: { type: Type.STRING, description: 'Broad topic category' },
              tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Searchable keywords and tech tags',
              },
              sourceType: {
                type: Type.STRING,
                enum: ['AI_CHAT', 'YOUTUBE_VIDEO', 'ARTICLE', 'OTHER'],
                description: 'Type of content',
              },
              keyTakeaways: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '1-2 standout actionable conclusions',
              },
              sentimentOrTone: { type: Type.STRING, description: 'Tone of the piece' },
              estimatedReadingMinutes: { type: Type.INTEGER, description: 'Estimated reading time in minutes' },
            },
            required: ['mainIdea', 'summary', 'topicCategory', 'tags', 'sourceType'],
          },
        },
      });

      const parsed = JSON.parse(response.text.trim()) as ArchiveAnalysis;
      return {
        mainIdea: parsed.mainIdea || `Insightful resource on ${title || url}`,
        summary: parsed.summary?.length ? parsed.summary : ['Key content archived successfully.'],
        topicCategory: parsed.topicCategory || 'General',
        tags: parsed.tags?.length ? parsed.tags : ['Archive', 'Reference'],
        sourceType: (parsed.sourceType as SourceType) || guessedSourceType,
        keyTakeaways: parsed.keyTakeaways || [],
        sentimentOrTone: parsed.sentimentOrTone || 'Informative',
        estimatedReadingMinutes: parsed.estimatedReadingMinutes || 5,
      };
    } catch (err) {
      console.warn('Gemini analysis failed, using fallback heuristic parser:', err);
    }
  }

  // Heuristic fallback
  const domain = new URL(url).hostname.replace('www.', '');
  const derivedTitle = title || `${domain} Page Reference`;
  return {
    mainIdea: `Archived reference regarding ${derivedTitle}.`,
    summary: [
      `Captured from ${domain} on ${new Date().toLocaleDateString()}`,
      `Quick lookup note for research and tab organization`,
      rawContent ? `Preview: ${rawContent.slice(0, 160)}...` : `Direct link preserved at ${url}`,
    ],
    topicCategory: guessedSourceType === 'AI_CHAT' ? 'AI & Machine Learning' : 'General',
    tags: [domain, guessedSourceType.toLowerCase().replace('_', ' '), 'Smart Tab'],
    sourceType: guessedSourceType,
    keyTakeaways: ['Archived for fast semantic search and contextual retrieval.'],
    sentimentOrTone: 'Informational',
    estimatedReadingMinutes: Math.max(2, Math.round((rawContent?.length || 500) / 800)),
  };
}

export async function askGeminiAssistantAboutArchives(
  userQuery: string,
  relevantArchives: ArchiveItem[],
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ answer: string; citedArchiveIds: string[] }> {
  const ai = getAiClient();
  const archivesContext = relevantArchives
    .slice(0, 8)
    .map(
      (a, idx) => `[Tab ${idx + 1}] ID: ${a.id}
Title: ${a.title}
Source Type: ${a.sourceType}
Category: ${a.topicCategory}
URL: ${a.url}
Main Idea: ${a.mainIdea}
Summary: ${a.summary.join(' | ')}
Tags: ${a.tags.join(', ')}
${a.keyTakeaways ? `Key Takeaways: ${a.keyTakeaways.join(' | ')}` : ''}`
    )
    .join('\n\n');

  if (ai) {
    try {
      const systemInstruction = `You are "Smart Tab Copilot", an AI memory assistant for a user's smart tab archive.
Answer the user's inquiry based on their saved tabs provided in context.
Rules:
- Be clear, direct, and structured.
- Always cite the relevant tabs by their [Tab X] number and title when mentioning insights.
- If the archive doesn't contain the exact answer, answer as best as possible using context and mention what is available.
- Keep tone professional and encouraging.`;

      const prompt = `User's Archives In Context:
${archivesContext || 'No archived tabs currently match this filter.'}

Recent Conversation History:
${chatHistory.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

User Query: ${userQuery}

Provide your synthesized answer now:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });

      const citedIds = relevantArchives.map((a) => a.id);
      return {
        answer: response.text.trim(),
        citedArchiveIds: citedIds,
      };
    } catch (err) {
      console.warn('Gemini chat assistant failed:', err);
    }
  }

  // Fallback response if offline or key unavailable
  if (relevantArchives.length === 0) {
    return {
      answer: `I looked through your saved tabs, but didn't find any direct matches for "${userQuery}". Try adding more links or refining your search terms!`,
      citedArchiveIds: [],
    };
  }

  const topMatch = relevantArchives[0];
  return {
    answer: `Based on your archived tab **"${topMatch.title}"** (${topMatch.topicCategory}):\n\n• **Main Idea**: ${topMatch.mainIdea}\n• **Summary**: ${topMatch.summary.join(' ')}\n\nYou can access the full link here: [${topMatch.domain}](${topMatch.url}).`,
    citedArchiveIds: [topMatch.id],
  };
}
