/**
 * Polyfill for node:path module
 * Provides browser-compatible path functions
 */

export function basename(path: string, ext?: string): string {
  const base = path.split('/').pop() || '';
  if (ext && base.endsWith(ext)) {
    return base.slice(0, -ext.length);
  }
  return base;
}

export function dirname(path: string): string {
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || '/';
}

export function extname(path: string): string {
  const base = basename(path);
  const lastDot = base.lastIndexOf('.');
  return lastDot > 0 ? base.slice(lastDot) : '';
}

export function join(...paths: string[]): string {
  return paths
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '');
}

export function resolve(...paths: string[]): string {
  return join('/', ...paths);
}

export const sep = '/';
export const delimiter = ':';

export default {
  basename,
  dirname,
  extname,
  join,
  resolve,
  sep,
  delimiter
};
