/**
 * Polyfill for node:fs module
 * Provides browser-compatible stubs for fs functions
 */

// Stub implementations that throw or return empty data
export function statSync(): any {
  throw new Error('fs.statSync is not available in browser');
}

export function createReadStream(): any {
  throw new Error('fs.createReadStream is not available in browser');
}

// Promises API stub
export const promises = {
  readFile: async (): Promise<any> => {
    throw new Error('fs.promises.readFile is not available in browser');
  },
  writeFile: async (): Promise<void> => {
    throw new Error('fs.promises.writeFile is not available in browser');
  },
  stat: async (): Promise<any> => {
    throw new Error('fs.promises.stat is not available in browser');
  },
  readdir: async (): Promise<any[]> => {
    throw new Error('fs.promises.readdir is not available in browser');
  },
};

export default {
  statSync,
  createReadStream,
  promises
};
