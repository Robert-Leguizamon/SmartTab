export interface ExtractedUrlData {
  title?: string;
  domain: string;
  favicon?: string;
  excerpt?: string;
  fullText?: string;
}

export async function extractUrlMetadata(url: string): Promise<ExtractedUrlData> {
  let domain = 'unknown';
  let pathname = '';
  try {
    const parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    domain = parsedUrl.hostname.replace(/^www\./, '');
    pathname = parsedUrl.pathname;
  } catch {
    domain = 'unknown';
  }

  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

  try {
    const signal = AbortSignal.timeout(2500);

    const response = await fetch(url, {
      signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SmartTabArchiveBot/1.0',
        Accept: 'text/html,application/xhtml+xml,text/plain',
      },
    });

    if (response.ok) {
      const html = await response.text();

      // Extract HTML <title>
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
      const title = ogTitleMatch?.[1] || titleMatch?.[1] || domain;

      // Extract meta description or text
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
      const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
      const excerpt = ogDescMatch?.[1] || descMatch?.[1] || '';

      // Strip basic HTML tags for raw content snippet
      const cleanText = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000);

      return {
        title: title.trim(),
        domain,
        favicon,
        excerpt: excerpt.trim(),
        fullText: cleanText,
      };
    }
  } catch (err) {
    console.log(`Could not fetch HTML directly from ${url} (expected for firewalls/CORS):`, (err as Error).message);
  }

  // Fallback if direct fetch blocked
  const pathParts = pathname.split('/').filter(Boolean);
  const fallbackTitle = pathParts.length > 0
    ? pathParts[pathParts.length - 1].replace(/[-_]/g, ' ').replace(/\.[a-z0-9]+$/i, '')
    : domain;

  return {
    title: fallbackTitle ? fallbackTitle.charAt(0).toUpperCase() + fallbackTitle.slice(1) : domain,
    domain,
    favicon,
    excerpt: '',
    fullText: '',
  };
}
