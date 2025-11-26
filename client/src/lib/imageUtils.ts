export function normalizeImageUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined;
  
  if (url.startsWith('/objects/')) {
    return url;
  }
  
  if (url.includes('storage.googleapis.com') && url.includes('/.private/uploads/')) {
    const match = url.match(/\.private\/uploads\/([a-f0-9-]+)/i);
    if (match && match[1]) {
      return `/objects/uploads/${match[1]}`;
    }
  }
  
  if (url.includes('storage.googleapis.com') && url.includes('/uploads/')) {
    const match = url.match(/\/uploads\/([a-f0-9-]+)/i);
    if (match && match[1]) {
      return `/objects/uploads/${match[1]}`;
    }
  }
  
  return url;
}

export function normalizeImageUrls(urls: string[] | undefined | null): string[] {
  if (!urls || !Array.isArray(urls)) return [];
  return urls.map(url => normalizeImageUrl(url)).filter((url): url is string => !!url);
}
