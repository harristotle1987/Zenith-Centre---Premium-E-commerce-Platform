export const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.APP_URL || process.env.VITE_APP_URL || '';
};

export const getApiUrl = (path: string) => {
  const baseUrl = getBaseUrl();
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // If path is empty, just return baseUrl
  if (path === '') return baseUrl;

  // Ensure no double slashes if baseUrl ends with / or sanitizedPath starts with /
  const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  return `${normalizedBase}${sanitizedPath}`;
};
