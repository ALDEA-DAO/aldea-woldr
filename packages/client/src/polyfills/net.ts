/**
 * Minimal polyfill for node:net module
 * Provides browser-compatible stubs for net functions
 */

export function isIP(input: string): number {
  if (!input) return 0;
  
  // Simple IPv4 check
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(input)) {
    const parts = input.split('.');
    if (parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255)) {
      return 4;
    }
  }
  
  // Simple IPv6 check
  const ipv6Regex = /^([\da-f]{0,4}:){2,7}[\da-f]{0,4}$/i;
  if (ipv6Regex.test(input)) {
    return 6;
  }
  
  return 0;
}

export function isIPv4(input: string): boolean {
  return isIP(input) === 4;
}

export function isIPv6(input: string): boolean {
  return isIP(input) === 6;
}

// Stub exports for other net functions that might be needed
export class Socket {}
export class Server {}

export default {
  isIP,
  isIPv4,
  isIPv6,
  Socket,
  Server,
};
