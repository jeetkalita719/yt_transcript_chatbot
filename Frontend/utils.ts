/**
 * Creates a page URL for hash-based routing
 * @param path - The path with optional query parameters (e.g., "Home" or "Chat?videoId=123")
 * @returns The formatted URL (e.g., "#/home" or "#/chat?videoId=123")
 */
export function createPageUrl(path: string): string {
  // Convert to lowercase and handle query parameters
  const [page, query] = path.split('?');
  const pagePath = page.toLowerCase();
  const queryString = query ? `?${query}` : '';
  return `#/${pagePath}${queryString}`;
}

