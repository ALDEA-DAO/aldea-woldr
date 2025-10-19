/**
 * Polyfill for node:url module
 * Provides browser-compatible URL functions
 */

export function format(urlObject: any): string {
  if (typeof urlObject === 'string') return urlObject;
  
  try {
    if (urlObject instanceof URL) {
      return urlObject.href;
    }
    
    // Handle URL-like objects
    const {
      protocol = '',
      hostname = '',
      port = '',
      pathname = '',
      search = '',
      hash = ''
    } = urlObject;
    
    let url = protocol ? `${protocol}//` : '';
    url += hostname;
    if (port) url += `:${port}`;
    url += pathname || '/';
    if (search) url += search.startsWith('?') ? search : `?${search}`;
    if (hash) url += hash.startsWith('#') ? hash : `#${hash}`;
    
    return url;
  } catch (e) {
    return String(urlObject);
  }
}

export function parse(urlString: string): any {
  try {
    const url = new URL(urlString);
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      href: url.href
    };
  } catch (e) {
    return null;
  }
}

// Re-export native browser URL and URLSearchParams
export const URL = globalThis.URL;
export const URLSearchParams = globalThis.URLSearchParams;

export default {
  format,
  parse,
  URL,
  URLSearchParams
};
